import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { type Language } from "@/lib/translations";

interface StateSelectorProps {
  open: boolean;
  onStateSelect: (state: string) => void;
  language: Language;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const StateSelector = ({ open, onStateSelect, language }: StateSelectorProps) => {
  const [selectedState, setSelectedState] = useState<string>("");

  const handleSubmit = () => {
    if (selectedState) {
      onStateSelect(selectedState);
    }
  };

  const getTitle = () => {
    switch (language) {
      case "Hindi": return "आप भारत के किस राज्य से हैं?";
      case "Tamil": return "நீங்கள் இந்தியாவின் எந்த மாநிலத்தைச் சேர்ந்தவர்?";
      case "Telugu": return "మీరు భారతదేశంలోని ఏ రాష్ట్రానికి చెందినవారు?";
      default: return "Which state of India are you from?";
    }
  };

  const getDescription = () => {
    switch (language) {
      case "Hindi": return "हम आपके राज्य के अनुसार वर्गीकरण और निर्देशों को अनुकूलित करेंगे।";
      case "Tamil": return "உங்கள் மாநிலத்தின் அடிப்படையில் வகைப்பாடு மற்றும் வழிமுறைகளை நாங்கள் தனிப்பயனாக்குவோம்.";
      case "Telugu": return "మేము మీ రాష్ట్రం ఆధారంగా వర్గీకరణ మరియు సూచనలను అనుకూలీకరిస్తాము.";
      default: return "We'll customize classifications and instructions based on your state.";
    }
  };

  const getButtonText = () => {
    switch (language) {
      case "Hindi": return "जारी रखें";
      case "Tamil": return "தொடரவும்";
      case "Telugu": return "కొనసాగించండి";
      default: return "Continue";
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl">{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {indianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!selectedState}
          >
            {getButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
