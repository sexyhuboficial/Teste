-- CRIAR USUÁRIO ADMIN FINAL - MÉTODO DIRETO E FUNCIONAL
-- Esta migração cria o usuário admin de forma definitiva

DO $$
DECLARE
    admin_user_id uuid := '2f6c559e-8bca-45bc-96b4-1bcc20726b8e'; -- ID fixo para o admin
    user_exists boolean := false;
BEGIN
    -- Verificar se usuário admin já existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'danielm2021d@gmail.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Inserir usuário admin na tabela auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
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
        
        RAISE NOTICE 'Usuário admin criado na auth.users com ID: %', admin_user_id;
    ELSE
        -- Se usuário já existe, pegar o ID dele
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'danielm2021d@gmail.com';
        RAISE NOTICE 'Usuário admin já existe com ID: %', admin_user_id;
    END IF;
    
    -- Inserir perfil admin (sempre, com UPSERT)
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'danielm2021d@gmail.com',
        'Administrador',
        'admin',
        true,
        NOW(),
        NOW()
    ) 
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        full_name = 'Administrador',
        email = 'danielm2021d@gmail.com',
        is_active = true,
        updated_at = NOW();
        
    -- Também inserir por email (caso haja conflito de email)
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'admin@sexyhub.com', -- Email alternativo
        'Admin SexyHub',
        'admin',
        true,
        NOW(),
        NOW()
    ) 
    ON CONFLICT (email) DO NOTHING; -- Não sobrescrever se já existe
        
    RAISE NOTICE 'Perfil admin configurado com sucesso!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao configurar admin: %', SQLERRM;
    RAISE NOTICE 'Continuando execução...';
END $$;

-- Verificar se foi criado corretamente
DO $$
DECLARE
    admin_count integer;
    profile_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM auth.users WHERE email = 'danielm2021d@gmail.com';
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE email = 'danielm2021d@gmail.com' AND role = 'admin';
    
    RAISE NOTICE 'Usuários admin na auth.users: %', admin_count;
    RAISE NOTICE 'Perfis admin na profiles: %', profile_count;
    
    IF admin_count > 0 AND profile_count > 0 THEN
        RAISE NOTICE 'SUCESSO: Admin criado corretamente!';
    ELSE
        RAISE NOTICE 'ATENÇÃO: Pode haver problema na criação do admin';
    END IF;
END $$;