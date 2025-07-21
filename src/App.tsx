import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseDiagnostic } from "@/components/SupabaseDiagnostic";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Explorar from "./pages/Explorar";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CreatorProfile from "./pages/CreatorProfile";
import Mensagens from "./pages/Mensagens";
import WhatsAppChat from "./pages/WhatsAppChat";
import Favoritas from "./pages/Favoritas";
import CentralAjuda from "./pages/CentralAjuda";
import Suporte from "./pages/Suporte";
import SobreNos from "./pages/SobreNos";
import TermosUso from "./pages/TermosUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import RecuperarSenha from "./pages/RecuperarSenha";
import UserProfile from "./pages/UserProfile";
import MimosHistory from "./pages/MimosHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupabaseDiagnostic />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/criadora/:id" element={<CreatorProfile />} />
          <Route path="/mensagens" element={<ProtectedRoute><Mensagens /></ProtectedRoute>} />
          <Route path="/whatsapp-chat" element={<ProtectedRoute><WhatsAppChat /></ProtectedRoute>} />
          <Route path="/favoritas" element={<ProtectedRoute><Favoritas /></ProtectedRoute>} />
          <Route path="/central-ajuda" element={<CentralAjuda />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/sobre-nos" element={<SobreNos />} />
          <Route path="/termos-uso" element={<TermosUso />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/perfil" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/mimos-history" element={<ProtectedRoute><MimosHistory /></ProtectedRoute>} />
          <Route path="/mimos/success" element={<ProtectedRoute><MimosHistory /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
