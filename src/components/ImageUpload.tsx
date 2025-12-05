import { useCallback, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getTranslation, type Language } from "@/lib/translations";

interface ImageUploadProps {
  onImageUpload: (base64: string) => void;
  isAnalyzing: boolean;
  language: Language;
}

export const ImageUpload = ({ onImageUpload, isAnalyzing, language }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  
  const t = (key: string) => getTranslation(language, key as any);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageUpload(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-300 ${
        dragActive
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50"
      } ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={isAnalyzing}
      />
      
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground">{t("analyzing")}</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
          </>
        ) : (
          <>
            <Upload className="h-16 w-16 text-primary mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {t("uploadTitle")}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {t("uploadDescription")}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t("maxFileSize")}
            </p>
          </>
        )}
      </label>
    </div>
  );
};
