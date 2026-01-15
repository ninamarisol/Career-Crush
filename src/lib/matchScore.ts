import { JobPreferences, defaultPriorityWeights, PriorityWeights } from '@/lib/data';
import { Application } from '@/context/AppContext';

export interface ScoreBreakdown {
  location: { score: number; weight: number; reason: string };
  salary: { score: number; weight: number; reason: string };
  roleType: { score: number; weight: number; reason: string };
  industry: { score: number; weight: number; reason: string };
  workStyle: { score: number; weight: number; reason: string };
  totalScore: number;
}

export const calculateMatchScore = (
  application: Application,
  preferences: JobPreferences | null
): ScoreBreakdown => {
  const weights = preferences?.priorityWeights || defaultPriorityWeights;
  
  const breakdown: ScoreBreakdown = {
    location: { score: 75, weight: weights.location, reason: 'No preference set' },
    salary: { score: 75, weight: weights.salary, reason: 'No preference set' },
    roleType: { score: 75, weight: weights.roleType, reason: 'No preference set' },
    industry: { score: 75, weight: weights.industry, reason: 'No preference set' },
    workStyle: { score: 75, weight: weights.workStyle, reason: 'No preference set' },
    totalScore: 75,
  };

  if (!preferences) {
    return breakdown;
  }

  // Location match
  if (preferences.locations.length > 0 && application.location) {
    const isRemote = application.location.toLowerCase() === 'remote';
    const locationLower = application.location.toLowerCase();
    
    const hasMatch = preferences.locations.some(loc => {
      if (loc === 'anywhere') return true;
      if (loc === 'remote' && isRemote) return true;
      return locationLower.includes(loc.toLowerCase());
    });
    
    if (hasMatch) {
      breakdown.location = { score: 100, weight: weights.location, reason: 'Location matches your preferences' };
    } else if (isRemote && preferences.remotePreference === 'flexible') {
      breakdown.location = { score: 80, weight: weights.location, reason: 'Remote work available' };
    } else {
      breakdown.location = { score: 40, weight: weights.location, reason: 'Location does not match preferences' };
    }
  }

  // Salary match
  if (preferences.salaryRange.min > 0 && (application.salary_min || application.salary_max)) {
    const jobSalary = application.salary_max || application.salary_min || 0;
    
    if (jobSalary >= preferences.salaryRange.min && jobSalary <= preferences.salaryRange.max) {
      breakdown.salary = { score: 100, weight: weights.salary, reason: 'Salary within your target range' };
    } else if (jobSalary >= preferences.salaryRange.min * 0.9) {
      breakdown.salary = { score: 80, weight: weights.salary, reason: 'Salary close to your target' };
    } else if (jobSalary >= preferences.salaryRange.min * 0.8) {
      breakdown.salary = { score: 60, weight: weights.salary, reason: 'Salary below target but acceptable' };
    } else {
      breakdown.salary = { score: 40, weight: weights.salary, reason: 'Salary significantly below target' };
    }
  }

  // Role type match
  const allRoleTypes = [...(preferences.roleTypes || []), ...(preferences.customRoleTypes || [])];
  if (allRoleTypes.length > 0 && application.role_type) {
    const hasMatch = allRoleTypes.some(role =>
      application.role_type?.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(application.role_type?.toLowerCase() || '')
    );
    
    if (hasMatch) {
      breakdown.roleType = { score: 100, weight: weights.roleType, reason: 'Role type matches your target' };
    } else {
      breakdown.roleType = { score: 50, weight: weights.roleType, reason: 'Role type does not match preferences' };
    }
  }

  // Industry match
  const allIndustries = [...(preferences.industries || []), ...(preferences.customIndustries || [])];
  if (allIndustries.length > 0 && application.industry) {
    const hasMatch = allIndustries.some(ind =>
      application.industry?.toLowerCase().includes(ind.toLowerCase()) ||
      ind.toLowerCase().includes(application.industry?.toLowerCase() || '')
    );
    
    if (hasMatch) {
      breakdown.industry = { score: 100, weight: weights.industry, reason: 'Industry matches your interests' };
    } else {
      breakdown.industry = { score: 50, weight: weights.industry, reason: 'Industry does not match preferences' };
    }
  }

  // Work style match
  if (application.work_style && preferences.remotePreference) {
    const workStyleLower = application.work_style.toLowerCase();
    const prefLower = preferences.remotePreference.toLowerCase();
    
    if (
      (prefLower === 'remote' && workStyleLower === 'remote') ||
      (prefLower === 'onsite' && workStyleLower === 'on-site') ||
      (prefLower === 'hybrid' && workStyleLower === 'hybrid') ||
      prefLower === 'flexible'
    ) {
      breakdown.workStyle = { score: 100, weight: weights.workStyle, reason: 'Work style matches your preference' };
    } else if (prefLower === 'flexible') {
      breakdown.workStyle = { score: 80, weight: weights.workStyle, reason: 'Flexible on work arrangement' };
    } else {
      breakdown.workStyle = { score: 50, weight: weights.workStyle, reason: 'Work style does not match preference' };
    }
  }

  // Calculate total weighted score
  let totalWeight = 0;
  let weightedSum = 0;
  
  Object.entries(breakdown).forEach(([key, value]) => {
    if (key !== 'totalScore' && typeof value === 'object') {
      totalWeight += value.weight;
      weightedSum += (value.score * value.weight) / 100;
    }
  });

  breakdown.totalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 75;
  breakdown.totalScore = Math.min(100, Math.max(40, breakdown.totalScore));

  return breakdown;
};

export const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 55) return 'text-orange-500';
  return 'text-red-500';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 85) return 'bg-green-500/20';
  if (score >= 70) return 'bg-yellow-500/20';
  if (score >= 55) return 'bg-orange-500/20';
  return 'bg-red-500/20';
};
