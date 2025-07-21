import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServicePayment {
  id: string;
  service_id: string;
  amount: number;
  service_type: string;
  payment_status: string;
  payment_url: string;
  created_at: string;
}

export const useServicePayments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createServicePayment = async (serviceId: string) => {
    if (!serviceId || typeof serviceId !== 'string') {
      toast({
        title: "Erro",
        description: "ID do serviço inválido",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      // Log for debugging
      console.log('Creating service payment for serviceId:', serviceId);
      
      const { data, error } = await supabase.functions.invoke('create-service-payment', {
        body: { serviceId }
      });

      if (error) {
        console.error('Function error:', error);
        
        // Parse error message for better user experience
        let errorMessage = 'Erro desconhecido ao processar pagamento';
        
        if (error.message) {
          if (error.message.includes('not authenticated')) {
            errorMessage = 'Você precisa estar logado para fazer um pagamento';
          } else if (error.message.includes('not found')) {
            errorMessage = 'Serviço não encontrado';
          } else if (error.message.includes('gateway')) {
            errorMessage = 'Erro no gateway de pagamento. Tente novamente.';
          } else if (error.message.includes('API key')) {
            errorMessage = 'Configuração de pagamento temporariamente indisponível';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: "Erro no Pagamento",
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
        console.error('Payment creation failed:', data.error);
        
        let errorMessage = data.error;
        if (data.details && typeof data.details === 'object') {
          errorMessage += `: ${JSON.stringify(data.details)}`;
        }
        
        toast({
          title: "Erro no Pagamento",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }

      if (data.success && data.payment_url) {
        toast({
          title: "Pagamento Criado",
          description: "Redirecionando para o pagamento...",
        });
        
        // Redirect to payment URL
        window.open(data.payment_url, '_blank');
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
      console.error('Error creating service payment:', error);
      
      // Handle different types of errors
      let errorMessage = 'Erro desconhecido ao processar pagamento';
      
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
    } finally {
      setLoading(false);
    }
  };

  const getServicePayments = async () => {
    try {
      const { data, error } = await supabase
        .from('service_payments')
        .select(`
          *,
          creator_services (title, description),
          creators (display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching service payments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching service payments:', error);
      return [];
    }
  };

  return {
    createServicePayment,
    getServicePayments,
    loading
  };
};

