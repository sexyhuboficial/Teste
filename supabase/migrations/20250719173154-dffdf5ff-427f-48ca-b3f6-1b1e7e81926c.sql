-- Create the admin user danielm2021d@gmail.com
-- This will create both the auth.users entry and profiles entry

DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
    user_exists boolean := false;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'danielm2021d@gmail.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Insert into auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'danielm2021d@gmail.com',
            crypt('28051982D', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- Insert into profiles
        INSERT INTO public.profiles (
            user_id,
            email,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'danielm2021d@gmail.com',
            'Daniel Admin',
            'admin',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin user danielm2021d@gmail.com created successfully with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'User danielm2021d@gmail.com already exists';
    END IF;
END $$;