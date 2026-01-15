import {
  Flame,
  Briefcase,
  FileText,
  Trophy,
  Target,
  Sparkles,
  Calendar,
  Users,
  Shield,
  TrendingUp,
  BookOpen,
  Award,
  Eye,
  Lock,
  DollarSign,
  Heart,
  Zap,
  Clock,
  Bookmark,
  MessageSquare,
  Star,
  Building2,
} from 'lucide-react';
import { WidgetConfig, WidgetCategory } from './types';

// Master registry of all available widgets
export const widgetRegistry: WidgetConfig[] = [
  // ═══════════════════════════════════════════════════════════════
  // APPLICATION & JOB SEARCH WIDGETS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'application_pipeline',
    name: 'Application Pipeline',
    description: 'Track your applications across all stages',
    icon: Briefcase,
    category: 'application',
    availableModes: ['active_seeker', 'stealth_seeker'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'large', priority: 2 },
      stealth_seeker: { visible: true, size: 'large', priority: 3 },
    },
  },
  {
    id: 'todays_momentum',
    name: "Today's Momentum",
    description: 'Daily stats and streak tracking',
    icon: Flame,
    category: 'application',
    availableModes: ['active_seeker'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'large', priority: 1 },
    },
  },
  {
    id: 'quick_apply',
    name: 'Quick Apply',
    description: 'High-match jobs ready for one-click apply',
    icon: Zap,
    category: 'application',
    availableModes: ['active_seeker'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'medium', priority: 5 },
    },
  },
  {
    id: 'saved_jobs',
    name: 'Saved Jobs',
    description: 'Jobs bookmarked for later review',
    icon: Bookmark,
    category: 'application',
    availableModes: ['active_seeker', 'career_insurance'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'small', priority: 9 },
      career_insurance: { visible: true, size: 'medium', priority: 5 },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // INTERVIEW & NETWORKING WIDGETS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'upcoming_interviews',
    name: 'Upcoming Interviews',
    description: 'Scheduled interviews and prep status',
    icon: Calendar,
    category: 'interview',
    availableModes: ['active_seeker', 'stealth_seeker'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'medium', priority: 4 },
      stealth_seeker: { visible: true, size: 'medium', priority: 5 },
    },
  },
  {
    id: 'interview_prep',
    name: 'Interview Prep',
    description: 'Preparation checklist for upcoming interviews',
    icon: FileText,
    category: 'interview',
    availableModes: ['active_seeker', 'stealth_seeker'],
    defaultSettings: {
      active_seeker: { visible: false, size: 'medium', priority: 10 },
      stealth_seeker: { visible: false, size: 'medium', priority: 10 },
    },
  },
  {
    id: 'network_activity',
    name: 'Network Activity',
    description: 'Recent connections and coffee chats',
    icon: Users,
    category: 'networking',
    availableModes: ['active_seeker', 'career_insurance', 'stealth_seeker', 'career_growth'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'small', priority: 8 },
      career_insurance: { visible: true, size: 'medium', priority: 7 },
      stealth_seeker: { visible: true, size: 'small', priority: 9 },
      career_growth: { visible: true, size: 'small', priority: 10 },
    },
  },
  {
    id: 'networking_suggestions',
    name: 'Connect With',
    description: 'Suggested people at your target companies',
    icon: MessageSquare,
    category: 'networking',
    availableModes: ['active_seeker', 'stealth_seeker'],
    defaultSettings: {
      active_seeker: { visible: false, size: 'medium', priority: 11 },
      stealth_seeker: { visible: true, size: 'medium', priority: 8 },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // CAREER HEALTH & MONITORING WIDGETS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'career_health_score',
    name: 'Career Health',
    description: 'Overall career health dashboard',
    icon: Heart,
    category: 'career_health',
    availableModes: ['career_insurance', 'stealth_seeker', 'career_growth'],
    defaultSettings: {
      career_insurance: { visible: true, size: 'full', priority: 1 },
      stealth_seeker: { visible: true, size: 'medium', priority: 6 },
      career_growth: { visible: true, size: 'medium', priority: 6 },
    },
  },
  {
    id: 'market_intelligence',
    name: 'Market Pulse',
    description: 'Industry trends and hiring data',
    icon: TrendingUp,
    category: 'career_health',
    availableModes: ['career_insurance', 'stealth_seeker'],
    defaultSettings: {
      career_insurance: { visible: true, size: 'large', priority: 3 },
      stealth_seeker: { visible: true, size: 'small', priority: 10 },
    },
  },
  {
    id: 'compensation_tracker',
    name: 'Compensation Check',
    description: 'Your position in the market',
    icon: DollarSign,
    category: 'career_health',
    availableModes: ['career_insurance', 'stealth_seeker'],
    defaultSettings: {
      career_insurance: { visible: true, size: 'medium', priority: 6 },
      stealth_seeker: { visible: false, size: 'small', priority: 11 },
    },
  },
  {
    id: 'opportunity_radar',
    name: 'Opportunity Radar',
    description: 'Dream job matches and alerts',
    icon: Target,
    category: 'career_health',
    availableModes: ['career_insurance', 'stealth_seeker'],
    defaultSettings: {
      career_insurance: { visible: true, size: 'large', priority: 2 },
      stealth_seeker: { visible: true, size: 'medium', priority: 4 },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // LEARNING & GROWTH WIDGETS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'promotion_readiness',
    name: 'Promotion Readiness',
    description: 'Track progress toward your next role',
    icon: Trophy,
    category: 'learning',
    availableModes: ['career_growth'],
    defaultSettings: {
      career_growth: { visible: true, size: 'full', priority: 1 },
    },
  },
  {
    id: 'active_learning',
    name: 'Active Learning',
    description: 'Current courses and learning progress',
    icon: BookOpen,
    category: 'learning',
    availableModes: ['career_growth', 'career_insurance'],
    defaultSettings: {
      career_growth: { visible: true, size: 'large', priority: 2 },
      career_insurance: { visible: false, size: 'medium', priority: 10 },
    },
  },
  {
    id: 'skill_gap_analysis',
    name: 'Skill Gaps',
    description: 'What skills to build next',
    icon: Sparkles,
    category: 'learning',
    availableModes: ['career_growth', 'career_insurance'],
    defaultSettings: {
      career_growth: { visible: true, size: 'large', priority: 3 },
      career_insurance: { visible: true, size: 'medium', priority: 5 },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // STEALTH MODE WIDGETS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'stealth_status',
    name: 'Stealth Status',
    description: 'Privacy protections and stealth mode settings',
    icon: Eye,
    category: 'stealth',
    availableModes: ['stealth_seeker'],
    defaultSettings: {
      stealth_seeker: { visible: true, size: 'full', priority: 1 },
    },
  },
  {
    id: 'target_companies',
    name: 'Target Companies',
    description: 'Monitor your dream companies',
    icon: Building2,
    category: 'stealth',
    availableModes: ['stealth_seeker'],
    defaultSettings: {
      stealth_seeker: { visible: true, size: 'large', priority: 2 },
    },
  },
  {
    id: 'interview_scheduler',
    name: 'Interview Scheduler',
    description: 'Discrete scheduling and cover stories',
    icon: Clock,
    category: 'stealth',
    availableModes: ['stealth_seeker'],
    defaultSettings: {
      stealth_seeker: { visible: true, size: 'medium', priority: 5 },
    },
  },
  {
    id: 'offer_comparison',
    name: 'Offer Analysis',
    description: 'Compare offers against current role',
    icon: DollarSign,
    category: 'stealth',
    availableModes: ['stealth_seeker'],
    defaultSettings: {
      stealth_seeker: { visible: false, size: 'medium', priority: 6 },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // GAMIFICATION WIDGETS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'quest_board',
    name: 'Quest Board',
    description: "Today's quests and weekly goals",
    icon: Target,
    category: 'gamification',
    availableModes: ['active_seeker', 'career_growth'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'large', priority: 3 },
      career_growth: { visible: true, size: 'medium', priority: 4 },
    },
  },
  {
    id: 'level_xp',
    name: 'Level & XP',
    description: 'Your gamification progress',
    icon: Star,
    category: 'gamification',
    availableModes: ['active_seeker', 'career_growth'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'small', priority: 7 },
      career_growth: { visible: true, size: 'small', priority: 8 },
    },
  },
  {
    id: 'achievements',
    name: 'Recent Achievements',
    description: 'Badges and milestones unlocked',
    icon: Award,
    category: 'gamification',
    availableModes: ['active_seeker', 'career_growth'],
    defaultSettings: {
      active_seeker: { visible: false, size: 'small', priority: 10 },
      career_growth: { visible: true, size: 'small', priority: 9 },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // UTILITY WIDGETS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'next_actions',
    name: 'Next Actions',
    description: 'Smart suggestions for what to do next',
    icon: Sparkles,
    category: 'quick_actions',
    availableModes: ['active_seeker', 'stealth_seeker'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'medium', priority: 6 },
      stealth_seeker: { visible: true, size: 'small', priority: 8 },
    },
  },
  {
    id: 'weekly_progress',
    name: "This Week's Progress",
    description: 'Weekly goals and progress bars',
    icon: TrendingUp,
    category: 'quick_actions',
    availableModes: ['active_seeker', 'career_growth'],
    defaultSettings: {
      active_seeker: { visible: true, size: 'full', priority: 2.5 },
      career_growth: { visible: true, size: 'medium', priority: 5 },
    },
  },
];

// Helper to get widgets for a specific mode
export function getWidgetsForMode(mode: string): WidgetConfig[] {
  return widgetRegistry.filter(w => 
    w.availableModes.includes(mode as any)
  );
}

// Helper to get widget by ID
export function getWidgetById(id: string): WidgetConfig | undefined {
  return widgetRegistry.find(w => w.id === id);
}

// Helper to get visible widgets for a mode, sorted by priority
export function getVisibleWidgetsForMode(mode: string): WidgetConfig[] {
  return widgetRegistry
    .filter(w => {
      if (!w.availableModes.includes(mode as any)) return false;
      const settings = w.defaultSettings[mode as keyof typeof w.defaultSettings];
      return settings?.visible ?? false;
    })
    .sort((a, b) => {
      const aPriority = a.defaultSettings[mode as keyof typeof a.defaultSettings]?.priority ?? 100;
      const bPriority = b.defaultSettings[mode as keyof typeof b.defaultSettings]?.priority ?? 100;
      return aPriority - bPriority;
    });
}
