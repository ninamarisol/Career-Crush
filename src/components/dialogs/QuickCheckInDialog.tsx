import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, Send } from 'lucide-react';
import { useContacts, Contact } from '@/hooks/useContacts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface QuickCheckInDialogProps {
  trigger?: React.ReactNode;
}

export function QuickCheckInDialog({ trigger }: QuickCheckInDialogProps) {
  const { contacts, refetch } = useContacts();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [interactionType, setInteractionType] = useState<string>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedContactId) {
      toast.error('Please select a contact');
      return;
    }

    setIsSubmitting(true);
    try {
      // Log the interaction
      const { error: interactionError } = await supabase
        .from('contact_interactions')
        .insert({
          user_id: user.id,
          contact_id: selectedContactId,
          type: interactionType,
          date: new Date().toISOString().split('T')[0],
          notes: notes || null,
          outcome: 'check-in',
        });

      if (interactionError) throw interactionError;

      // Update contact's last_contacted date
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ last_contacted: new Date().toISOString().split('T')[0] })
        .eq('id', selectedContactId);

      if (updateError) throw updateError;

      toast.success('Check-in logged! 🎉');
      setOpen(false);
      setSelectedContactId('');
      setNotes('');
      refetch();
    } catch (error) {
      console.error('Error logging check-in:', error);
      toast.error('Failed to log check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <ButtonRetro variant="outline">
            <Users className="h-4 w-4 mr-2" /> Quick Check-in
          </ButtonRetro>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Network Check-in
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {contacts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No contacts in your network yet.</p>
              <p className="text-sm mt-2">Add contacts from the Contacts page first!</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold">Who did you connect with?</label>
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} {contact.company && `(${contact.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">How did you connect?</label>
                <Select value={interactionType} onValueChange={setInteractionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="linkedin">💼 LinkedIn Message</SelectItem>
                    <SelectItem value="call">📞 Phone Call</SelectItem>
                    <SelectItem value="coffee">☕ Coffee Chat</SelectItem>
                    <SelectItem value="meeting">🤝 Meeting</SelectItem>
                    <SelectItem value="event">🎪 Event</SelectItem>
                    <SelectItem value="other">💬 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Quick notes (optional)</label>
                <Textarea
                  placeholder="What did you discuss? Any follow-ups?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <ButtonRetro 
                className="w-full" 
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedContactId}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Logging...' : 'Log Check-in'}
              </ButtonRetro>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
