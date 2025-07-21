-- Create mimos table for gift payments
CREATE TABLE public.mimos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents (e.g., 1000 = R$ 10.00)
  message TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  payment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT mimos_amount_positive CHECK (amount > 0),
  CONSTRAINT mimos_payment_status_valid CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

-- Add foreign key constraint for creator_id
ALTER TABLE public.mimos 
ADD CONSTRAINT mimos_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.mimos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view mimos they sent or received" 
ON public.mimos 
FOR SELECT 
USING (
  auth.uid() = client_id OR 
  auth.uid() IN (
    SELECT user_id FROM creators WHERE id = creator_id
  )
);

CREATE POLICY "Users can create mimos for themselves" 
ON public.mimos 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Create indexes for better performance
CREATE INDEX idx_mimos_client_id ON public.mimos(client_id);
CREATE INDEX idx_mimos_creator_id ON public.mimos(creator_id);
CREATE INDEX idx_mimos_payment_status ON public.mimos(payment_status);
CREATE INDEX idx_mimos_created_at ON public.mimos(created_at);

-- Create function for updating updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';