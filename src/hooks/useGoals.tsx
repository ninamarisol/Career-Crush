import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApp, UserMode } from '@/context/AppContext';
import { startOfWeek, endOfWeek, differenceInDays, format, subWeeks } from 'date-fns';

// Mode-specific quest templates
interface QuestTemplate {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category: string;
  target: number;
  xp_reward: number;
}

const getActiveSeekerQuests = (weeklyTarget: number): QuestTemplate[] => [
  // Daily quests - focused on application volume
  {
    title: `Apply to ${Math.max(1, Math.ceil(weeklyTarget / 5))} role${weeklyTarget > 5 ? 's' : ''}`,
    description: 'Submit quality applications today',
    type: 'daily',
    category: 'applications',
    target: Math.max(1, Math.ceil(weeklyTarget / 5)),
    xp_reward: 30,
  },
  {
    title: 'Update an application status',
    description: 'Keep your tracker current',
    type: 'daily',
    category: 'applications',
    target: 1,
    xp_reward: 15,
  },
  {
    title: 'Review a job posting thoroughly',
    description: 'Research before you apply',
    type: 'daily',
    category: 'research',
    target: 1,
    xp_reward: 20,
  },
  // Weekly quests
  {
    title: `Submit ${weeklyTarget} applications`,
    description: 'Your weekly application goal',
    type: 'weekly',
    category: 'applications',
    target: weeklyTarget,
    xp_reward: 100,
  },
  {
    title: 'Follow up on 2 applications',
    description: 'Stay engaged with your applications',
    type: 'weekly',
    category: 'networking',
    target: 2,
    xp_reward: 60,
  },
  {
    title: 'Customize 3 resumes for specific roles',
    description: 'Tailor your resume for better matches',
    type: 'weekly',
    category: 'applications',
    target: 3,
    xp_reward: 75,
  },
];

const getCareerInsuranceQuests = (networkingTarget: number): QuestTemplate[] => [
  // Daily quests - focused on small networking actions
  {
    title: 'Engage with 2 LinkedIn posts',
    description: 'Stay visible in your network',
    type: 'daily',
    category: 'networking',
    target: 2,
    xp_reward: 15,
  },
  {
    title: 'Read 1 industry article',
    description: 'Stay current with trends',
    type: 'daily',
    category: 'learning',
    target: 1,
    xp_reward: 10,
  },
  // Weekly quests - relationship building
  {
    title: `Connect with ${networkingTarget} new professional${networkingTarget > 1 ? 's' : ''}`,
    description: 'Grow your network gradually',
    type: 'weekly',
    category: 'networking',
    target: networkingTarget,
    xp_reward: 80,
  },
  {
    title: 'Schedule a coffee chat',
    description: 'Nurture an existing relationship',
    type: 'weekly',
    category: 'networking',
    target: 1,
    xp_reward: 100,
  },
  {
    title: 'Update your LinkedIn profile',
    description: 'Keep your professional brand fresh',
    type: 'weekly',
    category: 'profile',
    target: 1,
    xp_reward: 40,
  },
  {
    title: 'Attend 1 industry event or webinar',
    description: 'Stay connected to your field',
    type: 'weekly',
    category: 'networking',
    target: 1,
    xp_reward: 75,
  },
];

const getStealthSeekerQuests = (weeklyTarget: number): QuestTemplate[] => [
  // Daily quests - discrete actions
  {
    title: 'Research 1 target company',
    description: 'Build your target list quietly',
    type: 'daily',
    category: 'research',
    target: 1,
    xp_reward: 20,
  },
  {
    title: 'Save 2 interesting job postings',
    description: 'Curate opportunities for later',
    type: 'daily',
    category: 'research',
    target: 2,
    xp_reward: 15,
  },
  // Weekly quests - targeted search
  {
    title: `Submit ${weeklyTarget} quality application${weeklyTarget > 1 ? 's' : ''}`,
    description: 'Quality over quantity',
    type: 'weekly',
    category: 'applications',
    target: weeklyTarget,
    xp_reward: 100,
  },
  {
    title: 'Prepare 1 custom cover letter',
    description: 'Craft a compelling narrative',
    type: 'weekly',
    category: 'applications',
    target: 1,
    xp_reward: 50,
  },
  {
    title: 'Update your resume for a target role',
    description: 'Tailor your experience',
    type: 'weekly',
    category: 'applications',
    target: 1,
    xp_reward: 60,
  },
  {
    title: 'Practice 1 interview question',
    description: 'Stay interview-ready',
    type: 'weekly',
    category: 'interview_prep',
    target: 1,
    xp_reward: 40,
  },
];

const getCareerGrowthQuests = (learningHours: number): QuestTemplate[] => [
  // Daily quests - learning focused
  {
    title: 'Learn something new for 30 mins',
    description: 'Invest in your skills daily',
    type: 'daily',
    category: 'learning',
    target: 1,
    xp_reward: 25,
  },
  {
    title: 'Read 1 industry article',
    description: 'Stay current with trends',
    type: 'daily',
    category: 'learning',
    target: 1,
    xp_reward: 15,
  },
  {
    title: 'Practice a skill for 15 mins',
    description: 'Consistent practice builds mastery',
    type: 'daily',
    category: 'learning',
    target: 1,
    xp_reward: 20,
  },
  // Weekly quests - skill development
  {
    title: `Complete ${Math.max(1, Math.ceil(learningHours / 2))} hours of learning`,
    description: 'Your weekly learning goal',
    type: 'weekly',
    category: 'learning',
    target: Math.max(1, Math.ceil(learningHours / 2)),
    xp_reward: 100,
  },
  {
    title: 'Complete 1 course module or chapter',
    description: 'Make progress on your courses',
    type: 'weekly',
    category: 'learning',
    target: 1,
    xp_reward: 75,
  },
  {
    title: 'Build or contribute to a project',
    description: 'Apply what you\'re learning',
    type: 'weekly',
    category: 'projects',
    target: 1,
    xp_reward: 80,
  },
  {
    title: 'Connect with a mentor or peer',
    description: 'Learn from others',
    type: 'weekly',
    category: 'networking',
    target: 1,
    xp_reward: 60,
  },
];

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
      avgMatchScore: 0, // Would need match scoring implemented
    };
  })();

  // Calculate personal bests
  const personalBests: PersonalBests = (() => {
    // Group applications by week
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
      // Fetch or create user goals
      let { data: goalsData } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!goalsData) {
        // Create initial goals
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
    const userMode = profile?.user_mode || 'active_seeker';
    await generateQuests(setup.focus, weeklyTarget, userMode);
    
    // Initialize achievements
    await initializeAchievements(setup.focus, weeklyTarget);
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
  const generateQuests = async (focus: string, weeklyTarget: number, userMode?: UserMode | null) => {
    if (!user) return;

    const now = new Date();
    const dailyExpiry = new Date(now);
    dailyExpiry.setHours(23, 59, 59, 999);

    const weeklyExpiry = endOfWeek(now, { weekStartsOn: 1 });

    // Get mode-specific quest templates
    let questTemplates: QuestTemplate[];
    
    switch (userMode) {
      case 'career_insurance':
        questTemplates = getCareerInsuranceQuests(userGoals?.weekly_networking_target || 2);
        break;
      case 'stealth_seeker':
        questTemplates = getStealthSeekerQuests(Math.max(1, Math.ceil(weeklyTarget / 2))); // Lower target for stealth
        break;
      case 'career_growth':
        questTemplates = getCareerGrowthQuests(userGoals?.weekly_hours || 10);
        break;
      default: // active_seeker
        questTemplates = getActiveSeekerQuests(weeklyTarget);
        break;
    }

    // Add expiry dates to quests
    const questsWithExpiry = questTemplates.map(quest => ({
      ...quest,
      expires_at: quest.type === 'daily' ? dailyExpiry.toISOString() : weeklyExpiry.toISOString(),
    }));

    // Insert quests
    for (const quest of questsWithExpiry) {
      await supabase.from('quests').insert({
        user_id: user.id,
        ...quest,
        starts_at: now.toISOString(),
      });
    }

    await fetchGoals();
  };

  // Regenerate quests when user mode changes
  const regenerateQuestsForMode = async (newMode: UserMode) => {
    if (!user) return;

    // Delete existing incomplete quests
    await supabase
      .from('quests')
      .delete()
      .eq('user_id', user.id)
      .eq('is_completed', false);

    // Generate new quests for the mode
    await generateQuests(
      userGoals?.focus || 'balanced',
      userGoals?.weekly_application_target || 3,
      newMode
    );
  };

  // Initialize achievements
  const initializeAchievements = async (focus: string, weeklyTarget: number) => {
    if (!user) return;

    const baseAchievements = [
      // Application milestones - personalized to baseline
      { id: 'application_warrior', tier: 'bronze', target: weeklyTarget * 2 },
      { id: 'application_warrior', tier: 'silver', target: weeklyTarget * 5 },
      { id: 'application_warrior', tier: 'gold', target: weeklyTarget * 10 },
      { id: 'application_warrior', tier: 'platinum', target: weeklyTarget * 20 },
      // Consistency
      { id: 'consistent_pro', tier: 'bronze', target: 2 },
      { id: 'consistent_pro', tier: 'silver', target: 4 },
      { id: 'consistent_pro', tier: 'gold', target: 8 },
      { id: 'consistent_pro', tier: 'platinum', target: 16 },
      // Interviews
      { id: 'interview_ace', tier: 'bronze', target: 1 },
      { id: 'interview_ace', tier: 'silver', target: 3 },
      { id: 'interview_ace', tier: 'gold', target: 5 },
      { id: 'interview_ace', tier: 'platinum', target: 10 },
    ];

    for (const achievement of baseAchievements) {
      // Use upsert to handle duplicates
      await supabase.from('achievements').upsert({
        user_id: user.id,
        achievement_id: achievement.id,
        tier: achievement.tier,
        target: achievement.target,
      }, { onConflict: 'user_id,achievement_id,tier', ignoreDuplicates: true });
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

  // Get level title
  const getLevelTitle = (level: number): string => {
    const titles = [
      'Newcomer', 'Explorer', 'Seeker', 'Pursuer', 'Contender',
      'Achiever', 'Champion', 'Master', 'Legend', 'Titan'
    ];
    return titles[Math.min(level - 1, titles.length - 1)] || 'Titan';
  };

  return {
    userGoals,
    quests,
    achievements,
    weeklyStats,
    personalBests,
    loading,
    levelProgress,
    getLevelTitle,
    updateGoals,
    completeSetup,
    updateQuestProgress,
    awardXP,
    refreshGoals: fetchGoals,
    regenerateQuestsForMode,
  };
}