import { UserMode } from '@/context/AppContext';
import { addDays, endOfWeek, endOfMonth, addMonths } from 'date-fns';

// Quest template interface
export interface QuestTemplate {
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'epic';
  category: 'applications' | 'networking' | 'learning' | 'interview_prep' | 'research' | 'profile' | 'projects' | 'brand' | 'skills';
  target: number;
  xp_reward: number;
  emoji?: string;
}

// Level titles for each mode - simplified to Crush and Climb
export const levelTitlesByMode: Record<UserMode, string[]> = {
  crush: [
    'Job Hunter',          // Level 1-2
    'Job Hunter',
    'Active Applicant',    // Level 3-4
    'Active Applicant',
    'Interview Warrior',   // Level 5-6
    'Interview Warrior',
    'Offer Magnet',        // Level 7-8
    'Offer Magnet',
    'Job Crusher',         // Level 9-10
    'Job Crusher',
    'Career Launcher',     // Level 11-12
    'Career Launcher',
    'Opportunity Master',  // Level 13-14
    'Opportunity Master',
    'Dream Job Hunter',    // Level 15+
  ],
  climb: [
    'Skill Seeker',           // Level 1-2
    'Skill Seeker',
    'Active Learner',         // Level 3-4
    'Active Learner',
    'Growth Focused',         // Level 5-6
    'Growth Focused',
    'Promotion Ready',        // Level 7-8
    'Promotion Ready',
    'Team Leader',            // Level 9-10
    'Team Leader',
    'Expert Builder',         // Level 11-12
    'Expert Builder',
    'Promotion Master',       // Level 13-14
    'Promotion Master',
    'Career Accelerator',     // Level 15+
  ],
};

// Achievement definitions by mode
export interface AchievementDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tiers: { tier: string; target: number }[];
}

export const achievementsByMode: Record<UserMode, AchievementDefinition[]> = {
  crush: [
    {
      id: 'application_warrior',
      name: 'Application Warrior',
      emoji: '⚔️',
      description: 'Submit applications consistently',
      tiers: [
        { tier: 'bronze', target: 10 },
        { tier: 'silver', target: 25 },
        { tier: 'gold', target: 50 },
        { tier: 'platinum', target: 100 },
      ],
    },
    {
      id: 'interview_ace',
      name: 'Interview Ace',
      emoji: '🎤',
      description: 'Complete interviews',
      tiers: [
        { tier: 'bronze', target: 3 },
        { tier: 'silver', target: 10 },
        { tier: 'gold', target: 20 },
        { tier: 'platinum', target: 50 },
      ],
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      emoji: '⚡',
      description: 'Apply to 5 jobs in one day',
      tiers: [{ tier: 'gold', target: 5 }],
    },
    {
      id: 'quality_seeker',
      name: 'Quality Seeker',
      emoji: '💎',
      description: 'High-quality applications',
      tiers: [
        { tier: 'bronze', target: 5 },
        { tier: 'silver', target: 10 },
        { tier: 'gold', target: 25 },
      ],
    },
    {
      id: 'persistent',
      name: 'Persistent',
      emoji: '💪',
      description: 'Continue after rejections',
      tiers: [{ tier: 'gold', target: 10 }],
    },
    {
      id: 'offer_collector',
      name: 'Offer Collector',
      emoji: '💼',
      description: 'Receive job offers',
      tiers: [
        { tier: 'bronze', target: 1 },
        { tier: 'silver', target: 2 },
        { tier: 'gold', target: 3 },
      ],
    },
    {
      id: 'streak_master',
      name: 'Unstoppable Streak',
      emoji: '🔥',
      description: 'Maintain activity streak',
      tiers: [
        { tier: 'bronze', target: 7 },
        { tier: 'silver', target: 14 },
        { tier: 'gold', target: 30 },
      ],
    },
    {
      id: 'star_story_master',
      name: 'Story Master',
      emoji: '⭐',
      description: 'Create STAR stories for interviews',
      tiers: [
        { tier: 'bronze', target: 3 },
        { tier: 'silver', target: 7 },
        { tier: 'gold', target: 15 },
      ],
    },
  ],
  climb: [
    {
      id: 'skill_builder',
      name: 'Skill Builder',
      emoji: '🎓',
      description: 'Complete courses',
      tiers: [
        { tier: 'bronze', target: 3 },
        { tier: 'silver', target: 7 },
        { tier: 'gold', target: 10 },
      ],
    },
    {
      id: 'win_logger',
      name: 'Win Logger',
      emoji: '🏆',
      description: 'Log weekly wins',
      tiers: [
        { tier: 'bronze', target: 10 },
        { tier: 'silver', target: 25 },
        { tier: 'gold', target: 52 },
      ],
    },
    {
      id: 'thought_leader',
      name: 'Thought Leader',
      emoji: '📝',
      description: 'Articles or talks published',
      tiers: [
        { tier: 'bronze', target: 3 },
        { tier: 'silver', target: 5 },
        { tier: 'gold', target: 10 },
      ],
    },
    {
      id: 'mentor',
      name: 'Mentor',
      emoji: '🤝',
      description: 'Junior team members mentored',
      tiers: [
        { tier: 'bronze', target: 1 },
        { tier: 'silver', target: 2 },
        { tier: 'gold', target: 3 },
      ],
    },
    {
      id: 'connector',
      name: 'Connector',
      emoji: '🔗',
      description: 'Maintain network relationships',
      tiers: [
        { tier: 'bronze', target: 10 },
        { tier: 'silver', target: 25 },
        { tier: 'gold', target: 50 },
      ],
    },
    {
      id: 'linkedin_influencer',
      name: 'LinkedIn Voice',
      emoji: '💬',
      description: 'Publish LinkedIn content',
      tiers: [
        { tier: 'bronze', target: 5 },
        { tier: 'silver', target: 12 },
        { tier: 'gold', target: 24 },
      ],
    },
    {
      id: 'promoted',
      name: 'Promoted',
      emoji: '🎉',
      description: 'Achieve promotion',
      tiers: [{ tier: 'platinum', target: 1 }],
    },
  ],
};

// ===== CRUSH MODE QUESTS =====
// Philosophy: "Every application is progress. Every interview is a win. Volume and momentum matter."
export function getCrushQuests(weeklyTarget: number): QuestTemplate[] {
  const dailyAppTarget = Math.max(1, Math.ceil(weeklyTarget / 5));
  
  return [
    // Daily Quests - Application focus
    {
      title: `Submit ${dailyAppTarget} application${dailyAppTarget > 1 ? 's' : ''}`,
      description: 'Quality applications move you forward',
      type: 'daily',
      category: 'applications',
      target: dailyAppTarget,
      xp_reward: 50 * dailyAppTarget,
      emoji: '⚔️',
    },
    {
      title: 'Send 1 follow-up email',
      description: 'You have applications waiting 5+ days',
      type: 'daily',
      category: 'applications',
      target: 1,
      xp_reward: 30,
      emoji: '📧',
    },
    {
      title: 'Tailor a resume for a specific role',
      description: 'Customized resumes get more callbacks',
      type: 'daily',
      category: 'applications',
      target: 1,
      xp_reward: 40,
      emoji: '📝',
    },
    // Weekly Quests
    {
      title: `Submit ${weeklyTarget} applications`,
      description: 'Your weekly application sprint',
      type: 'weekly',
      category: 'applications',
      target: weeklyTarget,
      xp_reward: 200,
      emoji: '🎯',
    },
    {
      title: 'Complete 2 interviews',
      description: 'Each interview is a win',
      type: 'weekly',
      category: 'interview_prep',
      target: 2,
      xp_reward: 150,
      emoji: '📞',
    },
    {
      title: 'Connect with 3 new people',
      description: 'Grow your network for referrals',
      type: 'weekly',
      category: 'networking',
      target: 3,
      xp_reward: 100,
      emoji: '🤝',
    },
    {
      title: 'Create 1 STAR story',
      description: 'Build your interview story library',
      type: 'weekly',
      category: 'interview_prep',
      target: 1,
      xp_reward: 75,
      emoji: '⭐',
    },
    {
      title: 'Research 2 target companies',
      description: 'Prepare for potential interviews',
      type: 'weekly',
      category: 'research',
      target: 2,
      xp_reward: 50,
      emoji: '🔍',
    },
    // Epic Quests
    {
      title: 'The Century Club',
      description: 'Submit 100 applications total',
      type: 'epic',
      category: 'applications',
      target: 100,
      xp_reward: 1000,
      emoji: '🏆',
    },
    {
      title: 'Interview Master',
      description: 'Complete 25 interviews',
      type: 'epic',
      category: 'interview_prep',
      target: 25,
      xp_reward: 750,
      emoji: '🎤',
    },
  ];
}

// ===== CLIMB MODE QUESTS =====
// Philosophy: "Career growth through visibility, learning, and relationships. Strategic and sustainable."
export function getClimbQuests(weeklyHours: number): QuestTemplate[] {
  return [
    // Weekly Quests - Sustainable growth
    {
      title: 'Log this week\'s win',
      description: 'Document an accomplishment for your promotion case',
      type: 'weekly',
      category: 'projects',
      target: 1,
      xp_reward: 75,
      emoji: '🏆',
    },
    {
      title: 'Complete 2 high-leverage actions',
      description: 'Focus on visibility and impact',
      type: 'weekly',
      category: 'skills',
      target: 2,
      xp_reward: 100,
      emoji: '⚡',
    },
    {
      title: 'Reach out to 1 contact',
      description: 'Keep your network warm',
      type: 'weekly',
      category: 'networking',
      target: 1,
      xp_reward: 50,
      emoji: '☕',
    },
    {
      title: 'Spend 1 hour on skill development',
      description: 'Invest in your growth',
      type: 'weekly',
      category: 'learning',
      target: 1,
      xp_reward: 60,
      emoji: '📚',
    },
    // Monthly Quests
    {
      title: 'Publish 1 LinkedIn post',
      description: 'Build your personal brand',
      type: 'monthly',
      category: 'brand',
      target: 1,
      xp_reward: 100,
      emoji: '💬',
    },
    {
      title: 'Have 2 coffee chats',
      description: 'Strengthen key relationships',
      type: 'monthly',
      category: 'networking',
      target: 2,
      xp_reward: 150,
      emoji: '☕',
    },
    {
      title: 'Complete 1 course module',
      description: 'Progress on your learning goals',
      type: 'monthly',
      category: 'learning',
      target: 1,
      xp_reward: 100,
      emoji: '🎓',
    },
    {
      title: 'Update promotion readiness notes',
      description: 'Review gaps and progress',
      type: 'monthly',
      category: 'projects',
      target: 1,
      xp_reward: 75,
      emoji: '📋',
    },
    // Epic Quests
    {
      title: 'Win Tracker Champion',
      description: 'Log 52 weekly wins (1 year)',
      type: 'epic',
      category: 'projects',
      target: 52,
      xp_reward: 1000,
      emoji: '👑',
    },
    {
      title: 'Thought Leader',
      description: 'Publish 12 LinkedIn posts',
      type: 'epic',
      category: 'brand',
      target: 12,
      xp_reward: 750,
      emoji: '📢',
    },
    {
      title: 'Network Master',
      description: 'Maintain 50 active relationships',
      type: 'epic',
      category: 'networking',
      target: 50,
      xp_reward: 800,
      emoji: '🌐',
    },
  ];
}

// Get quest expiration date based on type
export function getQuestExpiry(type: string): Date {
  const now = new Date();
  switch (type) {
    case 'daily':
      return addDays(now, 1);
    case 'weekly':
      return endOfWeek(now, { weekStartsOn: 1 });
    case 'monthly':
      return endOfMonth(now);
    case 'epic':
      return addMonths(now, 12);
    default:
      return addDays(now, 7);
  }
}

// Get all quests for a specific mode
export function getQuestsForMode(
  mode: UserMode,
  weeklyTarget: number = 5,
  networkingTarget: number = 2,
  weeklyHours: number = 10
): QuestTemplate[] {
  switch (mode) {
    case 'climb':
      return getClimbQuests(weeklyHours);
    case 'crush':
    default:
      return getCrushQuests(weeklyTarget);
  }
}

// Get level title for mode
export function getLevelTitleForMode(level: number, mode: UserMode): string {
  const titles = levelTitlesByMode[mode] || levelTitlesByMode.crush;
  const index = Math.min(level - 1, titles.length - 1);
  return titles[index] || titles[0];
}

// XP values for different actions by mode
export const xpValuesByMode: Record<UserMode, Record<string, number>> = {
  crush: {
    application_submitted: 50,
    interview_completed: 100,
    offer_received: 500,
    follow_up_sent: 25,
    resume_tailored: 40,
    star_story_created: 75,
    company_researched: 30,
    practice_completed: 50,
  },
  climb: {
    win_logged: 50,
    skill_hour_completed: 30,
    linkedin_post_published: 75,
    contact_reached: 40,
    course_completed: 150,
    coffee_chat_had: 60,
    promotion_notes_updated: 35,
    high_leverage_action: 50,
  },
};
