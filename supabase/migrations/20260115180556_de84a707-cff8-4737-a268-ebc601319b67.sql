-- Drop the old check constraint first to allow updates
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_mode_check;

-- Migrate existing users from old mode values to new values
UPDATE public.profiles SET user_mode = 'crush' WHERE user_mode IN ('active_seeker', 'stealth_seeker');
UPDATE public.profiles SET user_mode = 'climb' WHERE user_mode IN ('career_growth', 'career_insurance');

-- Add a new check constraint that only allows 'crush' and 'climb' modes
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_mode_check 
  CHECK (user_mode IS NULL OR user_mode IN ('crush', 'climb'));

-- Update the default value for new profiles
ALTER TABLE public.profiles ALTER COLUMN user_mode SET DEFAULT 'crush';