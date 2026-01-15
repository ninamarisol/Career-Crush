import { Trophy } from 'lucide-react';
import { WidgetContainer, CircularProgress, ProgressBar } from './WidgetContainer';
import { BaseWidgetProps } from './types';

interface PromotionReadinessWidgetProps extends BaseWidgetProps {
  targetRole: string;
  progress: number;
  timeline: string;
  nextMilestone: {
    title: string;
    deadline: string;
  };
}

export function PromotionReadinessWidget({ 
  targetRole = 'Senior Product Manager',
  progress = 72,
  timeline = '8-10 months at this pace',
  nextMilestone = { title: 'Complete AI/ML course', deadline: 'Jan 31' },
}: Partial<PromotionReadinessWidgetProps>) {
  return (
    <WidgetContainer 
      title="Promotion Readiness" 
      icon={Trophy}
      gradient="bg-gradient-to-r from-success/10 to-primary/10"
    >
      <div className="flex items-center gap-8">
        <CircularProgress 
          value={progress} 
          label="ready"
        />
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Target Role</p>
            <p className="text-xl font-bold">{targetRole}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Timeline</p>
            <p className="font-medium">{timeline}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted border-2 border-border">
            <p className="text-xs text-muted-foreground uppercase font-bold">Next Milestone</p>
            <p className="font-medium">{nextMilestone.title}</p>
            <p className="text-sm text-muted-foreground">Due: {nextMilestone.deadline}</p>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}
