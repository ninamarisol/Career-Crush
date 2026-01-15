import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { StatusBadge } from '@/components/ui/status-badge';
import { WidgetContainer } from './WidgetContainer';
import { AddApplicationDialog } from '@/components/dialogs/AddApplicationDialog';
import { BaseWidgetProps } from './types';
import { Application } from '@/context/AppContext';

interface RecentApplicationsWidgetProps extends BaseWidgetProps {
  applications: Application[];
  getStatusColor: (status: string) => string;
}

export function RecentApplicationsWidget({ 
  applications, 
  getStatusColor 
}: RecentApplicationsWidgetProps) {
  return (
    <WidgetContainer 
      title="Recent Applications"
      headerAction={
        <Link to="/applications">
          <ButtonRetro size="sm" variant="ghost">
            View All <ArrowRight className="h-4 w-4" />
          </ButtonRetro>
        </Link>
      }
    >
      <div className="space-y-3">
        {applications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No applications yet.</p>
            <AddApplicationDialog trigger={
              <ButtonRetro size="sm" className="mt-2">
                <Plus className="h-4 w-4" /> Add your first
              </ButtonRetro>
            } />
          </div>
        ) : (
          applications.map(app => (
            <Link 
              key={app.id} 
              to={`/applications/${app.id}`} 
              className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-border flex items-center justify-center font-bold">
                {app.company.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{app.position}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {app.company} • {app.location || 'No location'}
                </p>
              </div>
              <StatusBadge status={getStatusColor(app.status) as any}>
                {app.status}
              </StatusBadge>
            </Link>
          ))
        )}
      </div>
    </WidgetContainer>
  );
}
