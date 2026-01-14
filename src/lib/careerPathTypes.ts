// Career Path Types based on automated trajectory spec

export interface TrajectoryCompensation {
  current: number;
  target: number;
  increase: number;
  percentIncrease: number;
}

export interface TrajectoryAppeal {
  bestFor: string[];
  benefits: string[];
  tradeoffs: string[];
}

export interface TrajectoryMilestone {
  id: string;
  order: number;
  title: string;
  duration: string;
  objectives: string[];
  skillsToAcquire: string[];
  resources: string[];
  successMetrics: string[];
  completed: boolean;
  progress: number;
}

export interface TrajectoryGaps {
  strengths: string[];
  needsToBuild: string[];
  effortLevel: "Low" | "Medium" | "High" | "Very High";
}

export interface TrajectoryMarketContext {
  demandScore: number; // 0-100
  hiringTrends: string;
  competitiveLandscape: string;
  topCompanies: string[];
}

export interface CareerTrajectory {
  id: string;
  name: string;
  icon: string;
  targetRole: string;
  targetCompany: string;
  timeline: string;
  compensation: TrajectoryCompensation;
  successProbability: number;
  difficulty: "Low" | "Medium" | "Medium-High" | "High" | "Very High";
  appeal: TrajectoryAppeal;
  roadmap: {
    milestones: TrajectoryMilestone[];
  };
  gaps: TrajectoryGaps;
  marketContext: TrajectoryMarketContext;
}

export interface GeneratedTrajectories {
  currentRole: string;
  currentCompensation: number;
  yearsOfExperience: number;
  trajectories: CareerTrajectory[];
  recommendedPath: string;
  reasoning: string;
  generatedAt: string;
}

export interface ActiveCareerPath {
  trajectoryId: string;
  trajectory: CareerTrajectory;
  customizations: {
    timeline?: "relaxed" | "standard" | "aggressive";
    focusAreas?: string[];
    targetCompanyType?: string;
    workStylePreference?: string;
    riskTolerance?: "conservative" | "moderate" | "aggressive";
  };
  overallProgress: number;
  currentMilestoneIndex: number;
  startedAt: string;
  lastUpdated: string;
}

// Legacy types for backward compatibility
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
  
  const overallProgress = milestones.reduce((sum, milestone) => {
    return sum + (milestone.progress / totalMilestones);
  }, 0);
  
  const currentMilestone = milestones.findIndex(m => !m.completed && m.progress < 100) || 0;
  
  const totalTasks = milestones.reduce((sum, m) => sum + m.objectives.length, 0);
  const completedTasks = milestones.reduce((sum, m) => {
    return sum + Math.floor(m.objectives.length * (m.progress / 100));
  }, 0);
  
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

export function calculateTrajectoryProgress(trajectory: CareerTrajectory): {
  overallProgress: number;
  milestonesCompleted: number;
  totalMilestones: number;
  currentMilestoneIndex: number;
} {
  const milestones = trajectory.roadmap.milestones;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  
  const overallProgress = milestones.reduce((sum, milestone) => {
    return sum + (milestone.progress / totalMilestones);
  }, 0);
  
  const currentMilestoneIndex = milestones.findIndex(m => !m.completed && m.progress < 100);
  
  return {
    overallProgress: Math.round(overallProgress),
    milestonesCompleted: completedMilestones,
    totalMilestones,
    currentMilestoneIndex: currentMilestoneIndex === -1 ? totalMilestones - 1 : currentMilestoneIndex
  };
}
