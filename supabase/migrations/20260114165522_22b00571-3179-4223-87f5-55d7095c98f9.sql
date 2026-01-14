-- Create user_goals table for personalized gamification
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Personalization setup
  situation TEXT DEFAULT 'between_opportunities', -- student, employed, laid_off, career_switch, between_opportunities
  focus TEXT DEFAULT 'balanced', -- maximum, targeted, networking, interview_prep, balanced
  weekly_hours INTEGER DEFAULT 10, -- 2-4, 5-10, 10-20, 20+
  motivation_style TEXT DEFAULT 'improvement', -- numbers, improvement, consistency, quality
  celebration_style TEXT DEFAULT 'subtle', -- big_loud, subtle, share_worthy, private
  
  -- Baseline (calculated from user activity)
  calibration_complete BOOLEAN DEFAULT false,
  calibration_start_date TIMESTAMP WITH TIME ZONE,
  avg_applications_per_week NUMERIC(5,2) DEFAULT 0,
  preferred_search_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  avg_match_score_target INTEGER DEFAULT 80,
  active_hours_per_week NUMERIC(5,2) DEFAULT 0,
  
  -- User targets (set by user or adapted)
  weekly_application_target INTEGER DEFAULT 3,
  weekly_networking_target INTEGER DEFAULT 1,
  match_score_target INTEGER DEFAULT 85,
  
  -- Streaks
  streak_style TEXT DEFAULT 'weekly', -- daily, weekly, milestone, custom
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_until DATE,
  streak_grace_days_remaining INTEGER DEFAULT 2,
  
  -- XP and levels
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  
  -- Active achievement paths
  active_achievement_paths TEXT[] DEFAULT ARRAY['balanced']::TEXT[], -- quality, quantity, balanced, networking
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create quests table for daily/weekly quests
CREATE TABLE public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- daily, weekly, special
  category TEXT NOT NULL, -- applications, networking, quality, interview_prep
  
  target INTEGER NOT NULL DEFAULT 1,
  current_progress INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own quests"
ON public.quests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quests"
ON public.quests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests"
ON public.quests
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quests"
ON public.quests
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quests_updated_at
BEFORE UPDATE ON public.quests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  achievement_id TEXT NOT NULL, -- e.g., 'application_warrior', 'quality_seeker'
  tier TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, platinum
  
  current_progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, achievement_id, tier)
);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own achievements"
ON public.achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements"
ON public.achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.achievements
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();