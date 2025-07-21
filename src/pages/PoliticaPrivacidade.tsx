import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PoliticaPrivacidade = () => {
  const sections = [
    {
      icon: UserCheck,
      title: "1. Informações que Coletamos",
      content: [
        "Informações de identificação pessoal: nome, email, telefone, endereço",
        "Informações de pagamento: dados do cartão, histórico de transações",
        "Informações de uso: páginas visitadas, tempo de navegação, preferências",
        "Informações técnicas: endereço IP, tipo de dispositivo, navegador utilizado",
        "Informações de comunicação: mensagens trocadas na plataforma"
      ]
    },
    {
      icon: Eye,
      title: "2. Como Usamos suas Informações",
      content: [
        "Fornecer e melhorar nossos serviços e funcionalidades",
        "Processar transações e pagamentos de forma segura",
        "Comunicar sobre atualizações, promoções e suporte ao cliente",
        "Personalizar sua experiência na plataforma",
        "Cumprir obrigações legais e regulamentares",
        "Prevenir fraudes e garantir a segurança da plataforma"
      ]
    },
    {
      icon: Database,
      title: "3. Compartilhamento de Dados",
      content: [
        "Não vendemos suas informações pessoais para terceiros",
        "Compartilhamos dados apenas quando necessário para operação dos serviços",
        "Provedores de pagamento recebem apenas informações necessárias para transações",
        "Autoridades competentes podem ter acesso mediante ordem judicial",
        "Parceiros de tecnologia têm acesso limitado para melhorar nossos serviços"
      ]
    },
    {
      icon: Lock,
      title: "4. Segurança dos Dados",
      content: [
        "Utilizamos criptografia SSL/TLS para todas as transmissões de dados",
        "Servidores protegidos com firewalls e sistemas de detecção de intrusão",
        "Acesso aos dados restrito apenas a funcionários autorizados",
        "Backups regulares e seguros para prevenir perda de dados",
        "Monitoramento 24/7 para detectar e prevenir atividades suspeitas",
        "Certificações de segurança ISO 27001 e SOC 2"
      ]
    },
    {
      icon: Shield,
      title: "5. Seus Direitos (LGPD)",
      content: [
        "Direito de acesso: solicitar cópia dos seus dados pessoais",
        "Direito de retificação: corrigir dados incorretos ou incompletos",
        "Direito de exclusão: solicitar a remoção dos seus dados",
        "Direito de portabilidade: transferir seus dados para outro serviço",
        "Direito de oposição: opor-se ao processamento de seus dados",
        "Direito de revisão: questionar decisões automatizadas"
      ]
    }
  ];

  const dataRetention = [
    { type: "Dados de conta", period: "Enquanto a conta estiver ativa" },
    { type: "Dados de pagamento", period: "5 anos após a última transação" },
    { type: "Logs de acesso", period: "12 meses" },
    { type: "Mensagens", period: "2 anos ou até exclusão manual" },
    { type: "Dados de suporte", period: "3 anos após resolução" }
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
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-montserrat">
            Política de <span className="text-primary">Privacidade</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transparência total sobre como protegemos e utilizamos seus dados
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Última atualização: Janeiro de 2024
          </p>
        </div>

        {/* Intro */}
        <Card className="creator-card bg-primary/5 border-primary/20 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Nosso Compromisso com sua Privacidade
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Na SexyHub, respeitamos e protegemos sua privacidade. Esta política explica 
              como coletamos, usamos, armazenamos e protegemos suas informações pessoais 
              de acordo com a Lei Geral de Proteção de Dados (LGPD) e as melhores práticas 
              internacionais de segurança.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="max-w-4xl mx-auto mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="creator-card mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-foreground">
                    <Icon className="w-6 h-6 text-primary mr-3" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-muted-foreground leading-relaxed flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Retention */}
        <Card className="creator-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-foreground">
              <Database className="w-6 h-6 text-primary mr-3" />
              6. Tempo de Retenção de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades 
              descritas nesta política:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Tipo de Dados</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Período de Retenção</th>
                  </tr>
                </thead>
                <tbody>
                  {dataRetention.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground">{item.type}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="creator-card mb-12">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              7. Cookies e Tecnologias Similares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <strong className="text-foreground">Cookies essenciais:</strong> necessários para o funcionamento da plataforma
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <strong className="text-foreground">Cookies de performance:</strong> ajudam a melhorar a velocidade e funcionalidade
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <strong className="text-foreground">Cookies de personalização:</strong> lembram suas preferências e configurações
                </li>
              </ul>
              <p>
                Você pode controlar os cookies através das configurações do seu navegador.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact DPO */}
        <Card className="creator-card bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Exercer seus Direitos
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Para exercer qualquer um dos seus direitos ou esclarecer dúvidas sobre 
              o tratamento dos seus dados, entre em contato com nosso Encarregado de Proteção de Dados.
            </p>
            <div className="space-y-2 text-muted-foreground mb-6">
              <p><strong className="text-foreground">Email:</strong> privacidade@sexyhub.com</p>
              <p><strong className="text-foreground">Telefone:</strong> +55 (11) 9999-9999</p>
              <p><strong className="text-foreground">Horário:</strong> Segunda a Sexta, 9h às 18h</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-hero">
                <Link to="/central-ajuda">Central de Ajuda</Link>
              </Button>
              <Button variant="outline" asChild className="btn-outline-pink">
                <Link to="/contato">Falar com DPO</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;
