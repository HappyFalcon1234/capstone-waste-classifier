import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getTranslation, type Language } from "@/lib/translations";
import { AnalyzingProgress } from "./AnalyzingProgress";

interface ImageUploadProps {
  onImageUpload: (base64: string) => void;
  isAnalyzing: boolean;
  analysisComplete?: boolean;
  language: Language;
}

export const ImageUpload = ({ onImageUpload, isAnalyzing, analysisComplete, language }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  
  const t = (key: string) => getTranslation(language, key as any);

  // Convert image to WebP format for optimization
  const convertToWebP = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Convert to WebP with 0.85 quality
        const webpBase64 = canvas.toDataURL('image/webp', 0.85);
        resolve(webpBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
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

    // Smart conversion: only convert if file is >2MB or is PNG (not already WebP)
    const shouldConvert = (file.size > 2 * 1024 * 1024 || file.type === 'image/png') 
                          && file.type !== 'image/webp';

    if (shouldConvert) {
      try {
        const webpBase64 = await convertToWebP(file);
        onImageUpload(webpBase64);
      } catch {
        // Fallback to original if conversion fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onImageUpload(base64);
        };
        reader.readAsDataURL(file);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageUpload(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, toast, convertToWebP]);

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
      className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-500 group ${
        dragActive
          ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
          : "border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
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
          <AnalyzingProgress language={language} analysisComplete={analysisComplete} />
        ) : (
          <div className="animate-fade-in text-center">
            <Upload className="h-16 w-16 text-primary mb-4 mx-auto transition-all duration-300 group-hover:scale-110 animate-float" />
            <p className="text-lg font-medium text-foreground mb-2 transition-colors text-center">
              {t("uploadTitle")}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {t("uploadDescription")}
            </p>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t("maxFileSize")}
            </p>
          </div>
        )}
      </label>
    </div>
  );
};
