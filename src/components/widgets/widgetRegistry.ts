import {
  Flame,
  Briefcase,
  FileText,
  Trophy,
  Target,
  Sparkles,
  Calendar,
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Zap,
  Clock,
  Star,
  Building2,
  MessageSquare,
  ScanLine,
  FileEdit,
  Mic,
  Brain,
  Linkedin,
  BarChart3,
  ChevronUp,
  GraduationCap,
  Timer,
} from 'lucide-react';
import { WidgetConfig } from './types';

// Master registry of all available widgets for Crush and Climb modes
export const widgetRegistry: WidgetConfig[] = [
  // ═══════════════════════════════════════════════════════════════
  // CRUSH MODE WIDGETS - Active Job Search
  // ═══════════════════════════════════════════════════════════════
  
  // Application Tracking
  {
    id: 'todays_momentum',
    name: "Today's Momentum",
    description: 'Daily application stats and streak tracking',
    icon: Flame,
    category: 'application',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'large', priority: 1 },
    },
  },
  {
    id: 'application_pipeline',
    name: 'Application Pipeline',
    description: 'Track applications across all stages',
    icon: Briefcase,
    category: 'application',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'large', priority: 2 },
    },
  },
  {
    id: 'weekly_progress',
    name: "This Week's Progress",
    description: 'Weekly goals and progress tracking',
    icon: TrendingUp,
    category: 'application',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'full', priority: 3 },
    },
  },
  {
    id: 'upcoming_interviews',
    name: 'Upcoming Interviews',
    description: 'Scheduled interviews and prep status',
    icon: Calendar,
    category: 'interview',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'medium', priority: 4 },
    },
  },
  {
    id: 'next_actions',
    name: 'Next Actions',
    description: 'Smart suggestions for what to do next',
    icon: Sparkles,
    category: 'quick_actions',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'medium', priority: 5 },
    },
  },
  
  // Resume Tools
  {
    id: 'ats_scanner',
    name: 'ATS Resume Scanner',
    description: 'Scan your resume against job descriptions',
    icon: ScanLine,
    category: 'resume',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'medium', priority: 6 },
    },
  },
  {
    id: 'resume_generator',
    name: 'Resume Generator',
    description: 'Generate tailored resumes from your master resume',
    icon: FileEdit,
    category: 'resume',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: false, size: 'medium', priority: 10 },
    },
  },
  
  // Interview Prep
  {
    id: 'star_stories',
    name: 'STAR Story Library',
    description: 'Your behavioral interview stories',
    icon: Star,
    category: 'interview',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'medium', priority: 7 },
    },
  },
  {
    id: 'practice_mode',
    name: 'Practice Mode',
    description: 'Practice interview questions with timers',
    icon: Mic,
    category: 'interview',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: false, size: 'medium', priority: 11 },
    },
  },
  {
    id: 'company_research',
    name: 'Company Research',
    description: 'Research notes for target companies',
    icon: Building2,
    category: 'interview',
    availableModes: ['crush'],
    defaultSettings: {
      crush: { visible: true, size: 'small', priority: 8 },
    },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // CLIMB MODE WIDGETS - Career Growth
  // ═══════════════════════════════════════════════════════════════
  
  // Promotion Readiness
  {
    id: 'weekly_actions',
    name: 'Weekly High-Leverage Actions',
    description: 'AI-generated weekly career actions',
    icon: Zap,
    category: 'promotion',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'large', priority: 1 },
    },
  },
  {
    id: 'promotion_readiness',
    name: 'Promotion Readiness',
    description: 'Track progress toward your next role',
    icon: Trophy,
    category: 'promotion',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'full', priority: 2 },
    },
  },
  {
    id: 'gap_analysis',
    name: 'Gap Analysis',
    description: 'Current vs target role comparison',
    icon: Target,
    category: 'promotion',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'large', priority: 3 },
    },
  },
  {
    id: 'timeline_predictor',
    name: 'Promotion Timeline',
    description: 'Estimated timeline to next promotion',
    icon: Timer,
    category: 'promotion',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'medium', priority: 4 },
    },
  },
  {
    id: 'impact_narrative',
    name: 'Impact Narratives',
    description: 'Turn wins into promotion-worthy stories',
    icon: Award,
    category: 'promotion',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'medium', priority: 5 },
    },
  },
  
  // Skills & Learning
  {
    id: 'skill_recommendations',
    name: 'High-ROI Skills',
    description: 'Skills with the best career ROI',
    icon: Brain,
    category: 'skills',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'medium', priority: 6 },
    },
  },
  {
    id: 'skills_progress',
    name: 'Skills in Progress',
    description: 'Track your skill development',
    icon: GraduationCap,
    category: 'skills',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'medium', priority: 7 },
    },
  },
  {
    id: 'skill_decay',
    name: 'Skill Decay Alerts',
    description: 'Skills that need refreshing',
    icon: Clock,
    category: 'skills',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: false, size: 'small', priority: 12 },
    },
  },
  
  // Personal Brand & Network
  {
    id: 'linkedin_ideas',
    name: 'LinkedIn Content Ideas',
    description: 'Post ideas and engagement prompts',
    icon: Linkedin,
    category: 'brand',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'medium', priority: 8 },
    },
  },
  {
    id: 'relationship_maintenance',
    name: 'Relationship Maintenance',
    description: 'Keep your network warm',
    icon: Users,
    category: 'networking',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'medium', priority: 9 },
    },
  },
  {
    id: 'network_health',
    name: 'Network Health',
    description: 'Overall network status and contacts to reach out to',
    icon: MessageSquare,
    category: 'networking',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'small', priority: 10 },
    },
  },
  
  // Win Logging
  {
    id: 'win_logger',
    name: 'Log a Win',
    description: 'Quick entry for weekly accomplishments',
    icon: ChevronUp,
    category: 'promotion',
    availableModes: ['climb'],
    defaultSettings: {
      climb: { visible: true, size: 'small', priority: 11 },
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
