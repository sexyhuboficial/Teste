import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, MessageCircle, DollarSign, Heart, Plus, Edit, Trash2, BarChart3, Settings, UserPlus, Image, ArrowLeft, Shield, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { GalleryManager } from "@/components/GalleryManager";
import { useCreators, useUpdateCreator, useCreateCreator, useDeleteCreator, useBulkUpdateCounters } from "@/hooks/useCreators";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StarRating } from "@/components/StarRating";

// Interfaces
interface Service {
  id?: string;
  title: string;
  description: string;
  service_type: string;
  price: number;
  duration_minutes: number;
}

interface GalleryItem {
  id?: string;
  title: string;
  description: string;
  media_type: string;
  media_url: string;
  is_featured: boolean;
}

interface Post {
  id?: string;
  content: string;
  media_urls: string[];
  is_premium: boolean;
  likes_count: number;
}
interface Creator {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  status: 'online' | 'busy' | 'offline';
  starting_price: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_new: boolean;
  location: string;
  tags?: string[];
  languages?: string[];
  view_count?: number;
  like_count?: number;
  message_count?: number;
  cover_image_url?: string;
}

interface Conversation {
  id: string;
  client_id: string;
  creator_id: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
  creator?: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
  client?: {
    id: string;
    display_name: string;
    email: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: string;
  media_url?: string;
  sender?: {
    id: string;
    display_name?: string;
    email?: string;
  };
}

// ContentManagement Component
const ContentManagement = ({ creators }: { creators: Creator[] }) => {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'gallery' | 'posts'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [galleryManagerOpen, setGalleryManagerOpen] = useState(false);
  const { toast } = useToast();

  // Forms state
  const [serviceForm, setServiceForm] = useState<Service>({
    title: '',
    description: '',
    service_type: 'pack_conteudo',
    price: 0,
    duration_minutes: 30
  });

  const [galleryForm, setGalleryForm] = useState<GalleryItem>({
    title: '',
    description: '',
    media_type: 'image',
    media_url: '',
    is_featured: false
  });

  const [postForm, setPostForm] = useState<Post>({
    content: '',
    media_urls: [],
    is_premium: false,
    likes_count: 0
  });

  const fetchCreatorContent = async (creatorId: string) => {
    setLoading(true);
    try {
      // Fetch services
      const { data: servicesData } = await supabase
        .from('creator_services')
        .select('*')
        .eq('creator_id', creatorId);

      // Fetch gallery
      const { data: galleryData } = await supabase
        .from('creator_gallery')
        .select('*')
        .eq('creator_id', creatorId);

      // Fetch posts
      const { data: postsData } = await supabase
        .from('creator_posts')
        .select('*')
        .eq('creator_id', creatorId);

      setServices(servicesData || []);
      setGallery(galleryData || []);
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conteúdo da criadora",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorSelect = (creator: Creator) => {
    setSelectedCreator(creator);
    fetchCreatorContent(creator.id);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) {
      toast({
        title: "Erro",
        description: "Nenhuma criadora selecionada",
        variant: "destructive",
      });
      return;
    }

    if (!serviceForm.title.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const serviceData = {
        title: serviceForm.title.trim(),
        description: serviceForm.description?.trim() || '',
        service_type: serviceForm.service_type,
        price: Math.round(Math.abs(serviceForm.price) * 100), // Convert to cents and ensure positive
        duration_minutes: serviceForm.duration_minutes > 0 ? serviceForm.duration_minutes : null,
        creator_id: selectedCreator.id,
        is_active: true
      };

      console.log('Adding service with data:', serviceData);

      const { data, error } = await supabase
        .from('creator_services')
        .insert(serviceData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Service added successfully:', data);

      toast({
        title: "Sucesso",
        description: "Serviço adicionado com sucesso!",
      });

      setServiceForm({
        title: '',
        description: '',
    service_type: 'pack_conteudo',
        price: 0,
        duration_minutes: 30
      });

      // Refresh the content
      await fetchCreatorContent(selectedCreator.id);
      
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar serviço",
        variant: "destructive",
      });
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) return;

    try {
      const { error } = await supabase
        .from('creator_gallery')
        .insert({
          ...galleryForm,
          creator_id: selectedCreator.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item da galeria adicionado com sucesso!",
      });

      setGalleryForm({
        title: '',
        description: '',
        media_type: 'image',
        media_url: '',
        is_featured: false
      });

      fetchCreatorContent(selectedCreator.id);
      
      // Force refresh of creators data in parent component
      window.dispatchEvent(new CustomEvent('refreshCreators'));
    } catch (error) {
      console.error('Error adding gallery item:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar item da galeria",
        variant: "destructive",
      });
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) return;

    try {
      const { error } = await supabase
        .from('creator_posts')
        .insert({
          ...postForm,
          creator_id: selectedCreator.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post adicionado com sucesso!",
      });

      setPostForm({
        content: '',
        media_urls: [],
        is_premium: false,
        likes_count: 0
      });

      fetchCreatorContent(selectedCreator.id);
      
      // Force refresh of creators data in parent component
      window.dispatchEvent(new CustomEvent('refreshCreators'));
    } catch (error) {
      console.error('Error adding post:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar post",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;

    try {
      const { error } = await supabase
        .from('creator_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço removido com sucesso!",
      });

      if (selectedCreator) {
        fetchCreatorContent(selectedCreator.id);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover serviço",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja remover este item da galeria?')) return;

    try {
      const { error } = await supabase
        .from('creator_gallery')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item da galeria removido com sucesso!",
      });

      if (selectedCreator) {
        fetchCreatorContent(selectedCreator.id);
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover item da galeria",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja remover este post?')) return;

    try {
      const { error } = await supabase
        .from('creator_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post removido com sucesso!",
      });

      if (selectedCreator) {
        fetchCreatorContent(selectedCreator.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover post",
        variant: "destructive",
      });
    }
  };

  const handleUpdateServicePrice = async (serviceId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('creator_services')
        .update({ price: Math.round(newPrice) })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Preço do serviço atualizado!",
      });

      if (selectedCreator) {
        fetchCreatorContent(selectedCreator.id);
      }
    } catch (error) {
      console.error('Error updating service price:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar preço do serviço",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Creator Selection */}
      <div>
        <Label className="text-base font-medium mb-3 block">Selecionar Criadora</Label>
        <Select value={selectedCreator?.id || ''} onValueChange={(value) => {
          const creator = creators.find(c => c.id === value);
          if (creator) handleCreatorSelect(creator);
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolha uma criadora para editar o conteúdo" />
          </SelectTrigger>
          <SelectContent>
            {creators.map((creator) => (
              <SelectItem key={creator.id} value={creator.id}>
                {creator.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCreator && (
        <div className="space-y-6">
          {/* Creator Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={selectedCreator.avatar_url} />
              <AvatarFallback>{selectedCreator.display_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedCreator.display_name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCreator.bio}</p>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'services' | 'gallery' | 'posts')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Service Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Adicionar Serviço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddService} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="service_title">Título</Label>
                        <Input
                          id="service_title"
                          value={serviceForm.title}
                          onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service_description">Descrição</Label>
                        <Textarea
                          id="service_description"
                          value={serviceForm.description}
                          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="service_price">Preço (R$)</Label>
                          <Input
                            id="service_price"
                            type="number"
                            step="0.01"
                            value={serviceForm.price}
                            onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service_duration">Duração (min)</Label>
                          <Input
                            id="service_duration"
                            type="number"
                            value={serviceForm.duration_minutes}
                            onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) || 30 })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service_type">Tipo</Label>
                        <Select
                          value={serviceForm.service_type}
                          onValueChange={(value) => setServiceForm({ ...serviceForm, service_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pack_conteudo">Pack de Conteúdo</SelectItem>
                            <SelectItem value="sexting">Sexting</SelectItem>
                            <SelectItem value="web_namoro">Web Namoro</SelectItem>
                            <SelectItem value="chamada_video">Chamada de Vídeo</SelectItem>
                            <SelectItem value="assinatura_mensal">Assinatura Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Serviço
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Services List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Serviços Existentes ({services.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">Carregando...</div>
                    ) : services.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum serviço cadastrado
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {services.map((service) => (
                          <div key={service.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{service.title}</h4>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                 <div className="text-sm mt-2 flex items-center justify-between">
                                   <span className="font-medium">R$ {(service.price / 100).toFixed(2)}</span>
                                   <div className="flex items-center space-x-2">
                                     <Input
                                       type="number"
                                       step="0.01"
                                       value={(service.price / 100).toFixed(2)}
                                       onChange={(e) => {
                                         const newPrice = parseFloat(e.target.value) * 100;
                                         handleUpdateServicePrice(service.id!, newPrice);
                                       }}
                                       className="w-20 h-6 text-xs"
                                     />
                                   </div>
                                  {service.duration_minutes && (
                                    <span className="text-muted-foreground ml-2">
                                      • {service.duration_minutes} min
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => service.id && handleDeleteService(service.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Gerenciar Galeria</h3>
                <Button
                  onClick={() => setGalleryManagerOpen(true)}
                  disabled={!selectedCreator}
                  className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Controlar Posições das Fotos
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Gallery Item Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Adicionar Item da Galeria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddGalleryItem} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="gallery_title">Título</Label>
                        <Input
                          id="gallery_title"
                          value={galleryForm.title}
                          onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gallery_description">Descrição</Label>
                        <Textarea
                          id="gallery_description"
                          value={galleryForm.description}
                          onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gallery_url">URL da Mídia</Label>
                        <Input
                          id="gallery_url"
                          value={galleryForm.media_url}
                          onChange={(e) => setGalleryForm({ ...galleryForm, media_url: e.target.value })}
                          placeholder="https://..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gallery_type">Tipo de Mídia</Label>
                        <Select
                          value={galleryForm.media_type}
                          onValueChange={(value) => setGalleryForm({ ...galleryForm, media_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Imagem</SelectItem>
                            <SelectItem value="video">Vídeo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gallery_featured"
                          checked={galleryForm.is_featured}
                          onCheckedChange={(checked) => setGalleryForm({ ...galleryForm, is_featured: !!checked })}
                        />
                        <Label htmlFor="gallery_featured">Item em destaque</Label>
                      </div>
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar à Galeria
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Gallery Items List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Itens da Galeria ({gallery.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">Carregando...</div>
                    ) : gallery.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum item na galeria
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {gallery.map((item) => (
                          <div key={item.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex space-x-3">
                                <img
                                  src={item.media_url}
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                  <h4 className="font-medium">{item.title}</h4>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                  <div className="text-sm mt-1">
                                    <Badge variant={item.is_featured ? "default" : "secondary"}>
                                      {item.media_type}
                                    </Badge>
                                    {item.is_featured && (
                                      <Badge variant="outline" className="ml-2">
                                        Destaque
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => item.id && handleDeleteGalleryItem(item.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Post Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddPost} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="post_content">Conteúdo</Label>
                        <Textarea
                          id="post_content"
                          value={postForm.content}
                          onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="post_likes">Curtidas</Label>
                        <Input
                          id="post_likes"
                          type="number"
                          min="0"
                          value={postForm.likes_count}
                          onChange={(e) => setPostForm({ ...postForm, likes_count: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="post_premium"
                          checked={postForm.is_premium}
                          onCheckedChange={(checked) => setPostForm({ ...postForm, is_premium: !!checked })}
                        />
                        <Label htmlFor="post_premium">Post Premium</Label>
                      </div>
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Post
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Posts List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Posts Existentes ({posts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-4">Carregando...</div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum post criado
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {posts.map((post) => (
                          <div key={post.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm">{post.content}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-sm text-muted-foreground">
                                    ❤️ {post.likes_count}
                                  </span>
                                  {post.is_premium && (
                                    <Badge variant="outline">Premium</Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => post.id && handleDeletePost(post.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Gallery Manager Dialog */}
      {selectedCreator && (
        <GalleryManager
          creatorId={selectedCreator.id}
          isOpen={galleryManagerOpen}
          onOpenChange={setGalleryManagerOpen}
        />
      )}
    </div>
  );
};

// Componente para Gerenciar Conversas
const ConversationManager = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'conversation'>('list');
  const { toast } = useToast();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          creator:creators!creator_id(id, display_name, avatar_url),
          client:profiles!client_id(user_id, display_name, email)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data as any || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conversas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(user_id, display_name, email)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as any || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setViewMode('conversation');
    fetchMessages(conversation.id);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Primeiro deletar todas as mensagens da conversa
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Depois deletar a conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      toast({
        title: "Sucesso",
        description: "Conversa excluída com sucesso",
      });

      // Atualizar lista de conversas
      fetchConversations();
      
      // Se estava visualizando a conversa deletada, voltar para a lista
      if (selectedConversation?.id === conversationId) {
        setViewMode('list');
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conversa",
        variant: "destructive",
      });
    }
  };

  const handleModerateConversation = async (conversationId: string) => {
    try {
      // Implementar lógica de moderação aqui
      // Por exemplo, marcar como moderada, adicionar tag, etc.
      const { error } = await supabase
        .from('conversation_tags')
        .insert({
          conversation_id: conversationId,
          tag_type: 'moderation',
          tag_value: 'reviewed',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conversa moderada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao moderar conversa:', error);
      toast({
        title: "Erro",
        description: "Erro ao moderar conversa",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (viewMode === 'conversation' && selectedConversation) {
    return (
      <div className="space-y-6">
        {/* Header da conversa */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation.creator?.avatar_url} />
                <AvatarFallback>
                  {selectedConversation.creator?.display_name?.[0] || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {selectedConversation.creator?.display_name || 'Criadora'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cliente: {selectedConversation.client?.display_name || selectedConversation.client?.email}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModerateConversation(selectedConversation.id)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Moderar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteConversation(selectedConversation.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Mensagens */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens da Conversa</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando mensagens...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma mensagem encontrada
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg max-w-xs ${
                      message.sender_id === selectedConversation.client_id
                        ? 'bg-primary/10 ml-auto'
                        : 'bg-muted mr-auto'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.sender_id === selectedConversation.client_id
                        ? selectedConversation.client?.display_name || 'Cliente'
                        : selectedConversation.creator?.display_name || 'Criadora'}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(message.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Conversas</h2>
          <p className="text-muted-foreground">Monitorar e moderar conversas na plataforma</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-primary/10">
            Sistema organizado por admin logado
          </Badge>
          <span className="text-sm text-muted-foreground">
            {conversations.length} conversas ativas no sistema
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Carregando conversas...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma conversa encontrada</h3>
              <p>Não há conversas ativas no sistema no momento.</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {conversations.map((conversation) => (
                <Card key={conversation.id} className="border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.creator?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {conversation.creator?.display_name?.[0] || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-foreground">C</span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground">
                              {conversation.creator?.display_name || 'Criadora'}
                            </h4>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(conversation.last_message_at || conversation.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Cliente: {conversation.client?.display_name || conversation.client?.email || 'Usuário'}
                          </p>
                          <p className="text-sm text-foreground">
                            Última mensagem: {conversation.last_message || 'Sem mensagens'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewConversation(conversation)}
                          className="w-full"
                        >
                          Ver Conversa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModerateConversation(conversation.id)}
                          className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                        >
                          Moderar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteConversation(conversation.id)}
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface DashboardStats {
  totalCreators: number;
  totalConversations: number;
  totalRevenue: number;
  totalFavorites: number;
}
const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCreators: 0,
    totalConversations: 0,
    totalRevenue: 0,
    totalFavorites: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();

  // Use react-query hooks
  const {
    data: creators = [],
    refetch: refetchCreators
  } = useCreators();
  const updateCreatorMutation = useUpdateCreator();
  const createCreatorMutation = useCreateCreator();
  const deleteCreatorMutation = useDeleteCreator();
  const bulkUpdateCountersMutation = useBulkUpdateCounters();
  const [newCreator, setNewCreator] = useState<{
    display_name: string;
    bio: string;
    avatar_url: string;
    cover_image_url: string;
    starting_price: string;
    location: string;
    tags: string;
    languages: string;
    status: 'offline' | 'online' | 'busy';
    rating: string;
    review_count: string;
  }>({
    display_name: '',
    bio: '',
    avatar_url: '',
    cover_image_url: '',
    starting_price: '',
    location: '',
    tags: '',
    languages: '',
    status: 'offline',
    rating: '4.8',
    review_count: '128'
  });
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    display_name: string;
    bio: string;
    avatar_url: string;
    cover_image_url: string;
    starting_price: string;
    location: string;
    tags: string;
    languages: string;
    status: 'offline' | 'online' | 'busy';
    is_featured: boolean;
    is_new: boolean;
    view_count: string;
    like_count: string;
    message_count: string;
    rating: string;
    review_count: string;
  }>({
    display_name: '',
    bio: '',
    avatar_url: '',
    cover_image_url: '',
    starting_price: '',
    location: '',
    tags: '',
    languages: '',
    status: 'offline',
    is_featured: false,
    is_new: false,
    view_count: '',
    like_count: '',
    message_count: '',
    rating: '',
    review_count: ''
  });
  const [loading, setLoading] = useState(true);
  const [weeklyFeatured, setWeeklyFeatured] = useState<any[]>([]);
  const [selectedWeeklyCreators, setSelectedWeeklyCreators] = useState<string[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [galleryManagerOpen, setGalleryManagerOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeCreators: 0,
    totalRevenue: 0,
    totalServiceSales: 0,
    totalMimos: 0,
    mimosRevenue: 0,
    serviceTypeStats: [] as Array<{
      service_type: string;
      count: number;
      total_amount: number;
    }>,
    recentServiceSales: [] as Array<{
      id: string;
      amount: number;
      service_type: string;
      payment_status: string;
      created_at: string;
      service_title: string;
      creator_name: string;
      client_name: string;
    }>
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        navigate("/admin-login");
        return;
      }
      try {
        const {
          data,
          error
        } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
        if (error || !data || data.role !== 'admin') {
          navigate("/admin-login");
          return;
        }
        setIsAdmin(true);
        fetchDashboardData();
        refetchCreators();
      } catch (error) {
        console.error('Erro ao verificar role de admin:', error);
        navigate("/admin-login");
      }
    };

    // Add listener for refresh events
    const handleRefreshCreators = () => {
      refetchCreators();
      fetchDashboardData();
    };

    window.addEventListener('refreshCreators', handleRefreshCreators);

    checkAdminRole();

    return () => {
      window.removeEventListener('refreshCreators', handleRefreshCreators);
    };
  }, [user, navigate]);
  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const {
        data: conversationsData
      } = await supabase.from('conversations').select('id');
      const {
        data: ordersData
      } = await supabase.from('orders').select('amount');
      const {
        data: favoritesData
      } = await supabase.from('user_favorites').select('id');
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.amount, 0) || 0;

      // Fetch analytics data
      const { data: usersData } = await supabase.from('profiles').select('id');
      const { data: creatorsData } = await supabase.from('creators').select('id, status');
      
      // Fetch service payments data
      const { data: servicePaymentsData } = await supabase
        .from('service_payments')
        .select(`
          id, amount, service_type, payment_status, created_at, service_id, creator_id, client_id
        `)
        .order('created_at', { ascending: false });

      // Fetch related data separately to avoid complex joins
      const serviceIds = [...new Set(servicePaymentsData?.map(sp => sp.service_id).filter(Boolean) || [])];
      const creatorIds = [...new Set(servicePaymentsData?.map(sp => sp.creator_id).filter(Boolean) || [])];
      const clientIds = [...new Set(servicePaymentsData?.map(sp => sp.client_id).filter(Boolean) || [])];

      const { data: servicesData } = serviceIds.length > 0 ? await supabase
        .from('creator_services')
        .select('id, title')
        .in('id', serviceIds) : { data: [] };

      const { data: creatorsNamesData } = creatorIds.length > 0 ? await supabase
        .from('creators')
        .select('id, display_name')
        .in('id', creatorIds) : { data: [] };

      const { data: clientsData } = clientIds.length > 0 ? await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', clientIds) : { data: [] };

      // Fetch mimos data
      const { data: mimosData } = await supabase
        .from('mimos')
        .select('amount, payment_status');

      // Calculate analytics
      const completedServicePayments = servicePaymentsData?.filter(sp => sp.payment_status === 'completed') || [];
      const completedMimos = mimosData?.filter(m => m.payment_status === 'completed') || [];
      
      const serviceTypeStats = completedServicePayments.reduce((acc, payment) => {
        const existing = acc.find(item => item.service_type === payment.service_type);
        if (existing) {
          existing.count += 1;
          existing.total_amount += payment.amount;
        } else {
          acc.push({
            service_type: payment.service_type,
            count: 1,
            total_amount: payment.amount
          });
        }
        return acc;
      }, [] as Array<{ service_type: string; count: number; total_amount: number }>);

      const recentServiceSales = (servicePaymentsData || []).slice(0, 10).map(sale => {
        const service = servicesData?.find(s => s.id === sale.service_id);
        const creator = creatorsNamesData?.find(c => c.id === sale.creator_id);
        const client = clientsData?.find(cl => cl.user_id === sale.client_id);
        
        return {
          id: sale.id,
          amount: sale.amount,
          service_type: sale.service_type,
          payment_status: sale.payment_status,
          created_at: sale.created_at,
          service_title: service?.title || 'Serviço',
          creator_name: creator?.display_name || 'Criadora',
          client_name: client?.display_name || 'Cliente'
        };
      });

      // Fetch complete conversations data for admin panel
      const { data: conversationsFullData } = await supabase
        .from('conversations')
        .select(`
          *,
          creators(
            id,
            display_name,
            avatar_url,
            status
          )
        `)
        .order('last_message_at', { ascending: false });

      setConversations(conversationsFullData || []);

      setStats({
        totalCreators: creators?.length || 0,
        totalConversations: conversationsData?.length || 0,
        totalRevenue: totalRevenue / 100,
        totalFavorites: favoritesData?.length || 0
      });

      setAnalytics({
        totalUsers: usersData?.length || 0,
        activeCreators: creatorsData?.filter(c => c.status !== 'offline').length || 0,
        totalRevenue: completedServicePayments.reduce((sum, sp) => sum + sp.amount, 0) + 
                     completedMimos.reduce((sum, m) => sum + m.amount, 0),
        totalServiceSales: completedServicePayments.length,
        totalMimos: completedMimos.length,
        mimosRevenue: completedMimos.reduce((sum, m) => sum + m.amount, 0),
        serviceTypeStats,
        recentServiceSales
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }
    try {
      await createCreatorMutation.mutateAsync({
        display_name: newCreator.display_name,
        bio: newCreator.bio,
        avatar_url: newCreator.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616c9daa828?w=400',
        cover_image_url: newCreator.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        starting_price: Math.round(parseFloat(newCreator.starting_price) * 100),
        location: newCreator.location,
        tags: newCreator.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        languages: newCreator.languages.split(',').map(lang => lang.trim()).filter(Boolean),
        status: newCreator.status,
        rating: parseFloat(newCreator.rating) || 4.8,
        review_count: parseInt(newCreator.review_count) || 128,
        user_id: user.id
      });
      setNewCreator({
        display_name: '',
        bio: '',
        avatar_url: '',
        cover_image_url: '',
        starting_price: '',
        location: '',
        tags: '',
        languages: '',
        status: 'offline' as const,
        rating: '4.8',
        review_count: '128'
      });
      fetchDashboardData();
    } catch (error: any) {
      console.error('Erro ao criar criadora:', error);
    }
  };
  const handleDeleteCreator = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta criadora?')) return;
    try {
      await deleteCreatorMutation.mutateAsync(id);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting creator:', error);
    }
  };
  const handleStatusChange = async (creatorId: string, newStatus: 'online' | 'busy' | 'offline') => {
    try {
      await updateCreatorMutation.mutateAsync({
        id: creatorId,
        updates: {
          status: newStatus
        }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleQuickUpdateCounter = async (creatorId: string, field: 'view_count' | 'like_count' | 'message_count', value: number) => {
    try {
      const updates = { [field]: value };
      
      await updateCreatorMutation.mutateAsync({
        id: creatorId,
        updates
      });

      toast({
        title: "Sucesso",
        description: "Contador atualizado!",
      });
    } catch (error) {
      console.error('Error updating counter:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contador",
        variant: "destructive",
      });
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'busy':
        return 'Ocupada';
      case 'offline':
        return 'Offline';
      default:
        return 'Offline';
    }
  };
  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreatorId(creator.id);
    setEditForm({
      display_name: creator.display_name,
      bio: creator.bio || '',
      avatar_url: creator.avatar_url || '',
      cover_image_url: creator.cover_image_url || '',
      starting_price: (creator.starting_price / 100).toString(),
      location: creator.location || '',
      tags: creator.tags?.join(', ') || '',
      languages: creator.languages?.join(', ') || '',
      status: creator.status,
      is_featured: creator.is_featured,
      is_new: creator.is_new,
      view_count: (creator.view_count || 0).toString(),
      like_count: (creator.like_count || 0).toString(),
      message_count: (creator.message_count || 0).toString(),
      rating: (creator.rating || 4.8).toString(),
      review_count: (creator.review_count || 128).toString()
    });
  };
  const handleUpdateCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId) {
      toast({
        title: "Erro",
        description: "Nenhuma criadora selecionada",
        variant: "destructive"
      });
      return;
    }
    try {
      await updateCreatorMutation.mutateAsync({
        id: selectedCreatorId,
        updates: {
          display_name: editForm.display_name,
          bio: editForm.bio,
          avatar_url: editForm.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616c9daa828?w=400',
          cover_image_url: editForm.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          starting_price: Math.round(parseFloat(editForm.starting_price) * 100),
          location: editForm.location,
          tags: editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          languages: editForm.languages.split(',').map(lang => lang.trim()).filter(Boolean),
          status: editForm.status,
          is_featured: editForm.is_featured,
          is_new: editForm.is_new,
          view_count: parseInt(editForm.view_count) || 0,
          like_count: parseInt(editForm.like_count) || 0,
          message_count: parseInt(editForm.message_count) || 0,
          rating: parseFloat(editForm.rating) || 4.8,
          review_count: parseInt(editForm.review_count) || 128
        }
      });
      fetchDashboardData();
    } catch (error: any) {
      console.error('Erro ao atualizar criadora:', error);
    }
  };
  const fetchWeeklyFeatured = async () => {
    try {
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      const {
        data,
        error
      } = await supabase.from('weekly_featured').select(`
          *,
          creators (
            id,
            display_name,
            avatar_url,
            rating,
            review_count
          )
        `).eq('week_start_date', currentWeekStart.toISOString().split('T')[0]).eq('is_active', true).order('position');
      if (error) throw error;
      setWeeklyFeatured(data || []);
    } catch (error) {
      console.error('Error fetching weekly featured:', error);
    }
  };
  const handleToggleWeeklyFeatured = (creatorId: string) => {
    setSelectedWeeklyCreators(prev => prev.includes(creatorId) ? prev.filter(id => id !== creatorId) : prev.length < 5 ? [...prev, creatorId] : prev);
  };
  const handleSaveWeeklyFeatured = async () => {
    try {
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

      // Remove existing featured for this week
      await supabase.from('weekly_featured').delete().eq('week_start_date', currentWeekStart.toISOString().split('T')[0]);

      // Add new featured creators
      const weeklyFeaturedData = selectedWeeklyCreators.map((creatorId, index) => ({
        creator_id: creatorId,
        week_start_date: currentWeekStart.toISOString().split('T')[0],
        week_end_date: currentWeekEnd.toISOString().split('T')[0],
        position: index + 1,
        auto_selected: false
      }));
      const {
        error
      } = await supabase.from('weekly_featured').insert(weeklyFeaturedData);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Modelos em destaque da semana atualizadas!"
      });
      fetchWeeklyFeatured();
      fetchDashboardData(); // Atualiza as estatísticas
    } catch (error) {
      console.error('Error saving weekly featured:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar modelos em destaque",
        variant: "destructive"
      });
    }
  };
  const handleAutoRotate = async () => {
    try {
      const {
        error
      } = await supabase.rpc('auto_rotate_weekly_featured');
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Rotação automática executada com sucesso!"
      });
      fetchWeeklyFeatured();
      fetchDashboardData(); // Atualiza as estatísticas
    } catch (error) {
      console.error('Error auto rotating:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar rotação automática",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateAllRatings = async () => {
    try {
      const ratings = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
      
      for (const creator of creators) {
        const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
        const randomReviews = Math.floor(Math.random() * 200 + 50);
        
        await updateCreatorMutation.mutateAsync({
          id: creator.id,
          updates: {
            rating: randomRating,
            review_count: randomReviews
          }
        });
      }
      
      toast({
        title: "Sucesso",
        description: "Todos os ratings foram atualizados!"
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating ratings:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ratings",
        variant: "destructive"
      });
    }
  };
  const handleUpdateAllCounters = async () => {
    try {
      const {
        error
      } = await supabase.from('creators').update({
        view_count: Math.floor(Math.random() * 26 + 15),
        like_count: Math.floor(Math.random() * 26 + 15),
        message_count: Math.floor(Math.random() * 26 + 15)
      }).neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Todos os contadores foram atualizados!"
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating counters:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contadores",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    if (isAdmin) {
      fetchWeeklyFeatured();
    }
  }, [isAdmin]);
  if (loading || !isAdmin) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-2xl text-foreground">
            {loading ? "Carregando dashboard..." : "Verificando permissões..."}
          </div>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-montserrat mb-2">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie criadoras, conteúdo e monitore métricas da plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="creator-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Criadoras</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalCreators}</div>
            </CardContent>
          </Card>

          <Card className="creator-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalConversations}</div>
            </CardContent>
          </Card>

          <Card className="creator-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {stats.totalRevenue.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>

          <Card className="creator-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Favoritos</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalFavorites}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="models" className="w-full">
          {/* Mobile: Horizontal scrolling tabs */}
          <div className="block md:hidden mb-4">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="flex space-x-1 p-1 w-max">
                <TabsTrigger value="models" className="text-xs whitespace-nowrap px-3 py-2">Modelos</TabsTrigger>
                <TabsTrigger value="creators" className="text-xs whitespace-nowrap px-3 py-2">Criadoras</TabsTrigger>
                <TabsTrigger value="manage-profiles" className="text-xs whitespace-nowrap px-3 py-2">Perfis</TabsTrigger>
                <TabsTrigger value="manage-content" className="text-xs whitespace-nowrap px-3 py-2">Conteúdo</TabsTrigger>
                <TabsTrigger value="weekly-featured" className="text-xs whitespace-nowrap px-3 py-2">Destaque</TabsTrigger>
                <TabsTrigger value="messages" className="text-xs whitespace-nowrap px-3 py-2">Mensagens</TabsTrigger>
                <TabsTrigger value="add-creator" className="text-xs whitespace-nowrap px-3 py-2">Adicionar</TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs whitespace-nowrap px-3 py-2">Analytics</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs whitespace-nowrap px-3 py-2">Config</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1">
              <TabsTrigger value="models" className="text-sm">Modelos</TabsTrigger>
              <TabsTrigger value="creators" className="text-sm">Criadoras</TabsTrigger>
              <TabsTrigger value="manage-profiles" className="text-sm">Perfis</TabsTrigger>
              <TabsTrigger value="manage-content" className="text-sm">Conteúdo</TabsTrigger>
              <TabsTrigger value="weekly-featured" className="text-sm">Destaque</TabsTrigger>
              <TabsTrigger value="messages" className="text-sm">Mensagens</TabsTrigger>
              <TabsTrigger value="add-creator" className="text-sm">Adicionar</TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">Config</TabsTrigger>
            </TabsList>
          </div>

          {/* Models Management Table */}
          <TabsContent value="models">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Gerenciar Modelos</CardTitle>
                <CardDescription>
                  Edite as informações das 3 modelos principais da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mobile: Card layout */}
                <div className="block md:hidden space-y-4">
                  {creators.filter(creator => 
                    ['Carla Sedutora', 'Ana Sensual', 'Bia Encantadora'].includes(creator.display_name)
                  ).map((creator) => (
                    <Card key={creator.id} className="p-4 space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={creator.avatar_url} />
                            <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(creator.status)}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{creator.display_name}</h3>
                          <p className="text-sm text-muted-foreground">{creator.bio?.substring(0, 50)}...</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <Select value={creator.status} onValueChange={(value) => 
                            handleStatusChange(creator.id, value as 'online' | 'busy' | 'offline')
                          }>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(creator.status)}`}></div>
                                  <span>{getStatusText(creator.status)}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online" className="text-green-600 font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Online</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="busy" className="text-yellow-600 font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span>Ocupada</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="offline" className="text-gray-600 font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                  <span>Offline</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Preço</Label>
                          <p className="mt-1 font-medium">R$ {(creator.starting_price / 100).toFixed(0)}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Localização</Label>
                          <p className="mt-1">{creator.location}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Rating</Label>
                          <div className="mt-1">
                            <StarRating rating={creator.rating || 4.8} size="sm" readonly />
                            <p className="text-xs text-muted-foreground">{creator.review_count} avaliações</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 border-t pt-3">
                        <Label className="text-xs text-muted-foreground">Contadores</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center space-x-1">
                            <span>👁️</span>
                            <Input
                              type="number"
                              value={creator.view_count}
                              onChange={(e) => handleQuickUpdateCounter(creator.id, 'view_count', parseInt(e.target.value) || 0)}
                              className="w-full h-8 text-xs"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>❤️</span>
                            <Input
                              type="number"
                              value={creator.like_count}
                              onChange={(e) => handleQuickUpdateCounter(creator.id, 'like_count', parseInt(e.target.value) || 0)}
                              className="w-full h-8 text-xs"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>💬</span>
                            <Input
                              type="number"
                              value={creator.message_count}
                              onChange={(e) => handleQuickUpdateCounter(creator.id, 'message_count', parseInt(e.target.value) || 0)}
                              className="w-full h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={creator.is_featured}
                            onCheckedChange={(checked) => {
                              updateCreatorMutation.mutate({
                                id: creator.id,
                                updates: { is_featured: !!checked }
                              });
                            }}
                          />
                          <Label className="text-sm">Destacar</Label>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          <Button size="sm" onClick={() => {
                            setSelectedCreatorId(creator.id);
                            setEditForm({
                              display_name: creator.display_name,
                              bio: creator.bio,
                              avatar_url: creator.avatar_url || '',
                              cover_image_url: creator.cover_image_url || '',
                              location: creator.location || '',
                              starting_price: (creator.starting_price / 100).toString(),
                              status: creator.status,
                              tags: creator.tags?.join(', ') || '',
                              languages: creator.languages?.join(', ') || '',
                              is_featured: creator.is_featured,
                              is_new: creator.is_new,
                              view_count: (creator.view_count || 0).toString(),
                              like_count: (creator.like_count || 0).toString(),
                              message_count: (creator.message_count || 0).toString(),
                              rating: (creator.rating || 4.8).toString(),
                              review_count: (creator.review_count || 128).toString()
                            });
                          }}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteCreator(creator.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden md:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Rating/Avaliações</TableHead>
                        <TableHead>Contadores</TableHead>
                        <TableHead>Destacar</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creators.filter(creator => 
                        ['Carla Sedutora', 'Ana Sensual', 'Bia Encantadora'].includes(creator.display_name)
                      ).map((creator) => (
                        <TableRow key={creator.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={creator.avatar_url} />
                                  <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(creator.status)}`} />
                              </div>
                              <div>
                                <p className="font-medium">{creator.display_name}</p>
                                <p className="text-xs text-muted-foreground">{creator.bio?.substring(0, 30)}...</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select value={creator.status} onValueChange={(value) => 
                              handleStatusChange(creator.id, value as 'online' | 'busy' | 'offline')
                            }>
                              <SelectTrigger className="w-32 bg-card border-border hover:bg-accent hover:text-accent-foreground">
                                <SelectValue>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(creator.status)}`}></div>
                                    <span>{getStatusText(creator.status)}</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border">
                                <SelectItem value="online" className="text-green-600 font-medium focus:bg-green-50 focus:text-green-700">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Online</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="busy" className="text-yellow-600 font-medium focus:bg-yellow-50 focus:text-yellow-700">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span>Ocupada</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="offline" className="text-gray-600 font-medium focus:bg-gray-50 focus:text-gray-700">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span>Offline</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{creator.location}</TableCell>
                          <TableCell>R$ {(creator.starting_price / 100).toFixed(0)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <StarRating 
                                rating={creator.rating || 4.8} 
                                size="sm" 
                                readonly 
                              />
                              <div className="text-xs text-muted-foreground">
                                {creator.review_count} avaliações
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center space-x-1">
                                <span>👁️</span>
                                <Input
                                  type="number"
                                  value={creator.view_count}
                                  onChange={(e) => handleQuickUpdateCounter(creator.id, 'view_count', parseInt(e.target.value) || 0)}
                                  className="w-12 h-5 text-xs p-1"
                                />
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>❤️</span>
                                <Input
                                  type="number"
                                  value={creator.like_count}
                                  onChange={(e) => handleQuickUpdateCounter(creator.id, 'like_count', parseInt(e.target.value) || 0)}
                                  className="w-12 h-5 text-xs p-1"
                                />
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>💬</span>
                                <Input
                                  type="number"
                                  value={creator.message_count}
                                  onChange={(e) => handleQuickUpdateCounter(creator.id, 'message_count', parseInt(e.target.value) || 0)}
                                  className="w-12 h-5 text-xs p-1"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Checkbox 
                              checked={creator.is_featured}
                              onCheckedChange={(checked) => {
                                updateCreatorMutation.mutate({
                                  id: creator.id,
                                  updates: { is_featured: !!checked }
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSelectCreator(creator)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteCreator(creator.id)}
                                className="h-8 w-8 p-0 text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Formulário de edição rápida quando um modelo é selecionado */}
                {selectedCreatorId && (
                  <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-medium mb-4">Edição Rápida</h3>
                    <form onSubmit={handleUpdateCreator} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quick_display_name">Nome</Label>
                        <Input 
                          id="quick_display_name" 
                          value={editForm.display_name} 
                          onChange={e => setEditForm({...editForm, display_name: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quick_location">Localização</Label>
                        <Input 
                          id="quick_location" 
                          value={editForm.location} 
                          onChange={e => setEditForm({...editForm, location: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quick_starting_price">Preço (R$)</Label>
                        <Input 
                          id="quick_starting_price" 
                          type="number" 
                          value={editForm.starting_price} 
                          onChange={e => setEditForm({...editForm, starting_price: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quick_rating">Rating (⭐)</Label>
                        <Input 
                          id="quick_rating" 
                          type="number" 
                          step="0.1"
                          min="1"
                          max="5"
                          value={editForm.rating} 
                          onChange={e => setEditForm({...editForm, rating: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2 lg:col-span-4">
                        <Label htmlFor="quick_bio">Bio</Label>
                        <Textarea 
                          id="quick_bio" 
                          value={editForm.bio} 
                          onChange={e => setEditForm({...editForm, bio: e.target.value})} 
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-4 flex space-x-2">
                        <Button type="submit" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Atualizar
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCreatorId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creators Management */}
          <TabsContent value="creators">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Gerenciar Criadoras</CardTitle>
                <CardDescription>
                  Visualize e gerencie todas as criadoras da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creators.map(creator => <div key={creator.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={creator.avatar_url} />
                            <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(creator.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{creator.display_name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{creator.location}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Badge variant={creator.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                              {getStatusText(creator.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {creator.is_featured && <Badge variant="outline" className="text-xs">Destaque</Badge>}
                        {creator.is_new && <Badge variant="outline" className="text-xs">Nova</Badge>}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">
                          R$ {(creator.starting_price / 100).toFixed(0)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Select value={creator.status} onValueChange={(value) => handleStatusChange(creator.id, value as 'online' | 'busy' | 'offline')}>
                            <SelectTrigger className="h-8 w-20 text-xs bg-background border-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-primary/20">
                              <SelectItem value="online" className="text-green-600 text-xs">
                                🟢 On
                              </SelectItem>
                              <SelectItem value="busy" className="text-yellow-600 text-xs">
                                🟡 Ocupada
                              </SelectItem>
                              <SelectItem value="offline" className="text-gray-600 text-xs">
                                ⚫ Off
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => setEditingCreator(creator)} className="h-8 w-8 p-0 bg-background border-primary/20 hover:bg-primary/10 hover:border-primary text-primary">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCreator(creator.id)} className="h-8 w-8 p-0 bg-background border-destructive/20 hover:bg-destructive/10 hover:border-destructive text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Profiles */}
          <TabsContent value="manage-profiles">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Gerenciar Perfis das Modelos</CardTitle>
                <CardDescription>
                  Selecione uma modelo para editar seu perfil detalhadamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Lista de Modelos */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-medium mb-4">Selecionar Modelo</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {creators.map(creator => <div key={creator.id} onClick={() => handleSelectCreator(creator)} className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedCreatorId === creator.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={creator.avatar_url} />
                                <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(creator.status)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate text-sm">{creator.display_name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{creator.location}</p>
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </div>

                  {/* Formulário de Edição */}
                  <div className="lg:col-span-2">
                    {selectedCreatorId ? <form onSubmit={handleUpdateCreator} className="space-y-4">
                        <h3 className="text-lg font-medium mb-4">Editar Perfil</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_display_name">Nome de Exibição</Label>
                            <Input id="edit_display_name" value={editForm.display_name} onChange={e => setEditForm({
                          ...editForm,
                          display_name: e.target.value
                        })} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_starting_price">Preço Inicial (R$)</Label>
                            <Input id="edit_starting_price" type="number" value={editForm.starting_price} onChange={e => setEditForm({
                          ...editForm,
                          starting_price: e.target.value
                        })} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_rating">Rating (⭐ 1-5)</Label>
                            <Input id="edit_rating" type="number" step="0.1" min="1" max="5" value={editForm.rating} onChange={e => setEditForm({
                          ...editForm,
                          rating: e.target.value
                        })} required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit_status">Status</Label>
                          <Select value={editForm.status} onValueChange={(value) => setEditForm({
                            ...editForm,
                            status: value as 'offline' | 'online' | 'busy'
                          })}>
                            <SelectTrigger className="w-full bg-background border-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-primary/20">
                              <SelectItem value="online" className="text-green-600 font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Online</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="busy" className="text-yellow-600 font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span>Ocupada</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="offline" className="text-gray-600 font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                  <span>Offline</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit_bio">Biografia</Label>
                          <Textarea id="edit_bio" value={editForm.bio} onChange={e => setEditForm({
                        ...editForm,
                        bio: e.target.value
                      })} rows={4} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_avatar_url">URL do Avatar</Label>
                            <Input id="edit_avatar_url" value={editForm.avatar_url} onChange={e => setEditForm({
                          ...editForm,
                          avatar_url: e.target.value
                        })} placeholder="https://..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_location">Localização</Label>
                            <Input id="edit_location" value={editForm.location} onChange={e => setEditForm({
                          ...editForm,
                          location: e.target.value
                        })} placeholder="São Paulo, SP" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_tags">Tags (separadas por vírgula)</Label>
                            <Input id="edit_tags" value={editForm.tags} onChange={e => setEditForm({
                          ...editForm,
                          tags: e.target.value
                        })} placeholder="Brasileira, Sensual, Premium" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_languages">Idiomas (separados por vírgula)</Label>
                            <Input id="edit_languages" value={editForm.languages} onChange={e => setEditForm({
                          ...editForm,
                          languages: e.target.value
                        })} placeholder="Português, Inglês" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">Rating e Avaliações</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit_rating_detail">Rating (1-5 estrelas)</Label>
                              <div className="space-y-2">
                                <StarRating 
                                  rating={parseFloat(editForm.rating) || 4.8}
                                  onRatingChange={(newRating) => setEditForm({
                                    ...editForm,
                                    rating: newRating.toString()
                                  })}
                                  size="lg"
                                />
                                <Input 
                                  id="edit_rating_detail" 
                                  type="number" 
                                  step="0.1" 
                                  min="1" 
                                  max="5" 
                                  value={editForm.rating} 
                                  onChange={e => setEditForm({
                                    ...editForm,
                                    rating: e.target.value
                                  })} 
                                  placeholder="4.8" 
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Clique nas estrelas ou digite um valor
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit_review_count_detail">Número de Avaliações</Label>
                              <Input id="edit_review_count_detail" type="number" min="0" value={editForm.review_count} onChange={e => setEditForm({
                            ...editForm,
                            review_count: e.target.value
                          })} placeholder="128" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">Contadores de Interação</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit_view_count">Visualizações</Label>
                              <Input id="edit_view_count" type="number" min="15" max="40" value={editForm.view_count} onChange={e => setEditForm({
                            ...editForm,
                            view_count: e.target.value
                          })} placeholder="15-40" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit_like_count">Curtidas</Label>
                              <Input id="edit_like_count" type="number" min="15" max="40" value={editForm.like_count} onChange={e => setEditForm({
                            ...editForm,
                            like_count: e.target.value
                          })} placeholder="15-40" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit_message_count">Mensagens</Label>
                              <Input id="edit_message_count" type="number" min="15" max="40" value={editForm.message_count} onChange={e => setEditForm({
                            ...editForm,
                            message_count: e.target.value
                          })} placeholder="15-40" />
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button type="button" variant="outline" size="sm" onClick={() => {
                          const randomView = Math.floor(Math.random() * 26 + 15);
                          const randomLike = Math.floor(Math.random() * 26 + 15);
                          const randomMessage = Math.floor(Math.random() * 26 + 15);
                          setEditForm({
                            ...editForm,
                            view_count: randomView.toString(),
                            like_count: randomLike.toString(),
                            message_count: randomMessage.toString()
                          });
                        }}>
                              Gerar Contadores Aleatórios
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => {
                          const ratings = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
                          const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
                          const randomReviews = Math.floor(Math.random() * 200 + 50);
                          setEditForm({
                            ...editForm,
                            rating: randomRating.toString(),
                            review_count: randomReviews.toString()
                          });
                        }}>
                              Gerar Rating Aleatório
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="edit_is_featured" checked={editForm.is_featured} onChange={e => setEditForm({
                          ...editForm,
                          is_featured: e.target.checked
                        })} className="w-4 h-4" />
                            <Label htmlFor="edit_is_featured">Modelo em Destaque</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="edit_is_new" checked={editForm.is_new} onChange={e => setEditForm({
                          ...editForm,
                          is_new: e.target.checked
                        })} className="w-4 h-4" />
                            <Label htmlFor="edit_is_new">Modelo Nova</Label>
                          </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                          <Button type="submit" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Atualizar Perfil
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setSelectedCreatorId(null)} className="flex-1">
                            Cancelar
                          </Button>
                        </div>
                      </form> : <div className="text-center py-12">
                        <Edit className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Selecione uma Modelo</h3>
                        <p className="text-muted-foreground">
                          Escolha uma modelo da lista ao lado para editar seu perfil
                        </p>
                      </div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Content Tab */}
          <TabsContent value="manage-content">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Editar Conteúdo das Criadoras</CardTitle>
                <CardDescription>
                  Gerencie serviços, galeria e posts das criadoras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentManagement creators={creators} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Featured Models */}
          <TabsContent value="weekly-featured">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Modelos em Destaque da Semana</CardTitle>
                <CardDescription>
                  Gerencie as modelos que aparecem em destaque na página principal (máximo 5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Week Featured */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Modelos em Destaque Atuais</h3>
                      <div className="flex space-x-2">
                        <Button onClick={handleAutoRotate} variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Rotação Automática
                        </Button>
                        <Button onClick={handleSaveWeeklyFeatured} size="sm">
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                    
                    {weeklyFeatured.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        {weeklyFeatured.map((featured, index) => <div key={featured.id} className="text-center">
                            <div className="relative mb-2">
                              <Avatar className="w-16 h-16 mx-auto">
                                <AvatarImage src={featured.creators?.avatar_url} />
                                <AvatarFallback>{featured.creators?.display_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                                #{index + 1}
                              </Badge>
                              {featured.auto_selected && <Badge variant="outline" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                  Auto
                                </Badge>}
                            </div>
                            <p className="text-sm font-medium">{featured.creators?.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              ⭐ {featured.creators?.rating?.toFixed(1)} ({featured.creators?.review_count} avaliações)
                            </p>
                          </div>)}
                      </div> : <div className="text-center py-8 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">Nenhuma modelo em destaque para esta semana</p>
                      </div>}
                  </div>

                  {/* Select New Featured */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Selecionar Novas Modelos em Destaque</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Selecione até 5 modelos para destacar esta semana. {selectedWeeklyCreators.length}/5 selecionadas
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {creators.map(creator => <div key={creator.id} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedWeeklyCreators.includes(creator.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`} onClick={() => handleToggleWeeklyFeatured(creator.id)}>
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={creator.avatar_url} />
                                <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(creator.status)}`} />
                              {selectedWeeklyCreators.includes(creator.id) && <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-xs text-primary-foreground font-bold">
                                    {selectedWeeklyCreators.indexOf(creator.id) + 1}
                                  </span>
                                </div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{creator.display_name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{creator.location}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="text-xs text-yellow-500">⭐</span>
                                <span className="text-xs">{creator.rating?.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({creator.review_count})</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {creator.is_featured && <Badge variant="secondary" className="text-xs">Destaque</Badge>}
                                {creator.is_new && <Badge variant="outline" className="text-xs">Nova</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Como funciona:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Selecione manualmente até 5 modelos para destacar na semana</li>
                      <li>• Use "Rotação Automática" para selecionar automaticamente baseado no desempenho</li>
                      <li>• A rotação automática considera rating, número de avaliações e atividade</li>
                      <li>• As modelos em destaque aparecem na página principal da plataforma</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Creator */}
          <TabsContent value="add-creator">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Adicionar Nova Criadora</CardTitle>
                <CardDescription>
                  Preencha os dados para adicionar uma nova criadora à plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                

                <form onSubmit={handleCreateCreator} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Nome de Exibição</Label>
                      <Input id="display_name" value={newCreator.display_name} onChange={e => setNewCreator({
                      ...newCreator,
                      display_name: e.target.value
                    })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="starting_price">Preço Inicial (R$)</Label>
                      <Input id="starting_price" type="number" step="0.01" value={newCreator.starting_price} onChange={e => setNewCreator({
                      ...newCreator,
                      starting_price: e.target.value
                    })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (⭐ 1-5)</Label>
                      <Input id="rating" type="number" step="0.1" min="1" max="5" value={newCreator.rating} onChange={e => setNewCreator({
                      ...newCreator,
                      rating: e.target.value
                    })} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status Inicial</Label>
                    <Select value={newCreator.status} onValueChange={(value) => setNewCreator({
                      ...newCreator,
                      status: value as 'offline' | 'online' | 'busy'
                    })}>
                      <SelectTrigger className="w-full bg-gradient-to-r from-primary/5 to-pink-500/5 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/20">
                        <SelectItem value="online" className="text-green-600 font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Online - Disponível</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="busy" className="text-yellow-600 font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Ocupada - Em atendimento</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="offline" className="text-gray-600 font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span>Offline - Indisponível</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea id="bio" value={newCreator.bio} onChange={e => setNewCreator({
                    ...newCreator,
                    bio: e.target.value
                  })} rows={3} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar_url">URL do Avatar</Label>
                      <Input id="avatar_url" value={newCreator.avatar_url} onChange={e => setNewCreator({
                      ...newCreator,
                      avatar_url: e.target.value
                    })} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cover_image_url">URL da Imagem de Capa</Label>
                      <Input id="cover_image_url" value={newCreator.cover_image_url} onChange={e => setNewCreator({
                      ...newCreator,
                      cover_image_url: e.target.value
                    })} placeholder="https://..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input id="location" value={newCreator.location} onChange={e => setNewCreator({
                      ...newCreator,
                      location: e.target.value
                    })} placeholder="São Paulo, SP" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                      <Input id="tags" value={newCreator.tags} onChange={e => setNewCreator({
                      ...newCreator,
                      tags: e.target.value
                    })} placeholder="Brasileira, Sensual, Premium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="languages">Idiomas (separados por vírgula)</Label>
                      <Input id="languages" value={newCreator.languages} onChange={e => setNewCreator({
                      ...newCreator,
                      languages: e.target.value
                    })} placeholder="Português, Inglês" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review_count">Número de Avaliações</Label>
                      <Input id="review_count" type="number" min="0" value={newCreator.review_count} onChange={e => setNewCreator({
                      ...newCreator,
                      review_count: e.target.value
                    })} placeholder="128" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Criadora
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="creator-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                      <p className="text-3xl font-bold text-primary">{analytics.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="creator-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Criadoras Ativas</p>
                      <p className="text-3xl font-bold text-primary">{analytics.activeCreators}</p>
                    </div>
                    <UserPlus className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="creator-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                      <p className="text-3xl font-bold text-primary">R$ {(analytics.totalRevenue / 100).toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="creator-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vendas de Serviços</p>
                      <p className="text-3xl font-bold text-primary">{analytics.totalServiceSales}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Service Sales Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="creator-card">
                <CardHeader>
                  <CardTitle>Vendas por Tipo de Serviço</CardTitle>
                  <CardDescription>Distribuição das vendas por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.serviceTypeStats.map((stat) => (
                      <div key={stat.service_type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {stat.service_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{stat.count} vendas</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {(stat.total_amount / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="creator-card">
                <CardHeader>
                  <CardTitle>Estatísticas de Mimos</CardTitle>
                  <CardDescription>Presentes enviados na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total de Mimos</p>
                        <p className="text-2xl font-bold text-primary">{analytics.totalMimos}</p>
                      </div>
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Receita com Mimos</p>
                        <p className="text-2xl font-bold text-primary">R$ {(analytics.mimosRevenue / 100).toFixed(2)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Service Sales */}
            <Card className="creator-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Vendas Recentes de Serviços
                </CardTitle>
                <CardDescription>
                  Últimas vendas de pacotes e serviços
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.recentServiceSales.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Criadora</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.recentServiceSales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>{sale.client_name || 'Cliente'}</TableCell>
                            <TableCell>{sale.creator_name}</TableCell>
                            <TableCell>{sale.service_title}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {sale.service_type.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>R$ {(sale.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={sale.payment_status === 'completed' ? 'default' : 
                                        sale.payment_status === 'failed' ? 'destructive' : 'secondary'}
                              >
                                {sale.payment_status === 'completed' ? 'Pago' :
                                 sale.payment_status === 'failed' ? 'Falhou' :
                                 sale.payment_status === 'pending' ? 'Pendente' : 'Processando'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma venda registrada</h3>
                    <p className="text-muted-foreground">
                      As vendas de serviços aparecerão aqui conforme forem realizadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages">
            <ConversationManager />
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Configurações da Plataforma</CardTitle>
                <CardDescription>
                  Configurações gerais e preferências do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Gerenciar Contadores</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Atualize os contadores de visualizações, curtidas e mensagens de todas as modelos automaticamente
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleUpdateAllCounters} className="btn-hero">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Atualizar Todos os Contadores (15-40)
                      </Button>
                      <Button onClick={handleUpdateAllRatings} variant="outline" className="btn-hero">
                        ⭐ Gerar Ratings Aleatórios (4.2-5.0)
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Outras Configurações</h3>
                    <div className="text-center py-8">
                      <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Configurações Avançadas</h3>
                      <p className="text-muted-foreground">
                        Mais configurações estarão disponíveis em breve
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Gallery Manager Dialog */}
      {selectedCreatorId && (
        <GalleryManager
          creatorId={selectedCreatorId}
          isOpen={galleryManagerOpen}
          onOpenChange={setGalleryManagerOpen}
        />
      )}

      <Footer />
    </div>;
};
export default AdminDashboard;
