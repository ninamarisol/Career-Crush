import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Users, Clock, AlertCircle, UserCheck, Network } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContacts, useContactInteractions, Contact } from '@/hooks/useContacts';
import { useApp } from '@/context/AppContext';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactDetailDialog } from '@/components/contacts/ContactDetailDialog';
import { AddContactDialog } from '@/components/dialogs/AddContactDialog';
import { LogInteractionDialog } from '@/components/dialogs/LogInteractionDialog';
import { ScheduleFollowUpDialog } from '@/components/dialogs/ScheduleFollowUpDialog';
import { isPast, parseISO } from 'date-fns';

type SortOption = 'recent' | 'name' | 'company' | 'strength';
type TabOption = 'all' | 'follow-up' | 'overdue' | 'mentors';

const strengthOrder: Record<string, number> = { mentor: 0, close: 1, professional: 2, acquaintance: 3 };

export default function Contacts() {
  const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();
  const { applications, addEvent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [activeTab, setActiveTab] = useState<TabOption>('all');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [interactionContact, setInteractionContact] = useState<Contact | null>(null);
  const [followUpContact, setFollowUpContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { addInteraction } = useContactInteractions(interactionContact?.id || null);

  const stats = useMemo(() => {
    const overdue = contacts.filter(
      (c) => c.next_follow_up && isPast(parseISO(c.next_follow_up)) && c.follow_up_status !== 'completed'
    ).length;
    const scheduled = contacts.filter((c) => c.follow_up_status === 'scheduled').length;
    const mentors = contacts.filter((c) => c.connection_strength === 'mentor').length;
    return { total: contacts.length, overdue, scheduled, mentors };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.position?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (activeTab) {
      case 'follow-up':
        result = result.filter((c) => c.follow_up_status === 'scheduled');
        break;
      case 'overdue':
        result = result.filter(
          (c) =>
            c.next_follow_up &&
            isPast(parseISO(c.next_follow_up)) &&
            c.follow_up_status !== 'completed'
        );
        break;
      case 'mentors':
        result = result.filter((c) => c.connection_strength === 'mentor');
        break;
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'company':
        result.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
        break;
      case 'strength':
        result.sort((a, b) => strengthOrder[a.connection_strength] - strengthOrder[b.connection_strength]);
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    return result;
  }, [contacts, searchQuery, activeTab, sortBy]);

  const handleAddContact = async (
    contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingContact) {
      await updateContact(editingContact.id, contactData);
    } else {
      await addContact(contactData);
    }
    setEditingContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setAddDialogOpen(true);
  };

  const handleScheduleFollowUp = async (
    date: string,
    event: Parameters<typeof addEvent>[0]
  ) => {
    if (!followUpContact) return;
    await updateContact(followUpContact.id, {
      next_follow_up: date,
      follow_up_status: 'scheduled',
    });
    await addEvent(event);
  };

  const emptyMessages: Record<TabOption, { title: string; body: string }> = {
    all: { title: 'No contacts yet', body: 'Start building your professional network!' },
    'follow-up': { title: 'No follow-ups scheduled', body: 'Keep in touch—schedule a follow-up with someone.' },
    overdue: { title: 'You\'re all caught up!', body: 'No overdue follow-ups. Great work!' },
    mentors: { title: 'No mentors added yet', body: 'Add someone as a mentor to see them here.' },
  };

  const currentEmpty = emptyMessages[activeTab];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-primary/15">
                <Network className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Contacts</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground pl-1">
              Your professional network — nurture it intentionally.
            </p>
          </div>
          <ButtonRetro
            className="w-full sm:w-auto shrink-0"
            onClick={() => {
              setEditingContact(null);
              setAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </ButtonRetro>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
      >
        {[
          {
            icon: Users,
            value: stats.total,
            label: 'Total',
            color: 'text-primary',
            bg: 'bg-primary/12',
            tab: 'all' as TabOption,
          },
          {
            icon: Clock,
            value: stats.scheduled,
            label: 'Follow-ups',
            color: 'text-secondary-foreground',
            bg: 'bg-secondary/25',
            tab: 'follow-up' as TabOption,
          },
          {
            icon: AlertCircle,
            value: stats.overdue,
            label: 'Overdue',
            color: 'text-destructive',
            bg: 'bg-destructive/12',
            tab: 'overdue' as TabOption,
          },
          {
            icon: UserCheck,
            value: stats.mentors,
            label: 'Mentors',
            color: 'text-primary',
            bg: 'bg-primary/12',
            tab: 'mentors' as TabOption,
          },
        ].map(({ icon: Icon, value, label, color, bg, tab }) => (
          <CardRetro
            key={label}
            className={`cursor-pointer transition-all hover:shadow-retro-lg ${
              activeTab === tab ? 'ring-2 ring-primary ring-offset-1' : ''
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <CardRetroContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg} shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </CardRetroContent>
          </CardRetro>
        ))}
      </motion.div>

      {/* Search + Sort */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <InputRetro
            placeholder="Search by name, company, tag…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="strength">Relationship</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tab Filter */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabOption)}>
          <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              All
              {contacts.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {contacts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="follow-up" className="flex items-center gap-1.5">
              Follow-ups
              {stats.scheduled > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {stats.scheduled}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center gap-1.5">
              Overdue
              {stats.overdue > 0 && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-destructive text-destructive-foreground">
                  {stats.overdue}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Results count */}
      {!loading && contacts.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filteredContacts.length === contacts.length
            ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`
            : `${filteredContacts.length} of ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardRetro key={i}>
              <CardRetroContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardRetroContent>
            </CardRetro>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-4"
        >
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Network className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-bold mb-2">{currentEmpty.title}</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">{currentEmpty.body}</p>
          {contacts.length === 0 && (
            <ButtonRetro onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Contact
            </ButtonRetro>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                applications={applications}
                onEdit={handleEdit}
                onDelete={deleteContact}
                onLogInteraction={setInteractionContact}
                onScheduleFollowUp={setFollowUpContact}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Dialogs */}
      <AddContactDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddContact}
        applications={applications}
        editingContact={editingContact}
      />

      <LogInteractionDialog
        open={!!interactionContact}
        onOpenChange={(open) => !open && setInteractionContact(null)}
        contact={interactionContact}
        onSubmit={addInteraction}
      />

      <ScheduleFollowUpDialog
        open={!!followUpContact}
        onOpenChange={(open) => !open && setFollowUpContact(null)}
        contact={followUpContact}
        onSubmit={handleScheduleFollowUp}
      />
    </div>
  );
}
