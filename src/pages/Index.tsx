import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { WasteResults } from "@/components/WasteResults";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ProjectInfoDialog } from "@/components/ProjectInfoDialog";
import { BinExamplesDialog } from "@/components/BinExamplesDialog";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { UserMenu } from "@/components/UserMenu";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUploadHistory } from "@/hooks/useUploadHistory";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { getTranslation, type Language } from "@/lib/translations";
import wasteGeneration from "@/assets/waste-generation.webp";
import environmentalImpact from "@/assets/environmental-impact.webp";
import wasteSegregationSolution from "@/assets/waste-segregation-solution.webp";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [predictions, setPredictions] = useState<WasteItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadHistoryId, setUploadHistoryId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("English");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [selectedBinColor, setSelectedBinColor] = useState<string | null>(null);
  const [highlightedBin, setHighlightedBin] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { saveToHistory } = useUploadHistory();
  const t = (key: string) => getTranslation(language, key as any);

  // RTL languages
  const RTL_LANGUAGES = ["Urdu", "Kashmiri", "Sindhi"];
  const isRTL = RTL_LANGUAGES.includes(language);

  // Load preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    const savedTheme = localStorage.getItem("theme");

    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
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
    setUploadHistoryId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
  };

  const handleImageUpload = async (base64Image: string) => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setUploadedImage(base64Image);
    setPredictions([]);
    try {
      const { data, error } = await supabase.functions.invoke("classify-waste", {
        body: {
          imageBase64: base64Image,
          language
        }
      });
      if (error) throw error;
      if (data?.predictions && Array.isArray(data.predictions)) {
        // Signal completion to show 100%
        setAnalysisComplete(true);
        
        // Wait 500ms to show 100% before revealing results
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPredictions(data.predictions);
        
        // Save to history for signed-in users
        const historyEntry = await saveToHistory(base64Image, data.predictions);
        if (historyEntry) {
          setUploadHistoryId(historyEntry.id);
        }
        
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
      setAnalysisComplete(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl-text' : ''}`}>
      <TutorialOverlay />
      {/* Header */}
      <header className={`border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-transform duration-300 ${
        !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 animate-fade-in">
              
              <button 
                onClick={handleReset}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                aria-label="Reset app"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:animate-wiggle transition-all">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-foreground text-2xl font-bold">EcoSort</h1>
              </button>
            </div>
            <div className="flex items-center gap-3 animate-fade-in delay-100" data-tutorial="settings">
              <UserMenu />
              <SettingsDialog 
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Upload Section */}
          <section data-tutorial="upload" className="animate-fade-in-up">
            <ImageUpload onImageUpload={handleImageUpload} isAnalyzing={isAnalyzing} analysisComplete={analysisComplete} language={language} />
          </section>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <section className="flex justify-center animate-scale-in">
              <div className="max-w-md w-full">
                <img src={uploadedImage} alt="Uploaded waste" className="rounded-lg border border-border shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl" />
              </div>
            </section>
          )}

          {/* Results Section */}
          {uploadedImage && (
            <section className="space-y-6 animate-fade-in-up delay-200">
              <WasteResults 
                predictions={predictions} 
                uploadedImage={uploadedImage} 
                language={language}
                hasAnalyzed={!isAnalyzing}
                uploadHistoryId={uploadHistoryId || undefined}
              />
            </section>
          )}

          {/* Info Section - Only show when no image uploaded */}
          {!uploadedImage && !isAnalyzing && (
            <section className="text-center py-12 animate-fade-in-up delay-200">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  {t("smartSegregation")}
                </h2>
                <p className="text-muted-foreground text-base font-medium">
                  {t("infoDescription")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 stagger-children" data-tutorial="bins">
                  <button 
                    onClick={() => { setSelectedBinColor("Blue Bin"); setHighlightedBin("Blue Bin"); }}
                    className={`p-4 bg-transparent rounded-lg border hover:bg-primary/10 transition-all cursor-pointer hover-lift group ${highlightedBin === "Blue Bin" ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-primary/30"}`}
                  >
                    <div className="w-12 h-12 bg-recyclable rounded-full mx-auto mb-2 transition-transform group-hover:scale-110 group-hover:animate-bounce-soft"></div>
                    <p className="text-sm font-semibold">{t("blueBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("recyclable")}</p>
                  </button>
                  <button 
                    onClick={() => { setSelectedBinColor("Green Bin"); setHighlightedBin("Green Bin"); }}
                    className={`p-4 bg-transparent rounded-lg border hover:bg-primary/10 transition-all cursor-pointer hover-lift group ${highlightedBin === "Green Bin" ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-primary/30"}`}
                  >
                    <div className="w-12 h-12 bg-organic rounded-full mx-auto mb-2 transition-transform group-hover:scale-110 group-hover:animate-bounce-soft"></div>
                    <p className="text-sm font-semibold">{t("greenBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("organic")}</p>
                  </button>
                  <button 
                    onClick={() => { setSelectedBinColor("Red Bin"); setHighlightedBin("Red Bin"); }}
                    className={`p-4 bg-transparent rounded-lg border hover:bg-primary/10 transition-all cursor-pointer hover-lift group ${highlightedBin === "Red Bin" ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-primary/30"}`}
                  >
                    <div className="w-12 h-12 bg-hazardous rounded-full mx-auto mb-2 transition-transform group-hover:scale-110 group-hover:animate-bounce-soft"></div>
                    <p className="text-sm font-semibold">{t("redBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("hazardous")}</p>
                  </button>
                  <button 
                    onClick={() => { setSelectedBinColor("Yellow Bin"); setHighlightedBin("Yellow Bin"); }}
                    className={`p-4 bg-transparent rounded-lg border hover:bg-primary/10 transition-all cursor-pointer hover-lift group ${highlightedBin === "Yellow Bin" ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-primary/30"}`}
                  >
                    <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2 transition-transform group-hover:scale-110 group-hover:animate-bounce-soft"></div>
                    <p className="text-sm font-semibold">{t("yellowBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("eWaste")}</p>
                  </button>
                </div>
                
                {/* Project Info Section */}
                <p className="mt-8 text-sm text-muted-foreground leading-relaxed text-center">
                  {t("projectDescription")}{" "}
                  <a 
                    href="https://ipcaworld.co.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("visitIpca")}
                  </a>
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Waste Management Info Section - Always visible at bottom */}
        {!uploadedImage && (
          <section className="mt-48 space-y-32">
            <div className="text-center space-y-6 pt-24 animate-fade-in-up" data-tutorial="info">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                {t("wasteInfoTitle")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t("wasteInfoSubtitle")}
              </p>
            </div>

            {/* Section 1: Massive Waste Generation */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover-glow">
                <img 
                  src={wasteGeneration}
                  alt={t("section1Title")} 
                  className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="max-w-4xl mx-auto space-y-6 px-6 animate-slide-in-left">
                <h3 className="text-3xl font-bold text-foreground">
                  {t("section1Title")}
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>{t("section1Content1")}</p>
                  <p>{t("section1Content2")}</p>
                  <p>{t("section1Content3")}</p>
                  <p className="font-semibold text-foreground">{t("section1Content4")}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Plastic Pollution */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover-glow">
                <img 
                  src={environmentalImpact}
                  alt={t("section2Title")} 
                  className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="max-w-4xl mx-auto space-y-6 px-6 animate-slide-in-right">
                <h3 className="text-3xl font-bold text-foreground">
                  {t("section2Title")}
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>{t("section2Content1")}</p>
                  <p>{t("section2Content2")}</p>
                  <p>{t("section2Content3")}</p>
                  <p className="font-semibold text-foreground">{t("section2Content4")}</p>
                </div>
              </div>
            </div>

            {/* Section 3: The Solution - Waste Segregation */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover-glow">
                <img 
                  src={wasteSegregationSolution}
                  alt={t("section3Title")} 
                  className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="max-w-4xl mx-auto space-y-6 px-6 animate-slide-in-left">
                <h3 className="text-3xl font-bold text-foreground">
                  {t("section3Title")}
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>{t("section3Content1")}</p>
                  <p>{t("section3Content2")}</p>
                  <p>{t("section3Content3")}</p>
                  <p className="font-semibold text-foreground">{t("section3Content4")}</p>
                  <p className="text-xl font-semibold text-foreground pt-4">{t("section3Content5")}</p>
                </div>
              </div>
            </div>

            {/* Section 4: NGOs Fighting for a Cleaner India */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="max-w-4xl mx-auto space-y-6 px-6 animate-slide-in-right">
                <h3 className="text-3xl font-bold text-foreground">
                  {t("section4Title")}
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>{t("section4Content1")}</p>
                  <p>{t("section4Content2")}</p>
                  <p className="font-semibold text-foreground">{t("section4OtherOrgs")}</p>
                  <ul className="list-disc list-inside space-y-3 pl-4">
                    <li className="transition-transform hover:translate-x-2 duration-300">{t("section4Ngo1")}</li>
                    <li className="transition-transform hover:translate-x-2 duration-300">{t("section4Ngo2")}</li>
                    <li className="transition-transform hover:translate-x-2 duration-300">{t("section4Ngo3")}</li>
                    <li className="transition-transform hover:translate-x-2 duration-300">{t("section4Ngo4")}</li>
                    <li className="transition-transform hover:translate-x-2 duration-300">{t("section4Ngo5")}</li>
                  </ul>
                  <p className="pt-4">{t("section4Content3")}</p>
                  <p>{t("section4Content4")}</p>
                  <p className="text-xl font-semibold text-foreground pt-4">{t("section4Content5")}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <BinExamplesDialog
        binColor={selectedBinColor}
        open={selectedBinColor !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBinColor(null);
            setHighlightedBin(null);
          }
        }}
        language={language}
      />
    </div>
  );
};

export default Index;
