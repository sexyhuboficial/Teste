import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft,
  Shield,
  Heart,
  Users,
  Zap,
  Award,
  Globe,
  Lock,
  Star
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SobreNos = () => {
  const values = [
    {
      icon: Shield,
      title: "Segurança",
      description: "Proteção total dos dados e privacidade de todos os usuários"
    },
    {
      icon: Heart,
      title: "Respeito",
      description: "Ambiente respeitoso e livre de julgamentos para todos"
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Construindo conexões autênticas e significativas"
    },
    {
      icon: Zap,
      title: "Inovação",
      description: "Tecnologia de ponta para a melhor experiência"
    }
  ];

  const stats = [
    { number: "500+", label: "Criadoras Verificadas" },
    { number: "10k+", label: "Usuários Ativos" },
    { number: "99.9%", label: "Uptime da Plataforma" },
    { number: "24/7", label: "Suporte Disponível" }
  ];

  const team = [
    {
      name: "Ana Silva",
      role: "CEO & Fundadora",
      image: "https://images.unsplash.com/photo-1494790108755-2616c9daa828?w=300&h=300&fit=crop&crop=face",
      description: "Visionária da plataforma com mais de 10 anos de experiência em tecnologia"
    },
    {
      name: "Carlos Mendes",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      description: "Especialista em segurança digital e arquitetura de sistemas"
    },
    {
      name: "Juliana Costa",
      role: "Head de Produto",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      description: "Designer de experiência focada em inovação e usabilidade"
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

        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-montserrat">
            Sobre a <span className="text-primary">SexyHub</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Somos uma plataforma inovadora que conecta criadoras de conteúdo premium 
            com uma audiência que valoriza autenticidade, qualidade e experiências exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="btn-hero">
              <Link to="/explorar">Conhecer Criadoras</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="btn-outline-pink">
              <Link to="/central-ajuda">Central de Ajuda</Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="creator-card text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <Card className="creator-card">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-montserrat">
                  Nossa Missão
                </h2>
                <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                  Criamos um espaço seguro e respeitoso onde criadoras podem expressar sua 
                  criatividade e construir relacionamentos autênticos com seus fãs, 
                  sempre priorizando a segurança, privacidade e bem-estar de todos.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Story */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-montserrat">
                Nossa História
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  A SexyHub nasceu da visão de criar uma plataforma que respeitasse 
                  tanto criadoras quanto usuários, oferecendo um ambiente seguro e 
                  profissional para conexões autênticas.
                </p>
                <p>
                  Desde o nosso lançamento, temos crescido constantemente, sempre 
                  mantendo nossos valores fundamentais de segurança, respeito e inovação. 
                  Nossa equipe trabalha incansavelmente para oferecer a melhor experiência possível.
                </p>
                <p>
                  Hoje, somos a plataforma preferida de centenas de criadoras verificadas 
                  e milhares de usuários que confiam em nossa tecnologia e valores.
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <span className="text-muted-foreground">4.9/5 avaliação dos usuários</span>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
                alt="Equipe trabalhando" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-montserrat">
              Nossa Equipe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Profissionais dedicados que trabalham para criar a melhor experiência para você
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="creator-card">
                <CardContent className="p-6 text-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="mb-16">
          <Card className="creator-card bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-montserrat">
                Segurança em Primeiro Lugar
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                Utilizamos as mais avançadas tecnologias de criptografia e proteção de dados. 
                Seus dados pessoais e financeiros são protegidos com certificados SSL, 
                autenticação multifator e monitoramento 24/7.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-background/50 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm">SSL Certificado</span>
                </div>
                <div className="flex items-center space-x-2 bg-background/50 px-4 py-2 rounded-full">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm">LGPD Compliance</span>
                </div>
                <div className="flex items-center space-x-2 bg-background/50 px-4 py-2 rounded-full">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm">ISO 27001</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default SobreNos;