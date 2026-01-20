-- Create interview_prep table for storing interview preparation data
CREATE TABLE public.interview_prep (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    company_research TEXT DEFAULT '',
    practice_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    coaching_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
    questions_to_ask JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on application_id (one prep per application)
CREATE UNIQUE INDEX interview_prep_application_id_idx ON public.interview_prep(application_id);

-- Enable Row Level Security
ALTER TABLE public.interview_prep ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own interview prep"
ON public.interview_prep
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview prep"
ON public.interview_prep
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview prep"
ON public.interview_prep
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview prep"
ON public.interview_prep
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_prep_updated_at
BEFORE UPDATE ON public.interview_prep
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();