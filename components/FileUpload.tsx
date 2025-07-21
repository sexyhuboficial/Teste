import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (url: string) => void;
  bucket: string;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export const FileUpload = ({
  onUpload,
  bucket,
  folder = "",
  accept = "image/*",
  maxSize = 5,
  disabled = false
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setProgress(10);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      setProgress(30);

      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

      setProgress(50);

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile);

      if (error) throw error;

      setProgress(80);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);

      onUpload(publicUrl);
      setSelectedFile(null);
      
      toast({
        title: "Upload concluído",
        description: "Arquivo enviado com sucesso!",
      });

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Selecionar Arquivo</Label>
        <Input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="cursor-pointer"
        />
        <p className="text-sm text-muted-foreground">
          Máximo {maxSize}MB. Formatos aceitos: {accept}
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <FileIcon className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Enviando arquivo... {progress}%
          </p>
        </div>
      )}

      <Button
        onClick={uploadFile}
        disabled={!selectedFile || uploading || disabled}
        className="w-full btn-hero"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Enviando..." : "Fazer Upload"}
      </Button>
    </div>
  );
};