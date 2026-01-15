-- Create table for tracking career wins/accomplishments
CREATE TABLE public.career_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  win_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking skills and learning hours
CREATE TABLE public.skill_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  category TEXT DEFAULT 'Technical',
  target_hours INTEGER NOT NULL DEFAULT 20,
  logged_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for career growth goals
CREATE TABLE public.career_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.career_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for career_wins
CREATE POLICY "Users can view their own wins" ON public.career_wins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own wins" ON public.career_wins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wins" ON public.career_wins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wins" ON public.career_wins FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for skill_tracking
CREATE POLICY "Users can view their own skills" ON public.skill_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skills" ON public.skill_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON public.skill_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skills" ON public.skill_tracking FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for career_goals
CREATE POLICY "Users can view their own goals" ON public.career_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.career_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.career_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.career_goals FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_career_wins_updated_at BEFORE UPDATE ON public.career_wins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skill_tracking_updated_at BEFORE UPDATE ON public.skill_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON public.career_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();