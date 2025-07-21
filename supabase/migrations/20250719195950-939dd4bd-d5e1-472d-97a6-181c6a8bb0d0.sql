-- Add foreign key constraint between weekly_featured and creators
ALTER TABLE public.weekly_featured 
ADD CONSTRAINT fk_weekly_featured_creator 
FOREIGN KEY (creator_id) 
REFERENCES public.creators(id) 
ON DELETE CASCADE;