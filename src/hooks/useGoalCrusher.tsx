import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApp, UserMode } from '@/context/AppContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subWeeks } from 'date-fns';
import { toast } from 'sonner';

// Goal types for each mode
export interface CrushModeGoals {
  applications: number;
  newContacts: number;
  followUps: number;
  interviewPrepHours: number;
}

export interface ClimbModeGoals {
  skills: { name: string; hoursPerWeek: number; logged: number }[];
  networkContacts: number; // monthly
  visibilityActivities: VisibilityActivity[];
}

export interface VisibilityActivity {
  id: string;
  label: string;
  frequency: string;
  target: number;
  completed: number;
  enabled: boolean;
}

export interface WeeklyProgress {
  applications: number;
  newContacts: number;
  followUps: number;
  interviewPrepHours: number;
}

export interface MonthlyProgress {
  networkContacts: number;
  visibilityActivities: Record<string, number>;
}

export interface CheckInData {
  id: string;
  weekStartDate: string;
  goalsHit: string[];
  goalsMissed: string[];
  whatWorked: string;
  whatGotInTheWay: string;
}

export interface CustomGoalStep {
  title: string;
  cadence: string;
  dueDate?: string;
  completed?: boolean;
}

export interface CustomGoal {
  id: string;
  pillar: 'visibility' | 'network' | 'skills';
  refinedGoal: string;
  steps: CustomGoalStep[];
  featureSuggestions: string[];
}

const DEFAULT_CRUSH_GOALS: CrushModeGoals = {
  applications: 5,
  newContacts: 3,
  followUps: 2,
  interviewPrepHours: 3,
};

const DEFAULT_VISIBILITY_ACTIVITIES: VisibilityActivity[] = [
  { id: 'share-wins', label: 'Share wins in meetings', frequency: '2x/month', target: 2, completed: 0, enabled: true },
  { id: 'linkedin-post', label: 'Post on LinkedIn', frequency: '1x/week', target: 4, completed: 0, enabled: true },
  { id: 'volunteer-project', label: 'Volunteer for high-visibility projects', frequency: '1x/month', target: 1, completed: 0, enabled: false },
  { id: 'present-meeting', label: 'Present in team meeting', frequency: '1x/month', target: 1, completed: 0, enabled: false },
];

function getMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

export function useGoalCrusher() {
  const { user } = useAuth();
  const { applications, events, profile } = useApp();
  const userMode: UserMode = (profile?.user_mode as UserMode) || 'crush';

  const [crushGoals, setCrushGoals] = useState<CrushModeGoals>(DEFAULT_CRUSH_GOALS);
  const [climbGoals, setClimbGoals] = useState<ClimbModeGoals>({
    skills: [],
    networkContacts: 5,
    visibilityActivities: DEFAULT_VISIBILITY_ACTIVITIES,
  });
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    applications: 0,
    newContacts: 0,
    followUps: 0,
    interviewPrepHours: 0,
  });
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress>({
    networkContacts: 0,
    visibilityActivities: {},
  });
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalsSetup, setGoalsSetup] = useState(false);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [streakMonths, setStreakMonths] = useState<string[]>([]);

  // Calculate weekly progress from real data
  const calculateWeeklyProgress = useCallback(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const appsThisWeek = applications.filter(app => {
      const date = new Date(app.date_applied);
      return date >= weekStart && date <= weekEnd;
    }).length;

    const followUpsThisWeek = events.filter(e => {
      const date = new Date(e.date);
      return (e.type === 'follow_up' || e.type === 'networking') && date >= weekStart && date <= weekEnd;
    }).length;

    setWeeklyProgress(prev => ({
      ...prev,
      applications: appsThisWeek,
      followUps: followUpsThisWeek,
    }));
  }, [applications, events]);

  useEffect(() => {
    calculateWeeklyProgress();
  }, [calculateWeeklyProgress]);

  // Persist climb goals to DB
  const persistClimbGoals = useCallback(async (
    visActivities: VisibilityActivity[],
    goals: CustomGoal[],
    networkTarget: number,
    streak: number,
    months: string[]
  ) => {
    if (!user) return;
    const monthKey = getMonthKey();

    await supabase
      .from('climb_goals')
      .upsert({
        user_id: user.id,
        month_key: monthKey,
        visibility_activities: JSON.parse(JSON.stringify(visActivities)),
        custom_goals: JSON.parse(JSON.stringify(goals)),
        network_contacts_target: networkTarget,
        streak_count: streak,
        streak_months: JSON.parse(JSON.stringify(months)),
      } as any, { onConflict: 'user_id,month_key' });
  }, [user]);

  // Fetch goals from DB
  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: goalsData } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (goalsData) {
        setCrushGoals({
          applications: goalsData.weekly_application_target || 5,
          newContacts: goalsData.weekly_networking_target || 3,
          followUps: 2,
          interviewPrepHours: 3,
        });
        setGoalsSetup(goalsData.calibration_complete || false);
      }

      // Fetch skills for climb mode
      const { data: skillsData } = await supabase
        .from('skill_tracking')
        .select('*')
        .eq('user_id', user.id);

      if (skillsData) {
        setClimbGoals(prev => ({
          ...prev,
          skills: skillsData.map(s => ({
            name: s.skill_name,
            hoursPerWeek: s.target_hours || 5,
            logged: Number(s.logged_hours) || 0,
          })),
        }));
      }

      // Fetch persisted climb goals for current month
      const monthKey = getMonthKey();
      const { data: climbData } = await supabase
        .from('climb_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .maybeSingle();

      if (climbData) {
        const visActivities = (climbData as any).visibility_activities as VisibilityActivity[];
        const savedGoals = (climbData as any).custom_goals as CustomGoal[];
        const netTarget = (climbData as any).network_contacts_target as number;
        const streak = (climbData as any).streak_count as number;
        const months = (climbData as any).streak_months as string[];

        if (visActivities && visActivities.length > 0) {
          setClimbGoals(prev => ({
            ...prev,
            visibilityActivities: visActivities,
            networkContacts: netTarget || 5,
          }));
        }
        if (savedGoals) setCustomGoals(savedGoals);
        setStreakCount(streak || 0);
        setStreakMonths(months || []);
      }

      // Fetch contacts for monthly progress
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (contactsData) {
        setMonthlyProgress(prev => ({
          ...prev,
          networkContacts: contactsData.length,
        }));
      }

      // Calculate new contacts this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data: weekContactsData } = await supabase
        .from('contacts')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (weekContactsData) {
        setWeeklyProgress(prev => ({
          ...prev,
          newContacts: weekContactsData.length,
        }));
      }

    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Update crush mode goals
  const updateCrushGoals = async (newGoals: Partial<CrushModeGoals>) => {
    if (!user) return;
    const updated = { ...crushGoals, ...newGoals };
    setCrushGoals(updated);

    await supabase
      .from('user_goals')
      .update({
        weekly_application_target: updated.applications,
        weekly_networking_target: updated.newContacts,
      })
      .eq('user_id', user.id);

    toast.success('Goals updated!');
  };

  // Update climb mode goals
  const updateClimbGoals = async (newGoals: Partial<ClimbModeGoals>) => {
    const updated = { ...climbGoals, ...newGoals };
    setClimbGoals(updated);
    await persistClimbGoals(
      updated.visibilityActivities,
      customGoals,
      updated.networkContacts,
      streakCount,
      streakMonths
    );
    toast.success('Goals updated!');
  };

  // Log progress manually
  const logProgress = async (type: keyof WeeklyProgress, amount: number = 1) => {
    setWeeklyProgress(prev => ({
      ...prev,
      [type]: prev[type] + amount,
    }));
    toast.success(`+${amount} ${type} logged!`);
  };

  // Add skill to track
  const addSkill = async (skillName: string, targetHours: number = 5) => {
    if (!user) return;
    const { error } = await supabase
      .from('skill_tracking')
      .insert({
        user_id: user.id,
        skill_name: skillName,
        target_hours: targetHours,
        logged_hours: 0,
      });

    if (!error) {
      setClimbGoals(prev => ({
        ...prev,
        skills: [...prev.skills, { name: skillName, hoursPerWeek: targetHours, logged: 0 }],
      }));
      toast.success(`${skillName} added to tracking!`);
    }
  };

  // Log skill hours
  const logSkillHours = async (skillName: string, hours: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('skill_tracking')
      .update({ logged_hours: hours })
      .eq('user_id', user.id)
      .eq('skill_name', skillName);

    if (!error) {
      setClimbGoals(prev => ({
        ...prev,
        skills: prev.skills.map(s => 
          s.name === skillName ? { ...s, logged: hours } : s
        ),
      }));
    }
  };

  // Toggle visibility activity and persist
  const toggleVisibilityActivity = (activityId: string, enabled: boolean) => {
    setClimbGoals(prev => {
      const updated = {
        ...prev,
        visibilityActivities: prev.visibilityActivities.map(a =>
          a.id === activityId ? { ...a, enabled } : a
        ),
      };
      persistClimbGoals(updated.visibilityActivities, customGoals, updated.networkContacts, streakCount, streakMonths);
      return updated;
    });
  };

  // Log visibility activity, persist, and auto-sync to Track Record
  const logVisibilityActivity = async (activityId: string) => {
    let activityLabel = '';
    setClimbGoals(prev => {
      const updated = {
        ...prev,
        visibilityActivities: prev.visibilityActivities.map(a => {
          if (a.id === activityId) {
            activityLabel = a.label;
            return { ...a, completed: a.completed + 1 };
          }
          return a;
        }),
      };
      persistClimbGoals(updated.visibilityActivities, customGoals, updated.networkContacts, streakCount, streakMonths);
      return updated;
    });

    // Auto-sync: create a track record entry for visibility wins
    if (user && activityLabel) {
      try {
        await supabase.from('track_record_entries').insert({
          user_id: user.id,
          content: `Completed visibility action: ${activityLabel}`,
          title: activityLabel,
          entry_type: 'achievement',
          status: 'ready_to_use',
          manual_tags: ['visibility', 'goal-crusher'],
          context_date: new Date().toISOString().split('T')[0],
        });
      } catch (e) {
        console.error('Auto-sync to Track Record failed:', e);
      }
    }

    toast.success('Activity logged!');
  };

  // Save custom goal and persist
  const saveCustomGoal = async (goal: CustomGoal) => {
    const updated = [...customGoals, goal];
    setCustomGoals(updated);
    await persistClimbGoals(climbGoals.visibilityActivities, updated, climbGoals.networkContacts, streakCount, streakMonths);
    toast.success('Custom goal added!');
  };

  // Toggle custom goal step and persist
  const toggleCustomGoalStep = async (goalId: string, stepIdx: number) => {
    const updated = customGoals.map(g =>
      g.id === goalId
        ? { ...g, steps: g.steps.map((s, i) => (i === stepIdx ? { ...s, completed: !s.completed } : s)) }
        : g
    );
    setCustomGoals(updated);
    await persistClimbGoals(climbGoals.visibilityActivities, updated, climbGoals.networkContacts, streakCount, streakMonths);
  };

  // Log network check-in and auto-sync to contacts
  const logNetworkCheckIn = async (contactId?: string) => {
    setMonthlyProgress(prev => ({
      ...prev,
      networkContacts: prev.networkContacts + 1,
    }));

    // Auto-sync: update contact's last_contacted
    if (user && contactId) {
      try {
        await supabase
          .from('contacts')
          .update({ last_contacted: new Date().toISOString().split('T')[0] })
          .eq('id', contactId)
          .eq('user_id', user.id);
      } catch (e) {
        console.error('Auto-sync to Contacts failed:', e);
      }
    }

    toast.success('Check-in logged!');
  };

  // Submit weekly check-in
  const submitCheckIn = async (data: Omit<CheckInData, 'id'>) => {
    const newCheckIn: CheckInData = {
      ...data,
      id: crypto.randomUUID(),
    };
    setCheckIns(prev => [...prev, newCheckIn]);
    toast.success('Weekly check-in saved!');
  };

  // Calculate goal completion percentage
  const getGoalProgress = (current: number, target: number) => {
    if (target === 0) return 100;
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Get overall weekly progress for crush mode
  const getCrushWeeklyProgress = () => {
    const appsProgress = getGoalProgress(weeklyProgress.applications, crushGoals.applications);
    const contactsProgress = getGoalProgress(weeklyProgress.newContacts, crushGoals.newContacts);
    const followUpsProgress = getGoalProgress(weeklyProgress.followUps, crushGoals.followUps);
    const prepProgress = getGoalProgress(weeklyProgress.interviewPrepHours, crushGoals.interviewPrepHours);
    return Math.round((appsProgress + contactsProgress + followUpsProgress + prepProgress) / 4);
  };

  // Setup initial goals
  const setupGoals = async (mode: UserMode, goals: CrushModeGoals | ClimbModeGoals) => {
    if (!user) return;

    if (mode === 'crush') {
      const crushG = goals as CrushModeGoals;
      await supabase
        .from('user_goals')
        .upsert({
          user_id: user.id,
          weekly_application_target: crushG.applications,
          weekly_networking_target: crushG.newContacts,
          calibration_complete: true,
        });
      setCrushGoals(crushG);
    } else {
      // Persist climb goals setup
      const climbG = goals as ClimbModeGoals;
      await persistClimbGoals(climbG.visibilityActivities, [], climbG.networkContacts, 0, []);
      setClimbGoals(climbG);
      
      // Also mark calibration as complete
      await supabase
        .from('user_goals')
        .upsert({
          user_id: user.id,
          calibration_complete: true,
        });
    }

    setGoalsSetup(true);
    toast.success('Goals saved! Let\'s crush it! 💪');
  };

  return {
    userMode,
    crushGoals,
    climbGoals,
    weeklyProgress,
    monthlyProgress,
    checkIns,
    loading,
    goalsSetup,
    customGoals,
    streakCount,
    streakMonths,
    updateCrushGoals,
    updateClimbGoals,
    logProgress,
    addSkill,
    logSkillHours,
    toggleVisibilityActivity,
    logVisibilityActivity,
    submitCheckIn,
    getGoalProgress,
    getCrushWeeklyProgress,
    setupGoals,
    saveCustomGoal,
    toggleCustomGoalStep,
    logNetworkCheckIn,
    refreshGoals: fetchGoals,
  };
}
