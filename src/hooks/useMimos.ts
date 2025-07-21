import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Mimo {
  id: string;
  client_id: string;
  creator_id: string;
  amount: number;
  message: string | null;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_id: string | null;
  payment_url: string | null;
  created_at: string;
  completed_at: string | null;
  creator?: {
    display_name: string;
    avatar_url: string;
  };
  client?: {
    display_name: string;
    full_name: string;
    avatar_url: string;
  };
}

export const useMimos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mimos, setMimos] = useState<Mimo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMimos = async (creatorId?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get basic mimos data
      let query = supabase
        .from('mimos' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (creatorId) {
        query = query.eq('creator_id', creatorId);
      } else {
        // If no specific creator, get mimos related to current user
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile?.role === 'criadora') {
          // Get creator ID
          const { data: creatorData } = await supabase
            .from('creators')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (creatorData) {
            query = query.eq('creator_id', creatorData.id);
          }
        } else {
          // Client - get mimos they sent
          query = query.eq('client_id', user.id);
        }
      }

      const { data: mimosData, error } = await query;

      if (error) throw error;

      // Enrich with creator and client data
      const enrichedMimos: Mimo[] = [];
      
      for (const mimoData of mimosData || []) {
        const mimo = mimoData as any; // Cast to any to avoid type issues
        
        // Get creator data
        const { data: creator } = await supabase
          .from('creators')
          .select('display_name, avatar_url')
          .eq('id', mimo.creator_id)
          .single();

        // Get client data
        const { data: client } = await supabase
          .from('profiles')
          .select('display_name, full_name, avatar_url')
          .eq('user_id', mimo.client_id)
          .single();

        enrichedMimos.push({
          id: mimo.id,
          client_id: mimo.client_id,
          creator_id: mimo.creator_id,
          amount: mimo.amount,
          message: mimo.message,
          payment_status: mimo.payment_status,
          payment_id: mimo.payment_id,
          payment_url: mimo.payment_url,
          created_at: mimo.created_at,
          completed_at: mimo.completed_at,
          creator: creator || undefined,
          client: client || undefined
        });
      }

      setMimos(enrichedMimos);
    } catch (error) {
      console.error('Error fetching mimos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mimos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMimo = async (creatorId: string, amount: number, message: string = '') => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar um mimo",
        variant: "destructive",
      });
      return null;
    }

    // Validate inputs
    if (!creatorId || typeof creatorId !== 'string') {
      toast({
        title: "Erro",
        description: "ID do criador inválido",
        variant: "destructive",
      });
      return null;
    }

    if (!amount || typeof amount !== 'number' || amount < 1 || amount > 10000) {
      toast({
        title: "Erro",
        description: "Valor inválido. Mínimo: R$ 1,00, Máximo: R$ 10.000,00",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Log the request data for debugging
      console.log('Creating mimo payment:', { creatorId, amount, message });
      
      const { data, error } = await supabase.functions.invoke('create-mimo-payment', {
        body: {
          creatorId,
          amount: amount, // Send amount in reais
          message: message.trim()
        }
      });

      if (error) {
        console.error('Function error:', error);
        
        // Parse error message for better user experience
        let errorMessage = 'Erro desconhecido ao criar mimo';
        
        if (error.message) {
          if (error.message.includes('not authenticated')) {
            errorMessage = 'Você precisa estar logado para enviar um mimo';
          } else if (error.message.includes('not found')) {
            errorMessage = 'Criador não encontrado';
          } else if (error.message.includes('gateway')) {
            errorMessage = 'Erro no gateway de pagamento. Tente novamente.';
          } else if (error.message.includes('API key')) {
            errorMessage = 'Configuração de pagamento temporariamente indisponível';
          } else if (error.message.includes('si mesmo')) {
            errorMessage = 'Você não pode enviar um mimo para si mesmo';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: "Erro no Mimo",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }

      if (!data) {
        console.error('No data returned from payment function');
        toast({
          title: "Erro",
          description: "Nenhuma resposta recebida do servidor",
          variant: "destructive",
        });
        return null;
      }

      console.log('Payment response:', data);

      // Check for error in response data
      if (data.error) {
        console.error('Mimo creation failed:', data.error);
        
        let errorMessage = data.error;
        if (data.details && typeof data.details === 'object') {
          errorMessage += `: ${JSON.stringify(data.details)}`;
        }
        
        toast({
          title: "Erro no Mimo",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }

      if (data.success && data.payment_url) {
        toast({
          title: "Mimo criado!",
          description: "Redirecionando para o pagamento...",
        });

        // Redirect to payment
        window.open(data.payment_url, '_blank');
        
        // Refresh mimos after creating payment
        fetchMimos();
        return data;
      } else {
        console.error('Payment URL not received or success flag missing:', data);
        toast({
          title: "Erro",
          description: "URL de pagamento não foi gerada",
          variant: "destructive",
        });
        return null;
      }

    } catch (error) {
      console.error('Error creating mimo:', error);
      
      // Handle different types of errors
      let errorMessage = 'Erro desconhecido ao criar mimo';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tempo limite excedido. Tente novamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchMimos();
    }
  }, [user]);

  return {
    mimos,
    loading,
    fetchMimos,
    createMimo
  };
};

