import { useState } from 'react';
import { Settings, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw, GripVertical } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { WidgetInstance, WidgetSize } from './types';

interface WidgetCustomizerProps {
  widgets: WidgetInstance[];
  onToggle: (widgetId: string) => void;
  onMoveUp: (widgetId: string) => void;
  onMoveDown: (widgetId: string) => void;
  onSetSize: (widgetId: string, size: WidgetSize) => void;
  onReset: () => void;
}

export function WidgetCustomizer({
  widgets,
  onToggle,
  onMoveUp,
  onMoveDown,
  onSetSize,
  onReset,
}: WidgetCustomizerProps) {
  const [open, setOpen] = useState(false);

  const sortedWidgets = [...widgets].sort((a, b) => a.priority - b.priority);
  const visibleCount = widgets.filter(w => w.visible).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonRetro variant="outline" size="sm">
          <Settings className="h-4 w-4" />
          Customize Dashboard
        </ButtonRetro>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Your Dashboard
          </DialogTitle>
          <DialogDescription>
            Show or hide widgets and reorder them to your preference. 
            {visibleCount} of {widgets.length} widgets visible.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {sortedWidgets.map((widget, index) => {
            const Icon = widget.icon;
            const isFirst = index === 0;
            const isLast = index === sortedWidgets.length - 1;

            return (
              <div
                key={widget.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                  widget.visible 
                    ? 'border-border bg-card' 
                    : 'border-dashed border-muted bg-muted/30 opacity-60'
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                
                <div className={cn(
                  'p-2 rounded-lg border-2 border-border',
                  widget.visible ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{widget.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {widget.description}
                  </p>
                </div>

                {/* Size selector */}
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as WidgetSize[]).map(size => (
                    <button
                      key={size}
                      onClick={() => onSetSize(widget.id, size)}
                      className={cn(
                        'px-2 py-1 text-xs rounded border transition-all',
                        widget.size === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border hover:bg-muted/80'
                      )}
                    >
                      {size.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => onMoveUp(widget.id)}
                    disabled={isFirst}
                    className={cn(
                      'p-1 rounded hover:bg-muted transition-colors',
                      isFirst && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onMoveDown(widget.id)}
                    disabled={isLast}
                    className={cn(
                      'p-1 rounded hover:bg-muted transition-colors',
                      isLast && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Visibility toggle */}
                <Switch
                  checked={widget.visible}
                  onCheckedChange={() => onToggle(widget.id)}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <ButtonRetro variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </ButtonRetro>
          <ButtonRetro onClick={() => setOpen(false)}>
            Done
          </ButtonRetro>
        </div>
      </DialogContent>
    </Dialog>
  );
}
