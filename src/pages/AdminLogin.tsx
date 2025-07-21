import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(""); // Limpar erro ao digitar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log('🔧 Admin Login - Email:', formData.email);
      console.log('🔧 Admin Login - Senha length:', formData.password.length);
      
      // Fazer login via Supabase
      const { error } = await signIn(formData.email, formData.password);
      console.log('🔧 Admin Login - Resultado signIn:', { error });
      
      if (!error) {
        console.log('✅ Admin login bem-sucedido, redirecionando...');
        navigate("/admin-dashboard");
      } else {
        console.error('❌ Admin login falhou:', error);
        setError(`Erro na autenticação: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Erro no handleSubmit:', err);
      setError(`Erro ao fazer login: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6 btn-ghost-pink">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </Link>
          </Button>

          <Card className="creator-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-foreground font-montserrat">
                Acesso Administrativo
              </CardTitle>
              
              <CardDescription className="text-muted-foreground">
                Esta área é restrita para administradores da plataforma SexyHub
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Aviso de Segurança */}
              <Alert className="mb-6 border-orange-500/20 bg-orange-500/5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-200">
                  <strong>Área Restrita:</strong> Apenas administradores autorizados podem acessar esta seção.
                  Todas as ações são monitoradas e registradas.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email do Administrador</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@sexyhub.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-10 bg-background border-border focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha de Administrador</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha de acesso"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pl-10 pr-10 bg-background border-border focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <Alert className="border-red-500/20 bg-red-500/5">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Botão de Login */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Verificando..." : "Acessar Painel"}
                </Button>
              </form>

              {/* Informações Adicionais */}
              <div className="mt-6 p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-foreground mb-2">Funcionalidades do Painel:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gerenciamento completo de criadoras</li>
                  <li>• Moderação de conteúdo e mensagens</li>
                  <li>• Relatórios financeiros e analytics</li>
                  <li>• Sistema de suporte e tickets</li>
                  <li>• Configurações da plataforma</li>
                </ul>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Problemas de acesso? Entre em contato com o suporte técnico.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;
