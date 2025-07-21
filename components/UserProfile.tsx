import { useState } from 'react';
import { User, Camera, Edit3, Mail, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCurrentUserProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';

export const UserProfile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useCurrentUserProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Perfil não encontrado. Faça login para continuar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = () => {
    setFormData({
      full_name: profile.full_name || '',
      display_name: profile.display_name || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData);
    setIsEditing(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'creator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'creator':
        return <Camera className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="relative mx-auto mb-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'Avatar'} />
            <AvatarFallback className="text-lg">
              {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 cursor-pointer transition-colors"
          >
            <Camera className="w-4 h-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploadAvatar.isPending}
            />
          </label>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-2xl">
            {isEditing ? (
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Seu nome completo"
                className="text-center text-2xl font-bold"
              />
            ) : (
              profile.full_name || 'Nome não informado'
            )}
          </CardTitle>
          
          <div className="flex items-center justify-center space-x-2">
            <Badge variant={getRoleBadgeVariant(profile.role)} className="flex items-center space-x-1">
              {getRoleIcon(profile.role)}
              <span className="capitalize">{profile.role}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{profile.email}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <h3 className="font-semibold">Nome de exibição</h3>
          {isEditing ? (
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Como você quer ser chamado..."
            />
          ) : (
            <p className="text-muted-foreground">
              {profile.display_name || 'Nenhum nome de exibição definido.'}
            </p>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex justify-center space-x-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};