import { Link } from 'react-router-dom';
import { Eye, ArrowRight, Clock } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { WidgetContainer } from './WidgetContainer';
import { BaseWidgetProps } from './types';

interface ActiveOpportunity {
  id: string;
  company: string;
  position: string;
  status: string;
  lastActivity: string;
}

interface ActiveOpportunitiesWidgetProps extends BaseWidgetProps {
  opportunities: ActiveOpportunity[];
  getStatusColor: (status: string) => string;
}

export function ActiveOpportunitiesWidget({ 
  opportunities, 
  getStatusColor 
}: ActiveOpportunitiesWidgetProps) {
  return (
    <WidgetContainer
      title="Active Opportunities (Private)"
      icon={Eye}
      headerAction={
        <Link to="/applications">
          <ButtonRetro size="sm" variant="ghost">
            View All <ArrowRight className="h-4 w-4" />
          </ButtonRetro>
        </Link>
      }
    >
      <div className="space-y-3">
        {opportunities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No active opportunities yet. Start exploring discreetly!</p>
          </div>
        ) : (
          opportunities.map(opp => (
            <Link 
              key={opp.id} 
              to={`/applications/${opp.id}`} 
              className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center font-bold">
                {opp.company.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{opp.position}</p>
                <p className="text-sm text-muted-foreground truncate">{opp.company}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={getStatusColor(opp.status) as any}>
                  {opp.status}
                </StatusBadge>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {opp.lastActivity}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </WidgetContainer>
  );
}
