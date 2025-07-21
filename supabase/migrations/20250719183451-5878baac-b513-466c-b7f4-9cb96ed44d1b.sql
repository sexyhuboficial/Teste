-- Remove Bella Santos completely from all tables
DELETE FROM public.weekly_featured WHERE creator_id = 'a796a80a-f68e-4d8a-be44-352ea06f7988';
DELETE FROM public.creators WHERE id = 'a796a80a-f68e-4d8a-be44-352ea06f7988';

-- Also remove Luna Costa and Sophia Milano if they still exist
DELETE FROM public.weekly_featured WHERE creator_id IN (
  SELECT id FROM public.creators 
  WHERE display_name IN ('Luna Costa', 'Sophia Milano')
);
DELETE FROM public.creators WHERE display_name IN ('Luna Costa', 'Sophia Milano');