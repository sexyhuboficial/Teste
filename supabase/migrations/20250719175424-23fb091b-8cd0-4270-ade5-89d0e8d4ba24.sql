-- Remove qualquer constraint unique da tabela profiles para permitir múltiplos admins
-- Especificamente na coluna user_id se existir
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- Remove também qualquer constraint unique em email se necessário para múltiplos admins
-- (comentado pois email geralmente deve ser único)
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Comentário para documentar a mudança
COMMENT ON TABLE public.profiles IS 'Tabela de profiles - permite múltiplos admins após remoção de constraints unique';