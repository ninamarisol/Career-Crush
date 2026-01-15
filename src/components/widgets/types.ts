import { UserMode } from '@/context/AppContext';
import { LucideIcon } from 'lucide-react';

// Widget size determines how it renders in the grid
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

// Widget categories for organization - updated for Crush/Climb modes
export type WidgetCategory = 
  | 'application'        // Crush: application tracking
  | 'interview'          // Crush: interview prep
  | 'resume'             // Crush: resume tools
  | 'networking'         // Both: contacts/network
  | 'promotion'          // Climb: promotion readiness
  | 'skills'             // Climb: skill development
  | 'brand'              // Climb: personal branding
  | 'quick_actions';     // Both: quick actions

// Base widget configuration
export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: WidgetCategory;
  
  // Which modes this widget is available in
  availableModes: UserMode[];
  
  // Default settings per mode
  defaultSettings: Partial<Record<UserMode, {
    visible: boolean;
    size: WidgetSize;
    priority: number; // Lower = higher on page
  }>>;
}

// Widget instance with user preferences merged
export interface WidgetInstance extends WidgetConfig {
  visible: boolean;
  size: WidgetSize;
  priority: number;
}

// Common widget props that all widgets receive
export interface BaseWidgetProps {
  size: WidgetSize;
  className?: string;
}

// Stats shape passed to many widgets
export interface DashboardStats {
  // Active Seeker
  weeklyStreak: number;
  activeJobs: number;
  totalApps: number;
  offers: number;
  interviews: number;
  appliedThisWeek: number;
  
  // Career Insurance
  savedJobs: number;
  networkContacts: number;
  lastResumeUpdate: string;
  monthlyCheckIns: number;
  
  // Stealth
  activeConversations: number;
  discreteApplications: number;
  trustedContacts: number;
  pendingResponses: number;
  
  // Career Growth
  skillsInProgress: number;
  completedGoals: number;
  learningStreak: number;
  nextMilestone: string;
  
  // Gamification
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  
  // Career Health
  careerHealthScore: number;
  marketPosition: number;
  skillRelevance: number;
  networkHealth: number;
  compensationPercentile: number;
}

// Quest/Goal types for gamification widgets
export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  type: 'daily' | 'weekly' | 'monthly';
  category: string;
}

// Network contact for networking widgets
export interface NetworkContact {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  lastContacted: string | null;
  connectionStrength: 'weak' | 'medium' | 'strong' | null;
}

// Skill progress for learning widgets
export interface SkillProgress {
  name: string;
  current: number;
  target: number;
  category: string;
}

// Growth goal for career growth widgets
export interface GrowthGoal {
  id: string;
  title: string;
  progress: number;
  deadline: string;
}

// Target company for stealth mode
export interface TargetCompany {
  id: string;
  name: string;
  openRoles: number;
  topMatch: {
    position: string;
    matchScore: number;
  } | null;
}

// Opportunity for radar widget
export interface OpportunityMatch {
  id: string;
  company: string;
  position: string;
  matchScore: number;
  postedAgo: string;
  potentialIncrease: number | null;
}
