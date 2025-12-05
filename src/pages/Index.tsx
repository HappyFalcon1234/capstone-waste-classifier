import { useState, useEffect, useCallback } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { WasteResults } from "@/components/WasteResults";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ProjectInfoDialog } from "@/components/ProjectInfoDialog";
import { BinExamplesDialog } from "@/components/BinExamplesDialog";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { NetworkStatusBanner } from "@/components/NetworkStatusBanner";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineClassifier } from "@/hooks/useOfflineClassifier";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";
import { useTheme } from "next-themes";
import { getTranslation, type Language } from "@/lib/translations";
import { compressImage } from "@/lib/imageCompression";
import wasteGeneration from "@/assets/waste-generation.jpg";
import environmentalImpact from "@/assets/environmental-impact.jpg";
import wasteSegregationSolution from "@/assets/waste-segregation-solution.jpg";

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
  const [selectedBinColor, setSelectedBinColor] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { classifyImage, loadModel, isModelLoading, modelLoadProgress, isModelReady } = useOfflineClassifier();
  const t = (key: string) => getTranslation(language, key as any);

  // Auto-switch to offline mode when offline
  useEffect(() => {
    if (!isOnline) {
      setIsOfflineMode(true);
      // Preload the model when going offline
      loadModel();
    }
  }, [isOnline, loadModel]);

  // Load offline mode preference from localStorage
  useEffect(() => {
    const savedOfflineMode = localStorage.getItem("offlineMode");
    if (savedOfflineMode === "true") {
      setIsOfflineMode(true);
      loadModel();
    }
  }, [loadModel]);

  const toggleOfflineMode = useCallback(() => {
    const newMode = !isOfflineMode;
    setIsOfflineMode(newMode);
    localStorage.setItem("offlineMode", String(newMode));
    if (newMode) {
      loadModel();
    }
  }, [isOfflineMode, loadModel]);

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

  const handleImageUpload = async (base64Image: string, file?: File) => {
    setIsAnalyzing(true);
    setUploadedImage(base64Image);
    setPredictions([]);
    
    try {
      // Offline mode: use local model
      if (isOfflineMode || !isOnline) {
        const offlinePredictions = await classifyImage(base64Image);
        const formattedPredictions = offlinePredictions.map(pred => ({
          item: pred.item,
          category: pred.bin_color === 'Green' ? 'Organic' : 
                   pred.bin_color === 'Blue' ? 'Recyclable' :
                   pred.bin_color === 'Red' ? 'Hazardous' :
                   pred.bin_color === 'Yellow' ? 'E-Waste' : 'Non-Recyclable',
          disposal: pred.disposal_instructions,
          binColor: pred.bin_color,
          confidence: pred.confidence,
        }));
        setPredictions(formattedPredictions);
        if (formattedPredictions.length > 0) {
          toast({
            title: `${t("analysisComplete")} (${t("offlineClassification")})`,
            description: `${t("foundItems")} ${formattedPredictions.length} ${t("items")}`
          });
        }
        return;
      }
      
      // Online mode: compress if slow connection
      let imageToSend = base64Image;
      if (isSlowConnection && file) {
        const compressedFile = await compressImage(file);
        const reader = new FileReader();
        imageToSend = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedFile);
        });
      }
      
      const { data, error } = await supabase.functions.invoke("classify-waste", {
        body: {
          imageBase64: imageToSend,
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
      <TutorialOverlay />
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
            <div className="flex items-center gap-3" data-tutorial="settings">
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
          {/* Network Status Banner */}
          <NetworkStatusBanner
            language={language}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={toggleOfflineMode}
            isModelLoading={isModelLoading}
            modelLoadProgress={modelLoadProgress}
          />
          
          {/* Upload Section */}
          <section data-tutorial="upload">
            <ImageUpload onImageUpload={handleImageUpload} isAnalyzing={isAnalyzing} language={language} />
          </section>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <section className="flex justify-center animate-fade-in">
              <div className="max-w-md w-full">
                <img src={uploadedImage} alt="Uploaded waste" className="rounded-lg border border-border shadow-lg transition-transform hover:scale-[1.02] duration-300" />
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
            <section className="text-center py-12 animate-fade-in">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  {t("smartSegregation")}
                </h2>
                <p className="text-muted-foreground text-base font-medium">
                  {t("infoDescription")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8" data-tutorial="bins">
                  <button 
                    onClick={() => setSelectedBinColor("Blue Bin")}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer hover:scale-105 hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-recyclable rounded-full mx-auto mb-2 transition-transform group-hover:scale-110"></div>
                    <p className="text-sm font-semibold">{t("blueBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("recyclable")}</p>
                  </button>
                  <button 
                    onClick={() => setSelectedBinColor("Green Bin")}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer hover:scale-105 hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-organic rounded-full mx-auto mb-2 transition-transform group-hover:scale-110"></div>
                    <p className="text-sm font-semibold">{t("greenBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("organic")}</p>
                  </button>
                  <button 
                    onClick={() => setSelectedBinColor("Red Bin")}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer hover:scale-105 hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-hazardous rounded-full mx-auto mb-2 transition-transform group-hover:scale-110"></div>
                    <p className="text-sm font-semibold">{t("redBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("hazardous")}</p>
                  </button>
                  <button 
                    onClick={() => setSelectedBinColor("Yellow Bin")}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer hover:scale-105 hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2 transition-transform group-hover:scale-110"></div>
                    <p className="text-sm font-semibold">{t("yellowBin")}</p>
                    <p className="text-xs text-muted-foreground">{t("eWaste")}</p>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Waste Management Info Section - Always visible at bottom */}
        {!uploadedImage && (
          <section className="mt-48 space-y-32">
            <div className="text-center space-y-6 animate-fade-in pt-24" data-tutorial="info">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                {t("wasteInfoTitle")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t("wasteInfoSubtitle")}
              </p>
            </div>

            {/* Section 1: Massive Waste Generation */}
            <div className="space-y-6 animate-fade-in">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                <img 
                  src={wasteGeneration}
                  alt="Massive waste landfills across India" 
                  className="w-full h-[400px] md:h-[600px] object-cover"
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
            <div className="space-y-6 animate-fade-in">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                <img 
                  src={environmentalImpact}
                  alt="Plastic pollution choking Indian rivers and oceans" 
                  className="w-full h-[400px] md:h-[600px] object-cover"
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
            <div className="space-y-6 animate-fade-in">
              <div className="w-full rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                <img 
                  src={wasteSegregationSolution}
                  alt="Community-led waste segregation initiatives" 
                  className="w-full h-[400px] md:h-[600px] object-cover"
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

            {/* Section 4: NGOs Fighting for a Cleaner India */}
            <div className="space-y-6 animate-fade-in">
              <div className="max-w-4xl mx-auto space-y-6 px-6">
                <h3 className="text-3xl font-bold text-foreground">
                  NGOs Fighting for a Cleaner India
                </h3>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">The Indian Pollution Control Association (IPCA)</strong> has been at the forefront of environmental advocacy since its establishment. Working closely with government bodies, industries, and communities, IPCA focuses on promoting pollution control measures, conducting environmental audits, and raising awareness about sustainable practices across India.
                  </p>
                  <p>
                    IPCA organizes nationwide campaigns on waste management, air quality monitoring, and water conservation. Their efforts include training programs for industries on pollution control technologies, community workshops on waste segregation, and policy advocacy for stricter environmental regulations.
                  </p>
                  <p>
                    <strong className="text-foreground">Other notable organizations making a difference:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-3 pl-4">
                    <li>
                      <strong className="text-foreground">Chintan Environmental Research and Action Group</strong> — Works with waste pickers and promotes zero-waste cities, recycling over 70,000 tonnes of waste annually
                    </li>
                    <li>
                      <strong className="text-foreground">Swechha</strong> — Youth-led environmental organization focusing on river cleanup, urban farming, and waste management education in Delhi
                    </li>
                    <li>
                      <strong className="text-foreground">Hasiru Dala</strong> — Bangalore-based NGO empowering waste pickers and promoting decentralized waste management solutions
                    </li>
                    <li>
                      <strong className="text-foreground">Toxics Link</strong> — Research and advocacy organization working on hazardous waste, e-waste, and chemical safety issues
                    </li>
                    <li>
                      <strong className="text-foreground">Centre for Science and Environment (CSE)</strong> — Premier research organization advocating for sustainable development and environmental justice
                    </li>
                  </ul>
                  <p className="pt-4">
                    These organizations have collectively impacted millions of lives through their grassroots initiatives. From organizing beach cleanups to establishing waste collection networks, they demonstrate that <strong className="text-foreground">collective action can transform India's environmental landscape</strong>.
                  </p>
                  <p>
                    The Swachh Bharat Mission has also partnered with numerous NGOs to achieve its sanitation and cleanliness goals. Community-led total sanitation programs, waste-to-wealth initiatives, and Extended Producer Responsibility (EPR) campaigns are showing promising results in cities across the nation.
                  </p>
                  <p className="text-xl font-semibold text-foreground pt-4">
                    You can join this movement by volunteering with local environmental groups, participating in cleanup drives, and most importantly, practicing proper waste segregation in your daily life.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <BinExamplesDialog
        binColor={selectedBinColor}
        open={selectedBinColor !== null}
        onOpenChange={(open) => !open && setSelectedBinColor(null)}
        language={language}
      />
    </div>
  );
};

export default Index;
