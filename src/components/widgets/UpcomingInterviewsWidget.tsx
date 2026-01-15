import { Calendar } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { WidgetContainer } from './WidgetContainer';
import { AddEventDialog } from '@/components/dialogs/AddEventDialog';
import { BaseWidgetProps } from './types';
import { Event } from '@/context/AppContext';

interface UpcomingInterviewsWidgetProps extends BaseWidgetProps {
  events: Event[];
}

export function UpcomingInterviewsWidget({ events }: UpcomingInterviewsWidgetProps) {
  return (
    <WidgetContainer title="Upcoming Schedule 📅">
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No upcoming events.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border-2 border-border">
              <div className="text-center">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </p>
                <p className="text-xl font-black">{new Date(event.date).getDate()}</p>
              </div>
              <div className="flex-1">
                <p className="font-bold">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.type}</p>
              </div>
              {event.time && (
                <span className="text-sm text-muted-foreground">{event.time}</span>
              )}
            </div>
          ))
        )}
        <AddEventDialog trigger={
          <ButtonRetro variant="outline" className="w-full">
            <Calendar className="h-4 w-4" /> Add Event
          </ButtonRetro>
        } />
      </div>
    </WidgetContainer>
  );
}
