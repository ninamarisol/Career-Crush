-- Create a table for master resumes
CREATE TABLE public.master_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  work_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  projects JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.master_resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own resume"
ON public.master_resumes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resume"
ON public.master_resumes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume"
ON public.master_resumes
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_master_resumes_updated_at
BEFORE UPDATE ON public.master_resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();