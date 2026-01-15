import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApp, UserMode } from '@/context/AppContext';
import { startOfWeek, endOfWeek, differenceInDays, format, subWeeks } from 'date-fns';
import {
  QuestTemplate,
  getQuestsForMode,
  getQuestExpiry,
  getLevelTitleForMode,
  achievementsByMode,
  xpValuesByMode,
} from '@/lib/questTemplates';

export interface UserGoals {
  id: string;
  user_id: string;
  situation: string;
  focus: string;
  weekly_hours: number;
  motivation_style: string;
  celebration_style: string;
  calibration_complete: boolean;
  calibration_start_date: string | null;
  avg_applications_per_week: number;
  preferred_search_days: string[];
  avg_match_score_target: number;
  active_hours_per_week: number;
  weekly_application_target: number;
  weekly_networking_target: number;
  match_score_target: number;
  streak_style: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_freeze_until: string | null;
  streak_grace_days_remaining: number;
  total_xp: number;
  current_level: number;
  active_achievement_paths: string[];
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  target: number;
  current_progress: number;
  xp_reward: number;
  is_completed: boolean;
  completed_at: string | null;
  starts_at: string;
  expires_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  tier: string;
  current_progress: number;
  target: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface WeeklyStats {
  applicationsThisWeek: number;
  applicationsLastWeek: number;
  interviewsThisWeek: number;
  followUpsThisWeek: number;
  avgMatchScore: number;
}

export interface PersonalBests {
  mostAppsInWeek: number;
  mostAppsInWeekDate: string | null;
  longestStreak: number;
  totalApplications: number;
  totalInterviews: number;
}

const XP_PER_LEVEL = 500;

export function useGoals() {
  const { user } = useAuth();
  const { applications, events, profile } = useApp();
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const userMode: UserMode = (profile?.user_mode as UserMode) || 'active_seeker';

  // Calculate weekly stats from applications
  const weeklyStats: WeeklyStats = (() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisWeekApps = applications.filter(app => {
      const date = new Date(app.date_applied);
      return date >= thisWeekStart && date <= thisWeekEnd;
    });

    const lastWeekApps = applications.filter(app => {
      const date = new Date(app.date_applied);
      return date >= lastWeekStart && date <= lastWeekEnd;
    });

    const interviewsThisWeek = events.filter(e => {
      const date = new Date(e.date);
      return e.type === 'interview' && date >= thisWeekStart && date <= thisWeekEnd;
    }).length;

    const followUpsThisWeek = events.filter(e => {
      const date = new Date(e.date);
      return e.type === 'follow_up' && date >= thisWeekStart && date <= thisWeekEnd;
    }).length;

    return {
      applicationsThisWeek: thisWeekApps.length,
      applicationsLastWeek: lastWeekApps.length,
      interviewsThisWeek,
      followUpsThisWeek,
      avgMatchScore: 0,
    };
  })();

  // Calculate personal bests
  const personalBests: PersonalBests = (() => {
    const weeklyApps: Record<string, number> = {};
    applications.forEach(app => {
      const weekKey = format(startOfWeek(new Date(app.date_applied), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      weeklyApps[weekKey] = (weeklyApps[weekKey] || 0) + 1;
    });

    let mostAppsInWeek = 0;
    let mostAppsInWeekDate: string | null = null;
    Object.entries(weeklyApps).forEach(([date, count]) => {
      if (count > mostAppsInWeek) {
        mostAppsInWeek = count;
        mostAppsInWeekDate = date;
      }
    });

    const totalInterviews = events.filter(e => e.type === 'interview').length;

    return {
      mostAppsInWeek,
      mostAppsInWeekDate,
      longestStreak: userGoals?.longest_streak || 0,
      totalApplications: applications.length,
      totalInterviews,
    };
  })();

  // Fetch user goals
  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      let { data: goalsData } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!goalsData) {
        const { data: newGoals, error: createError } = await supabase
          .from('user_goals')
          .insert({ 
            user_id: user.id,
            calibration_start_date: new Date().toISOString()
          })
          .select()
          .single();
        
        if (!createError && newGoals) {
          goalsData = newGoals;
        }
      }

      if (goalsData) {
        setUserGoals(goalsData as UserGoals);
      }

      // Fetch quests
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('expires_at', { ascending: true });

      if (questsData) {
        setQuests(questsData as Quest[]);
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (achievementsData) {
        setAchievements(achievementsData as Achievement[]);
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

  // Update user goals
  const updateGoals = async (updates: Partial<UserGoals>) => {
    if (!user || !userGoals) return;

    const { error } = await supabase
      .from('user_goals')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      setUserGoals({ ...userGoals, ...updates });
    }
  };

  // Complete personalization setup
  const completeSetup = async (setup: {
    situation: string;
    focus: string;
    weekly_hours: number;
    motivation_style: string;
    celebration_style: string;
  }) => {
    if (!user) return;

    const weeklyTarget = getRecommendedTarget(setup.focus, setup.weekly_hours);

    await updateGoals({
      ...setup,
      calibration_complete: true,
      weekly_application_target: weeklyTarget,
    });

    // Generate initial quests based on user mode
    await generateQuests(setup.focus, weeklyTarget, userMode);
    
    // Initialize achievements for mode
    await initializeAchievements(userMode);
  };

  // Get recommended target based on focus and time
  const getRecommendedTarget = (focus: string, hours: number): number => {
    const baseTargets: Record<string, number> = {
      maximum: 5,
      targeted: 2,
      networking: 1,
      interview_prep: 1,
      balanced: 3,
    };

    const hourMultiplier = hours <= 4 ? 0.5 : hours <= 10 ? 1 : hours <= 20 ? 1.5 : 2;
    return Math.max(1, Math.round((baseTargets[focus] || 3) * hourMultiplier));
  };

  // Generate quests based on user mode
  const generateQuests = async (focus: string, weeklyTarget: number, mode: UserMode) => {
    if (!user) return;

    const now = new Date();

    // Get mode-specific quest templates
    const questTemplates = getQuestsForMode(
      mode,
      weeklyTarget,
      userGoals?.weekly_networking_target || 2,
      userGoals?.weekly_hours || 10
    );

    // Filter quests based on mode - different modes have different quest types
    const questsToCreate = questTemplates.filter(q => {
      // Career Insurance doesn't use daily quests (too much pressure)
      if (mode === 'career_insurance' && q.type === 'daily') {
        return false;
      }
      return true;
    });

    // Insert quests with proper expiration dates
    for (const quest of questsToCreate) {
      const expiryDate = getQuestExpiry(quest.type);
      
      await supabase.from('quests').insert({
        user_id: user.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        category: quest.category,
        target: quest.target,
        xp_reward: quest.xp_reward,
        starts_at: now.toISOString(),
        expires_at: expiryDate.toISOString(),
      });
    }

    await fetchGoals();
  };

  // Regenerate quests when user mode changes
  const regenerateQuestsForMode = async (newMode: UserMode) => {
    if (!user) return;

    // Delete existing incomplete non-epic quests (preserve epic progress)
    await supabase
      .from('quests')
      .delete()
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .neq('type', 'epic');

    // Generate new quests for the mode
    await generateQuests(
      userGoals?.focus || 'balanced',
      userGoals?.weekly_application_target || 3,
      newMode
    );

    // Update achievements for new mode
    await initializeAchievements(newMode);
  };

  // Initialize achievements for mode
  const initializeAchievements = async (mode: UserMode) => {
    if (!user) return;

    const modeAchievements = achievementsByMode[mode] || achievementsByMode.active_seeker;

    for (const achievement of modeAchievements) {
      for (const tierDef of achievement.tiers) {
        // Use upsert to avoid duplicates
        await supabase.from('achievements').upsert({
          user_id: user.id,
          achievement_id: achievement.id,
          tier: tierDef.tier,
          target: tierDef.target,
        }, { onConflict: 'user_id,achievement_id,tier', ignoreDuplicates: true });
      }
    }

    await fetchGoals();
  };

  // Award XP and handle level ups
  const awardXP = async (amount: number) => {
    if (!user || !userGoals) return;

    const newTotalXP = userGoals.total_xp + amount;
    const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1;

    await updateGoals({
      total_xp: newTotalXP,
      current_level: newLevel,
    });
  };

  // Award XP for specific action based on mode
  const awardXPForAction = async (action: string) => {
    const modeXpValues = xpValuesByMode[userMode] || xpValuesByMode.active_seeker;
    const xpAmount = modeXpValues[action] || 0;
    
    if (xpAmount > 0) {
      await awardXP(xpAmount);
    }
  };

  // Update quest progress
  const updateQuestProgress = async (questId: string, progress: number) => {
    if (!user) return;

    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const isCompleted = progress >= quest.target;

    await supabase
      .from('quests')
      .update({
        current_progress: progress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', questId);

    if (isCompleted && !quest.is_completed) {
      await awardXP(quest.xp_reward);
    }

    await fetchGoals();
  };

  // Calculate level progress
  const levelProgress = userGoals ? {
    currentXP: userGoals.total_xp,
    xpForCurrentLevel: (userGoals.current_level - 1) * XP_PER_LEVEL,
    xpForNextLevel: userGoals.current_level * XP_PER_LEVEL,
    progressPercent: ((userGoals.total_xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100,
  } : null;

  // Get level title based on mode
  const getLevelTitle = (level: number): string => {
    return getLevelTitleForMode(level, userMode);
  };

  // Get quests by type
  const getQuestsByType = (type: 'daily' | 'weekly' | 'monthly' | 'epic') => {
    return quests.filter(q => q.type === type);
  };

  // Get active (incomplete) quests
  const getActiveQuests = () => {
    return quests.filter(q => !q.is_completed);
  };

  // Get completed quests
  const getCompletedQuests = () => {
    return quests.filter(q => q.is_completed);
  };

  return {
    userGoals,
    quests,
    achievements,
    weeklyStats,
    personalBests,
    loading,
    levelProgress,
    userMode,
    getLevelTitle,
    updateGoals,
    completeSetup,
    updateQuestProgress,
    awardXP,
    awardXPForAction,
    refreshGoals: fetchGoals,
    regenerateQuestsForMode,
    getQuestsByType,
    getActiveQuests,
    getCompletedQuests,
  };
}
