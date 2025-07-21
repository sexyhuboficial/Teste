-- Migração para corrigir a criação de novos usuários com ID duplicado
DO $$
BEGIN
    -- Dropar trigger existente se existir
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Recriar função de handle sem problemas de ID
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $func$
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
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Recriar trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;