import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contact } from '@/hooks/useContacts';
import { Event } from '@/context/AppContext';
import { addDays, format } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSubmit: (date: string, event: Omit<Event, 'id' | 'user_id'>) => void;
}

const quickOptions = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
];

export function ScheduleFollowUpDialog({
  open,
  onOpenChange,
  contact,
  onSubmit,
}: ScheduleFollowUpDialogProps) {
  const [date, setDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number | null>(7);

  const handleQuickSelect = (days: number) => {
    setSelectedDays(days);
    setDate(format(addDays(new Date(), days), 'yyyy-MM-dd'));
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    setSelectedDays(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    const event: Omit<Event, 'id' | 'user_id'> = {
      title: `Follow up with ${contact.name}`,
      type: 'follow-up',
      date,
      time: addToCalendar ? time : null,
      notes:
        notes ||
        `Follow-up with ${contact.name}${contact.company ? ` from ${contact.company}` : ''}`,
      application_id: contact.application_id,
    };

    onSubmit(date, event);
    onOpenChange(false);
    setDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    setTime('10:00');
    setNotes('');
    setSelectedDays(7);
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Schedule Follow-up</DialogTitle>
          <p className="text-sm text-muted-foreground">
            with <span className="font-semibold text-foreground">{contact.name}</span>
            {contact.company && (
              <span className="text-muted-foreground"> · {contact.company}</span>
            )}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Quick Select Pills */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              When?
            </Label>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => handleQuickSelect(opt.days)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all',
                    selectedDays === opt.days
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="followup-date" className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Date
              </Label>
              <InputRetro
                id="followup-date"
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="followup-time" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Time
              </Label>
              <InputRetro
                id="followup-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={!addToCalendar}
              />
            </div>
          </div>

          {/* Add to Calendar */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border cursor-pointer hover:bg-muted/80 transition-colors">
            <input
              type="checkbox"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-primary accent-primary"
            />
            <div>
              <p className="text-sm font-medium">Add to Calendar</p>
              <p className="text-xs text-muted-foreground">Creates an event on your timeline</p>
            </div>
          </label>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="followup-notes">Notes (optional)</Label>
            <Textarea
              id="followup-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What to cover, action items to prepare…"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <ButtonRetro type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit">Schedule Follow-up</ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
