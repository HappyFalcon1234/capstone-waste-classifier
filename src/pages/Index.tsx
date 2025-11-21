import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { WasteResults } from "@/components/WasteResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();
  const t = (key: string) => getTranslation(language, key as any);

  // Hide header on scroll down (mobile only)
  useEffect(() => {
    if (!isMobile) {
      setIsHeaderVisible(true);
      return;
    }
    let lastScrollY = window.scrollY;
    let ticking = false;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY < 50) {
            // Always show header at top
            setIsHeaderVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide header
            setIsHeaderVisible(false);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up - show header
            setIsHeaderVisible(true);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);
  const handleReset = () => {
    setPredictions([]);
    setUploadedImage(null);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
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
      <header className={`border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Reset app">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-foreground text-2xl font-bold">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <LanguageSelector language={language} onLanguageChange={setLanguage} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
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
                <p className="text-muted-foreground text-base font-medium">
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

        {/* Waste Management Info Section - Always visible at bottom */}
        <section className="mt-16 border-t border-border/50 pt-12 pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-bold text-foreground text-3xl mt-0 mr-0 mb-0 ml-0 my-px">
                {t("wasteInfoTitle")}
              </h2>
              <p className="text-muted-foreground text-xl">
                {t("wasteInfoSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-card border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("wasteInfoProblem1Title")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("wasteInfoProblem1Desc")}
                </p>
              </div>

              <div className="p-6 bg-card border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xl">🗑️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("wasteInfoProblem2Title")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("wasteInfoProblem2Desc")}
                </p>
              </div>

              <div className="p-6 bg-card border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xl">🏥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("wasteInfoProblem3Title")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("wasteInfoProblem3Desc")}
                </p>
              </div>

              <div className="p-6 bg-card border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("wasteInfoProblem4Title")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("wasteInfoProblem4Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>;
};
export default Index;