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
  cities
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
          placeholder="Search by name or accepted items..."
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
            <SelectValue placeholder="Select State" />
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
            <SelectValue placeholder="Select City" />
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
            Clear Filters
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
          All Types
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
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
