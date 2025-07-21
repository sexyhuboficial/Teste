import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const PaymentDebug = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPaymentSystems = async () => {
    if (!user) {
      setDebugInfo({ error: "User not authenticated" });
      return;
    }

    setLoading(true);
    try {
      // Test 1: Check if user has profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Test 2: Check if creators table is accessible
      const { data: creators, error: creatorsError } = await supabase
        .from('creators')
        .select('id, display_name')
        .limit(1);

      // Test 3: Check if creator_services table is accessible
      const { data: services, error: servicesError } = await supabase
        .from('creator_services')
        .select('id, title, price')
        .limit(1);

      // Test 4: Check mimos table
      const { data: mimos, error: mimosError } = await supabase
        .from('mimos')
        .select('id, amount, payment_status')
        .limit(1);

      // Test 5: Check service_payments table
      const { data: payments, error: paymentsError } = await supabase
        .from('service_payments')
        .select('id, amount, payment_status')
        .limit(1);

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          authenticated: !!user
        },
        profile: {
          data: profile,
          error: profileError?.message
        },
        creators: {
          data: creators,
          error: creatorsError?.message,
          count: creators?.length || 0
        },
        services: {
          data: services,
          error: servicesError?.message,
          count: services?.length || 0
        },
        mimos: {
          data: mimos,
          error: mimosError?.message,
          accessible: !mimosError
        },
        payments: {
          data: payments,
          error: paymentsError?.message,
          accessible: !paymentsError
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bug className="w-4 h-4" />
          Debug Pagamentos
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Sistema de Debug - Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testPaymentSystems} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testando..." : "Executar Testes"}
            </Button>
            
            {debugInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Usuário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={debugInfo.user?.authenticated ? "default" : "destructive"}>
                        {debugInfo.user?.authenticated ? "Autenticado" : "Não autenticado"}
                      </Badge>
                      <p className="text-xs mt-1">{debugInfo.user?.email}</p>
                    </CardContent>
                  </Card>

                  {/* Profile */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Perfil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={debugInfo.profile?.error ? "destructive" : "default"}>
                        {debugInfo.profile?.error ? "Erro" : "OK"}
                      </Badge>
                      {debugInfo.profile?.error && (
                        <p className="text-xs mt-1 text-red-600">{debugInfo.profile.error}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Creators */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Criadores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={debugInfo.creators?.error ? "destructive" : "default"}>
                        {debugInfo.creators?.error ? "Erro" : `${debugInfo.creators?.count || 0} encontrados`}
                      </Badge>
                      {debugInfo.creators?.error && (
                        <p className="text-xs mt-1 text-red-600">{debugInfo.creators.error}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Services */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Serviços</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={debugInfo.services?.error ? "destructive" : "default"}>
                        {debugInfo.services?.error ? "Erro" : `${debugInfo.services?.count || 0} encontrados`}
                      </Badge>
                      {debugInfo.services?.error && (
                        <p className="text-xs mt-1 text-red-600">{debugInfo.services.error}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Mimos */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Tabela Mimos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={debugInfo.mimos?.accessible ? "default" : "destructive"}>
                        {debugInfo.mimos?.accessible ? "Acessível" : "Erro"}
                      </Badge>
                      {debugInfo.mimos?.error && (
                        <p className="text-xs mt-1 text-red-600">{debugInfo.mimos.error}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Service Payments */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Pagamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={debugInfo.payments?.accessible ? "default" : "destructive"}>
                        {debugInfo.payments?.accessible ? "Acessível" : "Erro"}
                      </Badge>
                      {debugInfo.payments?.error && (
                        <p className="text-xs mt-1 text-red-600">{debugInfo.payments.error}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Raw Data */}
                <details className="text-xs">
                  <summary className="cursor-pointer">Dados completos (JSON)</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-60">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};