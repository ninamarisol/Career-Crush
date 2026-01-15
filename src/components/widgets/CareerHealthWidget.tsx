import { Shield, CheckCircle, Clock } from 'lucide-react';
import { WidgetContainer, CircularProgress } from './WidgetContainer';
import { BaseWidgetProps, DashboardStats } from './types';

interface CareerHealthWidgetProps extends BaseWidgetProps {
  stats: Pick<DashboardStats, 'careerHealthScore' | 'marketPosition' | 'skillRelevance' | 'networkHealth'>;
}

export function CareerHealthWidget({ stats, size }: CareerHealthWidgetProps) {
  const score = stats.careerHealthScore || 75;
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <WidgetContainer 
      title="Career Health" 
      icon={Shield}
      gradient="bg-gradient-to-r from-primary/10 to-secondary/10"
    >
      <div className="flex items-center gap-8">
        <CircularProgress value={score} label={getScoreLabel(score)} />
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
    </WidgetContainer>
  );
}
