-- Create a table for user widget preferences
CREATE TABLE public.widget_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  widget_id TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  size TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, widget_id)
);

-- Enable Row Level Security
ALTER TABLE public.widget_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own widget preferences" 
ON public.widget_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own widget preferences" 
ON public.widget_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget preferences" 
ON public.widget_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget preferences" 
ON public.widget_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_widget_preferences_updated_at
BEFORE UPDATE ON public.widget_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();