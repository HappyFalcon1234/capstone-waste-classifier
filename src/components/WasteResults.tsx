import { Trash2, Recycle, AlertTriangle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

interface WasteResultsProps {
  predictions: WasteItem[];
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

export const WasteResults = ({ predictions }: WasteResultsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Detected Items ({predictions.length})
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {predictions.map((item, index) => (
          <Card key={index} className="overflow-hidden border-border/50 hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  {item.item}
                </CardTitle>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={`${getBinColorClass(item.binColor)} text-white`}
                    variant="secondary"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
