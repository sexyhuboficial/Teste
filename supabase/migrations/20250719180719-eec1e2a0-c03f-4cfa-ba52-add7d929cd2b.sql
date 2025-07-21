-- Fix admin password and add view counters to creators table
-- Update admin password to ensure it works
UPDATE auth.users 
SET encrypted_password = crypt('28051982D', gen_salt('bf'))
WHERE email = 'danielm2021d@gmail.com';

-- Add view counters and interaction metrics to creators table
ALTER TABLE public.creators 
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT floor(random() * 26 + 15),
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT floor(random() * 26 + 15),
ADD COLUMN IF NOT EXISTS message_count integer DEFAULT floor(random() * 26 + 15);

-- Update existing creators with random values between 15-40
UPDATE public.creators 
SET 
  view_count = floor(random() * 26 + 15),
  like_count = floor(random() * 26 + 15),
  message_count = floor(random() * 26 + 15);