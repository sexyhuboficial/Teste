-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cliente'::user_role)
  );
  RETURN NEW;
END;
$function$;

-- Fix auto_rotate_weekly_featured function
CREATE OR REPLACE FUNCTION public.auto_rotate_weekly_featured()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;