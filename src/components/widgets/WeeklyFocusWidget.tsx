import { TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { WidgetContainer, ChecklistItem } from './WidgetContainer';
import { BaseWidgetProps } from './types';

interface WeeklyFocusItem {
  id: string;
  label: string;
  completed: boolean;
}

interface WeeklyFocusWidgetProps extends BaseWidgetProps {
  items?: WeeklyFocusItem[];
}

const defaultItems: WeeklyFocusItem[] = [
  { id: '1', label: 'Complete leadership course module 3', completed: true },
  { id: '2', label: 'Schedule 1:1 with manager for feedback', completed: false },
  { id: '3', label: 'Practice presentation for team meeting', completed: false },
  { id: '4', label: 'Read "The Manager\'s Path" Chapter 4', completed: false },
];

export function WeeklyFocusWidget({ items = defaultItems }: WeeklyFocusWidgetProps) {
  return (
    <WidgetContainer title="This Week's Focus" icon={TrendingUp}>
      <div className="space-y-3">
        {items.map(item => (
          <ChecklistItem
            key={item.id}
            checked={item.completed}
            variant={item.completed ? 'success' : 'default'}
          >
            {item.label}
          </ChecklistItem>
        ))}
      </div>
    </WidgetContainer>
  );
}
