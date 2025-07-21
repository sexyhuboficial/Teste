import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Gift, Heart, Clock, User, DollarSign } from "lucide-react";
import { useMimos } from "@/hooks/useMimos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Mimo {
  id: string;
  client_id: string;
  creator_id: string;
  amount: number;
  message: string | null;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
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

const MimosHistory = () => {
  const { user } = useAuth();
  const { mimos, loading, fetchMimos } = useMimos();
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const checkUserRole = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      setUserRole(profile?.role || 'cliente');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAmount = mimos
    .filter(mimo => mimo.payment_status === 'completed')
    .reduce((sum, mimo) => sum + mimo.amount, 0);

  const completedMimos = mimos.filter(mimo => mimo.payment_status === 'completed').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-2xl text-foreground">Você precisa estar logado para ver o histórico de mimos</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Histórico de Mimos
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'criadora' 
              ? 'Mimos que você recebeu dos seus clientes'
              : 'Mimos que você enviou para as criadoras'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Mimos</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedMimos}</div>
              <p className="text-xs text-muted-foreground">
                {userRole === 'criadora' ? 'recebidos' : 'enviados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(totalAmount / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                em mimos concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mimos.filter(mimo => {
                  const mimoDate = new Date(mimo.created_at);
                  const now = new Date();
                  return mimoDate.getMonth() === now.getMonth() && 
                         mimoDate.getFullYear() === now.getFullYear() &&
                         mimo.payment_status === 'completed';
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                mimos este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mimos List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Detalhado</CardTitle>
            <CardDescription>
              Lista completa de todos os mimos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg">Carregando...</div>
              </div>
            ) : mimos.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum mimo encontrado</h3>
                <p className="text-muted-foreground">
                  {userRole === 'criadora' 
                    ? 'Você ainda não recebeu nenhum mimo'
                    : 'Você ainda não enviou nenhum mimo'
                  }
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {mimos.map((mimo) => (
                    <div
                      key={mimo.id}
                      className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={userRole === 'criadora' 
                            ? mimo.client?.avatar_url 
                            : mimo.creator?.avatar_url
                          } 
                        />
                        <AvatarFallback>
                          {userRole === 'criadora' 
                            ? mimo.client?.display_name?.[0] || mimo.client?.full_name?.[0] || 'C'
                            : mimo.creator?.display_name?.[0] || 'C'
                          }
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">
                            {userRole === 'criadora' 
                              ? mimo.client?.display_name || mimo.client?.full_name || 'Cliente'
                              : mimo.creator?.display_name || 'Criadora'
                            }
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(mimo.payment_status)}>
                              {getStatusText(mimo.payment_status)}
                            </Badge>
                            <span className="text-lg font-bold text-primary">
                              R$ {(mimo.amount / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {mimo.message && (
                          <p className="text-sm text-muted-foreground mb-2 italic">
                            "{mimo.message}"
                          </p>
                        )}

                        <div className="flex items-center text-xs text-muted-foreground space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(mimo.created_at)}</span>
                          </div>
                          {mimo.completed_at && mimo.payment_status === 'completed' && (
                            <div className="text-green-600">
                              Concluído em {formatDate(mimo.completed_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default MimosHistory;
