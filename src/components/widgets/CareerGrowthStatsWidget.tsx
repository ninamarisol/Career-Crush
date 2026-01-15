import { CardRetro } from '@/components/ui/card-retro';
import { BookOpen, Award, Star, Target } from 'lucide-react';
import { BaseWidgetProps, DashboardStats } from './types';

interface CareerGrowthStatsWidgetProps extends BaseWidgetProps {
  stats: Pick<DashboardStats, 'skillsInProgress' | 'completedGoals' | 'learningStreak' | 'nextMilestone'>;
}

export function CareerGrowthStatsWidget({ stats }: CareerGrowthStatsWidgetProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CardRetro className="p-4 bg-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary border-2 border-border">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Skills Building</p>
            <p className="text-2xl font-black">{stats.skillsInProgress}</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-success/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success border-2 border-border">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Goals Met</p>
            <p className="text-2xl font-black">{stats.completedGoals} 🎯</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary border-2 border-border">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Learning Streak</p>
            <p className="text-2xl font-black">{stats.learningStreak} days</p>
          </div>
        </div>
      </CardRetro>
      <CardRetro className="p-4 bg-info/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info border-2 border-border">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Next Milestone</p>
            <p className="text-lg font-black truncate">{stats.nextMilestone}</p>
          </div>
        </div>
      </CardRetro>
    </div>
  );
}
