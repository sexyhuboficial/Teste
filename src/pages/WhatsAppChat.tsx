import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Search, 
  Trash2,
  Info,
  CheckCheck,
  Gift,
  Video,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MimoDialog } from "@/components/MimoDialog";
import { VideoCallDialog } from "@/components/VideoCallDialog";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string;
  media_url?: string;
  conversation_id: string;
}

interface Creator {
  id: string;
  display_name: string;
  avatar_url: string;
  status: 'online' | 'offline' | 'ocupada';
}

interface Client {
  user_id: string;
  full_name: string;
  display_name: string;
  avatar_url: string;
}

interface Conversation {
  id: string;
  creator_id: string;
  client_id: string;
  last_message: string;
  last_message_at: string;
  creator: Creator;
  client?: Client | null;
  unread_count?: number;
}

const WhatsAppChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [creatorId, setCreatorId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeUser();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    if (userRole) {
      fetchConversations();
    }
  }, [userRole, creatorId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupRealtimeSubscriptions = () => {
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          if (newMessage.conversation_id === selectedConversation) {
            setMessages(prev => {
              if (prev.find(m => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
          
          fetchConversations();
        }
      )
      .subscribe();

    const conversationsChannel = supabase
      .channel('conversations-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => fetchConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => fetchConversations())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'conversations' }, () => fetchConversations())
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  };

  const initializeUser = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      setUserRole(profile?.role || 'cliente');

      if (profile?.role === 'criadora') {
        const { data: creatorData } = await supabase
          .from('creators')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        if (creatorData) {
          setCreatorId(creatorData.id);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar usuário:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      let query = supabase
        .from('conversations')
        .select(`
          id,
          creator_id,
          client_id,
          last_message,
          last_message_at,
          creators(id, display_name, avatar_url, status)
        `)
        .order('last_message_at', { ascending: false });

      if (userRole === 'criadora' && creatorId) {
        query = query.eq('creator_id', creatorId);
      } else if (userRole !== 'admin') {
        query = query.eq('client_id', user?.id);
      }

      const { data: rawData } = await query;
      
      if (!rawData) {
        setConversations([]);
        return;
      }

      // Buscar informações dos clientes separadamente se for criadora
      const finalConversations: Conversation[] = [];
      
      if (userRole === 'criadora' && rawData.length > 0) {
        const clientIds = rawData.map(conv => conv.client_id);
        const { data: clientsData } = await supabase
          .from('profiles')
          .select('user_id, full_name, display_name, avatar_url')
          .in('user_id', clientIds);
        
        for (const conv of rawData) {
          const client = clientsData?.find(c => c.user_id === conv.client_id) || null;
          finalConversations.push({
            id: conv.id,
            creator_id: conv.creator_id,
            client_id: conv.client_id,
            last_message: conv.last_message,
            last_message_at: conv.last_message_at,
            creator: conv.creators as Creator,
            client,
            unread_count: 0
          });
        }
      } else {
        for (const conv of rawData) {
          finalConversations.push({
            id: conv.id,
            creator_id: conv.creator_id,
            client_id: conv.client_id,
            last_message: conv.last_message,
            last_message_at: conv.last_message_at,
            creator: conv.creators as Creator,
            client: null,
            unread_count: 0
          });
        }
      }
      
      setConversations(finalConversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user?.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', selectedConversation);

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await supabase.from('messages').delete().eq('conversation_id', conversationId);
      await supabase.from('conversations').delete().eq('id', conversationId);

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      toast({
        title: "Sucesso",
        description: "Conversa excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conversa",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'ocupada': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatConversationTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchName = userRole === 'criadora' 
      ? conv.client?.display_name || conv.client?.full_name || ''
      : conv.creator?.display_name || '';
    return searchName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Lista de Conversas */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-border flex-col`}>
        {/* Header da Sidebar */}
        <div className="h-14 md:h-16 bg-primary/5 border-b border-border px-4 flex items-center justify-between">
          <h2 className="font-semibold text-base md:text-lg">
            {userRole === 'criadora' ? 'Meus Clientes' : 
             userRole === 'admin' ? 'Todas as Conversas' : 'Conversas'}
          </h2>
        </div>

        {/* Busca */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-1">
            {filteredConversations.map((conversation) => {
              const displayName = userRole === 'criadora' 
                ? conversation.client?.display_name || conversation.client?.full_name || 'Cliente'
                : conversation.creator?.display_name;
              const avatarUrl = userRole === 'criadora' 
                ? conversation.client?.avatar_url 
                : conversation.creator?.avatar_url;

              return (
                <div
                  key={conversation.id}
                  className={`group flex items-center space-x-3 p-3 md:p-4 rounded-xl transition-all duration-200 hover:bg-primary/5 border border-transparent hover:border-primary/20 ${
                    selectedConversation === conversation.id ? 'bg-primary/10 border-primary/30' : ''
                  }`}
                >
                  <button
                    onClick={() => setSelectedConversation(conversation.id)}
                    className="flex-1 flex items-center space-x-3 text-left"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 md:w-14 md:h-14 border-2 border-primary/20">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm md:text-base">
                          {displayName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.creator?.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate text-sm md:text-lg">
                          {userRole === 'criadora' 
                            ? (conversation.client?.display_name || conversation.client?.full_name || 'Cliente')
                            : conversation.creator?.display_name}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                          {formatConversationTime(conversation.last_message_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {conversation.last_message || 'Conversa iniciada'}
                        </p>
                        <div className="flex items-center gap-1 md:gap-2">
                          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                            Ver mensagem
                          </Badge>
                          {(userRole === 'admin' || userRole === 'criadora') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-5 w-5 md:h-6 md:w-6"
                                >
                                  <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="mx-4 max-w-sm md:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-lg">Excluir Conversa</AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm">
                                    Tem certeza que deseja excluir esta conversa com {displayName}? 
                                    Esta ação não pode ser desfeita e todas as mensagens serão perdidas.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                  <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteConversation(conversation.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Área Principal do Chat */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedConversation && selectedConv ? (
          <>
            {/* Header do Chat */}
            <div className="h-14 md:h-16 bg-background border-b border-border px-4 md:px-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Back button for mobile */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden p-1 h-8 w-8"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                  <AvatarImage src={userRole === 'criadora' ? selectedConv.client?.avatar_url : selectedConv.creator?.avatar_url} />
                  <AvatarFallback className="text-xs md:text-sm">
                    {userRole === 'criadora' 
                      ? selectedConv.client?.display_name?.[0] || selectedConv.client?.full_name?.[0] 
                      : selectedConv.creator?.display_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-foreground text-sm md:text-base">
                    {userRole === 'criadora' 
                      ? selectedConv.client?.display_name || selectedConv.client?.full_name || 'Cliente'
                      : selectedConv.creator?.display_name}
                  </h3>
                  <p className={`text-xs md:text-sm ${getStatusColor(selectedConv.creator?.status || 'offline')}`}>
                    {selectedConv.creator?.status === 'online' ? 'Online' : 
                     selectedConv.creator?.status === 'ocupada' ? 'Ocupada' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 md:space-x-2">
                {/* Video call and Mimo buttons for clients */}
                {userRole === 'cliente' && selectedConv && (
                  <>
                    <VideoCallDialog creator={{ 
                      id: selectedConv.creator_id, 
                      display_name: selectedConv.creator?.display_name || 'Criadora', 
                      avatar_url: selectedConv.creator?.avatar_url || '' 
                    }}>
                      <Button variant="outline" size="sm" className="h-8 w-8 md:h-10 md:w-10 p-0">
                        <Video className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </VideoCallDialog>
                    
                    <MimoDialog creator={{ 
                      id: selectedConv.creator_id, 
                      display_name: selectedConv.creator?.display_name || 'Criadora', 
                      avatar_url: selectedConv.creator?.avatar_url || '' 
                    }}>
                      <Button variant="outline" size="sm" className="h-8 w-8 md:h-10 md:w-10 p-0">
                        <Gift className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </MimoDialog>
                  </>
                )}
                
                <Button variant="ghost" size="sm" className="h-8 w-8 md:h-10 md:w-10 p-0">
                  <Info className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>

            {/* Área de Mensagens */}
            <ScrollArea className="flex-1 bg-gradient-to-b from-background to-background/95">
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-2xl relative ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-card text-card-foreground border rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm md:text-base">{message.content}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span className="text-xs">
                          {formatMessageTime(message.created_at)}
                        </span>
                        {message.sender_id === user?.id && (
                          <CheckCheck className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="bg-background border-t border-border p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  className="flex-1 text-sm md:text-base"
                />
                
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary hover:bg-primary/90 rounded-full w-9 h-9 md:w-10 md:h-10 p-0"
                >
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-background/95">
            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Bem-vindo ao Chat
              </h3>
              <p className="text-muted-foreground">
                Selecione uma conversa para começar a trocar mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
