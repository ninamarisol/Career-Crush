import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/hooks/useContacts';
import { Application } from '@/context/AppContext';
import { X, User, Briefcase, Link2, Tag, StickyNote } from 'lucide-react';

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  applications: Application[];
  editingContact?: Contact | null;
}

type ConnectionStrength = 'acquaintance' | 'professional' | 'close' | 'mentor';
type FollowUpStatus = 'none' | 'scheduled' | 'overdue' | 'completed';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  linkedin_url: string;
  notes: string;
  connection_strength: ConnectionStrength;
  last_contacted: string | null;
  next_follow_up: string | null;
  follow_up_status: FollowUpStatus;
  tags: string[];
  application_id: string | null;
}

const defaultContact: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  linkedin_url: '',
  notes: '',
  connection_strength: 'acquaintance',
  last_contacted: null,
  next_follow_up: null,
  follow_up_status: 'none',
  tags: [],
  application_id: null,
};

const strengthOptions: { value: ConnectionStrength; label: string; description: string }[] = [
  { value: 'acquaintance', label: 'Acquaintance', description: 'Met briefly or connected online' },
  { value: 'professional', label: 'Professional', description: 'Regular professional contact' },
  { value: 'close', label: 'Close Contact', description: 'Strong relationship, mutual trust' },
  { value: 'mentor', label: 'Mentor', description: 'Guides your career growth' },
];

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

export function AddContactDialog({
  open,
  onOpenChange,
  onSubmit,
  applications,
  editingContact,
}: AddContactDialogProps) {
  const [formData, setFormData] = useState<FormData>(defaultContact);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name,
        email: editingContact.email || '',
        phone: editingContact.phone || '',
        company: editingContact.company || '',
        position: editingContact.position || '',
        linkedin_url: editingContact.linkedin_url || '',
        notes: editingContact.notes || '',
        connection_strength: editingContact.connection_strength as ConnectionStrength,
        last_contacted: editingContact.last_contacted,
        next_follow_up: editingContact.next_follow_up,
        follow_up_status: editingContact.follow_up_status as FollowUpStatus,
        tags: editingContact.tags,
        application_id: editingContact.application_id,
      });
    } else {
      setFormData(defaultContact);
      setTagInput('');
    }
  }, [editingContact, open]);

  const set = (patch: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      email: formData.email || null,
      phone: formData.phone || null,
      company: formData.company || null,
      position: formData.position || null,
      linkedin_url: formData.linkedin_url || null,
      notes: formData.notes || null,
    });
    onOpenChange(false);
    setFormData(defaultContact);
    setTagInput('');
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      set({ tags: [...formData.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => set({ tags: formData.tags.filter((t) => t !== tag) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {editingContact
              ? 'Update contact information and relationship details.'
              : 'Add someone to your professional network.'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-1">
          {/* Basic Info */}
          <div>
            <SectionLabel icon={User}>Basic Info</SectionLabel>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <InputRetro
                  id="name"
                  value={formData.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="Jane Smith"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <InputRetro
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <InputRetro
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                    placeholder="+1 555 000 0000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Company */}
          <div>
            <SectionLabel icon={Briefcase}>Role & Company</SectionLabel>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="position">Position / Title</Label>
                  <InputRetro
                    id="position"
                    value={formData.position}
                    onChange={(e) => set({ position: e.target.value })}
                    placeholder="Engineering Manager"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <InputRetro
                    id="company"
                    value={formData.company}
                    onChange={(e) => set({ company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              {/* Link to Application */}
              <div className="space-y-1.5">
                <Label>Linked Application</Label>
                <Select
                  value={formData.application_id || 'none'}
                  onValueChange={(v) => set({ application_id: v === 'none' ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Link to an application…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked application</SelectItem>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.position} at {app.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Relationship */}
          <div>
            <SectionLabel icon={Link2}>Relationship</SectionLabel>
            <div className="space-y-3">
              {/* Connection Strength */}
              <div className="space-y-1.5">
                <Label>Connection Strength</Label>
                <div className="grid grid-cols-2 gap-2">
                  {strengthOptions.map(({ value, label, description }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set({ connection_strength: value })}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        formData.connection_strength === value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <InputRetro
                  id="linkedin"
                  value={formData.linkedin_url}
                  onChange={(e) => set({ linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/janesmith"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <SectionLabel icon={Tag}>Tags</SectionLabel>
            <div className="space-y-2">
              <div className="flex gap-2">
                <InputRetro
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. recruiter, tech, warm-intro…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <ButtonRetro type="button" variant="outline" onClick={addTag} className="shrink-0">
                  Add
                </ButtonRetro>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive transition-colors ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <SectionLabel icon={StickyNote}>Notes</SectionLabel>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="How you met, topics to bring up, anything memorable…"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <ButtonRetro type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit" disabled={!formData.name.trim()}>
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
