import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { WidgetContainer, ChecklistItem } from './WidgetContainer';
import { BaseWidgetProps } from './types';
import { toast } from 'sonner';

interface WeeklyFocusItem {
  id: string;
  label: string;
  completed: boolean;
}

interface WeeklyFocusWidgetProps extends BaseWidgetProps {
  items?: WeeklyFocusItem[];
}

export function WeeklyFocusWidget({ items: initialItems }: WeeklyFocusWidgetProps) {
  const [items, setItems] = useState<WeeklyFocusItem[]>(initialItems || [
    { id: '1', label: 'Complete leadership course module 3', completed: true },
    { id: '2', label: 'Schedule 1:1 with manager for feedback', completed: false },
    { id: '3', label: 'Practice presentation for team meeting', completed: false },
    { id: '4', label: 'Read "The Manager\'s Path" Chapter 4', completed: false },
  ]);

  const handleToggle = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      
      const item = updated.find(i => i.id === id);
      if (item?.completed) {
        toast.success('Great progress! 🎉');
      }
      
      return updated;
    });
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;

  return (
    <WidgetContainer title="This Week's Focus" icon={TrendingUp}>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-bold">{completedCount}/{totalCount} completed</span>
        </div>
        {items.map(item => (
          <div 
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className="cursor-pointer"
          >
            <ChecklistItem
              checked={item.completed}
              variant={item.completed ? 'success' : 'default'}
            >
              {item.label}
            </ChecklistItem>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
