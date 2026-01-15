import { Eye, Lock } from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { BaseWidgetProps } from './types';

interface StealthStatusWidgetProps extends BaseWidgetProps {
  isActive?: boolean;
}

export function StealthStatusWidget({ isActive = true }: StealthStatusWidgetProps) {
  return (
    <CardRetro className="bg-gradient-to-r from-muted to-muted/50 border-dashed">
      <CardRetroContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/20 border-2 border-border">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Stealth Mode Active</h3>
            <p className="text-sm text-muted-foreground">
              Your job search is private. No public activity signals.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 border border-success">
            <Lock className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">Secure</span>
          </div>
        </div>
      </CardRetroContent>
    </CardRetro>
  );
}
