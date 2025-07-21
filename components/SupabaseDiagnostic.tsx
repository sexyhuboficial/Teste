import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SupabaseDiagnostic = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testando conexão com Supabase...');
        
        // Teste básico de conexão
        const { data, error } = await supabase.from('creators').select('count').limit(1);
        
        if (error) {
          console.error('Erro na conexão:', error);
          setError(error.message);
          setConnectionStatus('error');
        } else {
          console.log('Conexão bem-sucedida:', data);
          setConnectionStatus('connected');
        }
      } catch (err: any) {
        console.error('Erro no teste de conexão:', err);
        setError(err.message || 'Erro desconhecido');
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  if (connectionStatus === 'testing') {
    return (
      <div className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded shadow-lg z-50">
        🔄 Testando conexão Supabase...
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded shadow-lg z-50 max-w-sm">
        ❌ Erro Supabase: {error}
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded shadow-lg z-50">
      ✅ Supabase conectado
    </div>
  );
};