import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Language } from "@/lib/translations";

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSelector = ({ language, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Alphabetically ordered Indian languages + English */}
          <SelectItem value="Assamese">অসমীয়া (Assamese)</SelectItem>
          <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
          <SelectItem value="Bodo">बड़ो (Bodo)</SelectItem>
          <SelectItem value="Dogri">डोगरी (Dogri)</SelectItem>
          <SelectItem value="English">English</SelectItem>
          <SelectItem value="Gujarati">ગુજરાતી (Gujarati)</SelectItem>
          <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
          <SelectItem value="Kannada">ಕನ್ನಡ (Kannada)</SelectItem>
          <SelectItem value="Kashmiri">कٲشُر (Kashmiri)</SelectItem>
          <SelectItem value="Konkani">कोंकणी (Konkani)</SelectItem>
          <SelectItem value="Maithili">मैथिली (Maithili)</SelectItem>
          <SelectItem value="Malayalam">മലയാളം (Malayalam)</SelectItem>
          <SelectItem value="Manipuri">মৈতৈলোন্ (Manipuri)</SelectItem>
          <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
          <SelectItem value="Nepali">नेपाली (Nepali)</SelectItem>
          <SelectItem value="Odia">ଓଡ଼ିଆ (Odia)</SelectItem>
          <SelectItem value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
          <SelectItem value="Sanskrit">संस्कृतम् (Sanskrit)</SelectItem>
          <SelectItem value="Santali">ᱥᱟᱱᱛᱟᱲᱤ (Santali)</SelectItem>
          <SelectItem value="Sindhi">سنڌي (Sindhi)</SelectItem>
          <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
          <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
          <SelectItem value="Urdu">اردو (Urdu)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
