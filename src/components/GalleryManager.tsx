import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
import { 
  GripVertical, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Image as ImageIcon,
  Star
} from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_type: string;
  media_url: string;
  is_featured: boolean;
  display_order?: number;
  creator_id: string;
  created_at?: string;
}

interface GalleryManagerProps {
  creatorId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GalleryManager = ({ creatorId, isOpen, onOpenChange }: GalleryManagerProps) => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchGallery();
    }
  }, [isOpen, creatorId]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('creator_gallery')
        .select('*')
        .eq('creator_id', creatorId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Garantir que todos os itens tenham display_order
      const galleryWithOrder = (data || []).map((item: any, index) => ({
        ...item,
        display_order: item.display_order ?? index
      }));
      
      setGallery(galleryWithOrder);
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar galeria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newGallery = Array.from(gallery);
    const [reorderedItem] = newGallery.splice(result.source.index, 1);
    newGallery.splice(result.destination.index, 0, reorderedItem);

    // Atualizar ordem de exibição
    const updatedGallery = newGallery.map((item, index) => ({
      ...item,
      display_order: index
    }));

    setGallery(updatedGallery);

    // Salvar nova ordem no banco
    try {
      const updates = updatedGallery.map(item => ({
        id: item.id,
        display_order: item.display_order
      }));

      for (const update of updates) {
        const { error } = await supabase.functions.invoke('update-gallery-order', {
          body: {
            gallery_id: update.id,
            new_order: update.display_order
          }
        });
        if (error) throw error;
      }

      toast({
        title: "Ordem atualizada",
        description: "A ordem das fotos foi atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar nova ordem",
        variant: "destructive",
      });
      fetchGallery(); // Recarregar dados originais
    }
  };

  const handleSaveItem = async (formData: FormData) => {
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const mediaUrl = formData.get('media_url') as string;
      const isFeatured = formData.get('is_featured') === 'true';

      if (editingItem) {
        // Atualizar item existente
        const { error } = await supabase
          .from('creator_gallery')
          .update({
            title,
            description,
            media_url: mediaUrl,
            is_featured: isFeatured
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Item atualizado",
          description: "Item da galeria atualizado com sucesso",
        });
      } else {
        // Criar novo item
        const maxOrder = Math.max(...gallery.map(item => item.display_order || 0), -1);
        
        const { error } = await supabase
          .from('creator_gallery')
          .insert({
            creator_id: creatorId,
            title,
            description,
            media_url: mediaUrl,
            media_type: 'image',
            is_featured: isFeatured,
            display_order: maxOrder + 1
          });

        if (error) throw error;

        toast({
          title: "Item adicionado",
          description: "Novo item adicionado à galeria",
        });
      }

      setEditingItem(null);
      setIsAddDialogOpen(false);
      fetchGallery();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('creator_gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item removido",
        description: "Item removido da galeria",
      });

      fetchGallery();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover item",
        variant: "destructive",
      });
    }
  };

  const GalleryItemForm = ({ item, onSubmit }: { item?: GalleryItem; onSubmit: (data: FormData) => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            defaultValue={item?.title || ''}
            placeholder="Título da imagem"
          />
        </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={item?.description || ''}
          placeholder="Descrição da imagem"
        />
      </div>

      <div>
        <Label htmlFor="media_url">URL da Imagem</Label>
        <Input
          id="media_url"
          name="media_url"
          defaultValue={item?.media_url || ''}
          placeholder="https://exemplo.com/imagem.jpg"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_featured"
          name="is_featured"
          defaultChecked={item?.is_featured || false}
        />
        <Label htmlFor="is_featured">Destacar esta imagem</Label>
      </div>

        <Button type="submit" className="w-full">
          {item ? 'Atualizar' : 'Adicionar'}
        </Button>
      </form>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Gerenciar Galeria</span>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Foto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Foto</DialogTitle>
                </DialogHeader>
                <GalleryItemForm onSubmit={handleSaveItem} />
              </DialogContent>
            </Dialog>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {gallery.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>

                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                              <img
                                src={item.media_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              {item.is_featured && (
                                <div className="absolute top-1 right-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h3 className="font-medium">{item.title || 'Sem título'}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.description || 'Sem descrição'}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                Posição: {index + 1}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Foto</DialogTitle>
                                  </DialogHeader>
                                  <GalleryItemForm item={item} onSubmit={handleSaveItem} />
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </DialogContent>
    </Dialog>
  );
};