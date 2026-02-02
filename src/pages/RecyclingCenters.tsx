import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { RECYCLING_CENTERS, getUniqueStates, getCitiesForState, RecyclingCenter } from "@/data/recyclingCenters";
import { LocationFilters } from "@/components/recycling/LocationFilters";
import { CenterCard } from "@/components/recycling/CenterCard";
import { getTranslation, Language } from "@/lib/translations";

const RecyclingCenters = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("English");
  const t = (key: string) => getTranslation(language, key as any);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) setLanguage(savedLanguage as Language);
  }, []);

  const states = useMemo(() => getUniqueStates(), []);
  const cities = useMemo(() => 
    selectedState ? getCitiesForState(selectedState) : [], 
    [selectedState]
  );

  const filteredCenters = useMemo(() => {
    return RECYCLING_CENTERS.filter(center => {
      const matchesSearch = searchQuery === "" || 
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.acceptedItems.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = !selectedType || center.type === selectedType;
      const matchesState = !selectedState || center.state === selectedState;
      const matchesCity = !selectedCity || center.city === selectedCity;
      return matchesSearch && matchesType && matchesState && matchesCity;
    });
  }, [searchQuery, selectedType, selectedState, selectedCity]);

  const openInMaps = (center: RecyclingCenter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.coordinates.lat},${center.coordinates.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("recyclingCentersTitle")}</h1>
            <p className="text-muted-foreground">{t("recyclingCentersSubtitle")}</p>
          </div>
        </div>

        {/* Filters */}
        <LocationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          states={states}
          cities={cities}
        />

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredCenters.length} of {RECYCLING_CENTERS.length} centers
          {selectedState && ` in ${selectedState}`}
          {selectedCity && `, ${selectedCity}`}
        </p>

        {/* Centers List */}
        <div className="space-y-4">
          {filteredCenters.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No recycling centers found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
              </CardContent>
            </Card>
          ) : (
            filteredCenters.map(center => (
              <CenterCard 
                key={center.id} 
                center={center} 
                onGetDirections={openInMaps}
              />
            ))
          )}
        </div>

        {/* Info Note */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Tip:</strong> Before visiting, call ahead to confirm operating hours and accepted materials. 
              Some facilities may require appointments for large quantities.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecyclingCenters;
