import { useApp, UserMode } from '@/context/AppContext';
import { ButtonRetro } from '@/components/ui/button-retro';
import { motivationalQuotes } from '@/lib/data';
import { Plus, Phone } from 'lucide-react';
import { useMemo } from 'react';
import { AddApplicationDialog } from '@/components/dialogs/AddApplicationDialog';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';
import { QuickCheckInDialog } from '@/components/dialogs/QuickCheckInDialog';
import { useSmartSteps } from '@/hooks/useSmartSteps';
import { useContacts } from '@/hooks/useContacts';
import { ModeWelcome } from '@/components/home/ModeWelcome';
import { CrushWidgets } from '@/components/home/CrushWidgets';
import { ClimbWidgets } from '@/components/home/ClimbWidgets';

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
  const { contacts } = useContacts();
  const userMode = profile?.user_mode as UserMode | null;
  
  const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);
  
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const appliedThisWeek = applications.filter(a => {
      const appDate = new Date(a.date_applied || a.created_at);
      return appDate >= weekStart;
    }).length;

    const monthlyCheckIns = contacts.filter(c => {
      if (!c.last_contacted) return false;
      return new Date(c.last_contacted) >= monthStart;
    }).length;

    const trustedContacts = contacts.filter(c => 
      c.connection_strength === 'close' || c.connection_strength === 'mentor'
    ).length;

    return {
      weeklyStreak: appliedThisWeek > 0 ? Math.min(appliedThisWeek * 2, 14) : 0,
      activeJobs: applications.filter(a => !['Rejected', 'Ghosted'].includes(a.status)).length,
      totalApps: applications.length,
      offers: applications.filter(a => a.status === 'Offer').length,
      interviews: applications.filter(a => a.status === 'Interview').length,
      appliedThisWeek,
      savedJobs: applications.filter(a => a.status === 'Saved').length,
      networkContacts: contacts.length,
      lastResumeUpdate: '2w',
      monthlyCheckIns,
      activeConversations: applications.filter(a => ['Interview', 'Applied'].includes(a.status)).length,
      discreteApplications: applications.length,
      trustedContacts,
      pendingResponses: applications.filter(a => a.status === 'Applied').length,
      skillsInProgress: 3,
      completedGoals: 7,
      learningStreak: 14,
      nextMilestone: 'Sr. Engineer',
    };
  }, [applications, contacts]);

  const recentApps = applications.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);
  const smartSteps = useSmartSteps(applications, events);

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

  const getQuickActions = () => {
    if (userMode === 'climb') {
      return (
        <div className="flex gap-3 flex-wrap">
          <ButtonRetro variant="outline"><Plus className="h-4 w-4" /> Log Learning</ButtonRetro>
          <ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Request Feedback</ButtonRetro>
        </div>
      );
    }
    // Crush mode (default)
    return (
      <div className="flex gap-3 flex-wrap">
        <AddEventDialog trigger={<ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Log Contact</ButtonRetro>} />
        <AddApplicationDialog />
      </div>
    );
  };

  const renderModeWidgets = () => {
    if (userMode === 'climb') {
      return (
        <ClimbWidgets 
          stats={stats} 
          skillsProgress={skillsProgress}
          growthGoals={growthGoals}
        />
      );
    }
    // Crush mode (default)
    return (
      <CrushWidgets 
        stats={stats}
        recentApps={recentApps}
        upcomingEvents={upcomingEvents}
        smartSteps={smartSteps}
        getStatusColor={getStatusColor}
      />
    );
  };

  return (
    <div className="space-y-8">
      <ModeWelcome 
        displayName={profile?.display_name || 'Friend'}
        mode={userMode}
        quote={quote}
      />
      {getQuickActions()}
      {renderModeWidgets()}
    </div>
  );
}
