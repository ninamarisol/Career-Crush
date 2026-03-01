import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contact, ContactInteraction } from '@/hooks/useContacts';
import { Mail, Phone, Users, Linkedin, Coffee, Calendar, MoreHorizontal, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSubmit: (interaction: Omit<ContactInteraction, 'id' | 'user_id' | 'created_at'>) => void;
}

const interactionTypes: {
  value: ContactInteraction['type'];
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-500' },
  { value: 'call', label: 'Call', icon: Phone, color: 'text-green-500' },
  { value: 'meeting', label: 'Meeting', icon: Users, color: 'text-purple-500' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { value: 'coffee', label: 'Coffee', icon: Coffee, color: 'text-amber-600' },
  { value: 'event', label: 'Event', icon: Calendar, color: 'text-primary' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-muted-foreground' },
];

export function LogInteractionDialog({
  open,
  onOpenChange,
  contact,
  onSubmit,
}: LogInteractionDialogProps) {
  const [type, setType] = useState<ContactInteraction['type']>('email');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    onSubmit({
      contact_id: contact.id,
      type,
      date,
      notes: notes || null,
      outcome: outcome || null,
    });

    onOpenChange(false);
    setType('email');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setOutcome('');
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Log Interaction</DialogTitle>
          <p className="text-sm text-muted-foreground">
            with <span className="font-semibold text-foreground">{contact.name}</span>
            {contact.company && (
              <span className="text-muted-foreground"> · {contact.company}</span>
            )}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Interaction Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              How did you connect?
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {interactionTypes.map((t) => {
                const Icon = t.icon;
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center',
                      active
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    )}
                  >
                    <Icon
                      className={cn('h-5 w-5', active ? t.color : 'text-muted-foreground')}
                    />
                    <span className={cn('text-[11px] font-medium leading-tight', active ? 'text-foreground' : 'text-muted-foreground')}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="interaction-date">Date</Label>
            <InputRetro
              id="interaction-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="interaction-notes">What did you discuss?</Label>
            <Textarea
              id="interaction-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Topics covered, updates shared, questions asked…"
              rows={3}
            />
          </div>

          {/* Outcome */}
          <div className="space-y-1.5">
            <Label htmlFor="outcome" className="flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" />
              Outcome / Next Steps
            </Label>
            <InputRetro
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. Will send resume, scheduled call for next week"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <ButtonRetro type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit">Log Interaction</ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
