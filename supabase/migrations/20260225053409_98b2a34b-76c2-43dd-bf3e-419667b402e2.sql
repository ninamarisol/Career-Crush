
CREATE TABLE public.career_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL,
  briefing_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT career_briefings_user_month_unique UNIQUE (user_id, month_key)
);

ALTER TABLE public.career_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own briefings" ON public.career_briefings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own briefings" ON public.career_briefings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own briefings" ON public.career_briefings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own briefings" ON public.career_briefings FOR DELETE USING (auth.uid() = user_id);
