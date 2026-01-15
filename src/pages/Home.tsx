import { useApp, UserMode } from '@/context/AppContext';
import { ButtonRetro } from '@/components/ui/button-retro';
import { motivationalQuotes } from '@/lib/data';
import { Plus, Phone } from 'lucide-react';
import { useMemo } from 'react';
import { AddApplicationDialog } from '@/components/dialogs/AddApplicationDialog';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';
import { useSmartSteps } from '@/hooks/useSmartSteps';
import { ModeWelcome } from '@/components/home/ModeWelcome';
import { ActiveSeekerWidgets } from '@/components/home/ActiveSeekerWidgets';
import { CareerInsuranceWidgets } from '@/components/home/CareerInsuranceWidgets';
import { StealthSeekerWidgets } from '@/components/home/StealthSeekerWidgets';
import { CareerGrowthWidgets } from '@/components/home/CareerGrowthWidgets';

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Saved: 'saved',
    Applied: 'applied',
    Interview: 'interview',
    Offer: 'offer',
    Rejected: 'rejected',
    Ghosted: 'ghosted',
  };
  return colors[status] || 'saved';
};

export default function Home() {
  const { profile, applications, events } = useApp();
  const userMode = profile?.user_mode as UserMode | null;
  
  const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);
  
  // Calculate stats based on applications
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const appliedThisWeek = applications.filter(a => {
      const appDate = new Date(a.date_applied || a.created_at);
      return appDate >= weekStart;
    }).length;

    return {
      weeklyStreak: 12, // TODO: Calculate from actual data
      activeJobs: applications.filter(a => !['Rejected', 'Ghosted'].includes(a.status)).length,
      totalApps: applications.length,
      offers: applications.filter(a => a.status === 'Offer').length,
      interviews: applications.filter(a => a.status === 'Interview').length,
      appliedThisWeek,
      savedJobs: applications.filter(a => a.status === 'Saved').length,
      networkContacts: 12, // TODO: Get from contacts
      lastResumeUpdate: '2w',
      monthlyCheckIns: 3,
      activeConversations: applications.filter(a => ['Interview', 'Applied'].includes(a.status)).length,
      discreteApplications: applications.length,
      trustedContacts: 5,
      pendingResponses: applications.filter(a => a.status === 'Applied').length,
      skillsInProgress: 3,
      completedGoals: 7,
      learningStreak: 14,
      nextMilestone: 'Sr. Engineer',
    };
  }, [applications]);

  const recentApps = applications.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);
  const savedPositions = applications.filter(a => a.status === 'Saved').slice(0, 4);
  const activeOpportunities = applications
    .filter(a => !['Rejected', 'Ghosted', 'Saved'].includes(a.status))
    .slice(0, 4)
    .map(a => ({
      ...a,
      lastActivity: '2 days ago', // TODO: Calculate from actual data
    }));

  // Skills and goals mock data for career growth mode
  const skillsProgress = [
    { name: 'Leadership', current: 12, target: 20, category: 'Soft Skills' },
    { name: 'System Design', current: 8, target: 15, category: 'Technical' },
    { name: 'Public Speaking', current: 5, target: 10, category: 'Soft Skills' },
  ];

  const growthGoals = [
    { id: '1', title: 'Complete AWS Certification', progress: 65, deadline: 'Mar 2026' },
    { id: '2', title: 'Lead a cross-team project', progress: 30, deadline: 'Jun 2026' },
    { id: '3', title: 'Mentor a junior developer', progress: 80, deadline: 'Feb 2026' },
  ];

  // Get automated smart steps based on user activity
  const smartSteps = useSmartSteps(applications, events);

  // Mode-specific quick actions
  const getQuickActions = () => {
    switch (userMode) {
      case 'career_insurance':
        return (
          <div className="flex gap-3 flex-wrap">
            <ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Quick Check-in</ButtonRetro>
            <ButtonRetro variant="outline"><Plus className="h-4 w-4" /> Save a Job</ButtonRetro>
          </div>
        );
      case 'stealth_seeker':
        return (
          <div className="flex gap-3 flex-wrap">
            <AddEventDialog trigger={<ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Private Note</ButtonRetro>} />
            <AddApplicationDialog />
          </div>
        );
      case 'career_growth':
        return (
          <div className="flex gap-3 flex-wrap">
            <ButtonRetro variant="outline"><Plus className="h-4 w-4" /> Log Learning</ButtonRetro>
            <ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Request Feedback</ButtonRetro>
          </div>
        );
      default: // active_seeker
        return (
          <div className="flex gap-3 flex-wrap">
            <AddEventDialog trigger={<ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Log Contact</ButtonRetro>} />
            <AddApplicationDialog />
          </div>
        );
    }
  };

  const renderModeWidgets = () => {
    switch (userMode) {
      case 'career_insurance':
        return (
          <CareerInsuranceWidgets 
            stats={stats} 
            savedPositions={savedPositions} 
          />
        );
      case 'stealth_seeker':
        return (
          <StealthSeekerWidgets 
            stats={stats} 
            activeOpportunities={activeOpportunities}
            getStatusColor={getStatusColor}
          />
        );
      case 'career_growth':
        return (
          <CareerGrowthWidgets 
            stats={stats} 
            skillsProgress={skillsProgress}
            growthGoals={growthGoals}
          />
        );
      default: // active_seeker
        return (
          <ActiveSeekerWidgets 
            stats={stats}
            recentApps={recentApps}
            upcomingEvents={upcomingEvents}
            smartSteps={smartSteps}
            getStatusColor={getStatusColor}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Mode-aware Welcome Header */}
      <ModeWelcome 
        displayName={profile?.display_name || 'Friend'}
        mode={userMode}
        quote={quote}
      />

      {/* Mode-specific Quick Actions */}
      {getQuickActions()}

      {/* Mode-specific Widgets */}
      {renderModeWidgets()}
    </div>
  );
}
