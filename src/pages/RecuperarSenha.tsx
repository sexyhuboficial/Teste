import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (!error) {
        setEmailSent(true);
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
            <Link to="/login" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Login</span>
            </Link>
          </Button>

          <Card className="creator-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-foreground font-montserrat">
                {emailSent ? "Email Enviado!" : "Recuperar Senha"}
              </CardTitle>
              
              <CardDescription className="text-muted-foreground">
                {emailSent 
                  ? "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha."
                  : "Digite seu email para receber as instruções de recuperação de senha."
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {emailSent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      Um email foi enviado para <strong>{email}</strong> com as instruções para redefinir sua senha.
                    </p>
                  </div>
                  
                  <Button asChild className="w-full btn-hero">
                    <Link to="/login">Voltar ao Login</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-background border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full btn-hero"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Email de Recuperação"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RecuperarSenha;
