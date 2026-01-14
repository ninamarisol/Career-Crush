-- Create contacts table for professional networking
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  linkedin_url TEXT,
  notes TEXT,
  connection_strength TEXT DEFAULT 'acquaintance' CHECK (connection_strength IN ('acquaintance', 'professional', 'close', 'mentor')),
  last_contacted DATE,
  next_follow_up DATE,
  follow_up_status TEXT DEFAULT 'none' CHECK (follow_up_status IN ('none', 'scheduled', 'overdue', 'completed')),
  tags TEXT[] DEFAULT '{}',
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_interactions table to log interactions
CREATE TABLE public.contact_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'linkedin', 'coffee', 'event', 'other')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
ON public.contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.contacts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for contact_interactions
CREATE POLICY "Users can view their own interactions"
ON public.contact_interactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
ON public.contact_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
ON public.contact_interactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
ON public.contact_interactions FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();