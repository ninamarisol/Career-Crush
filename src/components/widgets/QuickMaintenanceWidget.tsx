import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer } from './WidgetContainer';
import { BaseWidgetProps } from './types';
import { LinkedInHeadlineDialog } from '@/components/dialogs/LinkedInHeadlineDialog';
import { MarketScanDialog } from '@/components/dialogs/MarketScanDialog';
import { AddApplicationDialog } from '@/components/dialogs/AddApplicationDialog';

interface QuickMaintenanceWidgetProps extends BaseWidgetProps {
  // Props can be extended for custom tasks
}

export function QuickMaintenanceWidget({}: QuickMaintenanceWidgetProps) {
  return (
    <WidgetContainer title="Quick Maintenance Tasks" icon={Clock}>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Update LinkedIn Headline */}
        <div className="p-4 bg-muted rounded-lg border-2 border-border">
          <h4 className="font-bold">Update LinkedIn Headline</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Keep your profile fresh with a new headline (5 min)
          </p>
          <LinkedInHeadlineDialog 
            trigger={
              <ButtonRetro size="sm" variant="outline" className="mt-3">
                Get Suggestions
              </ButtonRetro>
            }
          />
        </div>

        {/* Reach Out to Contact */}
        <div className="p-4 bg-muted rounded-lg border-2 border-border">
          <h4 className="font-bold">Reach Out to One Contact</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Send a quick check-in message (3 min)
          </p>
          <Link to="/contacts">
            <ButtonRetro size="sm" variant="outline" className="mt-3">
              Choose Contact
            </ButtonRetro>
          </Link>
        </div>

        {/* Scan Job Market */}
        <div className="p-4 bg-muted rounded-lg border-2 border-border">
          <h4 className="font-bold">Scan Job Market</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Quick look at what's trending (10 min)
          </p>
          <MarketScanDialog 
            trigger={
              <ButtonRetro size="sm" variant="outline" className="mt-3">
                Start Scan
              </ButtonRetro>
            }
          />
        </div>

        {/* Save an Interesting Role */}
        <div className="p-4 bg-muted rounded-lg border-2 border-border">
          <h4 className="font-bold">Save an Interesting Role</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Bookmark for future reference (2 min)
          </p>
          <AddApplicationDialog 
            trigger={
              <ButtonRetro size="sm" variant="outline" className="mt-3">
                Add Job
              </ButtonRetro>
            }
          />
        </div>
      </div>
    </WidgetContainer>
  );
}
