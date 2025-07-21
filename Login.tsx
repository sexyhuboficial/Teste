import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Heart,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          navigate("/");
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (!error) {
          setIsLogin(true);
          setFormData(prev => ({ 
            ...prev, 
            name: "",
            password: "", 
            confirmPassword: "" 
          }));
        }
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
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
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-foreground font-montserrat">
                {isLogin ? "Bem-vindo de volta!" : "Junte-se à SexyHub"}
              </CardTitle>
              
              <CardDescription className="text-muted-foreground">
                {isLogin 
                  ? "Entre na sua conta para acessar conteúdo exclusivo" 
                  : "Crie sua conta e conecte-se com criadoras verificadas"
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome (apenas no registro) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Nome completo</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-10 bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pl-10 pr-10 bg-background border-border focus:border-primary"
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

                {/* Confirmar Senha (apenas no registro) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="pl-10 bg-background border-border focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Esqueci a senha (apenas no login) */}
                {isLogin && (
                  <div className="text-right">
                    <Link 
                      to="/recuperar-senha" 
                      className="text-sm text-primary hover:text-primary-glow transition-colors"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </div>
                )}

                {/* Botão de submissão */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full btn-hero"
                  disabled={loading || authLoading}
                >
                  {loading ? "Processando..." : (isLogin ? "Entrar" : "Criar Conta")}
                </Button>
              </form>

              <Separator className="my-6" />

              {/* Alternar entre login/registro */}
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}
                </p>
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full btn-outline-pink"
                >
                  {isLogin ? "Criar Conta Grátis" : "Fazer Login"}
                </Button>
              </div>

              {/* Benefícios (apenas no registro) */}
              {!isLogin && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center">
                    <Heart className="w-4 h-4 text-primary mr-2" />
                    Benefícios da sua conta
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center">
                      <ShieldCheck className="w-3 h-3 text-primary mr-2" />
                      Acesso a criadoras verificadas
                    </li>
                    <li className="flex items-center">
                      <ShieldCheck className="w-3 h-3 text-primary mr-2" />
                      Chat privado e seguro
                    </li>
                    <li className="flex items-center">
                      <ShieldCheck className="w-3 h-3 text-primary mr-2" />
                      Conteúdo exclusivo e personalizado
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;