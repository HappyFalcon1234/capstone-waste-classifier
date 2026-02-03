import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Leaf, 
  Recycle, 
  ShoppingBag, 
  Lightbulb,
  Home,
  Utensils,
  Shirt,
  Gift,
  ChevronRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { getTranslation, Language } from "@/lib/translations";

interface Tip {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: string;
  dos: string[];
  donts: string[];
}

const TIPS_DATA: Tip[] = [
  // Reduce tips
  {
    id: "1",
    title: "Say No to Single-Use Plastics",
    description: "Carry reusable bags, bottles, and containers. India generates over 3.5 million tons of plastic waste annually.",
    impact: "high",
    category: "reduce",
    dos: [
      "Carry a cloth bag for shopping",
      "Use steel or glass water bottles",
      "Bring your own containers for takeaway food",
      "Choose products with minimal packaging"
    ],
    donts: [
      "Accept plastic bags at shops",
      "Buy bottled water when you have a filter at home",
      "Use disposable cutlery at home",
      "Buy single-serve packaged items"
    ]
  },
  {
    id: "2",
    title: "Reduce Food Waste",
    description: "Plan meals, store food properly, and use leftovers creatively. About 40% of food produced in India is wasted.",
    impact: "high",
    category: "reduce",
    dos: [
      "Plan weekly meals before shopping",
      "Store fruits and vegetables properly",
      "Use FIFO (First In, First Out) method",
      "Freeze excess food before it spoils"
    ],
    donts: [
      "Buy in bulk without a plan",
      "Ignore expiry dates",
      "Throw away vegetable peels (use for stock)",
      "Cook more than needed regularly"
    ]
  },
  {
    id: "3",
    title: "Go Digital",
    description: "Reduce paper waste by opting for digital bills, statements, and documents.",
    impact: "medium",
    category: "reduce",
    dos: [
      "Request e-bills and e-statements",
      "Use note-taking apps instead of paper",
      "Share documents digitally",
      "Unsubscribe from unwanted catalogs"
    ],
    donts: [
      "Print emails unnecessarily",
      "Request paper receipts when digital is available",
      "Buy newspapers if you read online",
      "Use paper tickets when e-tickets work"
    ]
  },
  // Reuse tips
  {
    id: "4",
    title: "Upcycle Glass Jars",
    description: "Transform old glass jars into storage containers, planters, or decorative items.",
    impact: "medium",
    category: "reuse",
    dos: [
      "Use as spice containers",
      "Create mini herb gardens",
      "Store grains and pulses",
      "Make DIY candle holders"
    ],
    donts: [
      "Throw away without checking reuse potential",
      "Store acidic foods in metallic lids",
      "Use cracked or chipped jars for food",
      "Ignore sanitizing before reuse"
    ]
  },
  {
    id: "5",
    title: "Donate Before Discarding",
    description: "Give clothes, books, and electronics a second life by donating to those in need.",
    impact: "high",
    category: "reuse",
    dos: [
      "Donate to local NGOs or temples",
      "Use apps like 'Donate-a-Book' or 'Goonj'",
      "Organize clothing swaps with friends",
      "Repair items before considering disposal"
    ],
    donts: [
      "Throw away items that still work",
      "Donate torn or unusable items",
      "Ignore local kabadiwala for old items",
      "Discard without checking buyback options"
    ]
  },
  {
    id: "6",
    title: "Creative Cloth Reuse",
    description: "Turn old clothes into cleaning rags, bags, or quilts instead of throwing them away.",
    impact: "medium",
    category: "reuse",
    dos: [
      "Cut old t-shirts into cleaning cloths",
      "Make shopping bags from old jeans",
      "Create cushion covers from sarees",
      "Use fabric scraps for patchwork"
    ],
    donts: [
      "Throw clothes after minimal use",
      "Ignore tailoring options for resizing",
      "Discard without offering to others",
      "Mix fabric waste with general waste"
    ]
  },
  // Recycle tips
  {
    id: "7",
    title: "Proper E-Waste Disposal",
    description: "Electronic waste contains valuable materials and toxic substances. Dispose responsibly at authorized centers.",
    impact: "high",
    category: "recycle",
    dos: [
      "Find authorized e-waste collectors",
      "Use manufacturer take-back programs",
      "Wipe personal data before disposal",
      "Keep batteries separate from devices"
    ],
    donts: [
      "Throw electronics in regular waste",
      "Burn e-waste (releases toxic fumes)",
      "Ignore local e-waste collection drives",
      "Store broken electronics indefinitely"
    ]
  },
  {
    id: "8",
    title: "Clean Before Recycling",
    description: "Rinse containers and remove food residue. Contaminated recyclables often end up in landfills.",
    impact: "medium",
    category: "recycle",
    dos: [
      "Rinse food containers quickly",
      "Remove caps and labels when possible",
      "Flatten cardboard boxes",
      "Separate different material types"
    ],
    donts: [
      "Recycle greasy pizza boxes",
      "Mix recyclables with food waste",
      "Bag recyclables in plastic bags",
      "Assume all plastics are recyclable"
    ]
  },
  {
    id: "9",
    title: "Composting at Home",
    description: "Turn kitchen waste into nutrient-rich compost for plants. Reduces waste going to landfills by up to 30%.",
    impact: "high",
    category: "recycle",
    dos: [
      "Compost fruit and vegetable scraps",
      "Add dry leaves for carbon balance",
      "Turn compost regularly",
      "Use a covered bin to avoid pests"
    ],
    donts: [
      "Add meat, dairy, or oily foods",
      "Compost diseased plants",
      "Let compost get too wet or dry",
      "Add pet waste to edible garden compost"
    ]
  }
];

const CATEGORIES = [
  { id: "all", label: "allTips", icon: Lightbulb },
  { id: "reduce", label: "reduce", icon: ShoppingBag },
  { id: "reuse", label: "reuse", icon: Gift },
  { id: "recycle", label: "recycle", icon: Recycle }
];

const getImpactColor = (impact: Tip["impact"]) => {
  switch (impact) {
    case "high": return "bg-organic text-white";
    case "medium": return "bg-yellow-500 text-yellow-950";
    case "low": return "bg-blue-500 text-white";
  }
};

const getImpactLabel = (impact: Tip["impact"], t: (key: string) => string) => {
  switch (impact) {
    case "high": return t("highImpact");
    case "medium": return t("mediumImpact");
    case "low": return t("lowImpact");
  }
};

const Tips = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("English");
  const t = (key: string) => getTranslation(language, key as any);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) setLanguage(savedLanguage as Language);
  }, []);

  const filteredTips = selectedCategory === "all" 
    ? TIPS_DATA 
    : TIPS_DATA.filter(tip => tip.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("tipsTitle")}</h1>
            <p className="text-muted-foreground">{t("tipsSubtitle")}</p>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                <cat.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t(cat.label)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 3R Principle Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-organic/10 to-recyclable/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">{t("reduce")}</p>
                <p className="text-xs text-muted-foreground">{t("consumeLess")}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="w-12 h-12 rounded-full bg-organic/20 flex items-center justify-center mx-auto mb-2">
                  <Gift className="h-6 w-6 text-organic" />
                </div>
                <p className="font-semibold">{t("reuse")}</p>
                <p className="text-xs text-muted-foreground">{t("useAgain")}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="w-12 h-12 rounded-full bg-recyclable/20 flex items-center justify-center mx-auto mb-2">
                  <Recycle className="h-6 w-6 text-recyclable" />
                </div>
                <p className="font-semibold">{t("recycle")}</p>
                <p className="text-xs text-muted-foreground">{t("transform")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips List */}
        <div className="space-y-4">
          {filteredTips.map(tip => (
            <Card 
              key={tip.id} 
              className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${
                expandedTip === tip.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <Badge className={getImpactColor(tip.impact)}>
                        {getImpactLabel(tip.impact, t)}
                      </Badge>
                    </div>
                    <CardDescription>{tip.description}</CardDescription>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                    expandedTip === tip.id ? "rotate-90" : ""
                  }`} />
                </div>
              </CardHeader>
              
              {expandedTip === tip.id && (
                <CardContent className="pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Do's */}
                    <div>
                      <h4 className="flex items-center gap-2 font-semibold text-organic mb-3">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("dos")}
                      </h4>
                      <ul className="space-y-2">
                        {tip.dos.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-organic mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Don'ts */}
                    <div>
                      <h4 className="flex items-center gap-2 font-semibold text-hazardous mb-3">
                        <XCircle className="h-4 w-4" />
                        {t("donts")}
                      </h4>
                      <ul className="space-y-2">
                        {tip.donts.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-hazardous mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="py-6">
            <h3 className="font-semibold mb-4 text-center">{t("didYouKnow")}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">62M</p>
                <p className="text-xs text-muted-foreground">{t("wasteYearly")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-organic">30%</p>
                <p className="text-xs text-muted-foreground">{t("wasteComposted")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-recyclable">75%</p>
                <p className="text-xs text-muted-foreground">{t("eWasteRecyclable")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tips;
