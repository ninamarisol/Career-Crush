
CREATE TABLE public.career_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_title TEXT NOT NULL,
  time_in_role TEXT NOT NULL,
  target_destination TEXT NOT NULL,
  timeline TEXT NOT NULL,
  biggest_blocker TEXT NOT NULL,
  blocker_custom_text TEXT,
  review_cycle TEXT,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.career_targets ADD CONSTRAINT career_targets_user_id_unique UNIQUE (user_id);

ALTER TABLE public.career_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own career target"
  ON public.career_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own career target"
  ON public.career_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career target"
  ON public.career_targets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career target"
  ON public.career_targets FOR DELETE
  USING (auth.uid() = user_id);
