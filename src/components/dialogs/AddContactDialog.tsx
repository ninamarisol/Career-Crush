import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact } from '@/hooks/useContacts';
import { Application } from '@/context/AppContext';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export function AddContactDialog({
  open,
  onOpenChange,
  onSubmit,
  applications,
  editingContact,
}: AddContactDialogProps) {
  const [formData, setFormData] = useState(defaultContact);
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
        connection_strength: editingContact.connection_strength as 'acquaintance' | 'professional' | 'close' | 'mentor',
        last_contacted: editingContact.last_contacted,
        next_follow_up: editingContact.next_follow_up,
        follow_up_status: editingContact.follow_up_status as 'none' | 'scheduled' | 'overdue' | 'completed',
        tags: editingContact.tags,
        application_id: editingContact.application_id,
      });
    } else {
      setFormData(defaultContact);
    }
  }, [editingContact, open]);

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
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            {editingContact ? 'Edit Contact' : 'Add New Contact'} 📇
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <InputRetro
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <InputRetro
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <InputRetro
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          {/* Company & Position */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <InputRetro
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <InputRetro
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Hiring Manager"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <InputRetro
              id="linkedin"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          {/* Connection Strength */}
          <div className="space-y-2">
            <Label>Connection Strength</Label>
            <Select
              value={formData.connection_strength}
              onValueChange={(value: 'acquaintance' | 'professional' | 'close' | 'mentor') =>
                setFormData({ ...formData, connection_strength: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acquaintance">Acquaintance</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="close">Close Contact</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Link to Application */}
          <div className="space-y-2">
            <Label>Link to Application (Optional)</Label>
            <Select
              value={formData.application_id || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, application_id: value === 'none' ? null : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an application..." />
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

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <InputRetro
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <ButtonRetro type="button" variant="outline" onClick={addTag}>
                Add
              </ButtonRetro>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How you met, conversation topics, etc."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <ButtonRetro type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </ButtonRetro>
            <ButtonRetro type="submit">
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </ButtonRetro>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}