-- Adicionar coluna display_order na tabela creator_gallery
ALTER TABLE public.creator_gallery 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Atualizar registros existentes com display_order baseado na data de criação
UPDATE public.creator_gallery 
SET display_order = row_number() OVER (PARTITION BY creator_id ORDER BY created_at) - 1
WHERE display_order IS NULL OR display_order = 0;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_creator_gallery_order 
ON public.creator_gallery(creator_id, display_order);