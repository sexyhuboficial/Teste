import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Calendar,
  Heart,
  MessageCircle,
  Settings,
  Upload,
  Save,
  Edit3,
  Lock
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        display_name: data.display_name || '',
        avatar_url: data.avatar_url || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil do usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          display_name: formData.display_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground font-montserrat">Meu Perfil</h1>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Sair da Conta
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="favorites">Favoritas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="creator-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Informações do Perfil</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn-outline-pink"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={formData.avatar_url || profile?.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {(formData.display_name || profile?.display_name || profile?.full_name || profile?.email)?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                      <div className="flex-1">
                        <Label htmlFor="avatar_url">URL do Avatar</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="avatar_url"
                            value={formData.avatar_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                            placeholder="URL da imagem do avatar"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display_name">Nome de Exibição</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={profile?.email || ''}
                          disabled
                          className="pl-10 bg-muted"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Tipo de Conta</Label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {profile?.role || 'cliente'}
                        </Badge>
                        {profile?.role === 'admin' && (
                          <Badge variant="default" className="bg-purple-600">
                            Administrador
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Membro desde {new Date(profile?.created_at || '').toLocaleDateString('pt-BR')}</span>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="btn-hero"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card className="creator-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <span>Suas Favoritas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Acesse suas favoritas
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Veja e gerencie suas criadoras favoritas
                    </p>
                    <Button asChild className="btn-hero">
                      <a href="/favoritas">Ver Favoritas</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="creator-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Configurações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Account Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Conta</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <Button variant="outline" className="justify-start">
                        <Lock className="w-4 h-4 mr-2" />
                        Alterar Senha
                      </Button>
                      
                      <Button variant="outline" className="justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Preferências de Email
                      </Button>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Privacidade</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Notificações Push</p>
                          <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Visibilidade do Perfil</p>
                          <p className="text-sm text-muted-foreground">Controlar quem pode ver seu perfil</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="space-y-4 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-red-600">Zona de Perigo</h3>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="text-sm text-red-800 mb-3">
                        Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                      </p>
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        Excluir Conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;