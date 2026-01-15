import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, RotateCcw, Settings2 } from 'lucide-react';
import { useWidgetPreferences, WidgetWithPreference } from '@/hooks/useWidgetPreferences';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetSize } from '@/components/widgets/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SortableWidgetItemProps {
  widget: WidgetWithPreference;
  onToggleVisibility: (widgetId: string, visible: boolean) => void;
  onChangeSize: (widgetId: string, size: WidgetSize) => void;
}

function SortableWidgetItem({ widget, onToggleVisibility, onChangeSize }: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = widget.icon;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 bg-card transition-all",
        isDragging ? "border-primary shadow-retro z-50 opacity-90" : "border-border",
        !widget.visible && "opacity-60 bg-muted/30"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Widget Icon */}
      <div className={cn(
        "p-2 rounded-lg border-2 border-border",
        widget.visible ? "bg-primary/10" : "bg-muted"
      )}>
        <Icon className={cn(
          "w-4 h-4",
          widget.visible ? "text-primary" : "text-muted-foreground"
        )} />
      </div>

      {/* Widget Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-bold text-sm truncate",
          !widget.visible && "text-muted-foreground"
        )}>
          {widget.name}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {widget.description}
        </p>
      </div>

      {/* Size Selector */}
      <Select
        value={widget.size}
        onValueChange={(value) => onChangeSize(widget.id, value as WidgetSize)}
      >
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="small">Small</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="large">Large</SelectItem>
          <SelectItem value="full">Full</SelectItem>
        </SelectContent>
      </Select>

      {/* Visibility Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          checked={widget.visible}
          onCheckedChange={(checked) => onToggleVisibility(widget.id, checked)}
          aria-label={widget.visible ? "Hide widget" : "Show widget"}
        />
        {widget.visible ? (
          <Eye className="w-4 h-4 text-primary" />
        ) : (
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </motion.div>
  );
}

export function WidgetCustomizer() {
  const {
    loading,
    currentMode,
    getWidgetsWithPreferences,
    updatePreference,
    updatePriorities,
    resetToDefaults,
  } = useWidgetPreferences();

  const widgets = getWidgetsWithPreferences();
  const [localWidgets, setLocalWidgets] = useState<WidgetWithPreference[]>([]);
  
  // Sync local state with preferences when they change
  useMemo(() => {
    setLocalWidgets(widgets);
  }, [widgets.length, currentMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localWidgets.findIndex((w) => w.id === active.id);
      const newIndex = localWidgets.findIndex((w) => w.id === over.id);

      const newOrder = arrayMove(localWidgets, oldIndex, newIndex);
      setLocalWidgets(newOrder);
      
      // Save new order to database
      await updatePriorities(newOrder.map(w => w.id));
      toast.success('Widget order saved');
    }
  };

  const handleToggleVisibility = async (widgetId: string, visible: boolean) => {
    setLocalWidgets(prev => 
      prev.map(w => w.id === widgetId ? { ...w, visible } : w)
    );
    await updatePreference(widgetId, { visible });
    toast.success(visible ? 'Widget shown' : 'Widget hidden');
  };

  const handleChangeSize = async (widgetId: string, size: WidgetSize) => {
    setLocalWidgets(prev => 
      prev.map(w => w.id === widgetId ? { ...w, size } : w)
    );
    await updatePreference(widgetId, { size });
    toast.success('Widget size updated');
  };

  const handleReset = async () => {
    await resetToDefaults();
    setLocalWidgets(getWidgetsWithPreferences());
    toast.success('Widgets reset to defaults');
  };

  const visibleCount = localWidgets.filter(w => w.visible).length;
  const totalCount = localWidgets.length;

  const modeLabels: Record<string, string> = {
    active_seeker: 'Active Job Seeker',
    career_insurance: 'Career Insurance',
    stealth_seeker: 'Stealth Seeker',
    career_growth: 'Career Growth',
  };

  if (loading) {
    return (
      <CardRetro>
        <CardRetroContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardRetroContent>
      </CardRetro>
    );
  }

  return (
    <CardRetro>
      <CardRetroHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            <CardRetroTitle>🎛️ Dashboard Widgets</CardRetroTitle>
          </div>
          <Badge variant="outline">
            {modeLabels[currentMode]}
          </Badge>
        </div>
      </CardRetroHeader>
      <CardRetroContent>
        <div className="space-y-4">
          {/* Info & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{visibleCount}</span> of {totalCount} widgets visible • 
              Drag to reorder
            </p>
            <ButtonRetro
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </ButtonRetro>
          </div>

          {/* Widget List with Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localWidgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                <AnimatePresence>
                  {localWidgets.map((widget) => (
                    <SortableWidgetItem
                      key={widget.id}
                      widget={widget}
                      onToggleVisibility={handleToggleVisibility}
                      onChangeSize={handleChangeSize}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>

          {localWidgets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No widgets available for this mode.</p>
            </div>
          )}
        </div>
      </CardRetroContent>
    </CardRetro>
  );
}
