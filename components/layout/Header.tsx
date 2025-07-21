import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Heart, MessageCircle, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/sexyhub-logo.png";
import { NotificationSystem } from "@/components/NotificationSystem";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: "Início", href: "/", icon: null },
    { name: "Explorar", href: "/explorar", icon: null },
    { name: "Favoritas", href: "/favoritas", icon: Heart },
    { name: "Chat", href: "/whatsapp-chat", icon: MessageCircle },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/90">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src={logoImage} 
              alt="SexyHub Logo" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-2xl font-bold text-foreground font-montserrat">
              Sexy<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActive(item.href)
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationSystem />
                <span className="text-sm text-muted-foreground">
                  Olá, {user.user_metadata?.full_name || user.email}
                </span>
                <Button variant="ghost" onClick={signOut} className="btn-ghost-pink">
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  asChild
                  className="btn-ghost-pink"
                >
                  <Link to="/login" className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Entrar</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="btn-outline-pink"
                >
                  <Link to="/admin-login" className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-0 z-50 bg-background/95 backdrop-blur-md animate-fade-in">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
                  <img 
                    src={logoImage} 
                    alt="SexyHub Logo" 
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <span className="text-2xl font-bold text-foreground font-montserrat">
                    Sexy<span className="text-primary">Hub</span>
                  </span>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Mobile Navigation Grid */}
              <nav className="grid grid-cols-2 gap-4 mb-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200 min-h-[120px] ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-foreground hover:text-primary hover:bg-primary/5 bg-card border border-border"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-8 h-8 mb-3" />}
                    <span className="font-medium text-lg">{item.name}</span>
                  </Link>
                ))}
              </nav>
              
              {/* User Section */}
              <div className="border-t border-border pt-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-card rounded-xl border border-border">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">Cliente Premium</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }} 
                      className="w-full justify-center py-3 btn-outline-pink"
                    >
                      Sair da Conta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      asChild 
                      className="w-full py-4 btn-hero"
                    >
                      <Link to="/login" className="flex items-center justify-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Entrar na Conta</span>
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      asChild 
                      className="w-full py-3 btn-outline-pink"
                    >
                      <Link to="/admin-login" className="flex items-center justify-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Acesso Administrativo</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;