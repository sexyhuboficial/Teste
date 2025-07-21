-- Create services payment table
CREATE TABLE public.service_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  service_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  payment_id TEXT,
  payment_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their service payments" 
ON public.service_payments 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() IN (SELECT user_id FROM creators WHERE id = service_payments.creator_id));

CREATE POLICY "Users can create service payments" 
ON public.service_payments 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Create mimo rewards table
CREATE TABLE public.mimo_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minimum_amount INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_description TEXT NOT NULL,
  reward_value TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mimo_rewards ENABLE ROW LEVEL SECURITY;

-- Create policy for mimo rewards
CREATE POLICY "Anyone can view mimo rewards" 
ON public.mimo_rewards 
FOR SELECT 
USING (is_active = true);

-- Create policy for admins to manage mimo rewards
CREATE POLICY "Admins can manage mimo rewards" 
ON public.mimo_rewards 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'::user_role
));

-- Insert default mimo rewards
INSERT INTO public.mimo_rewards (minimum_amount, reward_type, reward_description, reward_value) VALUES
(500, 'message', 'Mensagem personalizada da criadora', 'Mensagem exclusiva'),
(1000, 'photo', 'Foto exclusiva', '1 foto premium'),
(2000, 'video', 'Vídeo curto personalizado', '30s de vídeo'),
(5000, 'sexting', '10 minutos de sexting grátis', '10 minutos'),
(10000, 'call', '5 minutos de chamada de vídeo grátis', '5 minutos');

-- Add conversation tags table for tracking paid services
CREATE TABLE public.conversation_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  tag_type TEXT NOT NULL,
  tag_value TEXT NOT NULL,
  service_payment_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation tags
CREATE POLICY "Users can view conversation tags" 
ON public.conversation_tags 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM conversations 
  WHERE id = conversation_tags.conversation_id 
  AND (client_id = auth.uid() OR creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()))
));

CREATE POLICY "System can manage conversation tags" 
ON public.conversation_tags 
FOR ALL
USING (true);

-- Create trigger for updated_at columns
CREATE TRIGGER update_service_payments_updated_at
BEFORE UPDATE ON public.service_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();