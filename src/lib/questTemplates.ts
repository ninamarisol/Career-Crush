import { UserMode } from '@/context/AppContext';
import { addDays, endOfWeek, endOfMonth, addMonths } from 'date-fns';

// Quest template interface
export interface QuestTemplate {
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'epic';
  category: 'applications' | 'networking' | 'learning' | 'interview_prep' | 'research' | 'profile' | 'projects';
  target: number;
  xp_reward: number;
  emoji?: string;
}

// Level titles for each mode
export const levelTitlesByMode: Record<UserMode, string[]> = {
  active_seeker: [
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
  career_insurance: [
    'Career Observer',        // Level 1-2
    'Career Observer',
    'Network Builder',        // Level 3-4
    'Network Builder',
    'Market Aware Pro',       // Level 5-6
    'Market Aware Pro',
    'Strategic Connector',    // Level 7-8
    'Strategic Connector',
    'Career Optimizer',       // Level 9-10
    'Career Optimizer',
    'Industry Insider',       // Level 11-12
    'Industry Insider',
    'Career Secure',          // Level 13-14
    'Career Secure',
    'Career Master',          // Level 15+
  ],
  stealth_seeker: [
    'Strategic Observer',     // Level 1-2
    'Strategic Observer',
    'Stealth Applicant',      // Level 3-4
    'Stealth Applicant',
    'Target Tracker',         // Level 5-6
    'Target Tracker',
    'Quality Seeker',         // Level 7-8
    'Quality Seeker',
    'Precision Hunter',       // Level 9-10
    'Precision Hunter',
    'Strategic Negotiator',   // Level 11-12
    'Strategic Negotiator',
    'Stealth Master',         // Level 13-14
    'Stealth Master',
    'Strategic Closer',       // Level 15+
  ],
  career_growth: [
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
  active_seeker: [
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
  ],
  career_insurance: [
    {
      id: 'connector',
      name: 'Connector',
      emoji: '🤝',
      description: 'Build quality connections',
      tiers: [
        { tier: 'bronze', target: 10 },
        { tier: 'silver', target: 25 },
        { tier: 'gold', target: 50 },
      ],
    },
    {
      id: 'lifelong_learner',
      name: 'Lifelong Learner',
      emoji: '📚',
      description: 'Complete courses',
      tiers: [
        { tier: 'bronze', target: 2 },
        { tier: 'silver', target: 5 },
        { tier: 'gold', target: 10 },
      ],
    },
    {
      id: 'career_aware',
      name: 'Career Aware',
      emoji: '📊',
      description: 'Track market monthly',
      tiers: [
        { tier: 'bronze', target: 3 },
        { tier: 'silver', target: 6 },
        { tier: 'gold', target: 12 },
      ],
    },
    {
      id: 'relationship_master',
      name: 'Relationship Master',
      emoji: '☕',
      description: 'Coffee chats per year',
      tiers: [
        { tier: 'bronze', target: 4 },
        { tier: 'silver', target: 8 },
        { tier: 'gold', target: 12 },
      ],
    },
    {
      id: 'event_goer',
      name: 'Event Goer',
      emoji: '🎟️',
      description: 'Attend industry events',
      tiers: [
        { tier: 'bronze', target: 2 },
        { tier: 'silver', target: 4 },
        { tier: 'gold', target: 6 },
      ],
    },
  ],
  stealth_seeker: [
    {
      id: 'strategic_hunter',
      name: 'Strategic Hunter',
      emoji: '🎯',
      description: 'High-match applications',
      tiers: [
        { tier: 'bronze', target: 3 },
        { tier: 'silver', target: 7 },
        { tier: 'gold', target: 10 },
      ],
    },
    {
      id: 'quality_perfectionist',
      name: 'Quality Perfectionist',
      emoji: '💎',
      description: '95%+ match applications',
      tiers: [
        { tier: 'bronze', target: 3 },
        { tier: 'silver', target: 5 },
        { tier: 'gold', target: 10 },
      ],
    },
    {
      id: 'stealth_master',
      name: 'Stealth Master',
      emoji: '🕵️',
      description: 'Months of stealth search',
      tiers: [
        { tier: 'bronze', target: 2 },
        { tier: 'silver', target: 4 },
        { tier: 'gold', target: 6 },
      ],
    },
    {
      id: 'network_mapper',
      name: 'Network Mapper',
      emoji: '🗺️',
      description: 'Target company contacts',
      tiers: [
        { tier: 'bronze', target: 5 },
        { tier: 'silver', target: 10 },
        { tier: 'gold', target: 20 },
      ],
    },
    {
      id: 'negotiator',
      name: 'Negotiation Pro',
      emoji: '💰',
      description: 'Successful negotiations',
      tiers: [
        { tier: 'bronze', target: 1 },
        { tier: 'silver', target: 2 },
        { tier: 'gold', target: 3 },
      ],
    },
  ],
  career_growth: [
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
      id: 'ship_it',
      name: 'Ship It',
      emoji: '🚀',
      description: 'Features shipped at work',
      tiers: [
        { tier: 'bronze', target: 2 },
        { tier: 'silver', target: 3 },
        { tier: 'gold', target: 5 },
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
      id: 'continuous_learner',
      name: 'Continuous Learner',
      emoji: '📚',
      description: 'Quarters with completed course',
      tiers: [
        { tier: 'bronze', target: 2 },
        { tier: 'silver', target: 3 },
        { tier: 'gold', target: 4 },
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

// ===== ACTIVE JOB SEEKER QUESTS =====
// Philosophy: "Every application is progress. Every interview is a win. Volume and momentum matter."
export function getActiveSeekerQuests(weeklyTarget: number): QuestTemplate[] {
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

// ===== CAREER INSURANCE QUESTS =====
// Philosophy: "Career health maintained through relationships, awareness, and learning. Low effort, high impact."
export function getCareerInsuranceQuests(networkingTarget: number): QuestTemplate[] {
  return [
    // Monthly Quests - Low pressure, optional feeling
    {
      title: 'Engage on LinkedIn 3 times',
      description: 'Like, comment, or share industry content (~5 min)',
      type: 'monthly',
      category: 'networking',
      target: 3,
      xp_reward: 30,
      emoji: '💬',
    },
    {
      title: 'Have 1 coffee chat',
      description: 'Strengthen an existing relationship (30-60 min)',
      type: 'monthly',
      category: 'networking',
      target: 1,
      xp_reward: 75,
      emoji: '☕',
    },
    {
      title: 'Complete 1 short course or reading',
      description: 'Keep skills current and relevant (1-2 hours)',
      type: 'monthly',
      category: 'learning',
      target: 1,
      xp_reward: 50,
      emoji: '📚',
    },
    {
      title: 'Attend 1 virtual event or webinar',
      description: 'Stay connected to industry trends (1 hour)',
      type: 'monthly',
      category: 'networking',
      target: 1,
      xp_reward: 40,
      emoji: '🎟️',
    },
    // Weekly - Lighter touch
    {
      title: `Connect with ${networkingTarget} new professional${networkingTarget > 1 ? 's' : ''}`,
      description: 'Grow your network gradually',
      type: 'weekly',
      category: 'networking',
      target: networkingTarget,
      xp_reward: 50,
      emoji: '🤝',
    },
    {
      title: 'Read 2 industry articles',
      description: 'Stay current with trends (~15 min)',
      type: 'weekly',
      category: 'learning',
      target: 2,
      xp_reward: 20,
      emoji: '📰',
    },
    // Epic Milestones
    {
      title: 'Network Builder',
      description: 'Maintain 50+ quality connections',
      type: 'epic',
      category: 'networking',
      target: 50,
      xp_reward: 200,
      emoji: '🏅',
    },
    {
      title: 'Relationship Master',
      description: 'Complete 12 coffee chats this year',
      type: 'epic',
      category: 'networking',
      target: 12,
      xp_reward: 500,
      emoji: '☕',
    },
  ];
}

// ===== STEALTH SEEKER QUESTS =====
// Philosophy: "Quality over quantity. Strategic moves over volume. Discrete and effective."
export function getStealthSeekerQuests(weeklyTarget: number): QuestTemplate[] {
  // Stealth seekers have lower volume but higher quality requirements
  const qualityTarget = Math.max(1, Math.ceil(weeklyTarget / 2));
  
  return [
    // Weekly Strategic Quests - Quality focused
    {
      title: 'Deep dive on 2 target companies',
      description: 'Research culture, products, team, news (1-2 hours)',
      type: 'weekly',
      category: 'research',
      target: 2,
      xp_reward: 60,
      emoji: '🔍',
    },
    {
      title: `Submit ${qualityTarget} highly-tailored application${qualityTarget > 1 ? 's' : ''}`,
      description: 'Only to 90%+ match companies (2-3 hours)',
      type: 'weekly',
      category: 'applications',
      target: qualityTarget,
      xp_reward: 100,
      emoji: '💼',
    },
    {
      title: 'Save 5 potential roles for review',
      description: 'Quick browsing during lunch (~15 min)',
      type: 'weekly',
      category: 'research',
      target: 5,
      xp_reward: 25,
      emoji: '📋',
    },
    {
      title: 'Connect with 1 person at target company',
      description: 'Alumni, mutual connection, or cold reach (30 min)',
      type: 'weekly',
      category: 'networking',
      target: 1,
      xp_reward: 50,
      emoji: '🤝',
    },
    // Monthly Campaigns
    {
      title: 'Practice 5 behavioral interview questions',
      description: 'Be ready when opportunity comes',
      type: 'monthly',
      category: 'interview_prep',
      target: 5,
      xp_reward: 50,
      emoji: '🧠',
    },
    {
      title: 'Review 3 offer negotiations',
      description: 'Prepare for your own negotiation',
      type: 'monthly',
      category: 'research',
      target: 3,
      xp_reward: 75,
      emoji: '📊',
    },
    {
      title: 'Coffee chat with someone at target company',
      description: 'Get insider perspective, build connection',
      type: 'monthly',
      category: 'networking',
      target: 1,
      xp_reward: 100,
      emoji: '☕',
    },
    // Epic Strategic Milestones
    {
      title: 'Quality Perfectionist',
      description: 'Submit 10 applications with 95%+ match',
      type: 'epic',
      category: 'applications',
      target: 10,
      xp_reward: 750,
      emoji: '💎',
    },
    {
      title: 'Target Acquired',
      description: 'Land interview at a Tier 1 target company',
      type: 'epic',
      category: 'interview_prep',
      target: 1,
      xp_reward: 500,
      emoji: '🎯',
    },
  ];
}

// ===== CAREER GROWTH QUESTS =====
// Philosophy: "Growth is measured in skills acquired, projects completed, and readiness for promotion."
export function getCareerGrowthQuests(weeklyHours: number): QuestTemplate[] {
  const learningSessionTarget = Math.max(3, Math.ceil(weeklyHours / 2));
  
  return [
    // Daily Learning Quests
    {
      title: 'Learn something new for 30 min',
      description: 'Invest in your skills daily',
      type: 'daily',
      category: 'learning',
      target: 1,
      xp_reward: 25,
      emoji: '📖',
    },
    {
      title: 'Read 1 industry article',
      description: 'Stay current with trends',
      type: 'daily',
      category: 'learning',
      target: 1,
      xp_reward: 15,
      emoji: '📰',
    },
    {
      title: 'Practice a skill for 15 min',
      description: 'Consistent practice builds mastery',
      type: 'daily',
      category: 'learning',
      target: 1,
      xp_reward: 20,
      emoji: '🛠️',
    },
    // Weekly Learning Quests
    {
      title: `Complete ${learningSessionTarget} learning sessions`,
      description: 'Your weekly learning commitment',
      type: 'weekly',
      category: 'learning',
      target: learningSessionTarget,
      xp_reward: 100,
      emoji: '🎓',
    },
    {
      title: 'Complete 1 course module or chapter',
      description: 'Make progress on your courses',
      type: 'weekly',
      category: 'learning',
      target: 1,
      xp_reward: 75,
      emoji: '📚',
    },
    {
      title: 'Build or contribute to a project',
      description: 'Apply what you\'re learning',
      type: 'weekly',
      category: 'projects',
      target: 1,
      xp_reward: 80,
      emoji: '🚀',
    },
    {
      title: 'Connect with a mentor or peer',
      description: 'Learn from others',
      type: 'weekly',
      category: 'networking',
      target: 1,
      xp_reward: 60,
      emoji: '🤝',
    },
    // Monthly Skill Sprints
    {
      title: 'Complete a full course or certification',
      description: 'Major learning milestone',
      type: 'monthly',
      category: 'learning',
      target: 1,
      xp_reward: 200,
      emoji: '🏆',
    },
    {
      title: 'Write a case study for portfolio',
      description: 'Document your success',
      type: 'monthly',
      category: 'projects',
      target: 1,
      xp_reward: 100,
      emoji: '📝',
    },
    // Epic Career Milestones
    {
      title: 'Skill Builder',
      description: 'Complete 10 courses/certifications',
      type: 'epic',
      category: 'learning',
      target: 10,
      xp_reward: 1000,
      emoji: '🎓',
    },
    {
      title: 'Thought Leader',
      description: 'Publish 10 articles or talks',
      type: 'epic',
      category: 'projects',
      target: 10,
      xp_reward: 750,
      emoji: '📝',
    },
  ];
}

// Helper to get quests by mode
export function getQuestsForMode(
  mode: UserMode,
  weeklyTarget: number,
  networkingTarget: number,
  weeklyHours: number
): QuestTemplate[] {
  switch (mode) {
    case 'career_insurance':
      return getCareerInsuranceQuests(networkingTarget);
    case 'stealth_seeker':
      return getStealthSeekerQuests(weeklyTarget);
    case 'career_growth':
      return getCareerGrowthQuests(weeklyHours);
    default:
      return getActiveSeekerQuests(weeklyTarget);
  }
}

// Get expiration date based on quest type
export function getQuestExpiry(type: 'daily' | 'weekly' | 'monthly' | 'epic'): Date {
  const now = new Date();
  
  switch (type) {
    case 'daily':
      const dailyExpiry = new Date(now);
      dailyExpiry.setHours(23, 59, 59, 999);
      return dailyExpiry;
    case 'weekly':
      return endOfWeek(now, { weekStartsOn: 1 });
    case 'monthly':
      return endOfMonth(now);
    case 'epic':
      return addMonths(now, 12); // Epic quests last a year
    default:
      return endOfWeek(now, { weekStartsOn: 1 });
  }
}

// Get level title for mode
export function getLevelTitleForMode(level: number, mode: UserMode): string {
  const titles = levelTitlesByMode[mode] || levelTitlesByMode.active_seeker;
  const index = Math.min(level - 1, titles.length - 1);
  return titles[Math.max(0, index)] || 'Newcomer';
}

// XP values by mode and action
export const xpValuesByMode: Record<UserMode, Record<string, number>> = {
  active_seeker: {
    submit_application: 25,
    tailor_resume: 40,
    write_cover_letter: 35,
    high_ats_score: 50,
    schedule_interview: 50,
    complete_phone_screen: 75,
    complete_onsite: 150,
    send_thank_you: 20,
    add_contact: 15,
    coffee_chat: 50,
    referral_received: 100,
    follow_up_email: 30,
    update_status: 10,
  },
  career_insurance: {
    linkedin_engagement: 10,
    connect_new_person: 15,
    coffee_chat: 75,
    industry_event: 40,
    referral_given: 50,
    complete_course: 50,
    read_article: 10,
    complete_certification: 150,
    attend_webinar: 30,
    update_skills: 20,
    review_comp: 30,
    check_dream_companies: 15,
    monthly_activity_bonus: 100,
  },
  stealth_seeker: {
    save_job: 10,
    research_company_deep: 60,
    submit_90_match: 100,
    submit_95_match: 150,
    custom_cover_letter: 50,
    target_company_contact: 50,
    coffee_chat_insider: 100,
    referral_connection: 150,
    alumni_connection: 75,
    land_target_interview: 200,
    complete_final_round: 300,
    receive_offer: 500,
    successful_negotiation: 250,
    weekly_complete_bonus: 150,
  },
  career_growth: {
    complete_module: 50,
    finish_course: 200,
    earn_certification: 300,
    read_book: 75,
    practice_exercises: 30,
    ship_feature: 150,
    lead_project: 200,
    present_to_leadership: 100,
    mentor_junior: 40,
    document_case_study: 75,
    write_article: 100,
    give_presentation: 150,
    speak_at_conference: 300,
    publish_company_blog: 75,
    meet_promotion_requirement: 100,
    update_promotion_packet: 50,
    get_promotion: 1000,
  },
};
