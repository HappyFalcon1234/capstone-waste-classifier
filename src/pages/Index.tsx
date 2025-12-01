import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { WasteResults } from "@/components/WasteResults";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ProjectInfoDialog } from "@/components/ProjectInfoDialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";
import { useTheme } from "next-themes";
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
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const t = (key: string) => getTranslation(language, key as any);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
  };

  const handleImageUpload = async (base64Image: string) => {
    setIsAnalyzing(true);
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
            <div className="flex items-center gap-2">
              <ProjectInfoDialog />
              <button 
                onClick={handleReset}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                aria-label="Reset app"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h1 className="text-foreground text-2xl font-bold">EcoSort</h1>
                  <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-3">
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

        {/* Waste Management Info Section - Always visible at bottom */}
        {!uploadedImage && (
          <section className="mt-24 space-y-20">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                {t("wasteInfoTitle")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t("wasteInfoSubtitle")}
              </p>
            </div>

            {/* Section 1: Massive Waste Generation */}
            <div className="space-y-6">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="/src/assets/waste-landfill.jpg"
                  alt="Massive waste landfills across India" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div className="max-w-4xl mx-auto space-y-6 px-6">
                <h3 className="text-3xl font-bold text-foreground">
                  India's Growing Waste Crisis
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    India generates over <strong className="text-foreground">150,000 tonnes of municipal solid waste daily</strong>, with only 60% being collected and even less properly processed. Major cities like Delhi, Mumbai, and Bangalore are grappling with towering landfills that have become environmental hazards.
                  </p>
                  <p>
                    The Ghazipur landfill in Delhi has grown to over 65 meters high—taller than a 17-story building—and continues to grow at an alarming rate. In 2017, a section of this waste mountain collapsed, killing two people and highlighting the deadly risks these dumps pose to nearby communities.
                  </p>
                  <p>
                    Without proper waste segregation at source, these mountains of garbage pose serious health and environmental risks. The lack of proper waste management infrastructure and citizen participation means valuable recyclable materials are buried in landfills, while organic waste generates methane—a potent greenhouse gas that's 25 times more effective at trapping heat than carbon dioxide.
                  </p>
                  <p>
                    <strong className="text-foreground">By 2030, India's waste generation is projected to reach 165 million tonnes annually.</strong> Without immediate action on source segregation and proper disposal, our cities will be buried under their own waste.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Plastic Pollution */}
            <div className="space-y-6">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="/src/assets/plastic-pollution.jpg"
                  alt="Plastic pollution choking Indian rivers and oceans" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div className="max-w-4xl mx-auto space-y-6 px-6">
                <h3 className="text-3xl font-bold text-foreground">
                  The Plastic Pandemic
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Plastic waste has become one of India's most pressing environmental challenges, with <strong className="text-foreground">over 3.5 million tonnes of plastic waste generated annually</strong>. Rivers, oceans, and landscapes are increasingly choked with plastic debris that takes centuries to decompose.
                  </p>
                  <p>
                    India's rivers—the lifelines of our civilization—are now carrying plastic waste to the oceans at an unprecedented rate. The Ganges alone carries an estimated 1.2 billion pieces of plastic into the Bay of Bengal each year. Marine life is severely affected, with over 100,000 marine animals dying annually from plastic entanglement or ingestion globally.
                  </p>
                  <p>
                    Microplastics have entered our food chain with devastating consequences. Studies have found traces in seafood, drinking water, table salt, and even human blood samples. A recent study found that the average person consumes approximately 5 grams of plastic per week—equivalent to eating a credit card.
                  </p>
                  <p>
                    <strong className="text-foreground">Improper waste disposal also leads to soil contamination, water pollution, and severe air quality degradation.</strong> Open burning of plastic waste releases toxic fumes including dioxins and furans, which cause respiratory diseases and cancer in nearby populations. Children living near waste burning sites have been found to have significantly higher rates of respiratory illnesses.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: The Solution - Waste Segregation */}
            <div className="space-y-6">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="/src/assets/environmental-crisis.jpg"
                  alt="Community-led waste segregation initiatives" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div className="max-w-4xl mx-auto space-y-6 px-6">
                <h3 className="text-3xl font-bold text-foreground">
                  The Power of Segregation at Source
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Waste segregation at source is the most critical step in solving India's waste crisis.</strong> When waste is separated into wet (organic), dry (recyclable), hazardous, and e-waste categories right at home, it becomes exponentially easier to process, recycle, and dispose of responsibly.
                  </p>
                  <p>
                    Proper segregation enables composting of organic waste, which can reduce landfill volume by 40-50% while producing valuable fertilizer for agriculture. This not only saves landfill space but also reduces methane emissions and creates nutrient-rich compost that improves soil health.
                  </p>
                  <p>
                    Recyclable materials like paper, plastic, glass, and metal can be recovered and reprocessed when properly segregated, conserving natural resources and reducing the energy consumption required for manufacturing new products. Recycling one tonne of paper saves 17 trees, 7,000 gallons of water, and enough electricity to power an average home for six months.
                  </p>
                  <p>
                    <strong className="text-foreground">Success stories prove segregation works:</strong> Alappuzha in Kerala achieved 100% waste management through community participation, transforming from one of India's dirtiest cities to a zero-waste model. Indore has been recognized as India's cleanest city for six consecutive years through systematic waste segregation and processing initiatives.
                  </p>
                  <p className="text-xl font-semibold text-foreground pt-4">
                    Every citizen's participation matters. By segregating waste at home and using the correct colored bins, you contribute directly to reducing pollution, protecting wildlife, conserving resources, and building a sustainable future for India.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
