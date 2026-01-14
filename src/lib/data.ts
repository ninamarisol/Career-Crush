export type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';

export interface Application {
  id: string;
  roleTitle: string;
  companyName: string;
  companyInitial: string;
  location: string;
  status: ApplicationStatus;
  salaryRange: string;
  dreamJobMatchScore?: number;
  atsScore?: number;
  appliedDate: string;
  jobDescription?: string;
  notes?: string;
  applicationUrl?: string;
  industryTags?: string[];
  roleType?: string;
}

export interface Event {
  id: string;
  title: string;
  eventType: 'Interview' | 'Follow-Up' | 'Coffee Chat' | 'Career Fair' | 'Deadline';
  eventDate: string;
  applicationId?: string;
  completed: boolean;
}

export interface MasterResume {
  summary: string;
  skills: string[];
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    graduationDate: string;
  }[];
  certifications: string[];
}

export interface JobPreferences {
  locations: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  companySizes: ('startup' | 'small' | 'medium' | 'large' | 'enterprise')[];
  roleTypes: string[];
  industries: string[];
  workStyle: {
    pacePreference: 'fast' | 'moderate' | 'relaxed';
    collaborationStyle: 'independent' | 'collaborative' | 'mixed';
    managementPreference: 'hands-off' | 'supportive' | 'structured';
    growthPriority: 'learning' | 'advancement' | 'stability' | 'impact';
  };
  salaryRange: {
    min: number;
    max: number;
  };
  dealbreakers: string[];
}

export interface UserProfile {
  name: string;
  themeColor: 'bubblegum' | 'electric' | 'minty' | 'sky';
  onboardingComplete: boolean;
  weeklyStreak: number;
  masterResume?: MasterResume;
  jobPreferences?: JobPreferences;
}

// Mock data
export const mockApplications: Application[] = [
  {
    id: '1',
    roleTitle: 'Product Designer',
    companyName: 'Linear',
    companyInitial: 'L',
    location: 'Remote',
    status: 'Interview',
    salaryRange: '$120k - $150k',
    dreamJobMatchScore: 92,
    atsScore: 88,
    appliedDate: '2025-01-08',
    jobDescription: 'We are looking for a Product Designer to join our team...',
    notes: 'Great culture, modern design system',
    industryTags: ['Tech', 'SaaS', 'B2B'],
    roleType: 'Full-time',
  },
  {
    id: '2',
    roleTitle: 'Frontend Engineer',
    companyName: 'Vercel',
    companyInitial: 'V',
    location: 'San Francisco, CA',
    status: 'Applied',
    salaryRange: '$140k - $180k',
    dreamJobMatchScore: 85,
    atsScore: 76,
    appliedDate: '2025-01-11',
    jobDescription: 'Join us in building the future of web development...',
    industryTags: ['Tech', 'Developer Tools'],
    roleType: 'Full-time',
  },
  {
    id: '3',
    roleTitle: 'UX Researcher',
    companyName: 'Spotify',
    companyInitial: 'S',
    location: 'New York, NY',
    status: 'Saved',
    salaryRange: '$110k - $140k',
    dreamJobMatchScore: 78,
    appliedDate: '2025-01-13',
    industryTags: ['Tech', 'Entertainment', 'Music'],
    roleType: 'Full-time',
  },
  {
    id: '4',
    roleTitle: 'Product Manager',
    companyName: 'Notion',
    companyInitial: 'N',
    location: 'San Francisco, CA',
    status: 'Offer',
    salaryRange: '$160k - $200k',
    dreamJobMatchScore: 98,
    atsScore: 95,
    appliedDate: '2024-12-30',
    notes: 'Amazing offer! Considering...',
    industryTags: ['Tech', 'Productivity'],
    roleType: 'Full-time',
  },
  {
    id: '5',
    roleTitle: 'Senior Designer',
    companyName: 'Figma',
    companyInitial: 'F',
    location: 'Remote',
    status: 'Rejected',
    salaryRange: '$150k - $180k',
    dreamJobMatchScore: 88,
    atsScore: 72,
    appliedDate: '2024-12-15',
    industryTags: ['Tech', 'Design Tools'],
    roleType: 'Full-time',
  },
  {
    id: '6',
    roleTitle: 'Design Lead',
    companyName: 'Stripe',
    companyInitial: 'S',
    location: 'Seattle, WA',
    status: 'Ghosted',
    salaryRange: '$170k - $210k',
    dreamJobMatchScore: 82,
    appliedDate: '2024-12-01',
    industryTags: ['Tech', 'Fintech'],
    roleType: 'Full-time',
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Linear Design Interview',
    eventType: 'Interview',
    eventDate: '2025-01-15',
    applicationId: '1',
    completed: false,
  },
  {
    id: '2',
    title: 'Follow up with Vercel Recruiter',
    eventType: 'Follow-Up',
    eventDate: '2025-01-16',
    applicationId: '2',
    completed: false,
  },
  {
    id: '3',
    title: 'Coffee chat with Notion PM',
    eventType: 'Coffee Chat',
    eventDate: '2025-01-17',
    completed: false,
  },
];

export const motivationalQuotes = [
  "Your dream job is out there waiting for you. Keep applying! ✨",
  "Every 'no' brings you closer to that perfect 'yes.' Stay strong! 💪",
  "You're not just job hunting—you're building your future. 🚀",
  "Today's application could be tomorrow's career breakthrough! 🌟",
  "Interviews are just conversations. You've got this! 🎯",
  "Your skills are valuable. The right company will see that. 💎",
  "Persistence beats perfection. Keep showing up! 🔥",
  "Every rejection is just redirection to something better. 🌈",
  "You're one application away from changing your life. Go for it! ⚡",
  "Companies don't just hire resumes—they hire amazing people like you! 💖",
];

export const getStatusColor = (status: ApplicationStatus): string => {
  const colors = {
    Saved: 'saved',
    Applied: 'applied',
    Interview: 'interview',
    Offer: 'offer',
    Rejected: 'rejected',
    Ghosted: 'ghosted',
  };
  return colors[status] || 'saved';
};

// Calculate Dream Job Match Score based on user preferences and application
export const calculateDreamJobMatch = (
  application: Application,
  preferences?: JobPreferences
): number => {
  if (!preferences) return application.dreamJobMatchScore || 75;

  let score = 0;
  let factors = 0;

  // Location match (25 points)
  if (preferences.locations.length > 0) {
    factors++;
    const locationMatch = preferences.locations.some(loc => 
      application.location.toLowerCase().includes(loc.toLowerCase()) ||
      loc.toLowerCase() === 'remote' && application.location.toLowerCase() === 'remote'
    );
    if (locationMatch) score += 25;
    else if (preferences.remotePreference === 'flexible') score += 15;
  }

  // Remote preference match (15 points)
  factors++;
  const isRemote = application.location.toLowerCase() === 'remote';
  if (preferences.remotePreference === 'remote' && isRemote) score += 15;
  else if (preferences.remotePreference === 'onsite' && !isRemote) score += 15;
  else if (preferences.remotePreference === 'hybrid' || preferences.remotePreference === 'flexible') score += 10;

  // Industry match (25 points)
  if (preferences.industries.length > 0 && application.industryTags) {
    factors++;
    const industryMatches = application.industryTags.filter(tag =>
      preferences.industries.some(ind => 
        ind.toLowerCase() === tag.toLowerCase()
      )
    );
    score += Math.min(25, (industryMatches.length / preferences.industries.length) * 25);
  }

  // Role type match (20 points)
  if (preferences.roleTypes.length > 0) {
    factors++;
    const roleMatch = preferences.roleTypes.some(role =>
      application.roleTitle.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(application.roleTitle.toLowerCase().split(' ')[0])
    );
    if (roleMatch) score += 20;
  }

  // Salary range match (15 points)
  if (preferences.salaryRange.min > 0 && application.salaryRange) {
    factors++;
    const salaryMatch = application.salaryRange.match(/\$(\d+)k/);
    if (salaryMatch) {
      const jobSalary = parseInt(salaryMatch[1]) * 1000;
      if (jobSalary >= preferences.salaryRange.min && jobSalary <= preferences.salaryRange.max) {
        score += 15;
      } else if (jobSalary >= preferences.salaryRange.min * 0.9) {
        score += 10;
      }
    }
  }

  // Calculate final percentage
  const maxScore = factors * 20; // Average weight per factor
  const percentage = factors > 0 ? Math.round((score / maxScore) * 100) : 75;
  
  return Math.min(100, Math.max(50, percentage)); // Keep between 50-100
};

// Preference options for the survey
export const locationOptions = [
  'Remote', 'New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 
  'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Chicago, IL', 
  'Denver, CO', 'Miami, FL', 'Portland, OR', 'Atlanta, GA'
];

export const companySizeOptions = [
  { value: 'startup', label: 'Startup (1-50)', emoji: '🚀' },
  { value: 'small', label: 'Small (51-200)', emoji: '🌱' },
  { value: 'medium', label: 'Medium (201-1000)', emoji: '🏢' },
  { value: 'large', label: 'Large (1001-5000)', emoji: '🏛️' },
  { value: 'enterprise', label: 'Enterprise (5000+)', emoji: '🌐' },
];

export const industryOptions = [
  'Tech', 'SaaS', 'B2B', 'B2C', 'Fintech', 'Healthcare', 'E-commerce',
  'Entertainment', 'Education', 'Gaming', 'AI/ML', 'Developer Tools',
  'Design', 'Marketing', 'Productivity', 'Social Media', 'Climate Tech'
];

export const roleTypeOptions = [
  'Product Designer', 'UX Designer', 'UI Designer', 'Design Lead',
  'Product Manager', 'Project Manager', 'Program Manager',
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'UX Researcher', 'Data Analyst', 'Marketing Manager', 'Growth Manager'
];
