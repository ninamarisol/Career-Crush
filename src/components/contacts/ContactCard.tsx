import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Building2, Calendar, Clock, MoreVertical, MessageSquare, Briefcase } from 'lucide-react';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Badge } from '@/components/ui/badge';
import { ButtonRetro } from '@/components/ui/button-retro';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
}

const strengthColors = {
  acquaintance: 'bg-muted text-muted-foreground',
  professional: 'bg-primary/20 text-primary',
  close: 'bg-accent/30 text-accent-foreground',
  mentor: 'bg-primary text-primary-foreground',
};

const strengthLabels = {
  acquaintance: 'Acquaintance',
  professional: 'Professional',
  close: 'Close Contact',
  mentor: 'Mentor',
};

export function ContactCard({
  contact,
  applications,
  onEdit,
  onDelete,
  onLogInteraction,
  onScheduleFollowUp,
}: ContactCardProps) {
  const linkedApplication = applications.find((a) => a.id === contact.application_id);
  const isOverdue = contact.next_follow_up && isPast(parseISO(contact.next_follow_up)) && contact.follow_up_status !== 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <CardRetro className="hover:shadow-retro-lg transition-shadow">
        <CardRetroContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-black text-primary">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg truncate">{contact.name}</h3>
                {(contact.position || contact.company) && (
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.position}
                    {contact.position && contact.company && ' at '}
                    {contact.company}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ButtonRetro variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </ButtonRetro>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onLogInteraction(contact)}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Log Interaction
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onScheduleFollowUp(contact)}>
                  <Calendar className="h-4 w-4 mr-2" /> Schedule Follow-up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  Edit Contact
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(contact.id)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tags & Strength */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={cn('text-xs', strengthColors[contact.connection_strength])}>
              {strengthLabels[contact.connection_strength]}
            </Badge>
            {contact.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
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
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
          </div>

          {/* Linked Application */}
          {linkedApplication && (
            <div className="flex items-center gap-2 mt-3 text-sm bg-muted/50 rounded-lg px-3 py-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="font-medium">{linkedApplication.position}</span>
              <span className="text-muted-foreground">at {linkedApplication.company}</span>
            </div>
          )}

          {/* Follow-up Status */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {contact.last_contacted ? (
                <span>Last contacted {formatDistanceToNow(parseISO(contact.last_contacted), { addSuffix: true })}</span>
              ) : (
                <span>Never contacted</span>
              )}
            </div>
            {contact.next_follow_up && (
              <Badge className={cn(
                'text-xs',
                isOverdue ? 'bg-destructive text-destructive-foreground' : 'bg-primary/20 text-primary'
              )}>
                <Calendar className="h-3 w-3 mr-1" />
                {isOverdue ? 'Overdue' : format(parseISO(contact.next_follow_up), 'MMM d')}
              </Badge>
            )}
          </div>
        </CardRetroContent>
      </CardRetro>
    </motion.div>
  );
}