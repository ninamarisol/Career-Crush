-- Add resume_score column to applications table
ALTER TABLE public.applications
ADD COLUMN resume_score INTEGER;