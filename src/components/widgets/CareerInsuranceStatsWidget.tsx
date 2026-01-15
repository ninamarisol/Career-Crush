import { CardRetro } from '@/components/ui/card-retro';
import { Bookmark, Users, FileText, Bell } from 'lucide-react';
import { BaseWidgetProps, DashboardStats } from './types';

interface CareerInsuranceStatsWidgetProps extends BaseWidgetProps {
  stats: Pick<DashboardStats, 'savedJobs' | 'networkContacts' | 'lastResumeUpdate' | 'monthlyCheckIns'>;
}

export function CareerInsuranceStatsWidget({ stats }: CareerInsuranceStatsWidgetProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CardRetro className="p-4 bg-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary border-2 border-border">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Saved Jobs</p>
            <p className="text-2xl font-black">{stats.savedJobs}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-info/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info border-2 border-border">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Network</p>
            <p className="text-2xl font-black">{stats.networkContacts}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-success/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success border-2 border-border">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Resume Age</p>
            <p className="text-2xl font-black">{stats.lastResumeUpdate}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary border-2 border-border">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Monthly Check-ins</p>
            <p className="text-2xl font-black">{stats.monthlyCheckIns}</p>
          </div>
        </div>
      </CardRetro>
    </div>
  );
}
