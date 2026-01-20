-- Create track record entries table
CREATE TABLE public.track_record_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Content
  content TEXT NOT NULL,
  title TEXT,
  
  -- Entry type enum
  entry_type TEXT NOT NULL DEFAULT 'star_story' CHECK (entry_type IN ('star_story', 'feedback_praise', 'metric_outcome', 'project_highlight')),
  
  -- Tags
  manual_tags TEXT[] DEFAULT '{}',
  ai_suggested_tags TEXT[] DEFAULT '{}',
  
  -- AI-generated metadata
  ai_potential_questions TEXT[] DEFAULT '{}',
  ai_strength_score INTEGER CHECK (ai_strength_score >= 1 AND ai_strength_score <= 10),
  ai_strength_explanation TEXT,
  ai_improvement_suggestion TEXT,
  
  -- For STAR stories only
  star_situation TEXT,
  star_task TEXT,
  star_action TEXT,
  star_result TEXT,
  
  -- Context
  context_company TEXT,
  context_role TEXT,
  context_date DATE,
  context_project TEXT,
  
  -- Usage tracking
  usage_log JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'ready_to_use' CHECK (status IN ('ready_to_use', 'needs_refinement', 'needs_refresh')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.track_record_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own entries" 
ON public.track_record_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.track_record_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.track_record_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.track_record_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_track_record_entries_updated_at
BEFORE UPDATE ON public.track_record_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();