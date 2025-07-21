-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('cliente', 'criadora', 'admin');

-- Criar tabela de perfis
CREATE TABLE public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'cliente'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de creators
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
  age INTEGER,
  categories TEXT[],
  social_links JSONB DEFAULT '{}',
  subscription_price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mensagens
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

-- Criar tabela de favoritos
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, creator_id)
);

-- Criar tabela de transações
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

-- Criar índices para performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_creators_user_id ON public.creators(user_id);
CREATE INDEX idx_creators_is_active ON public.creators(is_active);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_favorites_user_creator ON public.favorites(user_id, creator_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para creators
CREATE POLICY "Todos podem ver creators ativos" ON public.creators
  FOR SELECT USING (is_active = true);

CREATE POLICY "Creators podem atualizar próprio perfil" ON public.creators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem se tornar creators" ON public.creators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para messages
CREATE POLICY "Usuários podem ver próprias mensagens" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Usuários podem enviar mensagens" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Usuários podem atualizar próprias mensagens" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Políticas RLS para favorites
CREATE POLICY "Usuários podem ver próprios favoritos" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar próprios favoritos" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Usuários podem ver próprias transações" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir transações" ON public.transactions
  FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON public.creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'cliente'::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o perfil já existe, apenas atualize
    UPDATE public.profiles 
    SET 
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
      updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();