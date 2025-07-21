-- Limpar todos os usuários e criar o admin danielm2021d@gmail.com

-- Primeiro, excluir todos os perfis
DELETE FROM public.profiles;

-- Depois, excluir todos os usuários (isso acionará cascata)
DELETE FROM auth.users;

-- Agora criar o usuário admin
DO $$
DECLARE
    admin_user_id uuid := '2f6c559e-8bca-45bc-96b4-1bcc20726b8e';
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
    
    RAISE NOTICE 'Usuário admin criado com sucesso: danielm2021d@gmail.com';
END $$;