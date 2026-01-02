-- Add cover_video column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS cover_video text;

-- Add display_order for sorting capability (used in WorksSection)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
