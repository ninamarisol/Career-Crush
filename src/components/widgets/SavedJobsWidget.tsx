import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Bookmark } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer } from './WidgetContainer';
import { BaseWidgetProps } from './types';
import { Application } from '@/context/AppContext';

interface SavedJobsWidgetProps extends BaseWidgetProps {
  savedJobs: Application[];
}

export function SavedJobsWidget({ savedJobs }: SavedJobsWidgetProps) {
  return (
    <WidgetContainer
      title="Saved Opportunities"
      icon={TrendingUp}
      headerAction={
        <Link to="/applications">
          <ButtonRetro size="sm" variant="ghost">
            View All <ArrowRight className="h-4 w-4" />
          </ButtonRetro>
        </Link>
      }
    >
      <div className="space-y-3">
        {savedJobs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No saved positions yet. Start building your opportunity pipeline!</p>
          </div>
        ) : (
          savedJobs.map(pos => (
            <Link 
              key={pos.id} 
              to={`/applications/${pos.id}`} 
              className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center font-bold">
                {pos.company.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{pos.position}</p>
                <p className="text-sm text-muted-foreground truncate">{pos.company}</p>
              </div>
              <Bookmark className="h-4 w-4 text-primary" />
            </Link>
          ))
        )}
      </div>
    </WidgetContainer>
  );
}
