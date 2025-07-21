-- Atualizar o usuário existente para danielm2021d@gmail.com

-- Atualizar na tabela auth.users
UPDATE auth.users 
SET 
    email = 'danielm2021d@gmail.com',
    encrypted_password = crypt('28051982D', gen_salt('bf')),
    updated_at = NOW()
WHERE id = '2f6c559e-8bca-45bc-95b4-1bcc2b726b8e';

-- Atualizar na tabela profiles
UPDATE public.profiles 
SET 
    email = 'danielm2021d@gmail.com',
    full_name = 'Daniel Admin',
    updated_at = NOW()
WHERE user_id = '2f6c559e-8bca-45bc-95b4-1bcc2b726b8e';

-- Verificar o resultado
SELECT 'Usuário atualizado com sucesso' as resultado;