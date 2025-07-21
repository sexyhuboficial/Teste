-- Habilitar realtime para as tabelas de conversas e mensagens
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Criar dados de exemplo para conversations
INSERT INTO public.conversations (id, creator_id, client_id, last_message, last_message_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM public.creators LIMIT 1), 
 (SELECT user_id FROM public.profiles WHERE role = 'cliente' LIMIT 1),
 'Olá! Como posso ajudar você hoje?',
 now(),
 now()),
('550e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM public.creators OFFSET 1 LIMIT 1), 
 (SELECT user_id FROM public.profiles WHERE role = 'cliente' LIMIT 1),
 'Oi, tudo bem? Gostaria de conhecer melhor meus serviços?',
 now() - interval '1 hour',
 now() - interval '2 hours');

-- Criar mensagens de exemplo
INSERT INTO public.messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440010',
 '550e8400-e29b-41d4-a716-446655440001',
 (SELECT user_id FROM public.creators LIMIT 1),
 'Olá! Bem-vindo ao meu perfil. Como posso tornar seu dia especial?',
 'text',
 now() - interval '5 minutes'),
('550e8400-e29b-41d4-a716-446655440011',
 '550e8400-e29b-41d4-a716-446655440001',
 (SELECT user_id FROM public.profiles WHERE role = 'cliente' LIMIT 1),
 'Oi! Adorei seu perfil, gostaria de conhecer seus serviços.',
 'text',
 now() - interval '3 minutes'),
('550e8400-e29b-41d4-a716-446655440012',
 '550e8400-e29b-41d4-a716-446655440001',
 (SELECT user_id FROM public.creators LIMIT 1),
 'Que bom que gostou! Posso te mostrar tudo o que tenho a oferecer 😉',
 'text',
 now() - interval '1 minute'),
('550e8400-e29b-41d4-a716-446655440020',
 '550e8400-e29b-41d4-a716-446655440002',
 (SELECT user_id FROM public.creators OFFSET 1 LIMIT 1),
 'Oi amor! Como você está hoje?',
 'text',
 now() - interval '2 hours'),
('550e8400-e29b-41d4-a716-446655440021',
 '550e8400-e29b-41d4-a716-446655440002',
 (SELECT user_id FROM public.profiles WHERE role = 'cliente' LIMIT 1),
 'Estou bem! E você? Seus conteúdos são incríveis!',
 'text',
 now() - interval '90 minutes');

-- Atualizar creator status para mostrar algumas online
UPDATE public.creators 
SET status = 'online' 
WHERE id IN (SELECT id FROM public.creators LIMIT 2);

UPDATE public.creators 
SET status = 'ocupada' 
WHERE id IN (SELECT id FROM public.creators OFFSET 2 LIMIT 1);

-- Atualizar informações das criadoras com localidades brasileiras
UPDATE public.creators 
SET location = CASE 
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'São Paulo, SP'
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Rio de Janeiro, RJ'  
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Belo Horizonte, MG'
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 3) THEN 'Brasília, DF'
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 4) THEN 'Salvador, BA'
  ELSE 'Brasil'
END,
languages = ARRAY['Português', 'Inglês'],
tags = CASE 
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 0) THEN ARRAY['Brasileira', 'Morena', 'Sensual']
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 1) THEN ARRAY['Loira', 'Carioca', 'Divertida']
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 2) THEN ARRAY['Ruiva', 'Mineira', 'Carinhosa']
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 3) THEN ARRAY['Morena', 'Brasiliense', 'Elegante']
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 4) THEN ARRAY['Baiana', 'Exótica', 'Quente']
  ELSE ARRAY['Brasileira', 'Premium']
END,
bio = CASE 
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Oi amor! Sou uma paulistana que adora conversar e criar momentos especiais. Venha me conhecer melhor! 💕'
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Carioca da gema, sempre pronta para uma boa conversa e muita diversão. Vamos nos conectar? 🌊'
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Mineirinha carinhosa que adora fazer novos amigos. Adoro conteúdo personalizado e conversas profundas! ❤️'
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 3) THEN 'De Brasília com muito amor! Sou elegante, sofisticada e amo criar experiências únicas. Te espero! ✨'
  WHEN id = (SELECT id FROM public.creators ORDER BY created_at LIMIT 1 OFFSET 4) THEN 'Baiana sensual e cheia de energia! Venha sentir o calor da Bahia comigo! 🔥'
  ELSE 'Criadora de conteúdo premium, sempre pronta para momentos especiais! 💋'
END;