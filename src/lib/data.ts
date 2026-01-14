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

export interface UserProfile {
  name: string;
  themeColor: 'bubblegum' | 'electric' | 'minty' | 'sky';
  onboardingComplete: boolean;
  weeklyStreak: number;
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
  "Your career is a marathon, not a sprint. But you look fast. 🏃",
  "Every application is a step closer to your dream role. ✨",
  "Rejection is redirection. Keep pushing forward. 💪",
  "You've got this. Trust the process. 🌟",
  "The best time to plant a tree was 20 years ago. The second best time is now. 🌱",
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
