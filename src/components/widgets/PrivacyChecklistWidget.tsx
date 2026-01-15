import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer, ChecklistItem } from './WidgetContainer';
import { BaseWidgetProps } from './types';

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

const defaultItems: PrivacyChecklistItem[] = [
  { id: '1', label: 'LinkedIn "Open to Work" badge is OFF', checked: true },
  { id: '2', label: 'Personal email used for applications', checked: true },
  { id: '3', label: 'Review which recruiters know you\'re looking', checked: false, actionRequired: true, action: 'Review' },
  { id: '4', label: 'Interview scheduling uses neutral times', checked: true },
];

export function PrivacyChecklistWidget({ items = defaultItems }: PrivacyChecklistWidgetProps) {
  return (
    <WidgetContainer title="Privacy Checklist" icon={Lock}>
      <div className="space-y-3">
        {items.map(item => (
          <ChecklistItem
            key={item.id}
            checked={item.checked}
            variant={item.checked ? 'success' : item.actionRequired ? 'warning' : 'default'}
            action={item.action && !item.checked ? (
              <ButtonRetro size="sm" variant="outline">{item.action}</ButtonRetro>
            ) : undefined}
          >
            {item.label}
          </ChecklistItem>
        ))}
      </div>
    </WidgetContainer>
  );
}
