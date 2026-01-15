-- Add industry and role_type columns to applications table
ALTER TABLE public.applications
ADD COLUMN industry TEXT,
ADD COLUMN role_type TEXT;