import { Target } from 'lucide-react';
import { WidgetContainer, ProgressBar } from './WidgetContainer';
import { BaseWidgetProps, DashboardStats } from './types';

interface WeeklyProgressWidgetProps extends BaseWidgetProps {
  stats: Pick<DashboardStats, 'appliedThisWeek' | 'interviews' | 'activeJobs'>;
  goals?: {
    applications: number;
    interviews: number;
    activeJobs: number;
  };
}

export function WeeklyProgressWidget({ 
  stats, 
  goals = { applications: 10, interviews: 3, activeJobs: 15 } 
}: WeeklyProgressWidgetProps) {
  return (
    <WidgetContainer title="This Week's Progress" icon={Target}>
      <div className="grid md:grid-cols-3 gap-6">
        <ProgressBar
          label="Applications"
          current={stats.appliedThisWeek}
          target={goals.applications}
          unit="goal"
          colorClass="bg-primary"
        />
        <ProgressBar
          label="Interviews"
          current={stats.interviews}
          target={goals.interviews}
          unit="goal"
          colorClass="bg-success"
        />
        <ProgressBar
          label="Active Jobs"
          current={stats.activeJobs}
          target={goals.activeJobs}
          unit="goal"
          colorClass="bg-info"
        />
      </div>
    </WidgetContainer>
  );
}
