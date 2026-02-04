import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Zap, AlertTriangle, Recycle, MapPin, X } from "lucide-react";
import { type Language } from "@/lib/translations";

interface LocationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedState: string | null;
  onStateChange: (state: string | null) => void;
  selectedCity: string | null;
  onCityChange: (city: string | null) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  states: string[];
  cities: string[];
  t: (key: string) => string;
}

const filterTypes = [
  { value: "e-waste", label: "E-Waste", icon: Zap },
  { value: "hazardous", label: "Hazardous", icon: AlertTriangle },
  { value: "recyclable", label: "Recyclable", icon: Recycle },
  { value: "organic", label: "Organic", icon: MapPin }
];

export const LocationFilters = ({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  selectedCity,
  onCityChange,
  selectedType,
  onTypeChange,
  states,
  cities,
  t,
}: LocationFiltersProps) => {
  const handleClearFilters = () => {
    onSearchChange("");
    onStateChange(null);
    onCityChange(null);
    onTypeChange(null);
  };

  const hasActiveFilters = searchQuery || selectedState || selectedCity || selectedType;

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* State and City Selectors */}
      <div className="flex flex-wrap gap-3">
        <Select 
          value={selectedState || undefined} 
          onValueChange={(value) => {
            onStateChange(value);
            onCityChange(null); // Reset city when state changes
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("selectState")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedCity || undefined} 
          onValueChange={onCityChange}
          disabled={!selectedState || cities.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("selectCity")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
              {t("clearFilters")}
          </Button>
        )}
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange(null)}
        >
          {t("allTypes")}
        </Button>
        {filterTypes.map(filter => (
          <Button
            key={filter.value}
            variant={selectedType === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(filter.value)}
            className="gap-2"
          >
            <filter.icon className="h-4 w-4" />
            {t(
              ((): string => {
                switch (filter.value) {
                  case "e-waste":
                    return "eWasteType";
                  case "hazardous":
                    return "hazardousType";
                  case "recyclable":
                    return "recyclableType";
                  case "organic":
                    return "organicType";
                  default:
                    return filter.label;
                }
              })()
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
