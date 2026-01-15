import { CardRetro } from '@/components/ui/card-retro';
import { MessageSquare, Eye, Users, Mail } from 'lucide-react';
import { BaseWidgetProps, DashboardStats } from './types';

interface StealthStatsWidgetProps extends BaseWidgetProps {
  stats: Pick<DashboardStats, 'activeConversations' | 'discreteApplications' | 'trustedContacts' | 'pendingResponses'>;
}

export function StealthStatsWidget({ stats }: StealthStatsWidgetProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CardRetro className="p-4 bg-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary border-2 border-border">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Active Chats</p>
            <p className="text-2xl font-black">{stats.activeConversations}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-info/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info border-2 border-border">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Discrete Apps</p>
            <p className="text-2xl font-black">{stats.discreteApplications}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-success/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success border-2 border-border">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Trusted Contacts</p>
            <p className="text-2xl font-black">{stats.trustedContacts}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-warning/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning border-2 border-border">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Pending</p>
            <p className="text-2xl font-black">{stats.pendingResponses}</p>
          </div>
        </div>
      </CardRetro>
    </div>
  );
}
