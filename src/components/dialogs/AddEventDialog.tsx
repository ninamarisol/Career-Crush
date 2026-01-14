import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { useApp } from '@/context/AppContext';
import { Event } from '@/lib/data';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddEventDialogProps {
  trigger?: React.ReactNode;
  applicationId?: string;
}

type EventType = Event['eventType'];

export function AddEventDialog({ trigger, applicationId }: AddEventDialogProps) {
  const { setEvents, applications } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'Follow-Up' as EventType,
    eventDate: '',
    applicationId: applicationId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.eventDate) return;

    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: formData.title,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      applicationId: formData.applicationId || undefined,
      completed: false,
    };

    setEvents((prev) => [...prev, newEvent]);
    setFormData({
      title: '',
      eventType: 'Follow-Up',
      eventDate: '',
      applicationId: applicationId || '',
    });
    setOpen(false);
  };

  const eventTypes: EventType[] = ['Interview', 'Follow-Up', 'Coffee Chat', 'Career Fair', 'Deadline'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <ButtonRetro variant="outline">
            <Calendar className="h-4 w-4" /> Add Event
          </ButtonRetro>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md border-2 border-border shadow-retro-xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Add New Event 📅</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4" /> Event Title *
            </label>
            <InputRetro
              placeholder="e.g., Interview with Linear"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Event Type</label>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, eventType: type })}
                  className={cn(
                    "px-3 py-1 rounded-full border-2 border-border text-sm font-bold transition-all",
                    formData.eventType === type
                      ? "bg-primary text-primary-foreground shadow-retro-sm"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Date *
            </label>
            <InputRetro
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              required
            />
          </div>

          {applications.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold">Link to Application (optional)</label>
              <select
                value={formData.applicationId}
                onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">No application linked</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.roleTitle} at {app.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <ButtonRetro type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" className="flex-1">
              <Calendar className="h-4 w-4" /> Add Event
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
