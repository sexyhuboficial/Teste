-- Create mimos table
CREATE TABLE IF NOT EXISTS public.mimos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Amount in cents
    message TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_id TEXT, -- PushInPay payment ID
    payment_url TEXT, -- PushInPay payment URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mimos_client_id ON public.mimos(client_id);
CREATE INDEX IF NOT EXISTS idx_mimos_creator_id ON public.mimos(creator_id);
CREATE INDEX IF NOT EXISTS idx_mimos_payment_status ON public.mimos(payment_status);
CREATE INDEX IF NOT EXISTS idx_mimos_created_at ON public.mimos(created_at DESC);

-- Enable RLS
ALTER TABLE public.mimos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mimos" ON public.mimos
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() IN (
            SELECT user_id FROM public.creators WHERE id = creator_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create mimos" ON public.mimos
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can update mimos" ON public.mimos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER update_mimos_updated_at
    BEFORE UPDATE ON public.mimos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();