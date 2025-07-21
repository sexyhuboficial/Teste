import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Shield, AlertTriangle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TermosUso = () => {
  const sections = [
    {
      title: "1. Aceitação dos Termos",
      content: [
        "Ao acessar e usar a plataforma SexyHub, você concorda em cumprir e estar vinculado a estes Termos de Uso.",
        "Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.",
        "Reservamo-nos o direito de modificar estes termos a qualquer momento, sendo as alterações efetivas após a publicação."
      ]
    },
    {
      title: "2. Elegibilidade e Conta de Usuário",
      content: [
        "Você deve ter pelo menos 18 anos de idade para usar esta plataforma.",
        "É necessário fornecer informações precisas e atualizadas durante o registro.",
        "Você é responsável por manter a confidencialidade de sua conta e senha.",
        "Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta."
      ]
    },
    {
      title: "3. Conduta do Usuário",
      content: [
        "Você concorda em usar a plataforma apenas para fins legais e de acordo com estes termos.",
        "É proibido compartilhar, distribuir ou revender conteúdo obtido através da plataforma.",
        "Não é permitido assediar, intimidar ou ameaçar outros usuários ou criadoras.",
        "O uso de linguagem ofensiva, discriminatória ou inadequada é estritamente proibido."
      ]
    },
    {
      title: "4. Conteúdo e Propriedade Intelectual",
      content: [
        "Todo o conteúdo na plataforma é propriedade das respectivas criadoras ou da SexyHub.",
        "Você recebe apenas uma licença limitada para visualizar o conteúdo para uso pessoal.",
        "É proibida a gravação, captura de tela ou distribuição de qualquer conteúdo.",
        "Violações de direitos autorais podem resultar no encerramento imediato da conta."
      ]
    },
    {
      title: "5. Pagamentos e Reembolsos",
      content: [
        "Todos os pagamentos são processados por provedores terceirizados seguros.",
        "Os preços podem variar e estão sujeitos a alterações sem aviso prévio.",
        "Reembolsos são concedidos apenas em circunstâncias excepcionais, a critério da SexyHub.",
        "Você é responsável por todos os impostos aplicáveis às suas transações."
      ]
    },
    {
      title: "6. Privacidade e Proteção de Dados",
      content: [
        "Levamos sua privacidade a sério e protegemos seus dados pessoais.",
        "Consulte nossa Política de Privacidade para detalhes sobre coleta e uso de dados.",
        "Implementamos medidas de segurança técnicas e organizacionais adequadas.",
        "Você tem direitos sobre seus dados pessoais conforme a LGPD."
      ]
    },
    {
      title: "7. Suspensão e Encerramento",
      content: [
        "Podemos suspender ou encerrar sua conta por violação destes termos.",
        "Você pode encerrar sua conta a qualquer momento através das configurações.",
        "Após o encerramento, você perde o acesso a todo o conteúdo e serviços.",
        "Algumas disposições destes termos permanecerão em vigor após o encerramento."
      ]
    },
    {
      title: "8. Limitação de Responsabilidade",
      content: [
        "A SexyHub não se responsabiliza por danos indiretos ou consequenciais.",
        "Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.",
        "Não garantimos que o serviço será ininterrupto ou livre de erros.",
        "Você usa a plataforma por sua própria conta e risco."
      ]
    },
    {
      title: "9. Lei Aplicável",
      content: [
        "Estes termos são regidos pelas leis brasileiras.",
        "Quaisquer disputas serão resolvidas nos tribunais competentes do Brasil.",
        "Se alguma disposição for considerada inválida, as demais permanecem em vigor.",
        "A falha em exercer qualquer direito não constitui renúncia a esse direito."
      ]
    },
    {
      title: "10. Contato",
      content: [
        "Para dúvidas sobre estes termos, entre em contato conosco:",
        "Email: legal@sexyhub.com",
        "Telefone: +55 (11) 9999-9999",
        "Endereço: São Paulo, SP, Brasil"
      ]
    }
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
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-montserrat">
            Termos de <span className="text-primary">Uso</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Última atualização: Janeiro de 2024
          </p>
        </div>

        {/* Important Notice */}
        <Card className="creator-card border-orange-200 bg-orange-50/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Importante</h3>
                <p className="text-muted-foreground">
                  Por favor, leia atentamente estes Termos de Uso antes de usar nossa plataforma. 
                  Ao continuar a usar nossos serviços, você concorda com todos os termos descritos abaixo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto">
          {sections.map((section, index) => (
            <Card key={index} className="creator-card mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground leading-relaxed">
                      {item.includes(':') ? (
                        <span>
                          <strong className="text-foreground">{item.split(':')[0]}:</strong>
                          {item.split(':').slice(1).join(':')}
                        </span>
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="creator-card bg-primary/5 border-primary/20 mt-12">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Dúvidas sobre os Termos?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nossa equipe jurídica está disponível para esclarecer qualquer questão 
              relacionada aos nossos Termos de Uso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-hero">
                <Link to="/central-ajuda">Central de Ajuda</Link>
              </Button>
              <Button variant="outline" asChild className="btn-outline-pink">
                <Link to="/contato">Entrar em Contato</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default TermosUso;