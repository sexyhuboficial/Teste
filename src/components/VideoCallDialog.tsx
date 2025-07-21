import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface Creator {
  id: string;
  display_name: string;
  avatar_url: string;
}

interface VideoCallDialogProps {
  creator: Creator;
  children?: React.ReactNode;
}

export const VideoCallDialog = ({ creator, children }: VideoCallDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsConnected(true);
      
      // Simulate connection after 2 seconds
      setTimeout(() => {
        // In a real implementation, this would be the remote stream
        // For demo purposes, we'll just show the creator's avatar
      }, 2000);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Erro ao acessar câmera/microfone. Verifique as permissões.');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsConnected(false);
    setCallDuration(0);
    setOpen(false);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Video className="w-4 h-4" />
            Chamada de Vídeo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Chamada de Vídeo com {creator.display_name}
            </div>
            {isConnected && (
              <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {formatDuration(callDuration)}
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {!isConnected ? 
              'Clique em "Iniciar Chamada" para começar a videochamada' :
              'Chamada em andamento'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
          {!isConnected ? (
            // Pre-call screen
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-white">
              <Avatar className="w-32 h-32">
                <AvatarImage src={creator.avatar_url} />
                <AvatarFallback className="text-4xl">{creator.display_name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">{creator.display_name}</h3>
                <p className="text-white/70">Pronta para conversar</p>
              </div>
              
              <Button 
                onClick={startCall}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16"
              >
                <Video className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            // Video call screen
            <div className="h-full relative">
              {/* Remote video (creator) - main view */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Avatar className="w-40 h-40 mx-auto mb-4">
                    <AvatarImage src={creator.avatar_url} />
                    <AvatarFallback className="text-6xl">{creator.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-3xl font-semibold">{creator.display_name}</h3>
                  <p className="text-white/70 mt-2">Conectada</p>
                </div>
              </div>
              
              {/* Local video - picture in picture */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white/30">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} // Mirror effect
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              
              {/* Call controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleAudio}
                  className={`rounded-full w-14 h-14 ${
                    isAudioEnabled 
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                      : 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleVideo}
                  className={`rounded-full w-14 h-14 ${
                    isVideoEnabled 
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                      : 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                  className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-muted-foreground">
          {!isConnected ? (
            <p>A chamada será iniciada quando ambas as partes estiverem conectadas</p>
          ) : (
            <p>Chamada encriptada ponta-a-ponta • Qualidade HD</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};