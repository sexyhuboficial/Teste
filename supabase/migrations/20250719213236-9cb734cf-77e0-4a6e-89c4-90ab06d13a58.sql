-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('creator-content', 'creator-content', false);

-- Storage policies for profile images (public)
CREATE POLICY "Profile images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for creator content (private)
CREATE POLICY "Users can view creator content they have access to" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'creator-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can upload their own content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'creator-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can update their own content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'creator-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can delete their own content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'creator-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create admin analytics view
CREATE TABLE public.analytics_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for analytics
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics (admin only)
CREATE POLICY "Admins can view analytics"
ON public.analytics_data
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for notifications updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample analytics data
INSERT INTO public.analytics_data (metric_name, metric_value, date_recorded) VALUES
('total_users', 1250, CURRENT_DATE - INTERVAL '6 days'),
('total_users', 1285, CURRENT_DATE - INTERVAL '5 days'),
('total_users', 1320, CURRENT_DATE - INTERVAL '4 days'),
('total_users', 1355, CURRENT_DATE - INTERVAL '3 days'),
('total_users', 1390, CURRENT_DATE - INTERVAL '2 days'),
('total_users', 1425, CURRENT_DATE - INTERVAL '1 day'),
('total_users', 1460, CURRENT_DATE),

('active_creators', 85, CURRENT_DATE - INTERVAL '6 days'),
('active_creators', 88, CURRENT_DATE - INTERVAL '5 days'),
('active_creators', 92, CURRENT_DATE - INTERVAL '4 days'),
('active_creators', 95, CURRENT_DATE - INTERVAL '3 days'),
('active_creators', 98, CURRENT_DATE - INTERVAL '2 days'),
('active_creators', 102, CURRENT_DATE - INTERVAL '1 day'),
('active_creators', 105, CURRENT_DATE),

('total_revenue', 45000, CURRENT_DATE - INTERVAL '6 days'),
('total_revenue', 47500, CURRENT_DATE - INTERVAL '5 days'),
('total_revenue', 50000, CURRENT_DATE - INTERVAL '4 days'),
('total_revenue', 52500, CURRENT_DATE - INTERVAL '3 days'),
('total_revenue', 55000, CURRENT_DATE - INTERVAL '2 days'),
('total_revenue', 57500, CURRENT_DATE - INTERVAL '1 day'),
('total_revenue', 60000, CURRENT_DATE),

('messages_sent', 2500, CURRENT_DATE - INTERVAL '6 days'),
('messages_sent', 2650, CURRENT_DATE - INTERVAL '5 days'),
('messages_sent', 2800, CURRENT_DATE - INTERVAL '4 days'),
('messages_sent', 2950, CURRENT_DATE - INTERVAL '3 days'),
('messages_sent', 3100, CURRENT_DATE - INTERVAL '2 days'),
('messages_sent', 3250, CURRENT_DATE - INTERVAL '1 day'),
('messages_sent', 3400, CURRENT_DATE);

-- Update admin dashboard conversations to show per logged admin
UPDATE conversations SET last_message_at = now() WHERE last_message_at IS NULL;