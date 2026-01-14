import { useApp } from '@/context/AppContext';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { motivationalQuotes } from '@/lib/data';
import { Plus, Phone, Flame, Briefcase, FileText, Trophy, ArrowRight, Calendar, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { AddApplicationDialog } from '@/components/dialogs/AddApplicationDialog';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';
import { SmartStepDialog } from '@/components/dialogs/SmartStepDialog';

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
  
  const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);
  
  const stats = useMemo(() => ({
    weeklyStreak: 12, // TODO: Calculate from actual data
    activeJobs: applications.filter(a => !['Rejected', 'Ghosted'].includes(a.status)).length,
    totalApps: applications.length,
    offers: applications.filter(a => a.status === 'Offer').length,
  }), [applications]);

  const recentApps = applications.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  const smartSteps = [
    {
      title: 'Optimize Resume for Linear',
      description: "Your match score is 92%. Adding 'Product Strategy' could bump it to 98%.",
      type: 'optimize' as const,
      buttonLabel: 'Optimize',
      buttonVariant: 'default' as const,
    },
    {
      title: 'Follow up with Vercel',
      description: "It's been 3 days since your application. A quick note shows initiative.",
      type: 'followup' as const,
      buttonLabel: 'Draft Email',
      buttonVariant: 'outline' as const,
    },
    {
      title: 'Networking Opportunity',
      description: '3 alumni from your school work at Notion. Reach out for a coffee chat?',
      type: 'network' as const,
      buttonLabel: 'View Contacts',
      buttonVariant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black">Welcome back, {profile?.display_name || 'Friend'} 👋</h1>
        <p className="text-muted-foreground italic">{quote}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <AddEventDialog trigger={<ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Log Contact</ButtonRetro>} />
        <AddApplicationDialog />
      </div>

      {/* Performance Tracker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardRetro className="p-4 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary border-2 border-border"><Flame className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Weekly Streak</p>
              <p className="text-2xl font-black">{stats.weeklyStreak} 🔥</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-info/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info border-2 border-border"><Briefcase className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-black">{stats.activeJobs}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary border-2 border-border"><FileText className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Applications</p>
              <p className="text-2xl font-black">{stats.totalApps}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success border-2 border-border"><Trophy className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Offers</p>
              <p className="text-2xl font-black">{stats.offers} 🎉</p>
            </div>
          </div>
        </CardRetro>
      </div>

      {/* Smart Next Steps */}
      <CardRetro>
        <CardRetroHeader><CardRetroTitle>Smart Next Steps ✨</CardRetroTitle></CardRetroHeader>
        <CardRetroContent className="grid md:grid-cols-3 gap-4">
          {smartSteps.map((step) => (
            <div key={step.title} className="p-4 bg-muted rounded-lg border-2 border-border">
              <h4 className="font-bold">{step.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              <SmartStepDialog
                step={step}
                trigger={
                  <ButtonRetro size="sm" variant={step.buttonVariant} className="mt-3">
                    {step.buttonLabel}
                  </ButtonRetro>
                }
              />
            </div>
          ))}
        </CardRetroContent>
      </CardRetro>

      {/* Recent Applications & Schedule */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CardRetro>
          <CardRetroHeader className="flex-row items-center justify-between">
            <CardRetroTitle>Recent Applications</CardRetroTitle>
            <Link to="/applications"><ButtonRetro size="sm" variant="ghost">View All <ArrowRight className="h-4 w-4" /></ButtonRetro></Link>
          </CardRetroHeader>
          <CardRetroContent className="space-y-3">
            {recentApps.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No applications yet.</p>
                <AddApplicationDialog trigger={
                  <ButtonRetro size="sm" className="mt-2"><Plus className="h-4 w-4" /> Add your first</ButtonRetro>
                } />
              </div>
            ) : (
              recentApps.map(app => (
                <Link key={app.id} to={`/applications/${app.id}`} className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center font-bold">
                    {app.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{app.position}</p>
                    <p className="text-sm text-muted-foreground truncate">{app.company} • {app.location || 'No location'}</p>
                  </div>
                  <StatusBadge status={getStatusColor(app.status) as any}>{app.status}</StatusBadge>
                </Link>
              ))
            )}
          </CardRetroContent>
        </CardRetro>

        <CardRetro>
          <CardRetroHeader><CardRetroTitle>Upcoming Schedule 📅</CardRetroTitle></CardRetroHeader>
          <CardRetroContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No upcoming events.</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border-2 border-border">
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-xl font-black">{new Date(event.date).getDate()}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.type}</p>
                  </div>
                  {event.time && (
                    <span className="text-sm text-muted-foreground">{event.time}</span>
                  )}
                </div>
              ))
            )}
            <AddEventDialog trigger={
              <ButtonRetro variant="outline" className="w-full"><Calendar className="h-4 w-4" /> Add Event</ButtonRetro>
            } />
          </CardRetroContent>
        </CardRetro>
      </div>
    </div>
  );
}
