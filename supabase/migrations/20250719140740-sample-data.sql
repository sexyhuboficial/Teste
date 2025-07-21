-- Inserir dados de exemplo para creators
INSERT INTO public.profiles (user_id, email, full_name, avatar_url, role) VALUES
  (uuid_generate_v4(), 'ana.silva@exemplo.com', 'Ana Silva', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'creator'),
  (uuid_generate_v4(), 'beatriz.santos@exemplo.com', 'Beatriz Santos', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'creator'),
  (uuid_generate_v4(), 'carla.oliveira@exemplo.com', 'Carla Oliveira', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'creator'),
  (uuid_generate_v4(), 'diana.costa@exemplo.com', 'Diana Costa', 'https://images.unsplash.com/photo-1488717507474-5b68b73e88e3?w=400', 'creator'),
  (uuid_generate_v4(), 'elena.ferreira@exemplo.com', 'Elena Ferreira', 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400', 'creator'),
  (uuid_generate_v4(), 'fernanda.lima@exemplo.com', 'Fernanda Lima', 'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400', 'creator');

-- Inserir creators baseados nos profiles criados
INSERT INTO public.creators (user_id, profile_id, stage_name, description, avatar_url, price_per_message, is_online, is_verified, rating, location, age, categories, subscription_price)
SELECT 
  p.user_id,
  p.id,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN 'Ana Sensual'
    WHEN p.full_name = 'Beatriz Santos' THEN 'Bia Encantadora'
    WHEN p.full_name = 'Carla Oliveira' THEN 'Carla Seductora'
    WHEN p.full_name = 'Diana Costa' THEN 'Diana Misteriosa'
    WHEN p.full_name = 'Elena Ferreira' THEN 'Elena Divina'
    WHEN p.full_name = 'Fernanda Lima' THEN 'Fernanda Doce'
  END,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN 'Olá queridos! Sou a Ana e adoro conversar e conhecer pessoas interessantes. Venham me conhecer melhor! 💋'
    WHEN p.full_name = 'Beatriz Santos' THEN 'Oi amores! Sou a Bia, uma menina doce que ama fazer novos amigos. Vamos bater um papo? 😘'
    WHEN p.full_name = 'Carla Oliveira' THEN 'Hey! Sou a Carla, apaixonada por conversas profundas e momentos especiais. Me chama! ✨'
    WHEN p.full_name = 'Diana Costa' THEN 'Oi pessoal! Diana aqui, sempre pronta para uma boa conversa e muita diversão! 🌟'
    WHEN p.full_name = 'Elena Ferreira' THEN 'Olá! Sou a Elena, adoro arte, música e conversas interessantes. Vem me conhecer! 🎨'
    WHEN p.full_name = 'Fernanda Lima' THEN 'Oi gente! Fernanda aqui, sempre alegre e pronta para novos encontros virtuais! 🌸'
  END,
  p.avatar_url,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN 5.00
    WHEN p.full_name = 'Beatriz Santos' THEN 3.50
    WHEN p.full_name = 'Carla Oliveira' THEN 7.00
    WHEN p.full_name = 'Diana Costa' THEN 4.50
    WHEN p.full_name = 'Elena Ferreira' THEN 6.00
    WHEN p.full_name = 'Fernanda Lima' THEN 4.00
  END,
  CASE 
    WHEN p.full_name IN ('Ana Silva', 'Diana Costa', 'Elena Ferreira') THEN true
    ELSE false
  END,
  CASE 
    WHEN p.full_name IN ('Ana Silva', 'Carla Oliveira', 'Elena Ferreira') THEN true
    ELSE false
  END,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN 4.8
    WHEN p.full_name = 'Beatriz Santos' THEN 4.6
    WHEN p.full_name = 'Carla Oliveira' THEN 4.9
    WHEN p.full_name = 'Diana Costa' THEN 4.7
    WHEN p.full_name = 'Elena Ferreira' THEN 4.9
    WHEN p.full_name = 'Fernanda Lima' THEN 4.5
  END,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN 'São Paulo, SP'
    WHEN p.full_name = 'Beatriz Santos' THEN 'Rio de Janeiro, RJ'
    WHEN p.full_name = 'Carla Oliveira' THEN 'Belo Horizonte, MG'
    WHEN p.full_name = 'Diana Costa' THEN 'Porto Alegre, RS'
    WHEN p.full_name = 'Elena Ferreira' THEN 'Salvador, BA'
    WHEN p.full_name = 'Fernanda Lima' THEN 'Curitiba, PR'
  END,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN 25
    WHEN p.full_name = 'Beatriz Santos' THEN 22
    WHEN p.full_name = 'Carla Oliveira' THEN 28
    WHEN p.full_name = 'Diana Costa' THEN 24
    WHEN p.full_name = 'Elena Ferreira' THEN 26
    WHEN p.full_name = 'Fernanda Lima' THEN 23
  END,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN ARRAY['conversas', 'romance', 'lifestyle']
    WHEN p.full_name = 'Beatriz Santos' THEN ARRAY['doce', 'amizade', 'música']
    WHEN p.full_name = 'Carla Oliveira' THEN ARRAY['sedução', 'misterio', 'arte']
    WHEN p.full_name = 'Diana Costa' THEN ARRAY['diversão', 'esportes', 'viagens']
    WHEN p.full_name = 'Elena Ferreira' THEN ARRAY['arte', 'cultura', 'filosofia']
    WHEN p.full_name = 'Fernanda Lima' THEN ARRAY['alegria', 'natureza', 'fotografia']
  END,
  CASE 
    WHEN p.full_name = 'Ana Silva' THEN 29.90
    WHEN p.full_name = 'Beatriz Santos' THEN 19.90
    WHEN p.full_name = 'Carla Oliveira' THEN 39.90
    WHEN p.full_name = 'Diana Costa' THEN 24.90
    WHEN p.full_name = 'Elena Ferreira' THEN 34.90
    WHEN p.full_name = 'Fernanda Lima' THEN 22.90
  END
FROM public.profiles p
WHERE p.role = 'creator';

-- Atualizar estatísticas dos creators
UPDATE public.creators SET 
  total_likes = FLOOR(RANDOM() * 500) + 50,
  total_messages = FLOOR(RANDOM() * 1000) + 100;