import { Link } from "react-router-dom";
import { Shield, Heart, MessageCircle, HelpCircle, Info } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground">
                S
              </div>
              <span className="text-xl font-bold text-foreground font-montserrat">
                Sexy<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              A plataforma premium que conecta você com criadoras verificadas do mundo todo.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary" />
              <span>100% Verificadas</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  to="/explorar" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Explorar Criadoras
                </Link>
              </li>
              <li>
                <Link 
                  to="/favoritas" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Favoritas
                </Link>
              </li>
              <li>
                <Link 
                  to="/whatsapp-chat" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/suporte" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Suporte
                </Link>
              </li>
              <li>
                <Link 
                  to="/central-ajuda" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link 
                  to="/sobre-nos" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <Info className="w-4 h-4 mr-1" />
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link 
                  to="/termos-uso" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/politica-privacidade" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Acesso Admin */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Administrativo</h3>
            <Link 
              to="/admin-login" 
              className="inline-flex items-center space-x-2 bg-secondary hover:bg-primary/10 border border-border hover:border-primary text-muted-foreground hover:text-primary px-4 py-2 rounded-lg transition-all duration-200 text-sm"
            >
              <Shield className="w-4 h-4" />
              <span>Acesso de Administrador</span>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              Área restrita para gerenciamento da plataforma
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SexyHub. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-xs text-muted-foreground">
              Plataforma segura e verificada
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-online rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Sistema ativo</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;