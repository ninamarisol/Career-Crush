import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { useApp } from '@/context/AppContext';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddEventDialogProps {
  trigger?: React.ReactNode;
  applicationId?: string;
}

type EventType = 'Interview' | 'Follow-Up' | 'Coffee Chat' | 'Career Fair' | 'Deadline';

export function AddEventDialog({ trigger, applicationId }: AddEventDialogProps) {
  const { addEvent, applications } = useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Follow-Up' as EventType,
    date: '',
    time: '',
    application_id: applicationId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    setLoading(true);
    try {
      await addEvent({
        title: formData.title,
        type: formData.type,
        date: formData.date,
        time: formData.time || null,
        application_id: formData.application_id || null,
        notes: null,
      });

      setFormData({
        title: '',
        type: 'Follow-Up',
        date: '',
        time: '',
        application_id: applicationId || '',
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
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
                  onClick={() => setFormData({ ...formData, type })}
                  className={cn(
                    "px-3 py-1 rounded-full border-2 border-border text-sm font-bold transition-all",
                    formData.type === type
                      ? "bg-primary text-primary-foreground shadow-retro-sm"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date *
              </label>
              <InputRetro
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time
              </label>
              <InputRetro
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          {applications.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold">Link to Application (optional)</label>
              <select
                value={formData.application_id}
                onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                className="w-full p-3 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">No application linked</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.position} at {app.company}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <ButtonRetro type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={loading}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding...' : <><Calendar className="h-4 w-4" /> Add Event</>}
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
