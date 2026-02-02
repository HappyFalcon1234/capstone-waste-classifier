import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Phone, Clock, Navigation, Loader2, Search, Recycle, Zap, AlertTriangle } from "lucide-react";

interface RecyclingCenter {
  id: string;
  name: string;
  type: "e-waste" | "hazardous" | "recyclable" | "organic";
  address: string;
  distance: string;
  phone?: string;
  hours: string;
  acceptedItems: string[];
  coordinates: { lat: number; lng: number };
}

// Sample data for Indian recycling centers
const SAMPLE_CENTERS: RecyclingCenter[] = [
  {
    id: "1",
    name: "E-Parisaraa Pvt Ltd",
    type: "e-waste",
    address: "Dobbspet Industrial Area, Bangalore, Karnataka",
    distance: "12.5 km",
    phone: "+91 80 2371 5253",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Mobiles", "TVs", "Printers", "Batteries"],
    coordinates: { lat: 13.0827, lng: 77.5877 }
  },
  {
    id: "2",
    name: "Attero Recycling",
    type: "e-waste",
    address: "Greater Noida, Uttar Pradesh",
    distance: "8.2 km",
    phone: "+91 120 4567890",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    acceptedItems: ["Laptops", "Phones", "Tablets", "Cables", "PCBs"],
    coordinates: { lat: 28.4744, lng: 77.504 }
  },
  {
    id: "3",
    name: "Mumbai Waste Management",
    type: "recyclable",
    address: "Dadar East, Mumbai, Maharashtra",
    distance: "3.1 km",
    phone: "+91 22 2411 5678",
    hours: "Mon-Sun: 7:00 AM - 8:00 PM",
    acceptedItems: ["Paper", "Cardboard", "Plastic bottles", "Glass", "Metal cans"],
    coordinates: { lat: 19.0178, lng: 72.8478 }
  },
  {
    id: "4",
    name: "Ramky Enviro Engineers",
    type: "hazardous",
    address: "Dundigal, Hyderabad, Telangana",
    distance: "18.7 km",
    phone: "+91 40 2304 5678",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Batteries", "Chemicals", "Paint", "Pesticides", "Medical waste"],
    coordinates: { lat: 17.5855, lng: 78.4235 }
  },
  {
    id: "5",
    name: "Delhi Green Composting",
    type: "organic",
    address: "Okhla Phase II, New Delhi",
    distance: "5.4 km",
    phone: "+91 11 2634 7890",
    hours: "Mon-Sun: 6:00 AM - 9:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Coconut shells", "Leaves"],
    coordinates: { lat: 28.5355, lng: 77.268 }
  },
  {
    id: "6",
    name: "Saahas Zero Waste",
    type: "recyclable",
    address: "HSR Layout, Bangalore, Karnataka",
    distance: "6.8 km",
    phone: "+91 80 4965 1234",
    hours: "Mon-Sat: 8:00 AM - 6:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Tetra packs", "E-waste"],
    coordinates: { lat: 12.9121, lng: 77.6446 }
  }
];

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

const RecyclingCenters = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingLocation(false);
        },
        () => {
          setLoadingLocation(false);
        }
      );
    }
  }, []);

  const filteredCenters = SAMPLE_CENTERS.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.acceptedItems.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !selectedType || center.type === selectedType;
    return matchesSearch && matchesType;
  });

  const openInMaps = (center: RecyclingCenter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.coordinates.lat},${center.coordinates.lng}`;
    window.open(url, "_blank");
  };

  const filterTypes = [
    { value: "e-waste", label: "E-Waste", icon: Zap },
    { value: "hazardous", label: "Hazardous", icon: AlertTriangle },
    { value: "recyclable", label: "Recyclable", icon: Recycle },
    { value: "organic", label: "Organic", icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Recycling Centers</h1>
            <p className="text-muted-foreground">Find nearby facilities for proper waste disposal</p>
          </div>
        </div>

        {/* Location Status */}
        {loadingLocation && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Getting your location...</span>
            </CardContent>
          </Card>
        )}

        {userLocation && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 py-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm">Showing centers near your location</span>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or accepted items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              All Types
            </Button>
            {filterTypes.map(filter => (
              <Button
                key={filter.value}
                variant={selectedType === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(filter.value)}
                className="gap-2"
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Centers List */}
        <div className="space-y-4">
          {filteredCenters.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No recycling centers found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredCenters.map(center => {
              const config = getTypeConfig(center.type);
              const Icon = config.icon;
              
              return (
                <Card key={center.id} className={`overflow-hidden border-l-4 ${config.borderColor} hover:shadow-lg transition-shadow`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{center.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {center.address}
                        </CardDescription>
                      </div>
                      <Badge className={config.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4" />
                        {center.distance}
                      </div>
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
                      <p className="text-sm font-medium mb-2">Accepted Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {center.acceptedItems.map(item => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => openInMaps(center)}
                      className="w-full sm:w-auto gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              );
            })
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
