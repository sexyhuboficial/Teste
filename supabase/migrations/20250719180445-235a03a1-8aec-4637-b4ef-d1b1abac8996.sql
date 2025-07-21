-- Create weekly_featured table for managing featured models of the week
CREATE TABLE public.weekly_featured (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid NOT NULL,
    week_start_date date NOT NULL,
    week_end_date date NOT NULL,
    position integer NOT NULL CHECK (position >= 1 AND position <= 5),
    is_active boolean NOT NULL DEFAULT true,
    auto_selected boolean NOT NULL DEFAULT false,
    selection_criteria jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(creator_id, week_start_date),
    UNIQUE(position, week_start_date, is_active)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_featured ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view weekly featured" 
ON public.weekly_featured 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage weekly featured" 
ON public.weekly_featured 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_weekly_featured_updated_at
BEFORE UPDATE ON public.weekly_featured
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically rotate weekly featured based on performance
CREATE OR REPLACE FUNCTION public.auto_rotate_weekly_featured()
RETURNS void AS $$
DECLARE
    current_week_start date := date_trunc('week', CURRENT_DATE)::date;
    current_week_end date := (date_trunc('week', CURRENT_DATE) + interval '6 days')::date;
    top_creators record;
    position_counter integer := 1;
BEGIN
    -- Deactivate previous week's featured
    UPDATE public.weekly_featured 
    SET is_active = false 
    WHERE week_start_date < current_week_start AND is_active = true;
    
    -- Check if current week already has featured creators
    IF NOT EXISTS (
        SELECT 1 FROM public.weekly_featured 
        WHERE week_start_date = current_week_start AND is_active = true
    ) THEN
        -- Auto-select top performing creators based on rating and review count
        FOR top_creators IN (
            SELECT id, display_name, rating, review_count
            FROM public.creators
            WHERE rating > 4.0 AND review_count > 0
            ORDER BY (rating * review_count) DESC, created_at DESC
            LIMIT 5
        ) LOOP
            INSERT INTO public.weekly_featured (
                creator_id,
                week_start_date,
                week_end_date,
                position,
                auto_selected,
                selection_criteria
            ) VALUES (
                top_creators.id,
                current_week_start,
                current_week_end,
                position_counter,
                true,
                jsonb_build_object(
                    'rating', top_creators.rating,
                    'review_count', top_creators.review_count,
                    'score', top_creators.rating * top_creators.review_count
                )
            );
            
            position_counter := position_counter + 1;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;