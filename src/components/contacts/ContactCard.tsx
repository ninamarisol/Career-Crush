import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Linkedin,
  Calendar,
  Clock,
  MoreVertical,
  MessageSquare,
  Briefcase,
  Tag,
} from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Badge } from '@/components/ui/badge';
import { ButtonRetro } from '@/components/ui/button-retro';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Contact } from '@/hooks/useContacts';
import { Application } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';

interface ContactCardProps {
  contact: Contact;
  applications: Application[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onLogInteraction: (contact: Contact) => void;
  onScheduleFollowUp: (contact: Contact) => void;
  onClick?: (contact: Contact) => void;
}

const strengthConfig = {
  acquaintance: {
    label: 'Acquaintance',
    dot: 'bg-muted-foreground',
    badge: 'bg-muted text-muted-foreground border-border',
    border: 'border-l-muted-foreground/40',
    avatar: 'bg-muted text-muted-foreground',
  },
  professional: {
    label: 'Professional',
    dot: 'bg-primary/70',
    badge: 'bg-primary/15 text-primary border-primary/30',
    border: 'border-l-primary/60',
    avatar: 'bg-primary/20 text-primary',
  },
  close: {
    label: 'Close Contact',
    dot: 'bg-secondary',
    badge: 'bg-secondary/30 text-secondary-foreground border-secondary/50',
    border: 'border-l-secondary',
    avatar: 'bg-secondary/30 text-secondary-foreground',
  },
  mentor: {
    label: 'Mentor',
    dot: 'bg-primary',
    badge: 'bg-primary text-primary-foreground border-primary',
    border: 'border-l-primary',
    avatar: 'bg-primary text-primary-foreground',
  },
};

export function ContactCard({
  contact,
  applications,
  onEdit,
  onDelete,
  onLogInteraction,
  onScheduleFollowUp,
}: ContactCardProps) {
  const linkedApp = applications.find((a) => a.id === contact.application_id);
  const isOverdue =
    contact.next_follow_up &&
    isPast(parseISO(contact.next_follow_up)) &&
    contact.follow_up_status !== 'completed';

  const cfg = strengthConfig[contact.connection_strength];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      layout
    >
      <CardRetro
        className={cn(
          'hover:shadow-retro-lg transition-all border-l-4 overflow-hidden',
          cfg.border
        )}
      >
        <CardRetroContent className="p-0">
          {/* Top section */}
          <div className="p-4 pb-3">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-lg select-none',
                  cfg.avatar
                )}
              >
                {contact.name.charAt(0).toUpperCase()}
              </div>

              {/* Name & role */}
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="font-bold text-base leading-tight truncate">{contact.name}</h3>
                {(contact.position || contact.company) && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {[contact.position, contact.company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              {/* Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ButtonRetro variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mt-0.5 -mr-1">
                    <MoreVertical className="h-4 w-4" />
                  </ButtonRetro>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onLogInteraction(contact)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Log Interaction
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onScheduleFollowUp(contact)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Follow-up
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(contact)}>
                    Edit Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(contact.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Strength badge + tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
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
              {contact.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{contact.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Contact details strip */}
          {(contact.email || contact.phone || contact.linkedin_url) && (
            <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate max-w-[140px]">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {contact.phone}
                </a>
              )}
              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5 shrink-0" />
                  LinkedIn
                </a>
              )}
            </div>
          )}

          {/* Linked application */}
          {linkedApp && (
            <div className="mx-4 mb-3 flex items-center gap-2 text-xs bg-muted/60 rounded-lg px-3 py-2">
              <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium truncate">
                {linkedApp.position} @ {linkedApp.company}
              </span>
            </div>
          )}

          {/* Footer bar */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {contact.last_contacted
                  ? formatDistanceToNow(parseISO(contact.last_contacted), { addSuffix: true })
                  : 'Never contacted'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {contact.next_follow_up && (
                <Badge
                  className={cn(
                    'text-xs flex items-center gap-1 px-2 py-0.5',
                    isOverdue
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-primary/15 text-primary border-primary/30'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {isOverdue ? 'Overdue' : format(parseISO(contact.next_follow_up), 'MMM d')}
                </Badge>
              )}
              <ButtonRetro
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => onLogInteraction(contact)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Log
              </ButtonRetro>
              <ButtonRetro
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => onScheduleFollowUp(contact)}
              >
                <Calendar className="h-3.5 w-3.5" />
                Follow-up
              </ButtonRetro>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}
