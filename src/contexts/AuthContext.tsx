import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Logout realizado",
            description: "Você foi desconectado com sucesso.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('🔄 Iniciando cadastro para:', email);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || email.split('@')[0],
          }
        }
      });

      console.log('📤 Resposta do signUp:', { data, error });

      if (error) {
        console.error('❌ Erro no signUp:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        console.log('✅ Usuário criado:', data.user.id);
        
        // Aguardar um pouco para o trigger executar
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', data.user!.id)
              .single();
            
            console.log('👤 Perfil criado:', profile);
          } catch (err) {
            console.log('⚠️ Perfil ainda não encontrado (normal se for por trigger)');
          }
        }, 2000);
        
        if (!data.session) {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta.",
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description: "Bem-vindo à plataforma!",
          });
        }
      }

      return { error };
    } catch (error: any) {
      console.error('💥 Erro no catch do signUp:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔄 Tentando login para:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📤 Resposta do signIn:', { data, error, user: data?.user?.id });

      if (error) {
        console.error('❌ Erro no signIn:', error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('✅ Login realizado com sucesso para:', data.user.email);
      }

      return { error };
    } catch (error: any) {
      console.error('💥 Erro no catch do signIn:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro no logout",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Erro ao recuperar senha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique seu email para redefinir a senha.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Erro ao recuperar senha",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};