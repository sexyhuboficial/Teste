import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  client_id: string;
  creator_id: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
  creator?: {
    display_name: string;
    avatar_url: string;
  };
  client?: {
    display_name: string;
    avatar_url: string;
  };
}

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First, determine user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      // Filter based on user role
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
        // Client - get conversations they're part of
        query = query.eq('client_id', user.id);
      }

      const { data: conversationsData, error } = await query;

      if (error) throw error;

      // Enrich with creator and client data
      const enrichedConversations: Conversation[] = [];
      
      for (const conv of conversationsData || []) {
        // Get creator data
        const { data: creator } = await supabase
          .from('creators')
          .select('display_name, avatar_url')
          .eq('id', conv.creator_id)
          .single();

        // Get client data
        const { data: client } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', conv.client_id)
          .single();

        enrichedConversations.push({
          ...conv,
          creator: creator || undefined,
          client: client || undefined
        });
      }

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conversas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrFindConversation = async (creatorId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para iniciar uma conversa",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Verificar se já existe uma conversa entre o usuário e a criadora
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('client_id', user.id)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Se não existe, criar uma nova conversa
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          creator_id: creatorId,
          client_id: user.id,
          last_message: 'Conversa iniciada',
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conversa iniciada com sucesso!",
      });

      // Refresh conversations
      fetchConversations();

      return newConversation.id;
    } catch (error) {
      console.error('Erro ao criar/encontrar conversa:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar conversa",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    fetchConversations,
    createOrFindConversation
  };
};