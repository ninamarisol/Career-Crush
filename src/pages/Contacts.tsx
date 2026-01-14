import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, SortAsc, Users, Clock, AlertCircle, UserCheck } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { CardRetro, CardRetroContent } from '@/components/ui/card-retro';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useContacts, useContactInteractions, Contact } from '@/hooks/useContacts';
import { useApp } from '@/context/AppContext';
import { ContactCard } from '@/components/contacts/ContactCard';
import { AddContactDialog } from '@/components/dialogs/AddContactDialog';
import { LogInteractionDialog } from '@/components/dialogs/LogInteractionDialog';
import { ScheduleFollowUpDialog } from '@/components/dialogs/ScheduleFollowUpDialog';
import { isPast, parseISO } from 'date-fns';

type SortOption = 'recent' | 'name' | 'company' | 'strength';
type FilterOption = 'all' | 'follow-up' | 'overdue' | 'acquaintance' | 'professional' | 'close' | 'mentor';

export default function Contacts() {
  const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();
  const { applications, addEvent } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [interactionContact, setInteractionContact] = useState<Contact | null>(null);
  const [followUpContact, setFollowUpContact] = useState<Contact | null>(null);
  
  const { addInteraction } = useContactInteractions(interactionContact?.id || null);

  // Stats
  const stats = useMemo(() => {
    const overdue = contacts.filter(c => 
      c.next_follow_up && isPast(parseISO(c.next_follow_up)) && c.follow_up_status !== 'completed'
    ).length;
    const scheduled = contacts.filter(c => c.follow_up_status === 'scheduled').length;
    const mentors = contacts.filter(c => c.connection_strength === 'mentor').length;
    
    return { total: contacts.length, overdue, scheduled, mentors };
  }, [contacts]);

  // Filtered and sorted contacts
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.position?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    switch (filterBy) {
      case 'follow-up':
        result = result.filter(c => c.follow_up_status === 'scheduled');
        break;
      case 'overdue':
        result = result.filter(c => 
          c.next_follow_up && isPast(parseISO(c.next_follow_up)) && c.follow_up_status !== 'completed'
        );
        break;
      case 'acquaintance':
      case 'professional':
      case 'close':
      case 'mentor':
        result = result.filter(c => c.connection_strength === filterBy);
        break;
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'company':
        result.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
        break;
      case 'strength':
        const strengthOrder = { mentor: 0, close: 1, professional: 2, acquaintance: 3 };
        result.sort((a, b) => strengthOrder[a.connection_strength] - strengthOrder[b.connection_strength]);
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    return result;
  }, [contacts, searchQuery, filterBy, sortBy]);

  const handleAddContact = async (contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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

  const handleScheduleFollowUp = async (date: string, event: Parameters<typeof addEvent>[0]) => {
    if (!followUpContact) return;
    
    // Update contact with follow-up date
    await updateContact(followUpContact.id, {
      next_follow_up: date,
      follow_up_status: 'scheduled',
    });
    
    // Add to calendar
    await addEvent(event);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-1">
                Contacts 📇
              </h1>
              <p className="text-muted-foreground">
                Manage your professional network and follow-ups
              </p>
            </div>
            <ButtonRetro onClick={() => { setEditingContact(null); setAddDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Contact
            </ButtonRetro>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          <CardRetro className="cursor-pointer hover:shadow-retro-lg transition-shadow" onClick={() => setFilterBy('all')}>
            <CardRetroContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardRetroContent>
          </CardRetro>
          
          <CardRetro className="cursor-pointer hover:shadow-retro-lg transition-shadow" onClick={() => setFilterBy('follow-up')}>
            <CardRetroContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/30">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </CardRetroContent>
          </CardRetro>
          
          <CardRetro className="cursor-pointer hover:shadow-retro-lg transition-shadow" onClick={() => setFilterBy('overdue')}>
            <CardRetroContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </CardRetroContent>
          </CardRetro>
          
          <CardRetro className="cursor-pointer hover:shadow-retro-lg transition-shadow" onClick={() => setFilterBy('mentor')}>
            <CardRetroContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats.mentors}</p>
                <p className="text-xs text-muted-foreground">Mentors</p>
              </div>
            </CardRetroContent>
          </CardRetro>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <InputRetro
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ButtonRetro variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {filterBy !== 'all' && (
                    <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
                  )}
                </ButtonRetro>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterBy('all')}>
                  All Contacts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterBy('follow-up')}>
                  Scheduled Follow-ups
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('overdue')}>
                  Overdue Follow-ups
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterBy('mentor')}>
                  Mentors
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('close')}>
                  Close Contacts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('professional')}>
                  Professional
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('acquaintance')}>
                  Acquaintances
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Active Filter Badge */}
        {filterBy !== 'all' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <Badge variant="secondary" className="gap-2">
              Filtering: {filterBy.charAt(0).toUpperCase() + filterBy.slice(1).replace('-', ' ')}
              <button onClick={() => setFilterBy('all')} className="hover:text-destructive">×</button>
            </Badge>
          </motion.div>
        )}

        {/* Contacts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </CardRetroContent>
              </CardRetro>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📇</div>
            <h3 className="text-xl font-bold mb-2">
              {contacts.length === 0 ? 'No contacts yet' : 'No matches found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {contacts.length === 0
                ? 'Start building your professional network!'
                : 'Try adjusting your search or filters'}
            </p>
            {contacts.length === 0 && (
              <ButtonRetro onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4" /> Add Your First Contact
              </ButtonRetro>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
      </div>

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