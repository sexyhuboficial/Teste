import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Verified, 
  Star, 
  Heart,
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCreators } from "@/hooks/useCreators";
import { useConversations } from "@/hooks/useConversations";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [filterOnline, setFilterOnline] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrFindConversation } = useConversations();

  // Buscar dados reais do banco de dados
  const { data: creatorsData = [], isLoading } = useCreators();

  // Mapear dados do banco para o formato da página
  const creators = creatorsData.map(creator => ({
    id: creator.id,
    name: creator.display_name,
    avatar: creator.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
    description: creator.bio || "Criadora de conteúdo premium",
    rating: creator.rating || 4.8,
    totalMessages: creator.message_count || 0,
    totalLikes: creator.like_count || 0,
    pricePerMessage: creator.starting_price / 100,
    subscriptionPrice: (creator.starting_price / 100) * 6, // Aproximação da assinatura
    isOnline: creator.status === 'online',
    isVerified: true,
    location: creator.location || "Brasil",
    categories: creator.tags || ["conversa"],
    age: 25, // Pode ser adicionado ao banco depois
    joinedAt: creator.created_at
  }));

  const handleStartChat = async (creatorId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const conversationId = await createOrFindConversation(creatorId);
    if (conversationId) {
      navigate('/whatsapp-chat');
    }
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOnlineFilter = filterOnline === "all" || 
                               (filterOnline === "online" && creator.isOnline) ||
                               (filterOnline === "offline" && !creator.isOnline);
    
    return matchesSearch && matchesOnlineFilter;
  });

  const sortedCreators = filteredCreators.sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return a.pricePerMessage - b.pricePerMessage;
      case "price-high":
        return b.pricePerMessage - a.pricePerMessage;
      case "newest":
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-2xl text-foreground">Carregando criadoras...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header da página */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4 font-montserrat px-2">
            Explorar Criadoras
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
            Descubra criadoras incríveis e conecte-se com pessoas interessantes
          </p>
        </div>

        {/* Filtros e busca */}
        <div className="bg-card p-4 md:p-6 rounded-lg border mb-6 md:mb-8">
          <div className="space-y-3 md:space-y-0 md:flex md:flex-row md:gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descrição ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros em linha no mobile */}
            <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
              {/* Filtro de status online */}
              <Select value={filterOnline} onValueChange={setFilterOnline}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              {/* Ordenação */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Melhor avaliação</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {sortedCreators.length} criadoras encontradas
          </p>
        </div>

        {/* Grid de criadoras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sortedCreators.map((creator) => (
            <Card key={creator.id} className="creator-card hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4 md:p-6">
                {/* Header do card */}
                <div className="flex items-start space-x-3 md:space-x-4 mb-3 md:mb-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 md:w-16 md:h-16">
                      <AvatarImage src={creator.avatar} alt={creator.name} />
                      <AvatarFallback>
                        {creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {creator.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate text-sm md:text-base">
                        {creator.name}
                      </h3>
                      {creator.isVerified && (
                        <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                          ✓
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{creator.location}</span>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-3 text-xs md:text-sm">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 mr-1 fill-current" />
                        <span>{creator.rating}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span>{creator.totalMessages}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Heart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span>{creator.totalLikes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2">
                  {creator.description}
                </p>

                {/* Categorias */}
                <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
                  {creator.categories.slice(0, 3).map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Preços e ações */}
                <div className="space-y-2 md:space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-muted-foreground">A partir de:</span>
                      <span className="font-semibold">R$ {creator.pricePerMessage.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-muted-foreground">Assinatura:</span>
                      <span className="font-semibold">R$ {creator.subscriptionPrice.toFixed(2)}/mês</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild className="flex-1 text-xs md:text-sm h-8 md:h-10">
                      <Link to={`/criadora/${creator.id}`}>Ver Perfil</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleStartChat(creator.id)}
                      title="Iniciar conversa"
                      className="h-8 w-8 md:h-10 md:w-10"
                    >
                      <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                      <Heart className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {sortedCreators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhuma criadora encontrada com os filtros selecionados.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setFilterOnline("all");
                setSortBy("rating");
              }}
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Explorar;
