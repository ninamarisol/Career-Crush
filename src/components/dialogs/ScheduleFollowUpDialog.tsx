import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contact } from '@/hooks/useContacts';
import { Event } from '@/context/AppContext';
import { addDays, format } from 'date-fns';

interface ScheduleFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSubmit: (date: string, event: Omit<Event, 'id' | 'user_id'>) => void;
}

const quickOptions = [
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: 'In 1 month', days: 30 },
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

  const handleQuickSelect = (days: number) => {
    setDate(format(addDays(new Date(), days), 'yyyy-MM-dd'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    const event: Omit<Event, 'id' | 'user_id'> = {
      title: `Follow up with ${contact.name}`,
      type: 'follow-up',
      date,
      time: addToCalendar ? time : null,
      notes: notes || `Follow-up with ${contact.name}${contact.company ? ` from ${contact.company}` : ''}`,
      application_id: contact.application_id,
    };

    onSubmit(date, event);
    onOpenChange(false);
    setDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    setTime('10:00');
    setNotes('');
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            Schedule Follow-up 📅
          </DialogTitle>
          <p className="text-muted-foreground">
            with <span className="font-bold text-foreground">{contact.name}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Select */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((opt) => (
                <ButtonRetro
                  key={opt.days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(opt.days)}
                >
                  {opt.label}
                </ButtonRetro>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="followup-date">Date</Label>
              <InputRetro
                id="followup-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-time">Time</Label>
              <InputRetro
                id="followup-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Add to Calendar Toggle */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              id="add-to-calendar"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary"
            />
            <Label htmlFor="add-to-calendar" className="font-medium cursor-pointer">
              Add to Calendar
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="followup-notes">Notes (Optional)</Label>
            <Textarea
              id="followup-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What to discuss, action items..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <ButtonRetro type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit">Schedule</ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}