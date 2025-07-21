-- Remove unique constraints para permitir múltiplos creators e admins
-- Isso permite que o mesmo usuário possa criar múltiplos perfis de creators

-- Remover a constraint unique do user_id na tabela creators
ALTER TABLE public.creators DROP CONSTRAINT IF EXISTS creators_user_id_key;

-- Alterar a coluna para remover a restrição UNIQUE (mantém NOT NULL)
ALTER TABLE public.creators ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.creators ALTER COLUMN user_id SET NOT NULL;

-- Remover também a constraint unique do profile_id se existir
ALTER TABLE public.creators DROP CONSTRAINT IF EXISTS creators_profile_id_key;

-- Comentário para documentar a mudança
COMMENT ON TABLE public.creators IS 'Tabela de creators - permite múltiplos creators por usuário após remoção da constraint unique em user_id';