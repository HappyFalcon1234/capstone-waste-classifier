import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { WasteResults } from "@/components/WasteResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";
import { getTranslation, type Language } from "@/lib/translations";
interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}
const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<WasteItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("English");
  const {
    toast
  } = useToast();
  const t = (key: string) => getTranslation(language, key as any);
  const handleImageUpload = async (base64Image: string) => {
    setIsAnalyzing(true);
    setUploadedImage(base64Image);
    setPredictions([]);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("classify-waste", {
        body: {
          imageBase64: base64Image,
          language
        }
      });
      if (error) throw error;
      if (data?.predictions && Array.isArray(data.predictions)) {
        setPredictions(data.predictions);
        toast({
          title: t("analysisComplete"),
          description: `${t("foundItems")} ${data.predictions.length} ${t("items")}`
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error classifying waste:", error);
      toast({
        title: t("analysisFailed"),
        description: error.message || t("analysisFailedDesc"),
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector language={language} onLanguageChange={setLanguage} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <ImageUpload onImageUpload={handleImageUpload} isAnalyzing={isAnalyzing} language={language} />
          </section>

          {/* Uploaded Image Preview */}
          {uploadedImage && <section className="flex justify-center">
              <div className="max-w-md w-full">
                <img src={uploadedImage} alt="Uploaded waste" className="rounded-lg border border-border shadow-lg" />
              </div>
            </section>}

          {/* Results Section */}
          {predictions.length > 0 && <section className="space-y-6">
              <WasteResults predictions={predictions} uploadedImage={uploadedImage || undefined} language={language} />
            </section>}

          {/* Info Section */}
          {predictions.length === 0 && !isAnalyzing && <section className="text-center py-12">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  {t("smartSegregation")}
                </h2>
                <p className="text-muted-foreground text-base font-normal">
                  {t("infoDescription")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-recyclable rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-semibold">{t("blueBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("recyclable")}</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-organic rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-semibold">{t("greenBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("organic")}</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-hazardous rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-semibold">{t("redBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("hazardous")}</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-semibold">{t("yellowBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("eWaste")}</p>
                  </div>
                </div>
              </div>
            </section>}
        </div>
      </main>
    </div>;
};
export default Index;