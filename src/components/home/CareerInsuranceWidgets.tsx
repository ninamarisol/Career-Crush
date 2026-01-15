import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Shield, Clock, Bell, CheckCircle, Users, FileText, ArrowRight, TrendingUp, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CareerInsuranceWidgetsProps {
  stats: {
    savedJobs: number;
    networkContacts: number;
    lastResumeUpdate: string;
    monthlyCheckIns: number;
  };
  savedPositions: Array<{
    id: string;
    company: string;
    position: string;
    status: string;
  }>;
}

export function CareerInsuranceWidgets({ stats, savedPositions }: CareerInsuranceWidgetsProps) {
  return (
    <>
      {/* Readiness Dashboard */}
      <CardRetro className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardRetroHeader>
          <CardRetroTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Career Readiness Score
          </CardRetroTitle>
        </CardRetroHeader>
        <CardRetroContent>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="fill-none stroke-muted stroke-[8]"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="fill-none stroke-primary stroke-[8]"
                  strokeDasharray={`${(75 / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black">75%</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">Resume updated within 3 months</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm">5+ industry contacts active</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-sm">Market scan overdue (2 weeks)</span>
              </div>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardRetro className="p-4 bg-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary border-2 border-border"><Bookmark className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Saved Jobs</p>
              <p className="text-2xl font-black">{stats.savedJobs}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-info/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info border-2 border-border"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Network</p>
              <p className="text-2xl font-black">{stats.networkContacts}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success border-2 border-border"><FileText className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Resume Age</p>
              <p className="text-2xl font-black">{stats.lastResumeUpdate}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary border-2 border-border"><Bell className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Monthly Check-ins</p>
              <p className="text-2xl font-black">{stats.monthlyCheckIns}</p>
            </div>
          </div>
        </CardRetro>
      </div>

      {/* Low-Effort Tasks */}
      <CardRetro>
        <CardRetroHeader>
          <CardRetroTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Quick Maintenance Tasks
          </CardRetroTitle>
        </CardRetroHeader>
        <CardRetroContent className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">Update LinkedIn Headline</h4>
            <p className="text-sm text-muted-foreground mt-1">Keep your profile fresh with a new headline (5 min)</p>
            <ButtonRetro size="sm" variant="outline" className="mt-3">
              Get Suggestions
            </ButtonRetro>
          </div>
          <div className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">Reach Out to One Contact</h4>
            <p className="text-sm text-muted-foreground mt-1">Send a quick check-in message (3 min)</p>
            <Link to="/contacts">
              <ButtonRetro size="sm" variant="outline" className="mt-3">
                Choose Contact
              </ButtonRetro>
            </Link>
          </div>
          <div className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">Scan Job Market</h4>
            <p className="text-sm text-muted-foreground mt-1">Quick look at what's trending (10 min)</p>
            <ButtonRetro size="sm" variant="outline" className="mt-3">
              Start Scan
            </ButtonRetro>
          </div>
          <div className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">Save an Interesting Role</h4>
            <p className="text-sm text-muted-foreground mt-1">Bookmark for future reference (2 min)</p>
            <Link to="/applications">
              <ButtonRetro size="sm" variant="outline" className="mt-3">
                Browse Jobs
              </ButtonRetro>
            </Link>
          </div>
        </CardRetroContent>
      </CardRetro>

      {/* Saved Opportunities */}
      <CardRetro>
        <CardRetroHeader className="flex-row items-center justify-between">
          <CardRetroTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Saved Opportunities
          </CardRetroTitle>
          <Link to="/applications"><ButtonRetro size="sm" variant="ghost">View All <ArrowRight className="h-4 w-4" /></ButtonRetro></Link>
        </CardRetroHeader>
        <CardRetroContent className="space-y-3">
          {savedPositions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No saved positions yet. Start building your opportunity pipeline!</p>
            </div>
          ) : (
            savedPositions.map(pos => (
              <Link key={pos.id} to={`/applications/${pos.id}`} className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center font-bold">
                  {pos.company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{pos.position}</p>
                  <p className="text-sm text-muted-foreground truncate">{pos.company}</p>
                </div>
                <Bookmark className="h-4 w-4 text-primary" />
              </Link>
            ))
          )}
        </CardRetroContent>
      </CardRetro>
    </>
  );
}
