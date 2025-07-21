-- Limpeza completa e criação do usuário admin

-- Primeiro, desabilitar triggers temporariamente para evitar conflitos
SET session_replication_role = replica;

-- Limpar completamente as tabelas
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- Reativar triggers
SET session_replication_role = DEFAULT;

-- Criar o usuário admin com um novo UUID
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
BEGIN
    -- Inserir na tabela auth.users
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
    
    -- Inserir na tabela profiles
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
    
    RAISE NOTICE 'Usuário admin criado com sucesso: danielm2021d@gmail.com com ID: %', admin_user_id;
END $$;