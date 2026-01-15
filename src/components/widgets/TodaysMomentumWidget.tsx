import { CardRetro } from '@/components/ui/card-retro';
import { Flame, Briefcase, FileText, Trophy } from 'lucide-react';
import { BaseWidgetProps, DashboardStats } from './types';

interface TodaysMomentumWidgetProps extends BaseWidgetProps {
  stats: Pick<DashboardStats, 'weeklyStreak' | 'activeJobs' | 'totalApps' | 'offers'>;
}

export function TodaysMomentumWidget({ stats }: TodaysMomentumWidgetProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CardRetro className="p-4 bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary border-2 border-border">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Weekly Streak</p>
            <p className="text-2xl font-black">{stats.weeklyStreak} 🔥</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-info/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info border-2 border-border">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Active Jobs</p>
            <p className="text-2xl font-black">{stats.activeJobs}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary border-2 border-border">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Applications</p>
            <p className="text-2xl font-black">{stats.totalApps}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-success/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success border-2 border-border">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Offers</p>
            <p className="text-2xl font-black">{stats.offers} 🎉</p>
          </div>
        </div>
      </CardRetro>
    </div>
  );
}
