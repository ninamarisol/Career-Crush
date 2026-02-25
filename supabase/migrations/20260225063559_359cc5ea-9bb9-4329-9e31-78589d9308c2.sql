
CREATE TABLE public.job_search_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  search_stage TEXT NOT NULL,
  target_role TEXT NOT NULL,
  target_companies TEXT,
  friction_type TEXT NOT NULL,
  urgency TEXT NOT NULL,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_search_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own context" ON public.job_search_context FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own context" ON public.job_search_context FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context" ON public.job_search_context FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own context" ON public.job_search_context FOR DELETE USING (auth.uid() = user_id);
