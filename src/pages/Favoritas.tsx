import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  User, 
  ArrowRight,
  Star,
  MessageCircle,
  MapPin,
  X
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  status: 'online' | 'offline' | 'ocupada';
  starting_price: number;
  rating: number;
  review_count: number;
  location: string;
  tags: string[];
}

const Favoritas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          creator_id,
          creators (
            id,
            display_name,
            bio,
            avatar_url,
            status,
            starting_price,
            rating,
            review_count,
            location,
            tags
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const favoritesData = data?.map(item => item.creators).filter(Boolean) || [];
      setFavorites(favoritesData as Creator[]);
    } catch (error) {
      console.error('Erro ao carregar favoritas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas favoritas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (creatorId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('creator_id', creatorId);

      if (error) throw error;

      setFavorites(prev => prev.filter(creator => creator.id !== creatorId));
      toast({
        title: "Removida",
        description: "Criadora removida dos favoritos",
      });
    } catch (error) {
      console.error('Erro ao remover favorita:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover dos favoritos",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'ocupada': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'ocupada': return 'Ocupada';
      default: return 'Offline';
    }
  };

  // Se não estiver logado, mostrar tela de redirecionamento
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="creator-card">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-primary-foreground" />
                </div>
                
                <CardTitle className="text-3xl font-bold text-foreground font-montserrat">
                  Suas Criadoras Favoritas
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-lg">
                  Salve suas criadoras favoritas e receba notificações quando elas 
                  estiverem online ou publicarem conteúdo novo.
                </p>
                
                {/* Benefícios */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center">
                    <Star className="w-5 h-5 text-primary mr-2" />
                    Recursos da Lista de Favoritas:
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Notificações quando ficam online</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Alertas de novo conteúdo</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Acesso rápido aos perfis</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Ofertas exclusivas das suas favoritas</span>
                    </div>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="space-y-4">
                  <Button size="lg" asChild className="w-full btn-hero">
                    <Link to="/login" className="flex items-center justify-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Criar Conta Grátis</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" asChild className="w-full btn-outline-pink">
                    <Link to="/explorar">
                      Explorar Criadoras
                    </Link>
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-muted-foreground text-sm">Já tem uma conta? </span>
                    <Link 
                      to="/login" 
                      className="text-primary hover:text-primary-glow font-medium"
                    >
                      Fazer Login
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground font-montserrat">Criadoras Favoritas</h1>
          <Badge variant="outline" className="text-primary border-primary">
            {favorites.length} favoritas
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="creator-card animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Nenhuma favorita ainda</h2>
            <p className="text-muted-foreground mb-6">
              Explore criadoras e adicione suas favoritas para acompanhar sempre!
            </p>
            <Button asChild className="btn-hero">
              <Link to="/explorar">
                Explorar Criadoras
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((creator) => (
              <Card key={creator.id} className="creator-card overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={creator.avatar_url} 
                      alt={creator.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute top-3 left-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-black/70 text-white text-xs`}>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(creator.status)}`} />
                      <span>{getStatusText(creator.status)}</span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 text-white"
                    onClick={() => removeFavorite(creator.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={creator.avatar_url} />
                      <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{creator.display_name}</h3>
                      {creator.location && (
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {creator.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {creator.bio}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(creator.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {creator.rating.toFixed(1)} ({creator.review_count})
                    </span>
                  </div>

                  {/* Tags */}
                  {creator.tags && creator.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {creator.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">
                      R$ {(creator.starting_price / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">a partir de</span>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    <Button asChild className="w-full btn-hero">
                      <Link to={`/criadora/${creator.id}`}>
                        Ver Perfil
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="w-full btn-outline-pink">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Conversar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Favoritas;
