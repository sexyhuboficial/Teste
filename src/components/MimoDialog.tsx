import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Gift } from "lucide-react";
import { useMimos } from "@/hooks/useMimos";
import { supabase } from "@/integrations/supabase/client";

interface Creator {
  id: string;
  display_name: string;
  avatar_url: string;
}

interface MimoDialogProps {
  creator: Creator;
  children?: React.ReactNode;
}

const PRESET_VALUES = [5, 10, 20, 50, 100];

interface MimoReward {
  id: string;
  minimum_amount: number;
  reward_type: string;
  reward_description: string;
  reward_value: string;
}

export const MimoDialog = ({ creator, children }: MimoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(10);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState<MimoReward[]>([]);
  const { createMimo } = useMimos();

  // Fetch mimo rewards on component mount
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const { data } = await supabase
          .from('mimo_rewards')
          .select('*')
          .eq('is_active', true)
          .order('minimum_amount', { ascending: true });
        
        if (data) setRewards(data);
      } catch (error) {
        console.error('Error fetching mimo rewards:', error);
      }
    };
    
    fetchRewards();
  }, []);

  const handleSendMimo = async () => {
    if (amount < 1) {
      return;
    }

    setLoading(true);
    try {
      const result = await createMimo(creator.id, amount, message);
      if (result) {
        setOpen(false);
        setAmount(10);
        setMessage('');
      }
    } catch (error) {
      console.error('Error in handleSendMimo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (value: number) => {
    setAmount(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Gift className="w-4 h-4" />
            Enviar Mimo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-pink-500" />
            Enviar Mimo
          </DialogTitle>
          <DialogDescription className="text-sm">
            Demonstre seu carinho enviando um mimo para {creator.display_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Creator Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="w-10 h-10 md:w-12 md:h-12">
              <AvatarImage src={creator.avatar_url} />
              <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm md:text-base">{creator.display_name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Vai receber seu mimo</p>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm md:text-base">Valor (R$)</Label>
            
            {/* Preset Values */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {PRESET_VALUES.map((value) => (
                <Button
                  key={value}
                  variant={amount === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(value)}
                  className="text-xs md:text-sm h-8 md:h-10"
                >
                  R$ {value}
                </Button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="pl-10"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm md:text-base">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Deixe uma mensagem carinhosa..."
              className="resize-none text-sm md:text-base"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/200
            </p>
          </div>

          {/* Rewards */}
          {rewards.length > 0 && (
            <div className="space-y-2">
              <Label>🎁 Recompensas disponíveis:</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`p-2 rounded-lg text-xs ${
                      amount * 100 >= reward.minimum_amount
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>R$ {(reward.minimum_amount / 100).toFixed(2)}+</span>
                      <span className="font-medium">{reward.reward_description}</span>
                    </div>
                    {amount * 100 >= reward.minimum_amount && (
                      <div className="text-xs text-green-600 mt-1">
                        ✅ Você vai receber: {reward.reward_value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {amount > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-lg font-semibold text-primary">
                  R$ {amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 text-sm md:text-base h-10 md:h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendMimo}
              disabled={loading || amount < 1}
              className="flex-1 gap-2 text-sm md:text-base h-10 md:h-11"
            >
              {loading ? (
                "Processando..."
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Enviar Mimo
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};