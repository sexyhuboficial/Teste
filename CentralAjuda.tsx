import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  ArrowLeft,
  HelpCircle,
  Shield,
  CreditCard,
  Users,
  Settings
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const CentralAjuda = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      id: "1",
      category: "conta",
      question: "Como criar uma conta na SexyHub?",
      answer: "Para criar uma conta, clique em 'Criar Conta Grátis' na página inicial. Preencha seus dados pessoais, confirme seu email e pronto! Você já pode começar a explorar nossa plataforma."
    },
    {
      id: "2", 
      category: "pagamento",
      question: "Quais formas de pagamento são aceitas?",
      answer: "Aceitamos cartões de crédito e débito (Visa, Mastercard, American Express), PIX, boleto bancário e carteiras digitais como PayPal e PagSeguro."
    },
    {
      id: "3",
      category: "seguranca",
      question: "Meus dados estão seguros na plataforma?",
      answer: "Sim! Utilizamos criptografia de ponta a ponta, certificados SSL e seguimos as melhores práticas de segurança. Seus dados pessoais e financeiros são protegidos com a máxima segurança."
    },
    {
      id: "4",
      category: "conta",
      question: "Como alterar minha senha?",
      answer: "Acesse 'Minha Conta' > 'Configurações' > 'Segurança' e clique em 'Alterar Senha'. Digite sua senha atual e a nova senha duas vezes para confirmar."
    },
    {
      id: "5",
      category: "criadoras",
      question: "Como funciona a verificação das criadoras?",
      answer: "Todas as criadoras passam por um rigoroso processo de verificação que inclui documentos de identidade, comprovação de endereço e verificação em vídeo para garantir autenticidade."
    },
    {
      id: "6",
      category: "pagamento",
      question: "Como cancelar uma assinatura?",
      answer: "Você pode cancelar sua assinatura a qualquer momento em 'Minha Conta' > 'Assinaturas'. O cancelamento é efetivo no final do período atual."
    }
  ];

  const categories = [
    { id: "conta", name: "Conta e Perfil", icon: Users },
    { id: "pagamento", name: "Pagamentos", icon: CreditCard },
    { id: "seguranca", name: "Segurança", icon: Shield },
    { id: "criadoras", name: "Criadoras", icon: Users },
    { id: "geral", name: "Ajuda Geral", icon: Settings }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Central de <span className="text-primary">Ajuda</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas rápidas para suas dúvidas ou entre em contato conosco
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar ajuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg bg-card border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="w-full justify-start hover:bg-primary/10"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="creator-card mt-6">
              <CardHeader>
                <CardTitle>Precisa de mais ajuda?</CardTitle>
                <CardDescription>
                  Nossa equipe está sempre pronta para ajudar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full btn-outline-pink">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat ao Vivo
                </Button>
                <Button variant="outline" className="w-full btn-outline-pink">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" className="w-full btn-outline-pink">
                  <Phone className="w-4 h-4 mr-2" />
                  Telefone
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <Card className="creator-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription>
                  {filteredFaqs.length} perguntas encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border border-border rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma pergunta encontrada</h3>
                    <p className="text-muted-foreground mb-4">
                      Tente usar outros termos ou entre em contato conosco
                    </p>
                    <Button className="btn-hero">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Falar com Suporte
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CentralAjuda;