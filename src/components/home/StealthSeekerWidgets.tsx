import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { Eye, Lock, Mail, MessageSquare, ArrowRight, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StealthSeekerWidgetsProps {
  stats: {
    activeConversations: number;
    discreteApplications: number;
    trustedContacts: number;
    pendingResponses: number;
  };
  activeOpportunities: Array<{
    id: string;
    company: string;
    position: string;
    status: string;
    lastActivity: string;
  }>;
  getStatusColor: (status: string) => string;
}

export function StealthSeekerWidgets({ stats, activeOpportunities, getStatusColor }: StealthSeekerWidgetsProps) {
  return (
    <>
      {/* Stealth Mode Indicator */}
      <CardRetro className="bg-gradient-to-r from-muted to-muted/50 border-dashed">
        <CardRetroContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20 border-2 border-border">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Stealth Mode Active</h3>
              <p className="text-sm text-muted-foreground">Your job search is private. No public activity signals.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 border border-success">
              <Lock className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Secure</span>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>

      {/* Privacy Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardRetro className="p-4 bg-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary border-2 border-border"><MessageSquare className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Active Chats</p>
              <p className="text-2xl font-black">{stats.activeConversations}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-info/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info border-2 border-border"><Eye className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Discrete Apps</p>
              <p className="text-2xl font-black">{stats.discreteApplications}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success border-2 border-border"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Trusted Contacts</p>
              <p className="text-2xl font-black">{stats.trustedContacts}</p>
            </div>
          </div>
        </CardRetro>
        <CardRetro className="p-4 bg-warning/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning border-2 border-border"><Mail className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Pending</p>
              <p className="text-2xl font-black">{stats.pendingResponses}</p>
            </div>
          </div>
        </CardRetro>
      </div>

      {/* Privacy Checklist */}
      <CardRetro>
        <CardRetroHeader>
          <CardRetroTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Privacy Checklist
          </CardRetroTitle>
        </CardRetroHeader>
        <CardRetroContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="flex-1">LinkedIn "Open to Work" badge is OFF</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="flex-1">Personal email used for applications</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="flex-1">Review which recruiters know you're looking</span>
              <ButtonRetro size="sm" variant="outline">Review</ButtonRetro>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="flex-1">Interview scheduling uses neutral times</span>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>

      {/* Active Opportunities */}
      <CardRetro>
        <CardRetroHeader className="flex-row items-center justify-between">
          <CardRetroTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Active Opportunities (Private)
          </CardRetroTitle>
          <Link to="/applications"><ButtonRetro size="sm" variant="ghost">View All <ArrowRight className="h-4 w-4" /></ButtonRetro></Link>
        </CardRetroHeader>
        <CardRetroContent className="space-y-3">
          {activeOpportunities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No active opportunities yet. Start exploring discreetly!</p>
            </div>
          ) : (
            activeOpportunities.map(opp => (
              <Link key={opp.id} to={`/applications/${opp.id}`} className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center font-bold">
                  {opp.company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{opp.position}</p>
                  <p className="text-sm text-muted-foreground truncate">{opp.company}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={getStatusColor(opp.status) as any}>{opp.status}</StatusBadge>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {opp.lastActivity}
                  </p>
                </div>
              </Link>
            ))
          )}
        </CardRetroContent>
      </CardRetro>
    </>
  );
}
