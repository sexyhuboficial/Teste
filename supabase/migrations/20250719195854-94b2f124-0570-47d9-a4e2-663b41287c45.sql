-- Add foreign key relationship between weekly_featured and creators
ALTER TABLE public.weekly_featured 
ADD CONSTRAINT weekly_featured_creator_id_fkey 
FOREIGN KEY (creator_id) 
REFERENCES public.creators(id) 
ON DELETE CASCADE;