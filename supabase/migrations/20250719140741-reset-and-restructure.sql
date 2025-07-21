-- RESET COMPLETO E REESTRUTURAÇÃO DO SUPABASE
-- Esta migração limpa tudo e recria do zero

-- 1. LIMPAR TUDO PRIMEIRO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Dropar tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.creators CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Dropar tipos
DROP TYPE IF EXISTS user_role CASCADE;

-- 2. RECRIAR ESTRUTURA LIMPA

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar enum para roles
CREATE TYPE user_role AS ENUM ('cliente', 'criadora', 'admin');

-- Tabela de perfis (estrutura simplificada e funcional)
CREATE TABLE public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'cliente'::user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de creators
CREATE TABLE public.creators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stage_name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  price_per_message DECIMAL(10,2) DEFAULT 0.00,
  is_online BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  total_likes INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  location TEXT,
  age INTEGER CHECK (age >= 18),
  categories TEXT[],
  social_links JSONB DEFAULT '{}',
  subscription_price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio')),
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de favoritos
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, creator_id)
);

-- Tabela de transações
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('message', 'subscription', 'tip')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_creators_user_id ON public.creators(user_id);
CREATE INDEX idx_creators_is_active ON public.creators(is_active);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_favorites_user_creator ON public.favorites(user_id, creator_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- 4. HABILITAR RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS SIMPLES E FUNCIONAIS

-- Profiles: todos podem ver, usuários podem editar próprio perfil
CREATE POLICY "Todos podem ver perfis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem editar próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode inserir perfis" ON public.profiles FOR INSERT WITH CHECK (true);

-- Creators: todos podem ver creators ativos
CREATE POLICY "Todos podem ver creators ativos" ON public.creators FOR SELECT USING (is_active = true);
CREATE POLICY "Creators podem editar próprio perfil" ON public.creators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode inserir creators" ON public.creators FOR INSERT WITH CHECK (true);

-- Messages: usuários podem ver próprias mensagens
CREATE POLICY "Usuários podem ver próprias mensagens" ON public.messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Usuários podem enviar mensagens" ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Favorites: usuários podem gerenciar próprios favoritos
CREATE POLICY "Usuários podem ver próprios favoritos" ON public.favorites 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar favoritos" ON public.favorites 
  FOR ALL USING (auth.uid() = user_id);

-- Transactions: usuários podem ver próprias transações
CREATE POLICY "Usuários podem ver próprias transações" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode inserir transações" ON public.transactions 
  FOR INSERT WITH CHECK (true);

-- 6. FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creators_updated_at 
  BEFORE UPDATE ON public.creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE (SIMPLIFICADA)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'cliente'::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, não faz nada
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não falha
    RAISE WARNING 'Erro ao criar perfil para %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. TRIGGER PARA CRIAR PERFIL
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. DADOS INICIAIS (alguns creators de exemplo)
INSERT INTO public.profiles (user_id, email, full_name, role) VALUES
  (uuid_generate_v4(), 'creator1@example.com', 'Maria Silva', 'criadora'),
  (uuid_generate_v4(), 'creator2@example.com', 'Ana Costa', 'criadora'),
  (uuid_generate_v4(), 'creator3@example.com', 'Julia Santos', 'criadora');

RAISE NOTICE 'Supabase reestruturado com sucesso!';