import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Star, 
  MapPin, 
  Languages, 
  Clock,
  ArrowLeft,
  Play,
  Eye,
  DollarSign,
  Gift
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useConversations } from "@/hooks/useConversations";
import { MimoDialog } from "@/components/MimoDialog";
import { ServicePaymentDialog } from "@/components/ServicePaymentDialog";

interface Creator {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  cover_image_url: string;
  status: 'online' | 'offline' | 'ocupada';
  starting_price: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_new: boolean;
  tags: string[];
  location: string;
  languages: string[];
}

interface Service {
  id: string;
  title: string;
  description: string;
  service_type: string;
  price: number;
  duration_minutes: number;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_type: string;
  media_url: string;
  is_featured: boolean;
}

interface Post {
  id: string;
  content: string;
  media_urls: string[];
  is_premium: boolean;
  likes_count: number;
  created_at: string;
}

const CreatorProfile = () => {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrFindConversation } = useConversations();

  useEffect(() => {
    fetchCreatorData();
    checkIfFavorite();
  }, [id]);

  const fetchCreatorData = async () => {
    try {
      // Fetch creator data
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('id', id)
        .single();

      if (creatorError) throw creatorError;

      // Fetch services
      const { data: servicesData } = await supabase
        .from('creator_services')
        .select('*')
        .eq('creator_id', id);

      // Fetch gallery
      const { data: galleryData } = await supabase
        .from('creator_gallery')
        .select('*')
        .eq('creator_id', id)
        .order('created_at', { ascending: false });

      // Fetch posts
      const { data: postsData } = await supabase
        .from('creator_posts')
        .select('*')
        .eq('creator_id', id)
        .order('created_at', { ascending: false });

      setCreator(creatorData);
      setServices(servicesData || []);
      setGallery(galleryData || []);
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching creator data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da criadora",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('creator_id', id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite - ignore error
    }
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar",
        variant: "destructive",
      });
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('creator_id', id);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: "Removida",
          description: "Criadora removida dos favoritos",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            creator_id: id
          });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: "Adicionada",
          description: "Criadora adicionada aos favoritos",
        });
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar favoritos",
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const conversationId = await createOrFindConversation(id!);
    if (conversationId) {
      navigate('/whatsapp-chat');
    }
  };

  const handlePurchaseService = async (service: Service) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comprar serviços",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          service_id: service.id,
          creator_id: id,
          amount: service.price / 100 // Convert from cents
        }
      });

      if (error) throw error;

      if (data?.payment_url) {
        // Open payment in new tab
        window.open(data.payment_url, '_blank');
        
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será redirecionado para completar o pagamento",
        });
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: "Erro ao processar pagamento. Tente novamente.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-2xl text-foreground">Carregando...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-2xl text-foreground">Criadora não encontrada</div>
          <Button asChild className="mt-4">
            <Link to="/explorar">Voltar ao catálogo</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 btn-ghost-pink">
          <Link to="/explorar" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo</span>
          </Link>
        </Button>

        {/* Mobile Hero Section */}
        <div className="md:hidden">
          <div className="relative h-48 rounded-lg overflow-hidden mb-4">
            <img 
              src={creator.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Mobile Profile Card */}
          <Card className="creator-card mb-6">
            <CardContent className="p-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                    <AvatarImage src={creator.avatar_url} />
                    <AvatarFallback className="text-xl">{creator.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background ${getStatusColor(creator.status)} shadow-lg`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground font-montserrat mb-1 truncate">
                    {creator.display_name}
                  </h1>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(creator.status)}`} />
                    <span className="text-sm font-medium text-muted-foreground">{getStatusText(creator.status)}</span>
                  </div>

                  {/* Location and Languages */}
                  <div className="space-y-1">
                    {creator.location && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{creator.location}</span>
                      </div>
                    )}
                    
                    {creator.languages.length > 0 && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Languages className="w-3 h-3" />
                        <span className="text-xs">{creator.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating and Price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(creator.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {creator.rating.toFixed(1)} ({creator.review_count})
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">
                    R$ {(creator.starting_price / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">a partir de</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {creator.bio}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {creator.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {creator.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{creator.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Action Buttons - Mobile */}
              <div className="space-y-2">
                <Button 
                  onClick={handleStartChat}
                  className="w-full bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Iniciar Conversa
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className={`${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    size="sm"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {favoriteLoading ? 'Carregando...' : (isFavorite ? 'Favoritar' : 'Favoritar')}
                  </Button>
                  
                  <MimoDialog creator={{ id: creator.id, display_name: creator.display_name, avatar_url: creator.avatar_url }}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Gift className="w-4 h-4 mr-2" />
                      Mimo
                    </Button>
                  </MimoDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Tabs - Only show on mobile */}
        <div className="md:hidden mb-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-card rounded-xl p-1 mb-6">
              <TabsTrigger 
                value="about" 
                className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                Sobre
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                Serviços
              </TabsTrigger>
              <TabsTrigger 
                value="gallery" 
                className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                Galeria
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
              >
                Posts
              </TabsTrigger>
            </TabsList>

            {/* Mobile Tab Contents */}
            <TabsContent value="about" className="mt-6">
              <Card className="creator-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Sobre {creator.display_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {creator.bio}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 gap-4">
                    {creator.location && (
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Localização</p>
                          <p className="text-muted-foreground text-sm">{creator.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.languages.length > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <Languages className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Idiomas</p>
                          <p className="text-muted-foreground text-sm">{creator.languages.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.map((service) => (
                    <Card key={service.id} className="creator-card">
                      <CardHeader>
                        <div className="flex flex-col space-y-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{service.title}</CardTitle>
                            <CardDescription className="text-sm">{service.description}</CardDescription>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xl font-bold text-primary">
                              R$ {(service.price / 100).toFixed(2)}
                            </div>
                            {service.duration_minutes && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                {service.duration_minutes} min
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ServicePaymentDialog 
                          service={service} 
                          creator={{ id: creator.id, display_name: creator.display_name, avatar_url: creator.avatar_url }}
                        >
                          <Button className="w-full py-3">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Comprar Agora
                          </Button>
                        </ServicePaymentDialog>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="creator-card">
                    <CardContent className="py-12 text-center">
                      <div className="text-6xl mb-4">💎</div>
                      <h3 className="text-lg font-medium text-muted-foreground">Nenhum serviço disponível</h3>
                      <p className="text-sm text-muted-foreground">Esta criadora ainda não oferece serviços.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {gallery.map((item) => (
                    <Card key={item.id} className="creator-card overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-square">
                        <img 
                          src={item.media_url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center">
                            <Play className="w-6 h-6 text-white mx-auto mb-1" />
                            <span className="text-white text-xs">Ver</span>
                          </div>
                        </div>
                        {item.is_featured && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-yellow-500 text-black text-xs">
                              ⭐ Destaque
                            </Badge>
                          </div>
                        )}
                      </div>
                      {item.title && (
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm truncate">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="creator-card">
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">🖼️</div>
                    <h3 className="text-lg font-medium text-muted-foreground">Galeria vazia</h3>
                    <p className="text-sm text-muted-foreground">Esta criadora ainda não adicionou conteúdo à galeria.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="creator-card">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={creator.avatar_url} />
                            <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col mb-2">
                              <span className="font-medium text-sm">{creator.display_name}</span>
                              <div className="flex items-center space-x-2 mt-1">
                                {post.is_premium && (
                                  <Badge variant="outline" className="text-xs">💎 Premium</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                            <p className="text-foreground mb-3 text-sm leading-relaxed">{post.content}</p>
                            
                            {post.media_urls && post.media_urls.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                {post.media_urls.slice(0, 4).map((url, index) => (
                                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                    <img 
                                      src={url} 
                                      alt="Post media"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                                <Heart className="w-4 h-4" />
                                <span>{post.likes_count}</span>
                              </button>
                              <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                                <Eye className="w-4 h-4" />
                                <span>Ver mais</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="creator-card">
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-muted-foreground">Nenhum post ainda</h3>
                    <p className="text-sm text-muted-foreground">Esta criadora ainda não fez nenhuma publicação.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Hero Section */}
        <div className="hidden md:block">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
            <img 
              src={creator.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Avatar positioned over cover image - left side */}
            <div className="absolute bottom-4 left-6 flex items-end space-x-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={creator.avatar_url} />
                  <AvatarFallback className="text-2xl">{creator.display_name[0]}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white ${getStatusColor(creator.status)} shadow-lg`} />
              </div>
              
              {/* Profile info next to avatar */}
              <div className="text-left pb-4">
                <h1 className="text-3xl font-bold text-white font-montserrat mb-2 drop-shadow-lg">
                  {creator.display_name}
                </h1>
                
                <div className="flex items-center space-x-2 text-white/90 mb-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(creator.status)}`} />
                  <span className="font-medium">{getStatusText(creator.status)}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(creator.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/90 font-medium">
                    {creator.rating.toFixed(1)} ({creator.review_count} avaliações)
                  </span>
                </div>

                {/* Price */}
                <div className="text-left">
                  <span className="text-3xl font-bold text-white drop-shadow-lg">
                    R$ {(creator.starting_price / 100).toFixed(2)}
                  </span>
                  <span className="text-white/90 block text-sm">
                    Conteúdos a partir de
                  </span>
                </div>
              </div>
            </div>
            
            {/* Bio text positioned on bottom right */}
            <div className="absolute bottom-4 right-6 max-w-xs">
              <p className="text-white/90 text-sm italic drop-shadow-lg text-right">
                {creator.bio}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info - Desktop Only */}
            <div className="lg:col-span-1">
              <Card className="creator-card sticky top-8">
                <CardHeader className="text-center pt-4">
                  {/* Location */}
                  {creator.location && (
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{creator.location}</span>
                    </div>
                  )}

                  {/* Languages */}
                  {creator.languages.length > 0 && (
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-4">
                      <Languages className="w-4 h-4" />
                      <span className="text-sm">{creator.languages.join(', ')}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {creator.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={handleStartChat}
                      className="w-full bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Iniciar Conversa
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className={`${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
                        onClick={toggleFavorite}
                        disabled={favoriteLoading}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                        {favoriteLoading ? 'Processando...' : (isFavorite ? 'Remover' : 'Favoritar')}
                      </Button>
                      
                      <MimoDialog creator={{ id: creator.id, display_name: creator.display_name, avatar_url: creator.avatar_url }}>
                        <Button variant="outline" className="w-full">
                          <Gift className="w-4 h-4 mr-2" />
                          Mimo
                        </Button>
                      </MimoDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Content - Desktop */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12 bg-card rounded-xl p-1 mb-6">
                  <TabsTrigger 
                    value="about" 
                    className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Sobre
                  </TabsTrigger>
                  <TabsTrigger 
                    value="services" 
                    className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Serviços
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gallery" 
                    className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Galeria
                  </TabsTrigger>
                  <TabsTrigger 
                    value="posts" 
                    className="py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Posts
                  </TabsTrigger>
                </TabsList>

                {/* Desktop Tab Contents */}
                <TabsContent value="about" className="mt-6">
                  <Card className="creator-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        Sobre {creator.display_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {creator.bio}
                      </p>
                      
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creator.location && (
                          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">Localização</p>
                              <p className="text-muted-foreground text-sm">{creator.location}</p>
                            </div>
                          </div>
                        )}
                        
                        {creator.languages.length > 0 && (
                          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                            <Languages className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">Idiomas</p>
                              <p className="text-muted-foreground text-sm">{creator.languages.join(', ')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="mt-6">
                  <div className="space-y-4">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <Card key={service.id} className="creator-card">
                          <CardHeader>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-2 md:space-y-0">
                              <div className="flex-1">
                                <CardTitle className="text-lg md:text-xl">{service.title}</CardTitle>
                                <CardDescription className="text-sm md:text-base">{service.description}</CardDescription>
                              </div>
                              <div className="flex items-center justify-between md:text-right md:block">
                                <div className="text-xl md:text-2xl font-bold text-primary">
                                  R$ {(service.price / 100).toFixed(2)}
                                </div>
                                {service.duration_minutes && (
                                  <div className="flex items-center text-sm text-muted-foreground md:justify-end">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {service.duration_minutes} min
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ServicePaymentDialog 
                              service={service} 
                              creator={{ id: creator.id, display_name: creator.display_name, avatar_url: creator.avatar_url }}
                            >
                              <Button className="w-full py-3">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Comprar Agora
                              </Button>
                            </ServicePaymentDialog>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="creator-card">
                        <CardContent className="py-12 text-center">
                          <div className="text-6xl mb-4">💎</div>
                          <h3 className="text-lg font-medium text-muted-foreground">Nenhum serviço disponível</h3>
                          <p className="text-sm text-muted-foreground">Esta criadora ainda não oferece serviços.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="gallery" className="mt-6">
                  {gallery.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                      {gallery.map((item) => (
                        <Card key={item.id} className="creator-card overflow-hidden hover:shadow-lg transition-all duration-300">
                          <div className="relative aspect-square">
                            <img 
                              src={item.media_url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-center">
                                <Play className="w-6 h-6 md:w-8 md:h-8 text-white mx-auto mb-1" />
                                <span className="text-white text-xs">Ver</span>
                              </div>
                            </div>
                            {item.is_featured && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-yellow-500 text-black text-xs">
                                  ⭐ Destaque
                                </Badge>
                              </div>
                            )}
                          </div>
                          {item.title && (
                            <CardContent className="p-3">
                              <h3 className="font-medium text-sm truncate">{item.title}</h3>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="creator-card">
                      <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">🖼️</div>
                        <h3 className="text-lg font-medium text-muted-foreground">Galeria vazia</h3>
                        <p className="text-sm text-muted-foreground">Esta criadora ainda não adicionou conteúdo à galeria.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="posts" className="mt-6">
                  {posts.length > 0 ? (
                    <div className="space-y-4 md:space-y-6">
                      {posts.map((post) => (
                        <Card key={post.id} className="creator-card">
                          <CardContent className="p-4 md:p-6">
                            <div className="flex items-start space-x-3 md:space-x-4">
                              <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                                <AvatarImage src={creator.avatar_url} />
                                <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center md:space-x-2 mb-2">
                                  <span className="font-medium text-sm md:text-base">{creator.display_name}</span>
                                  <div className="flex items-center space-x-2 mt-1 md:mt-0">
                                    {post.is_premium && (
                                      <Badge variant="outline" className="text-xs">💎 Premium</Badge>
                                    )}
                                    <span className="text-xs md:text-sm text-muted-foreground">
                                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-foreground mb-3 text-sm md:text-base leading-relaxed">{post.content}</p>
                                
                                {post.media_urls && post.media_urls.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    {post.media_urls.slice(0, 4).map((url, index) => (
                                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                        <img 
                                          src={url} 
                                          alt="Post media"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                                    <Heart className="w-4 h-4" />
                                    <span>{post.likes_count}</span>
                                  </button>
                                  <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                                    <Eye className="w-4 h-4" />
                                    <span>Ver mais</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="creator-card">
                      <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-lg font-medium text-muted-foreground">Nenhum post ainda</h3>
                        <p className="text-sm text-muted-foreground">Esta criadora ainda não fez nenhuma publicação.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreatorProfile;
