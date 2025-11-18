import { Trash2, Recycle, AlertTriangle, Zap, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ItemDetailDialog } from "./ItemDetailDialog";
import { BinExamplesDialog } from "./BinExamplesDialog";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface WasteResultsProps {
  predictions: WasteItem[];
  uploadedImage?: string;
}

const getBinColorClass = (binColor: string) => {
  const color = binColor.toLowerCase();
  if (color.includes("blue")) return "bg-recyclable";
  if (color.includes("green")) return "bg-organic";
  if (color.includes("red")) return "bg-hazardous";
  if (color.includes("yellow")) return "bg-yellow-500";
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

export const WasteResults = ({ predictions, uploadedImage }: WasteResultsProps) => {
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [selectedBinColor, setSelectedBinColor] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Detected Items ({predictions.length})
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
                <CardTitle className="text-lg flex items-center gap-2">
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
                    {item.binColor} Bin
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.confidence}% confident
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                <p className="text-sm text-foreground">{item.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Disposal Instructions
                </p>
                <p className="text-sm text-foreground leading-relaxed">{item.disposal}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Info className="h-3 w-3" />
                Click for more details and feedback
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
      />

      <BinExamplesDialog
        binColor={selectedBinColor}
        open={selectedBinColor !== null}
        onOpenChange={(open) => !open && setSelectedBinColor(null)}
      />
    </div>
  );
};
