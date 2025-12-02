import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { getTranslation, type Language } from "@/lib/translations";

interface BinExamplesDialogProps {
  binColor: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language;
}

const binExamples: Record<string, { title: string; examples: string[]; description: string }> = {
  blue: {
    title: "Recyclable Waste (Blue Bin)",
    description: "Clean, dry recyclable materials",
    examples: [
      "Paper and cardboard",
      "Newspapers and magazines",
      "Plastic bottles (PET)",
      "Glass bottles and jars",
      "Aluminum cans",
      "Steel/tin cans",
      "Clean food containers",
      "Tetra packs (clean and dry)",
    ],
  },
  green: {
    title: "Organic/Wet Waste (Green Bin)",
    description: "Biodegradable organic materials",
    examples: [
      "Fruit and vegetable peels",
      "Food scraps and leftovers",
      "Tea bags and coffee grounds",
      "Eggshells",
      "Garden waste and leaves",
      "Flowers",
      "Sawdust",
      "Cooked food waste",
    ],
  },
  red: {
    title: "Hazardous Waste (Red Bin)",
    description: "Dangerous materials requiring special disposal",
    examples: [
      "Batteries",
      "Paint cans",
      "Pesticides and insecticides",
      "Medical waste",
      "Expired medicines",
      "CFLs and tube lights",
      "Cleaning chemicals",
      "Aerosol cans",
    ],
  },
  yellow: {
    title: "E-Waste (Yellow Bin)",
    description: "Electronic and electrical waste",
    examples: [
      "Mobile phones and smartphones",
      "Laptops and computers",
      "Monitors and screens",
      "Keyboards and mice",
      "Printers and scanners",
      "Cables and chargers",
      "Batteries (rechargeable)",
      "Old electronic appliances",
    ],
  },
  black: {
    title: "Non-Recyclable/Dry Waste (Black Bin)",
    description: "Non-biodegradable, non-recyclable waste",
    examples: [
      "Polythene bags",
      "Multilayer plastic packaging",
      "Broken ceramics",
      "Disposable diapers",
      "Sanitary products",
      "Cigarette butts",
      "Soiled paper",
      "Worn-out clothes and shoes",
    ],
  },
};

const getBinColorClass = (binColor: string) => {
  const color = binColor.toLowerCase();
  if (color.includes("blue")) return "bg-recyclable";
  if (color.includes("green")) return "bg-organic";
  if (color.includes("red")) return "bg-hazardous";
  if (color.includes("yellow")) return "bg-yellow-500";
  if (color.includes("black")) return "bg-gray-700";
  return "bg-muted";
};

export const BinExamplesDialog = ({
  binColor,
  open,
  onOpenChange,
  language,
}: BinExamplesDialogProps) => {
  const t = (key: string) => getTranslation(language, key as any);
  if (!binColor) return null;

  const colorKey = binColor.toLowerCase().split(" ")[0];
  const examples = binExamples[colorKey] || binExamples.black;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Badge
              className={`${getBinColorClass(binColor)} text-white`}
              variant="secondary"
            >
              {binColor}
            </Badge>
            <DialogTitle className="text-xl">{examples.title}</DialogTitle>
          </div>
          <DialogDescription>{examples.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Examples of items:</h3>
          <ul className="grid grid-cols-1 gap-2">
            {examples.examples.map((example, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-foreground p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-primary font-bold min-w-[24px]">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> Always check local guidelines as waste
            segregation rules may vary by region.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
