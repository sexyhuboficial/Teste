import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  User, 
  ArrowRight,
  Heart,
  Lock
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Mensagens = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar automaticamente para o WhatsApp Chat se logado
    if (user) {
      navigate('/whatsapp-chat');
    }
  }, [user, navigate]);

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
                  <MessageCircle className="w-10 h-10 text-primary-foreground" />
                </div>
                
                <CardTitle className="text-3xl font-bold text-foreground font-montserrat">
                  Acesso ao Chat Privado
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-lg">
                  Para conversar com as criadoras e acessar conteúdo exclusivo, 
                  você precisa criar uma conta ou fazer login.
                </p>
                
                {/* Benefícios */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center">
                    <Heart className="w-5 h-5 text-primary mr-2" />
                    O que você terá acesso:
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Chat privado e seguro</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Conteúdo personalizado</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Chamadas de vídeo</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <span className="text-muted-foreground">Experiências exclusivas</span>
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
                
                {/* Segurança */}
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground pt-4 border-t border-border">
                  <Lock className="w-4 h-4" />
                  <span>100% Seguro e Verificado</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Se estiver logado, o useEffect já irá redirecionar
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-2xl text-foreground">Redirecionando para o chat...</div>
      </div>
      <Footer />
    </div>
  );
};

export default Mensagens;