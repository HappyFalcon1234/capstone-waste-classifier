import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, Navigation, Zap, AlertTriangle, Recycle } from "lucide-react";
import { RecyclingCenter } from "@/data/recyclingCenters";

interface CenterCardProps {
  center: RecyclingCenter;
  onGetDirections: (center: RecyclingCenter) => void;
  t: (key: string) => string;
}

const getTypeConfig = (type: RecyclingCenter["type"]) => {
  switch (type) {
    case "e-waste":
      return { 
        icon: Zap, 
        color: "bg-yellow-500 text-yellow-950", 
        label: "E-Waste",
        borderColor: "border-yellow-500/30"
      };
    case "hazardous":
      return { 
        icon: AlertTriangle, 
        color: "bg-hazardous text-white", 
        label: "Hazardous",
        borderColor: "border-hazardous/30"
      };
    case "recyclable":
      return { 
        icon: Recycle, 
        color: "bg-recyclable text-white", 
        label: "Recyclable",
        borderColor: "border-recyclable/30"
      };
    case "organic":
      return { 
        icon: MapPin, 
        color: "bg-organic text-white", 
        label: "Organic",
        borderColor: "border-organic/30"
      };
  }
};

export const CenterCard = ({ center, onGetDirections, t }: CenterCardProps) => {
  const config = getTypeConfig(center.type);
  const Icon = config.icon;

  return (
    <Card className={`overflow-hidden border-l-4 ${config.borderColor} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{center.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {center.address}, {center.city}, {center.state}
            </CardDescription>
          </div>
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {t(
              center.type === "e-waste"
                ? "eWasteType"
                : center.type === "hazardous"
                  ? "hazardousType"
                  : center.type === "recyclable"
                    ? "recyclableType"
                    : "organicType"
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {center.hours}
          </div>
          {center.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {center.phone}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">{t("acceptedItems")}:</p>
          <div className="flex flex-wrap gap-1">
            {center.acceptedItems.map(item => (
              <Badge key={item} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => onGetDirections(center)}
          className="w-full sm:w-auto gap-2"
        >
          <Navigation className="h-4 w-4" />
          {t("getDirections")}
        </Button>
      </CardContent>
    </Card>
  );
};
