import { useCallback, useState } from "react";
import { Upload, CheckCircle, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTranslation, type Language } from "@/lib/translations";
import { AnalyzingProgress } from "./AnalyzingProgress";

interface ImageUploadProps {
  onImageUpload: (base64: string) => void;
  isAnalyzing: boolean;
  analysisComplete?: boolean;
  language: Language;
}

interface CompressionStats {
  originalSize: number;
  optimizedSize: number;
  wasResized: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const calculateBase64Size = (base64: string): number => {
  // Remove data URL prefix to get actual base64 data
  const base64Data = base64.split(',')[1] || base64;
  // Base64 encoding adds ~33% overhead, so actual bytes = base64 length * 3/4
  return Math.round((base64Data.length * 3) / 4);
};

export const ImageUpload = ({ onImageUpload, isAnalyzing, analysisComplete, language }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const { toast } = useToast();
  
  const t = (key: string) => getTranslation(language, key as any);

  // Resize and convert image to WebP format for optimization
  const optimizeImage = useCallback((file: File, maxDimension: number = 4000): Promise<{ base64: string; wasResized: boolean }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        let { width, height } = img;
        let wasResized = false;
        
        // Resize if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          wasResized = true;
          if (width > height) {
            height = Math.round((height / width) * maxDimension);
            width = maxDimension;
          } else {
            width = Math.round((width / height) * maxDimension);
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP with 0.85 quality
        const webpBase64 = canvas.toDataURL('image/webp', 0.85);
        URL.revokeObjectURL(img.src);
        resolve({ base64: webpBase64, wasResized });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
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

    const originalSize = file.size;

    // Smart conversion: convert if file is >2MB, is PNG, or needs resizing check
    // Skip only for small WebP files
    const shouldOptimize = file.size > 2 * 1024 * 1024 || 
                           file.type === 'image/png' || 
                           file.type !== 'image/webp';

    if (shouldOptimize) {
      try {
        const { base64: optimizedBase64, wasResized } = await optimizeImage(file);
        const optimizedSize = calculateBase64Size(optimizedBase64);
        
        // Only show stats if there was actual compression benefit
        if (optimizedSize < originalSize) {
          setCompressionStats({ originalSize, optimizedSize, wasResized });
        } else {
          setCompressionStats(null);
        }
        
        onImageUpload(optimizedBase64);
      } catch {
        // Fallback to original if optimization fails
        setCompressionStats(null);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onImageUpload(base64);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setCompressionStats(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageUpload(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, toast, optimizeImage]);

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

  const compressionPercentage = compressionStats 
    ? Math.round((1 - compressionStats.optimizedSize / compressionStats.originalSize) * 100)
    : 0;

  return (
    <div className="space-y-3">
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
            <AnalyzingProgress language={language} analysisComplete={analysisComplete} />
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

      {/* Compression Stats Indicator */}
      {compressionStats && !isAnalyzing && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
            <TrendingDown className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Image optimized</span>
              <span className="text-primary font-bold">-{compressionPercentage}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="line-through">{formatFileSize(compressionStats.originalSize)}</span>
              <span>→</span>
              <span className="text-primary font-medium">{formatFileSize(compressionStats.optimizedSize)}</span>
              {compressionStats.wasResized && (
                <span className="px-1.5 py-0.5 bg-secondary rounded text-[10px] uppercase tracking-wide">
                  Resized
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
