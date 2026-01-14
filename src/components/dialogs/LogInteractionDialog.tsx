import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact, ContactInteraction } from '@/hooks/useContacts';
import { Mail, Phone, Users, Linkedin, Coffee, Calendar, MoreHorizontal } from 'lucide-react';

interface LogInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSubmit: (interaction: Omit<ContactInteraction, 'id' | 'user_id' | 'created_at'>) => void;
}

const interactionTypes = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'coffee', label: 'Coffee Chat', icon: Coffee },
  { value: 'event', label: 'Event', icon: Calendar },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
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
          <DialogTitle className="text-xl font-black">
            Log Interaction 💬
          </DialogTitle>
          <p className="text-muted-foreground">
            with <span className="font-bold text-foreground">{contact.name}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Interaction Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {interactionTypes.slice(0, 4).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as ContactInteraction['type'])}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                    type === t.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <t.icon className={`h-5 w-5 ${type === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {interactionTypes.slice(4).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as ContactInteraction['type'])}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                    type === t.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <t.icon className={`h-5 w-5 ${type === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="interaction-notes">Notes</Label>
            <Textarea
              id="interaction-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you discuss?"
              rows={3}
            />
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome / Next Steps</Label>
            <InputRetro
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g., Will send resume, scheduled interview"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
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