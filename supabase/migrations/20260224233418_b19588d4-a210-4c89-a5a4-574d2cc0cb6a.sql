
-- Table for persisting climb mode custom goals, visibility state, and monthly streak
CREATE TABLE public.climb_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  month_key text NOT NULL, -- e.g. '2026-02'
  visibility_activities jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  network_contacts_target integer NOT NULL DEFAULT 5,
  streak_count integer NOT NULL DEFAULT 0,
  streak_months jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of completed month keys
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

ALTER TABLE public.climb_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own climb goals"
  ON public.climb_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own climb goals"
  ON public.climb_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own climb goals"
  ON public.climb_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own climb goals"
  ON public.climb_goals FOR DELETE
  USING (auth.uid() = user_id);
