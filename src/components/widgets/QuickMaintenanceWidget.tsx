import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer } from './WidgetContainer';
import { BaseWidgetProps } from './types';

interface QuickMaintenanceTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  action: {
    label: string;
    link?: string;
    onClick?: () => void;
  };
}

interface QuickMaintenanceWidgetProps extends BaseWidgetProps {
  tasks?: QuickMaintenanceTask[];
}

const defaultTasks: QuickMaintenanceTask[] = [
  {
    id: '1',
    title: 'Update LinkedIn Headline',
    description: 'Keep your profile fresh with a new headline',
    duration: '5 min',
    action: { label: 'Get Suggestions' },
  },
  {
    id: '2',
    title: 'Reach Out to One Contact',
    description: 'Send a quick check-in message',
    duration: '3 min',
    action: { label: 'Choose Contact', link: '/contacts' },
  },
  {
    id: '3',
    title: 'Scan Job Market',
    description: "Quick look at what's trending",
    duration: '10 min',
    action: { label: 'Start Scan' },
  },
  {
    id: '4',
    title: 'Save an Interesting Role',
    description: 'Bookmark for future reference',
    duration: '2 min',
    action: { label: 'Browse Jobs', link: '/applications' },
  },
];

export function QuickMaintenanceWidget({ tasks = defaultTasks }: QuickMaintenanceWidgetProps) {
  return (
    <WidgetContainer title="Quick Maintenance Tasks" icon={Clock}>
      <div className="grid md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div key={task.id} className="p-4 bg-muted rounded-lg border-2 border-border">
            <h4 className="font-bold">{task.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {task.description} ({task.duration})
            </p>
            {task.action.link ? (
              <Link to={task.action.link}>
                <ButtonRetro size="sm" variant="outline" className="mt-3">
                  {task.action.label}
                </ButtonRetro>
              </Link>
            ) : (
              <ButtonRetro size="sm" variant="outline" className="mt-3" onClick={task.action.onClick}>
                {task.action.label}
              </ButtonRetro>
            )}
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
