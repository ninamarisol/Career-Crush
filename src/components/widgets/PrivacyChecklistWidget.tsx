import { useState } from 'react';
import { Lock } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer, ChecklistItem } from './WidgetContainer';
import { BaseWidgetProps } from './types';
import { toast } from 'sonner';

interface PrivacyChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  actionRequired?: boolean;
  action?: string;
}

interface PrivacyChecklistWidgetProps extends BaseWidgetProps {
  items?: PrivacyChecklistItem[];
}

export function PrivacyChecklistWidget({ items: initialItems }: PrivacyChecklistWidgetProps) {
  const [items, setItems] = useState<PrivacyChecklistItem[]>(initialItems || [
    { id: '1', label: 'LinkedIn "Open to Work" badge is OFF', checked: true },
    { id: '2', label: 'Personal email used for applications', checked: true },
    { id: '3', label: 'Review which recruiters know you\'re looking', checked: false, actionRequired: true, action: 'Review' },
    { id: '4', label: 'Interview scheduling uses neutral times', checked: true },
  ]);

  const handleAction = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: true, actionRequired: false } : item
    ));
    toast.success('Privacy item reviewed! ✅');
  };

  const handleToggle = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <WidgetContainer title="Privacy Checklist" icon={Lock}>
      <div className="space-y-3">
        {items.map(item => (
          <div 
            key={item.id}
            onClick={() => !item.actionRequired && handleToggle(item.id)}
            className={!item.actionRequired ? 'cursor-pointer' : ''}
          >
            <ChecklistItem
              checked={item.checked}
              variant={item.checked ? 'success' : item.actionRequired ? 'warning' : 'default'}
              action={item.action && !item.checked ? (
                <ButtonRetro 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(item.id);
                  }}
                >
                  {item.action}
                </ButtonRetro>
              ) : undefined}
            >
              {item.label}
            </ChecklistItem>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
