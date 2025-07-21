import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, Star } from "lucide-react";
import { useServicePayments } from "@/hooks/useServicePayments";

interface Creator {
  id: string;
  display_name: string;
  avatar_url: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  service_type: string;
  price: number;
  duration_minutes: number;
}

interface ServicePaymentDialogProps {
  service: Service;
  creator: Creator;
  children?: React.ReactNode;
}

const SERVICE_TYPE_LABELS = {
  sexting: "Sexting",
  chamada_video: "Chamada de Vídeo",
  pack_conteudo: "Pack de Conteúdo",
  custom: "Personalizado"
};

export const ServicePaymentDialog = ({ service, creator, children }: ServicePaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { createServicePayment, loading } = useServicePayments();

  const handlePayment = async () => {
    try {
      const result = await createServicePayment(service.id);
      if (result) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Error in handlePayment:', error);
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${(price / 100).toFixed(2)}`;
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'sexting':
        return '💬';
      case 'chamada_video':
        return '📹';
      case 'pack_conteudo':
        return '📦';
      default:
        return '⭐';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Comprar Agora
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getServiceIcon(service.service_type)}</span>
            Comprar Serviço
          </DialogTitle>
          <DialogDescription>
            Confirme os detalhes do serviço antes de prosseguir com o pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Creator Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={creator.avatar_url} />
              <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{creator.display_name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>Criadora Verificada</span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{service.title}</h4>
              <Badge variant="secondary">
                {SERVICE_TYPE_LABELS[service.service_type] || service.service_type}
              </Badge>
            </div>
            
            {service.description && (
              <p className="text-sm text-muted-foreground">{service.description}</p>
            )}

            {service.duration_minutes && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{service.duration_minutes} minutos</span>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(service.price)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamento via PIX
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                "Processando..."
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pagar com PIX
                </>
              )}
            </Button>
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
            Ao prosseguir, você concorda com nossos termos de uso e política de privacidade.
            Após o pagamento, você será redirecionado para o chat.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};