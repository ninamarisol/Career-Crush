import { useApp } from '@/context/AppContext';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { motivationalQuotes, getStatusColor } from '@/lib/data';
import { Plus, Phone, Flame, Briefcase, FileText, Trophy, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export default function Home() {
  const { user, applications, events } = useApp();
  
  const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);
  
  const stats = useMemo(() => ({
    weeklyStreak: user?.weeklyStreak || 12,
    activeJobs: applications.filter(a => !['Rejected', 'Ghosted'].includes(a.status)).length,
    totalApps: applications.length,
    offers: applications.filter(a => a.status === 'Offer').length,
  }), [applications, user]);

  const recentApps = applications.slice(0, 3);
  const upcomingEvents = events.filter(e => !e.completed).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black">Welcome back, {user?.name || 'Friend'} 👋</h1>
        <p className="text-muted-foreground italic">{quote}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <ButtonRetro variant="outline"><Phone className="h-4 w-4" /> Log Contact</ButtonRetro>
        <ButtonRetro><Plus className="h-4 w-4" /> Add App</ButtonRetro>
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
          <div className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">Optimize Resume for Linear</h4>
            <p className="text-sm text-muted-foreground mt-1">Your match score is 92%. Adding 'Product Strategy' could bump it to 98%.</p>
            <ButtonRetro size="sm" className="mt-3">Optimize</ButtonRetro>
          </div>
          <div className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">Follow up with Vercel</h4>
            <p className="text-sm text-muted-foreground mt-1">It's been 3 days since your application. A quick note shows initiative.</p>
            <ButtonRetro size="sm" variant="outline" className="mt-3">Draft Email</ButtonRetro>
          </div>
          <div className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">Networking Opportunity</h4>
            <p className="text-sm text-muted-foreground mt-1">3 alumni from your school work at Notion. Reach out for a coffee chat?</p>
            <ButtonRetro size="sm" variant="outline" className="mt-3">View Contacts</ButtonRetro>
          </div>
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
            {recentApps.map(app => (
              <Link key={app.id} to={`/applications/${app.id}`} className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center font-bold">{app.companyInitial}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{app.roleTitle}</p>
                  <p className="text-sm text-muted-foreground truncate">{app.companyName} • {app.location}</p>
                </div>
                <StatusBadge status={getStatusColor(app.status) as any}>{app.status}</StatusBadge>
                {app.dreamJobMatchScore && <span className="text-sm font-bold text-primary">{app.dreamJobMatchScore}%</span>}
              </Link>
            ))}
          </CardRetroContent>
        </CardRetro>

        <CardRetro>
          <CardRetroHeader><CardRetroTitle>Upcoming Schedule 📅</CardRetroTitle></CardRetroHeader>
          <CardRetroContent className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border-2 border-border">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground">{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}</p>
                  <p className="text-xl font-black">{new Date(event.eventDate).getDate()}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.eventType}</p>
                </div>
              </div>
            ))}
            <ButtonRetro variant="outline" className="w-full"><Calendar className="h-4 w-4" /> Add Event</ButtonRetro>
          </CardRetroContent>
        </CardRetro>
      </div>
    </div>
  );
}
