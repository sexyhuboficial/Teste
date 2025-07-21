-- Remove unique constraint to allow multiple creators per user
ALTER TABLE public.creators DROP CONSTRAINT IF EXISTS creators_user_id_key;