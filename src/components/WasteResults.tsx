import { Trash2, Recycle, AlertTriangle, Zap, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ItemDetailDialog } from "./ItemDetailDialog";
import { BinExamplesDialog } from "./BinExamplesDialog";
import { FeedbackButtons } from "./FeedbackButtons";
import { getTranslation, getBinColorTranslation, type Language } from "@/lib/translations";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

interface WasteResultsProps {
  predictions: WasteItem[];
  uploadedImage?: string;
  language: Language;
  hasAnalyzed?: boolean;
}

const getBinColorClass = (binColor: string) => {
  const color = binColor.toLowerCase();
  if (color.includes("blue")) return "bg-recyclable";
  if (color.includes("green")) return "bg-organic";
  if (color.includes("red")) return "bg-hazardous";
  if (color.includes("yellow")) return "bg-yellow-500";
  if (color.includes("black")) return "bg-black-bin";
  return "bg-muted";
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("recyclable")) return <Recycle className="h-5 w-5" />;
  if (cat.includes("organic") || cat.includes("wet")) return <Trash2 className="h-5 w-5" />;
  if (cat.includes("hazard")) return <AlertTriangle className="h-5 w-5" />;
  if (cat.includes("e-waste")) return <Zap className="h-5 w-5" />;
  return <Trash2 className="h-5 w-5" />;
};

export const WasteResults = ({
  predictions,
  uploadedImage,
  language,
  hasAnalyzed = false
}: WasteResultsProps) => {
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [selectedBinColor, setSelectedBinColor] = useState<string | null>(null);
  const t = (key: string) => getTranslation(language, key as any);

  // Show "No Waste Detected" if analysis is complete but no predictions
  if (hasAnalyzed && predictions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t("noWasteDetected")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {language === "English" && "No waste items were detected in the image. Try uploading a different image with waste items."}
            {language === "Hindi" && "छवि में कोई कचरा वस्तु नहीं मिली। कचरे की वस्तुओं के साथ एक अलग छवि अपलोड करने का प्रयास करें।"}
            {language === "Tamil" && "படத்தில் கழிவு பொருட்கள் எதுவும் கண்டறியப்படவில்லை. கழிவு பொருட்களுடன் வேறு படத்தை பதிவேற்ற முயற்சிக்கவும்."}
            {language === "Telugu" && "చిత్రంలో వ్యర్థ వస్తువులు ఏవీ గుర్తించబడలేదు. వ్యర్థ వస్తువులతో వేరే చిత్రాన్ని అప్‌లోడ్ చేయడానికి ప్రయత్నించండి."}
          </p>
        </div>
        <FeedbackButtons />
      </div>
    );
  }

  // Don't render anything if no predictions yet
  if (predictions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {t("detectedItems")} ({predictions.length})
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {predictions.map((item, index) => (
          <Card
            key={index}
            className="overflow-hidden border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedItem(item)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2 font-bold">
                  {getCategoryIcon(item.category)}
                  {item.item}
                </CardTitle>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={`${getBinColorClass(item.binColor)} text-white cursor-pointer hover:opacity-80`}
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBinColor(item.binColor);
                    }}
                  >
                    {getBinColorTranslation(language, item.binColor)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.confidence}% {t("confident")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t("category")}</p>
                <p className="text-sm text-foreground">{item.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("disposalInstructions")}
                </p>
                <p className="text-sm text-foreground leading-relaxed">{item.disposal}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Info className="h-3 w-3" />
                {t("clickForDetails")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ItemDetailDialog
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        uploadedImage={uploadedImage}
        language={language}
      />

      <BinExamplesDialog
        binColor={selectedBinColor}
        open={selectedBinColor !== null}
        onOpenChange={(open) => !open && setSelectedBinColor(null)}
        language={language}
      />
    </div>
  );
};
