// Career Path Types based on spec document

export interface SkillGap {
  skill: string;
  priority: "Critical" | "High" | "Medium" | "Nice-to-Have";
  currentLevel: "None" | "Beginner" | "Intermediate" | "Advanced";
  requiredLevel: "Intermediate" | "Advanced" | "Expert";
  timeToAcquire: string;
  resources: string[];
}

export interface GapAnalysis {
  experienceGap: {
    current: number;
    required: number;
    gap: number;
    strategy: string;
  };
  skillGaps: SkillGap[];
  credentialGaps: {
    credential: string;
    required: boolean;
    timeToComplete: string;
    cost: string;
    roi: string;
  }[];
  networkGaps: {
    targetConnections: string[];
    currentConnections: number;
    strategies: string[];
  };
}

export interface Milestone {
  id: string;
  order: number;
  title: string;
  role: string;
  duration: string;
  objectives: string[];
  skillsToAcquire: string[];
  projectsToLead: string[];
  companiesTargeted?: string[];
  successCriteria: string[];
  completed: boolean;
  progress: number;
}

export interface ActionItem {
  action: string;
  category: "Learning" | "Networking" | "Experience" | "Credibility";
  estimatedTime: string;
  priority: number;
  resources: string[];
}

export interface Course {
  title: string;
  provider: string;
  url?: string;
  cost: string;
  duration: string;
  priority: "Must" | "Should" | "Could";
}

export interface Book {
  title: string;
  author: string;
  why: string;
}

export interface CareerPath {
  generatedAt: string;
  targetRole: string;
  targetCompanies: string[];
  currentRole: string;
  estimatedDuration: string;
  overallProgress: number;
  
  gapAnalysis: GapAnalysis;
  
  milestones: Milestone[];
  
  actionPlan: {
    immediate: ActionItem[];
    shortTerm: {
      action: string;
      category: string;
      quarter: string;
      dependencies: string[];
    }[];
    longTerm: {
      action: string;
      milestone: string;
      estimatedCompletion: string;
    }[];
  };
  
  resources: {
    courses: Course[];
    books: Book[];
    communities: string[];
    mentors: string[];
    companies: string[];
  };
  
  risks: {
    commonPitfalls: string[];
    howToAvoid: string[];
    warningSignsOffTrack: string[];
  };
}

export interface ProgressMetrics {
  overallProgress: number;
  milestonesCompleted: number;
  totalMilestones: number;
  currentMilestone: number;
  tasksCompleted: number;
  totalTasks: number;
  estimatedTimeRemaining: string;
  onTrack: boolean;
  daysAhead: number;
}

export function calculateProgress(careerPath: CareerPath): ProgressMetrics {
  const milestones = careerPath.milestones;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  
  // Weighted progress
  const overallProgress = milestones.reduce((sum, milestone) => {
    return sum + (milestone.progress / totalMilestones);
  }, 0);
  
  // Current milestone
  const currentMilestone = milestones.findIndex(m => !m.completed && m.progress < 100) || 0;
  
  // Count tasks
  const totalTasks = milestones.reduce((sum, m) => sum + m.objectives.length, 0);
  const completedTasks = milestones.reduce((sum, m) => {
    return sum + Math.floor(m.objectives.length * (m.progress / 100));
  }, 0);
  
  // Calculate time remaining
  const progressPercent = Math.round(overallProgress);
  const remainingPercent = 100 - progressPercent;
  const durationMatch = careerPath.estimatedDuration.match(/(\d+)/);
  const totalMonths = durationMatch ? parseInt(durationMatch[1]) : 18;
  const remainingMonths = Math.round((remainingPercent / 100) * totalMonths);
  
  return {
    overallProgress: Math.round(overallProgress),
    milestonesCompleted: completedMilestones,
    totalMilestones,
    currentMilestone,
    tasksCompleted: completedTasks,
    totalTasks,
    estimatedTimeRemaining: `${remainingMonths} months`,
    onTrack: true,
    daysAhead: 0
  };
}
