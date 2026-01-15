import { Link } from 'react-router-dom';
import { Target, ArrowRight } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer } from './WidgetContainer';
import { BaseWidgetProps, GrowthGoal } from './types';

interface GrowthGoalsWidgetProps extends BaseWidgetProps {
  goals: GrowthGoal[];
}

export function GrowthGoalsWidget({ goals }: GrowthGoalsWidgetProps) {
  return (
    <WidgetContainer title="Active Growth Goals" icon={Target}>
      <div className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className="p-4 rounded-lg border-2 border-border bg-muted/50">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold">{goal.title}</h4>
              <span className="text-xs text-muted-foreground">{goal.deadline}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full border border-border overflow-hidden">
                <div 
                  className="h-full bg-success transition-all duration-500" 
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        <Link to="/goals">
          <ButtonRetro variant="outline" className="w-full">
            View All Goals <ArrowRight className="h-4 w-4 ml-2" />
          </ButtonRetro>
        </Link>
      </div>
    </WidgetContainer>
  );
}
