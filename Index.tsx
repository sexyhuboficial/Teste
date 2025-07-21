import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Verified, 
  Star, 
  Users, 
  MessageCircle, 
  ShieldCheck, 
  Heart,
  ArrowRight,
  Crown,
  Clock,
  Globe,
  Eye
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PaymentDebug } from "@/components/PaymentDebug";
import { useCreators } from "@/hooks/useCreators";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
const Index = () => {
  // Buscar dados reais do banco de dados
  const { data: allCreators = [], isLoading } = useCreators();
  
  // Buscar modelos em destaque da semana
  const { data: weeklyFeatured = [] } = useQuery({
    queryKey: ['weekly-featured'],
    queryFn: async () => {
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      
      // First get weekly featured entries
      const { data: featured, error: featuredError } = await supabase
        .from('weekly_featured')
        .select('*')
        .eq('week_start_date', currentWeekStart.toISOString().split('T')[0])
        .eq('is_active', true)
        .order('position');
      
      if (featuredError) throw featuredError;
      
      if (!featured || featured.length === 0) return [];
      
      // Then get creator details for each featured entry
      const creatorIds = featured.map(f => f.creator_id);
      const { data: creators, error: creatorsError } = await supabase
        .from('creators')
        .select('*')
        .in('id', creatorIds);
      
      if (creatorsError) throw creatorsError;
      
      // Combine the data
      return featured.map(featuredItem => {
        const creator = creators.find(c => c.id === featuredItem.creator_id);
        return {
          ...featuredItem,
          creator
        };
      });
    },
  });
  
  // Usar modelos em destaque da semana ou fallback para modelos com is_featured
  const featuredCreators = weeklyFeatured.length > 0 
    ? weeklyFeatured.slice(0, 3).map(featured => ({
      id: featured.creator?.id || featured.creator_id,
      name: featured.creator?.display_name || 'Nome não disponível',
      bio: featured.creator?.bio || "Criadora de conteúdo premium",
      image: featured.creator?.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616c9daa828?w=400&h=600&fit=crop&crop=face",
      price: ((featured.creator?.starting_price || 0) / 100).toString(),
      status: featured.creator?.status || 'offline',
      rating: featured.creator?.rating || 4.8,
      reviews: featured.creator?.review_count || 128,
      location: featured.creator?.location || "São Paulo, SP",
      tags: featured.creator?.tags || ["Brasileira", "Premium"],
      isOnline: featured.creator?.status === 'online',
      isVerified: true,
      views: featured.creator?.view_count || 0,
      likes: featured.creator?.like_count || 0,
      messages: featured.creator?.message_count || 0
    }))
    : allCreators
        .filter(creator => creator.is_featured)
        .slice(0, 3)
        .map(creator => ({
          id: creator.id,
          name: creator.display_name,
          bio: creator.bio || "Criadora de conteúdo premium",
          image: creator.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616c9daa828?w=400&h=600&fit=crop&crop=face",
          price: (creator.starting_price / 100).toString(),
          status: creator.status,
          rating: creator.rating || 4.8,
          reviews: creator.review_count || 128,
          location: creator.location || "São Paulo, SP",
          tags: creator.tags || ["Brasileira", "Premium"],
          isOnline: creator.status === 'online',
          isVerified: true,
          views: creator.view_count || 0,
          likes: creator.like_count || 0,
          messages: creator.message_count || 0
        }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-2xl text-foreground">Carregando...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-dark">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e91e63' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 md:mb-6 animate-fade-in text-xs md:text-sm">
              <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Plataforma Premium
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 font-montserrat animate-slide-up px-2">
              Conecte-se com as
              <span className="text-primary block">Criadoras Mais Exclusivas</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in px-4">
              Uma experiência premium com criadoras verificadas do mundo todo. 
              Conteúdo personalizado, interação real e momentos únicos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 animate-fade-in px-4">
              <Button size="lg" asChild className="btn-hero w-full sm:w-auto">
                <Link to="/explorar" className="flex items-center justify-center space-x-2">
                  <span>Explorar Criadoras</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild className="btn-outline-pink w-full sm:w-auto">
                <Link to="/login">Criar Conta Grátis</Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center px-4">
              <div className="animate-fade-in">
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-center justify-center mb-1">
                    <ShieldCheck className="w-4 h-4 md:w-6 md:h-6 text-primary mr-1 md:mr-2" />
                    <span className="text-lg md:text-2xl font-bold text-foreground">100%</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Verificadas</p>
              </div>
              
              <div className="animate-fade-in">
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 md:w-6 md:h-6 text-primary mr-1 md:mr-2" />
                    <span className="text-lg md:text-2xl font-bold text-foreground">500+</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Criadoras</p>
              </div>
              
              <div className="animate-fade-in">
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4 md:w-6 md:h-6 text-primary mr-1 md:mr-2" />
                    <span className="text-lg md:text-2xl font-bold text-foreground">10k+</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Clientes</p>
              </div>
              
              <div className="animate-fade-in">
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-center justify-center mb-1">
                    <Globe className="w-4 h-4 md:w-6 md:h-6 text-primary mr-1 md:mr-2" />
                    <span className="text-lg md:text-2xl font-bold text-foreground">24/7</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Disponível</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4 font-montserrat px-2">
              Criadoras em Destaque da Semana
            </h2>
            <p className="text-muted-foreground text-base md:text-lg px-4">
              Conheça nossas criadoras mais populares e bem avaliadas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {featuredCreators.map((creator) => (
              <Card key={creator.id} className="creator-card">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={creator.image} 
                      alt={creator.name}
                      className="w-full h-48 md:h-64 object-cover"
                    />
                    
                    {/* Status Indicator */}
                    <div className="absolute top-3 right-3">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        creator.status === 'online' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        <div className={creator.status === 'online' ? 'status-online' : 'status-busy'}></div>
                        <span className="capitalize hidden sm:inline">{creator.status === 'online' ? 'Online' : 'Ocupada'}</span>
                      </div>
                    </div>
                    
                    {/* Verified Badge */}
                    {creator.isVerified && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          <Verified className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Verificada</span>
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground truncate flex-1 mr-2">{creator.name}</h3>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground">{creator.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 md:mb-4 line-clamp-2">{creator.bio}</p>
                    
                    {/* Interaction Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 md:mb-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{creator.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{creator.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{creator.messages}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="text-primary font-bold text-sm md:text-base">
                        A partir de R$ {creator.price}
                      </div>
                      
                      <Button 
                        size="sm" 
                        asChild 
                        className="btn-hero w-full sm:w-auto"
                      >
                        <Link to={`/criadora/${creator.id}`}>
                          Ver Perfil
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" asChild className="btn-hero">
              <Link to="/explorar" className="flex items-center space-x-2">
                <span>Ver Todas as Criadoras</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4 font-montserrat px-2">
              Por que escolher a SexyHub?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg px-4">
              A plataforma mais segura e confiável para experiências premium
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">100% Verificadas</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Todas as criadoras passam por um rigoroso processo de verificação
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Chat Privado</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Converse diretamente com suas criadoras favoritas em ambiente seguro
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Disponível 24/7</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Acesso à plataforma e suporte disponível a qualquer hora
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Debug Section - Only visible for debugging */}
      <section className="py-8 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <PaymentDebug />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
