import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { WasteResults } from "@/components/WasteResults";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { StateSelector } from "@/components/StateSelector";
import { ProjectInfoDialog } from "@/components/ProjectInfoDialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";
import { useTheme } from "next-themes";
import { getTranslation, type Language } from "@/lib/translations";
import wasteGenerationImg from "@/assets/waste-generation.jpg";
import wasteSegregationImg from "@/assets/waste-segregation.jpg";
import environmentalImpactImg from "@/assets/environmental-impact.jpg";
import limitedResourcesImg from "@/assets/limited-resources.jpg";

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
  const [userState, setUserState] = useState<string | null>(null);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const t = (key: string) => getTranslation(language, key as any);

  // Load preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    const savedState = localStorage.getItem("userState");
    const savedTheme = localStorage.getItem("theme");

    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
    }
    if (savedState) {
      setUserState(savedState);
    }
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

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
            setIsHeaderVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsHeaderVisible(false);
          } else if (currentScrollY < lastScrollY) {
            setIsHeaderVisible(true);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const handleReset = () => {
    setPredictions([]);
    setUploadedImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStateSelect = (state: string) => {
    setUserState(state);
    localStorage.setItem("userState", state);
  };

  const handleImageUpload = async (base64Image: string) => {
    setIsAnalyzing(true);
    setUploadedImage(base64Image);
    setPredictions([]);
    try {
      const { data, error } = await supabase.functions.invoke("classify-waste", {
        body: {
          imageBase64: base64Image,
          language,
          state: userState
        }
      });
      if (error) throw error;
      if (data?.predictions && Array.isArray(data.predictions)) {
        setPredictions(data.predictions);
        if (data.predictions.length > 0) {
          toast({
            title: t("analysisComplete"),
            description: `${t("foundItems")} ${data.predictions.length} ${t("items")}`
          });
        }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-transform duration-300 ${
        !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleReset}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              aria-label="Reset app"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-foreground text-2xl font-bold">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <StateSelector selectedState={userState} onStateChange={handleStateSelect} />
              <ProjectInfoDialog open={showProjectInfo} onOpenChange={setShowProjectInfo} />
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
          {uploadedImage && (
            <section className="flex justify-center">
              <div className="max-w-md w-full">
                <img src={uploadedImage} alt="Uploaded waste" className="rounded-lg border border-border shadow-lg" />
              </div>
            </section>
          )}

          {/* Results Section */}
          {uploadedImage && (
            <section className="space-y-6">
              <WasteResults 
                predictions={predictions} 
                uploadedImage={uploadedImage} 
                language={language}
                hasAnalyzed={!isAnalyzing}
              />
            </section>
          )}

          {/* Info Section - Only show when no image uploaded */}
          {!uploadedImage && !isAnalyzing && (
            <section className="text-center py-12">
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
            </section>
          )}
        </div>

        {/* Waste Management Info Section - Always visible at bottom with more spacing */}
        <section className="mt-32 border-t border-border/50 pt-16 pb-8">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-foreground">
                {t("wasteInfoTitle")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("wasteInfoSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rapid Waste Generation */}
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={wasteGenerationImg} 
                    alt="Rapid waste generation in India" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {t("wasteInfoProblem1Title")}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t("wasteInfoProblem1Desc")}
                  </p>
                </div>
              </div>

              {/* Poor Segregation */}
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={wasteSegregationImg} 
                    alt="Poor waste segregation" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {t("wasteInfoProblem2Title")}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t("wasteInfoProblem2Desc")}
                  </p>
                </div>
              </div>

              {/* Health & Environment */}
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={environmentalImpactImg} 
                    alt="Environmental impact of waste" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {t("wasteInfoProblem3Title")}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t("wasteInfoProblem3Desc")}
                  </p>
                </div>
              </div>

              {/* Limited Resources */}
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={limitedResourcesImg} 
                    alt="Limited waste management resources" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {t("wasteInfoProblem4Title")}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t("wasteInfoProblem4Desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
