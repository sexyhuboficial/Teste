-- Primeiro, verificar se existe usuários criadores já no sistema
-- Se não existir, vamos criar as criadoras sem user_id real e configurar via admin depois

-- Inserir as 3 novas criadoras sem user_id (será configurado depois pelo admin)
INSERT INTO public.creators (
    user_id,
    display_name,
    bio,
    avatar_url,
    location,
    starting_price,
    rating,
    review_count,
    tags,
    status,
    view_count,
    like_count,
    message_count,
    is_featured,
    is_new
) VALUES 
(
    '00000000-0000-0000-0000-000000000001'::uuid, -- UUID temporário
    'Carla Sedutora',
    'Hey! Sou a Carla, apaixonada por conversas profundas e momentos especiais. Me chama! ⭐',
    '/lovable-uploads/3c5da19c-f485-4ab8-b87f-040e18948645.png',
    'Belo Horizonte, MG',
    700, -- R$ 7.00 em centavos
    4.9,
    35,
    ARRAY['sedução', 'mistério', 'arte'],
    'online',
    150,
    18,
    35,
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000002'::uuid, -- UUID temporário
    'Ana Sensual',
    'Olá queridos! Sou a Ana e adoro conversar e conhecer pessoas interessantes. Venham me...',
    '/lovable-uploads/3c5da19c-f485-4ab8-b87f-040e18948645.png',
    'São Paulo, SP',
    500, -- R$ 5.00 em centavos
    4.8,
    28,
    ARRAY['conversas', 'romance', 'lifestyle'],
    'online',
    120,
    32,
    28,
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000003'::uuid, -- UUID temporário
    'Bia Encantadora',
    'Oi amores! Sou a Bia, uma menina doce que ama fazer novos amigos. Vamos bater um papo? 😊',
    '/lovable-uploads/3c5da19c-f485-4ab8-b87f-040e18948645.png',
    'Rio de Janeiro, RJ',
    350, -- R$ 3.50 em centavos
    4.6,
    37,
    ARRAY['doce', 'amizade', 'música'],
    'online',
    180,
    24,
    37,
    true,
    false
);

-- Desativar destaques antigos
UPDATE public.weekly_featured 
SET is_active = false 
WHERE is_active = true;

-- Inserir as novas como destaque da semana atual
WITH new_creators AS (
    SELECT id, display_name, row_number() OVER (ORDER BY display_name) as rn
    FROM public.creators 
    WHERE display_name IN ('Carla Sedutora', 'Ana Sensual', 'Bia Encantadora')
)
INSERT INTO public.weekly_featured (
    creator_id,
    week_start_date,
    week_end_date,
    position,
    auto_selected,
    selection_criteria
)
SELECT 
    nc.id,
    date_trunc('week', CURRENT_DATE)::date,
    (date_trunc('week', CURRENT_DATE) + interval '6 days')::date,
    nc.rn,
    false,
    jsonb_build_object(
        'manual_selection', true,
        'added_by_admin', true
    )
FROM new_creators nc;