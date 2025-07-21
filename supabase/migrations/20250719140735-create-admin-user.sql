-- Criar usuário admin diretamente no sistema
DO $$
DECLARE
    admin_user_id uuid;
    admin_exists boolean := false;
BEGIN
    -- Verificar se o usuário admin já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'danielm2021d@gmail.com') INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- Gerar ID único para o admin
        admin_user_id := gen_random_uuid();
        
        -- Inserir usuário na tabela auth.users com hash correto da senha
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            last_sign_in_at,
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
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Administrador"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Usuário admin criado com ID: %', admin_user_id;
    ELSE
        -- Se usuário já existe, pegar o ID
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'danielm2021d@gmail.com';
        RAISE NOTICE 'Usuário admin já existe com ID: %', admin_user_id;
    END IF;
    
    -- Inserir ou atualizar perfil na tabela profiles
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'danielm2021d@gmail.com',
        'Administrador',
        'admin',
        NULL,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        full_name = 'Administrador',
        updated_at = NOW();
        
    RAISE NOTICE 'Perfil admin configurado para usuário: %', admin_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar admin: %', SQLERRM;
END $$;