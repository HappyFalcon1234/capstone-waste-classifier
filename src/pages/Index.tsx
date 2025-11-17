import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { WasteResults } from "@/components/WasteResults";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<WasteItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (base64Image: string) => {
    setIsAnalyzing(true);
    setUploadedImage(base64Image);
    setPredictions([]);

    try {
      const { data, error } = await supabase.functions.invoke("classify-waste", {
        body: { imageBase64: base64Image },
      });

      if (error) throw error;

      if (data?.predictions && Array.isArray(data.predictions)) {
        setPredictions(data.predictions);
        toast({
          title: "Analysis Complete",
          description: `Found ${data.predictions.length} waste item(s)`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error classifying waste:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">WasteWise</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Waste Classification</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <ImageUpload onImageUpload={handleImageUpload} isAnalyzing={isAnalyzing} />
          </section>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <section className="flex justify-center">
              <div className="max-w-md w-full">
                <img
                  src={uploadedImage}
                  alt="Uploaded waste"
                  className="rounded-lg border border-border shadow-lg"
                />
              </div>
            </section>
          )}

          {/* Results Section */}
          {predictions.length > 0 && (
            <section className="space-y-6">
              <WasteResults predictions={predictions} />
              <FeedbackButtons />
            </section>
          )}

          {/* Info Section */}
          {predictions.length === 0 && !isAnalyzing && (
            <section className="text-center py-12">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  Smart Waste Segregation
                </h2>
                <p className="text-muted-foreground text-lg">
                  Upload an image of your waste and our AI will identify all items, 
                  tell you what type of waste they are, and which colored bin to use 
                  according to Indian waste management guidelines.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-recyclable rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Blue Bin</p>
                    <p className="text-xs text-muted-foreground">Recyclable</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-organic rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Green Bin</p>
                    <p className="text-xs text-muted-foreground">Organic</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-hazardous rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Red Bin</p>
                    <p className="text-xs text-muted-foreground">Hazardous</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Yellow Bin</p>
                    <p className="text-xs text-muted-foreground">E-Waste</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
