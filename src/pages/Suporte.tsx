import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Suporte = () => {
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    priority: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para criar um ticket de suporte",
        variant: "destructive",
      });
      return;
    }

    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o assunto e a descrição",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: ticketForm.subject.trim(),
          description: ticketForm.description.trim(),
          priority: ticketForm.priority,
          status: 'open'
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Ticket criado com sucesso!",
        description: "Nossa equipe entrará em contato em breve.",
      });

      setTicketForm({
        subject: "",
        description: "",
        priority: "medium"
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar ticket de suporte",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Chat ao Vivo",
      description: "Disponível das 9h às 18h",
      action: "Iniciar Chat",
      available: true
    },
    {
      icon: Mail,
      title: "Email",
      description: "suporte@sexyhub.com",
      action: "Enviar Email",
      available: true
    },
    {
      icon: Phone,
      title: "Telefone",
      description: "+55 (11) 99999-9999",
      action: "Ligar Agora",
      available: true
    }
  ];

  const quickLinks = [
    { title: "Central de Ajuda", href: "/central-ajuda", description: "Perguntas frequentes e guias" },
    { title: "Sobre Nós", href: "/sobre-nos", description: "Conheça nossa empresa" },
    { title: "Termos de Uso", href: "/termos-uso", description: "Condições de uso da plataforma" },
    { title: "Política de Privacidade", href: "/politica-privacidade", description: "Como protegemos seus dados" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 btn-ghost-pink">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-montserrat">
            Central de <span className="text-primary">Suporte</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Support Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card key={option.title} className="creator-card text-center">
                    <CardContent className="pt-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{option.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                      <Button 
                        variant="outline" 
                        className="w-full btn-outline-pink"
                        disabled={!option.available}
                      >
                        {option.action}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Support Ticket Form */}
            <Card className="creator-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Criar Ticket de Suporte
                </CardTitle>
                <CardDescription>
                  Descreva seu problema ou dúvida e nossa equipe responderá em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Ticket criado com sucesso!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Nossa equipe analisará sua solicitação e entrará em contato em breve.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSubmitted(false)}
                      className="btn-outline-pink"
                    >
                      Criar Outro Ticket
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-6">
                    {!user && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-orange-800 text-sm">
                          <strong>Nota:</strong> Você precisa estar logado para criar um ticket de suporte.{" "}
                          <Link to="/login" className="text-primary hover:underline">
                            Fazer login
                          </Link>
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Assunto *
                        </label>
                        <Input
                          id="subject"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                          placeholder="Descreva brevemente o problema"
                          required
                          disabled={!user}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="priority" className="text-sm font-medium">
                          Prioridade
                        </label>
                        <Select 
                          value={ticketForm.priority} 
                          onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                          disabled={!user}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Descrição *
                      </label>
                      <Textarea
                        id="description"
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        placeholder="Descreva detalhadamente seu problema ou dúvida..."
                        rows={6}
                        required
                        disabled={!user}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-hero"
                      disabled={isSubmitting || !user}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Ticket
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Links Sidebar */}
          <div className="space-y-6">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Links Úteis</CardTitle>
                <CardDescription>
                  Acesse rapidamente outras seções importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickLinks.map((link) => (
                  <Button
                    key={link.title}
                    variant="ghost"
                    asChild
                    className="w-full justify-start h-auto p-3 hover:bg-primary/10"
                  >
                    <Link to={link.href} className="flex flex-col items-start">
                      <span className="font-medium">{link.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {link.description}
                      </span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="creator-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Horário de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Segunda - Sexta:</span>
                  <span className="font-medium">9h às 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado:</span>
                  <span className="font-medium">9h às 14h</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span className="text-muted-foreground">Fechado</span>
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  * Os tickets criados fora do horário comercial serão atendidos no próximo dia útil
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Suporte;
