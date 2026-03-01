import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ButtonRetro } from '@/components/ui/button-retro';
import {
  Mail,
  Phone,
  Linkedin,
  MessageSquare,
  Calendar,
  Coffee,
  Video,
  Users,
  Globe,
  Tag,
  Briefcase,
  ArrowRight,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { Contact, ContactInteraction, useContactInteractions } from '@/hooks/useContacts';
import { Application } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { InputRetro } from '@/components/ui/input-retro';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ContactDetailDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: Application[];
  onLogInteraction: (contact: Contact) => void;
  onScheduleFollowUp: (contact: Contact) => void;
}

const strengthConfig = {
  acquaintance: {
    label: 'Acquaintance',
    dot: 'bg-muted-foreground',
    badge: 'bg-muted text-muted-foreground border-border',
    avatar: 'bg-muted text-muted-foreground',
  },
  professional: {
    label: 'Professional',
    dot: 'bg-primary/70',
    badge: 'bg-primary/15 text-primary border-primary/30',
    avatar: 'bg-primary/20 text-primary',
  },
  close: {
    label: 'Close Contact',
    dot: 'bg-secondary',
    badge: 'bg-secondary/30 text-secondary-foreground border-secondary/50',
    avatar: 'bg-secondary/30 text-secondary-foreground',
  },
  mentor: {
    label: 'Mentor',
    dot: 'bg-primary',
    badge: 'bg-primary text-primary-foreground border-primary',
    avatar: 'bg-primary text-primary-foreground',
  },
};

const interactionIcons: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Video,
  linkedin: Linkedin,
  coffee: Coffee,
  event: Users,
  other: Globe,
};

const interactionTypes = ['email', 'call', 'meeting', 'linkedin', 'coffee', 'event', 'other'];

export function ContactDetailDialog({
  contact,
  open,
  onOpenChange,
  applications,
  onLogInteraction,
  onScheduleFollowUp,
}: ContactDetailDialogProps) {
  const { interactions, loading, updateInteraction, deleteInteraction } = useContactInteractions(open && contact ? contact.id : null);
  const linkedApp = contact ? applications.find((a) => a.id === contact.application_id) : null;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ type: '', date: '', notes: '', outcome: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!contact) return null;

  const cfg = strengthConfig[contact.connection_strength];

  const startEdit = (interaction: ContactInteraction) => {
    setEditingId(interaction.id);
    setEditForm({
      type: interaction.type,
      date: interaction.date,
      notes: interaction.notes || '',
      outcome: interaction.outcome || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateInteraction(editingId, {
      type: editForm.type as ContactInteraction['type'],
      date: editForm.date,
      notes: editForm.notes || null,
      outcome: editForm.outcome || null,
    });
    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteInteraction(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg border-2 border-border shadow-retro-xl bg-card p-0 gap-0 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-border">
            <DialogHeader className="mb-0">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-black text-xl select-none',
                    cfg.avatar
                  )}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl font-black leading-tight">
                    {contact.name}
                  </DialogTitle>
                  {(contact.position || contact.company) && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {[contact.position, contact.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge
                      className={cn(
                        'text-xs font-semibold border px-2 py-0.5 flex items-center gap-1',
                        cfg.badge
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full inline-block', cfg.dot)} />
                      {cfg.label}
                    </Badge>
                    {contact.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5 opacity-60" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Contact links */}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Mail className="h-3.5 w-3.5" /> {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </a>
              )}
              {contact.linkedin_url && (
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
            </div>

            {linkedApp && (
              <div className="flex items-center gap-2 text-xs bg-muted/60 rounded-lg px-3 py-2 mt-3">
                <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium truncate">
                  {linkedApp.position} @ {linkedApp.company}
                </span>
              </div>
            )}

            {contact.notes && (
              <p className="text-xs text-muted-foreground mt-3 bg-muted/40 rounded-lg px-3 py-2 italic">
                {contact.notes}
              </p>
            )}
          </div>

          {/* Interaction Timeline */}
          <div className="flex-1 overflow-y-auto p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Interaction History
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : interactions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary/50" />
                </div>
                <p className="font-bold text-sm mb-1">No interactions yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Log your first interaction to start tracking your relationship.
                </p>
                <ButtonRetro
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onLogInteraction(contact);
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Log First Interaction
                </ButtonRetro>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

                <div className="space-y-4">
                  {interactions.map((interaction) => {
                    const Icon = interactionIcons[interaction.type] || Globe;
                    const isEditing = editingId === interaction.id;

                    if (isEditing) {
                      return (
                        <div key={interaction.id} className="relative flex gap-3 pl-0">
                          <div className="relative z-10 w-8 h-8 rounded-full bg-primary border-2 border-primary flex items-center justify-center shrink-0">
                            <Pencil className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                          <div className="flex-1 bg-primary/5 rounded-lg border-2 border-primary/30 p-3 min-w-0 space-y-2">
                            <div className="flex gap-2">
                              <Select value={editForm.type} onValueChange={(v) => setEditForm(f => ({ ...f, type: v }))}>
                                <SelectTrigger className="h-8 text-xs w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {interactionTypes.map(t => (
                                    <SelectItem key={t} value={t} className="capitalize text-xs">{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <InputRetro
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))}
                                className="h-8 text-xs flex-1"
                              />
                            </div>
                            <Textarea
                              placeholder="Notes..."
                              value={editForm.notes}
                              onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                              className="text-xs min-h-[50px] resize-none"
                            />
                            <InputRetro
                              placeholder="Outcome / next step..."
                              value={editForm.outcome}
                              onChange={(e) => setEditForm(f => ({ ...f, outcome: e.target.value }))}
                              className="h-8 text-xs"
                            />
                            <div className="flex gap-2 justify-end">
                              <ButtonRetro variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                                <X className="h-3 w-3" /> Cancel
                              </ButtonRetro>
                              <ButtonRetro size="sm" className="h-7 text-xs" onClick={saveEdit}>
                                <Check className="h-3 w-3" /> Save
                              </ButtonRetro>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={interaction.id} className="relative flex gap-3 pl-0 group">
                        {/* Icon dot */}
                        <div className="relative z-10 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-muted/40 rounded-lg border border-border p-3 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                              {interaction.type}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">
                                {format(parseISO(interaction.date), 'MMM d, yyyy')}
                              </span>
                              {/* Edit/Delete buttons - visible on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                                <button
                                  onClick={() => startEdit(interaction)}
                                  className="p-1 rounded hover:bg-muted transition-colors"
                                  title="Edit interaction"
                                >
                                  <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                                <button
                                  onClick={() => setDeleteId(interaction.id)}
                                  className="p-1 rounded hover:bg-destructive/10 transition-colors"
                                  title="Delete interaction"
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {interaction.notes && (
                            <p className="text-sm text-foreground mt-1">{interaction.notes}</p>
                          )}

                          {interaction.outcome && (
                            <div className="flex items-start gap-1.5 mt-2 text-xs text-primary">
                              <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                              <span className="font-medium">{interaction.outcome}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 p-4 border-t border-border bg-muted/30">
            <ButtonRetro
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                onOpenChange(false);
                onLogInteraction(contact);
              }}
            >
              <MessageSquare className="h-3.5 w-3.5" /> Log Interaction
            </ButtonRetro>
            <ButtonRetro
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                onOpenChange(false);
                onScheduleFollowUp(contact);
              }}
            >
              <Calendar className="h-3.5 w-3.5" /> Schedule Follow-up
            </ButtonRetro>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete interaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this interaction from the history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
