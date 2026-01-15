import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Flame, Briefcase, FileText, Trophy, ArrowRight, Calendar, Sparkles, Target, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddApplicationDialog } from '@/components/dialogs/AddApplicationDialog';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';
import { SmartStepDialog } from '@/components/dialogs/SmartStepDialog';
import type { SmartStep } from '@/hooks/useSmartSteps';

interface ActiveSeekerWidgetsProps {
  stats: {
    weeklyStreak: number;
    activeJobs: number;
    totalApps: number;
    offers: number;
    interviews: number;
    appliedThisWeek: number;
  };
  recentApps: Array<{
    id: string;
    company: string;
    position: string;
    location: string | null;
    status: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    time: string | null;
  }>;
  smartSteps: SmartStep[];
  getStatusColor: (status: string) => string;
}

export function ActiveSeekerWidgets({ stats, recentApps, upcomingEvents, smartSteps, getStatusColor }: ActiveSeekerWidgetsProps) {
  return (
    <>
      {/* Performance Tracker - Full Stats */}
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

      {/* Weekly Goals Progress */}
      <CardRetro>
        <CardRetroHeader>
          <CardRetroTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            This Week's Progress
          </CardRetroTitle>
        </CardRetroHeader>
        <CardRetroContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Applications</span>
                <span className="text-muted-foreground">{stats.appliedThisWeek}/10 goal</span>
              </div>
              <div className="h-3 bg-muted rounded-full border border-border overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${Math.min((stats.appliedThisWeek / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Interviews</span>
                <span className="text-muted-foreground">{stats.interviews}/3 goal</span>
              </div>
              <div className="h-3 bg-muted rounded-full border border-border overflow-hidden">
                <div 
                  className="h-full bg-success transition-all duration-500" 
                  style={{ width: `${Math.min((stats.interviews / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Active Jobs</span>
                <span className="text-muted-foreground">{stats.activeJobs}/15 goal</span>
              </div>
              <div className="h-3 bg-muted rounded-full border border-border overflow-hidden">
                <div 
                  className="h-full bg-info transition-all duration-500" 
                  style={{ width: `${Math.min((stats.activeJobs / 15) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>

      {/* Smart Next Steps */}
      <CardRetro>
        <CardRetroHeader>
          <CardRetroTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Next Steps
          </CardRetroTitle>
        </CardRetroHeader>
        <CardRetroContent className="grid md:grid-cols-3 gap-4">
          {smartSteps.length > 0 ? (
            smartSteps.map((step, index) => (
              <div key={`${step.type}-${index}`} className="p-4 bg-muted rounded-lg border-2 border-border">
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
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-muted-foreground">
              <p>All caught up! Add more applications to get personalized suggestions. ✨</p>
            </div>
          )}
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
    </>
  );
}
