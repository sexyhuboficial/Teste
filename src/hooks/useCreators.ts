import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  status: 'online' | 'busy' | 'offline';
  starting_price: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_new: boolean;
  location: string | null;
  tags: string[] | null;
  languages: string[] | null;
  view_count: number | null;
  like_count: number | null;
  message_count: number | null;
  created_at: string;
  updated_at: string;
}

// Hook para buscar todos os creators
export const useCreators = () => {
  return useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map status values from database to our interface
      const mappedCreators = data?.map(creator => ({
        ...creator,
        status: creator.status === 'ocupada' ? 'busy' as const : 
                creator.status === 'online' ? 'online' as const : 
                'offline' as const
      })) || [];
      
      return mappedCreators as Creator[];
    },
  });
};

// Hook para buscar creator por ID
export const useCreator = (creatorId: string) => {
  return useQuery({
    queryKey: ['creator', creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('id', creatorId)
        .single();

      if (error) throw error;
      
      // Map status values
      const mappedCreator = {
        ...data,
        status: data.status === 'ocupada' ? 'busy' as const : 
                data.status === 'online' ? 'online' as const : 
                'offline' as const
      };
      
      return mappedCreator;
    },
    enabled: !!creatorId,
  });
};

// Hook para atualizar creator
export const useUpdateCreator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Creator> }) => {
      // Map status values for database
      const dbUpdates: any = { ...updates };
      if (updates.status) {
        dbUpdates.status = updates.status === 'busy' ? 'ocupada' : updates.status;
      }

      const { data, error } = await supabase
        .from('creators')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a creators
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      queryClient.invalidateQueries({ queryKey: ['creator'] });
      // Força o refetch de dados
      queryClient.refetchQueries({ queryKey: ['creators'] });
      toast({
        title: "Sucesso",
        description: "Criadora atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar criadora",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para criar creator
export const useCreateCreator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newCreator: Partial<Creator> & { user_id: string; display_name: string }) => {
      // Map status values for database
      const dbCreator: any = { ...newCreator };
      if (newCreator.status) {
        dbCreator.status = newCreator.status === 'busy' ? 'ocupada' : newCreator.status;
      }

      const { data, error } = await supabase
        .from('creators')
        .insert(dbCreator)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a creators
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      // Força o refetch de dados
      queryClient.refetchQueries({ queryKey: ['creators'] });
      toast({
        title: "Sucesso",
        description: "Criadora adicionada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar criadora",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para deletar creator
export const useDeleteCreator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a creators
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      // Força o refetch de dados
      queryClient.refetchQueries({ queryKey: ['creators'] });
      toast({
        title: "Sucesso",
        description: "Criadora removida com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover criadora",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar contadores em massa
export const useBulkUpdateCounters = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('creators')
        .update({
          view_count: Math.floor(Math.random() * 26 + 15),
          like_count: Math.floor(Math.random() * 26 + 15),
          message_count: Math.floor(Math.random() * 26 + 15)
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all creators

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a creators
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      // Força o refetch de dados
      queryClient.refetchQueries({ queryKey: ['creators'] });
      toast({
        title: "Sucesso",
        description: "Contadores atualizados com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar contadores",
        variant: "destructive",
      });
    },
  });
};