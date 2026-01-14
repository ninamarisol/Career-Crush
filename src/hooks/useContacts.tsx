import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  linkedin_url: string | null;
  notes: string | null;
  connection_strength: 'acquaintance' | 'professional' | 'close' | 'mentor';
  last_contacted: string | null;
  next_follow_up: string | null;
  follow_up_status: 'none' | 'scheduled' | 'overdue' | 'completed';
  tags: string[];
  application_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInteraction {
  id: string;
  user_id: string;
  contact_id: string;
  type: 'email' | 'call' | 'meeting' | 'linkedin' | 'coffee' | 'event' | 'other';
  date: string;
  notes: string | null;
  outcome: string | null;
  created_at: string;
}

export function useContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } else {
      // Update follow_up_status based on dates
      const today = new Date().toISOString().split('T')[0];
      const updatedContacts = (data || []).map((contact: Contact) => {
        if (contact.next_follow_up && contact.follow_up_status === 'scheduled') {
          if (contact.next_follow_up < today) {
            return { ...contact, follow_up_status: 'overdue' as const };
          }
        }
        return contact;
      });
      setContacts(updatedContacts);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contact, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
      return null;
    }

    setContacts((prev) => [data as Contact, ...prev]);
    toast.success('Contact added!');
    return data as Contact;
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!user) return;

    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
      return;
    }

    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    toast.success('Contact updated!');
  };

  const deleteContact = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
      return;
    }

    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast.success('Contact deleted');
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
}

export function useContactInteractions(contactId: string | null) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<ContactInteraction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInteractions = useCallback(async () => {
    if (!user || !contactId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('contact_interactions')
      .select('*')
      .eq('contact_id', contactId)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching interactions:', error);
    } else {
      setInteractions(data as ContactInteraction[]);
    }
    setLoading(false);
  }, [user, contactId]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const addInteraction = async (interaction: Omit<ContactInteraction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('contact_interactions')
      .insert({ ...interaction, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding interaction:', error);
      toast.error('Failed to log interaction');
      return null;
    }

    setInteractions((prev) => [data as ContactInteraction, ...prev]);

    // Update contact's last_contacted date
    await supabase
      .from('contacts')
      .update({ last_contacted: interaction.date })
      .eq('id', interaction.contact_id);

    toast.success('Interaction logged!');
    return data as ContactInteraction;
  };

  return {
    interactions,
    loading,
    addInteraction,
    refetch: fetchInteractions,
  };
}