-- Add user_mode column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_mode text DEFAULT 'active_seeker' 
CHECK (user_mode IN ('active_seeker', 'career_insurance', 'stealth_seeker', 'career_growth'));