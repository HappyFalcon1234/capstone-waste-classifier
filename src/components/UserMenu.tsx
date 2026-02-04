import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, History, Shield, MapPin, BarChart3, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "./AuthDialog";
import { useNavigate } from "react-router-dom";
import { getTranslation, type Language } from "@/lib/translations";

type UserMenuProps = {
  language?: Language;
};

const getMenuLabels = (language: Language) => {
  // Keep this local to avoid expanding the global translation key set.
  const labels: Record<Language, { signIn: string; signOut: string; adminPanel: string }> = {
    Assamese: { signIn: "ছাইন ইন", signOut: "ছাইন আউট", adminPanel: "এডমিন পেনেল" },
    Bengali: { signIn: "সাইন ইন", signOut: "সাইন আউট", adminPanel: "অ্যাডমিন প্যানেল" },
    Bodo: { signIn: "साइन इन", signOut: "साइन आउट", adminPanel: "एडमिन पेनल" },
    Dogri: { signIn: "साइन इन", signOut: "साइन आउट", adminPanel: "एडमिन पैनल" },
    English: { signIn: "Sign In", signOut: "Sign Out", adminPanel: "Admin Panel" },
    Gujarati: { signIn: "સાઇન ઇન", signOut: "સાઇન આઉટ", adminPanel: "એડમિન પેનલ" },
    Hindi: { signIn: "साइन इन", signOut: "साइन आउट", adminPanel: "एडमिन पैनल" },
    Kannada: { signIn: "ಸೈನ್ ಇನ್", signOut: "ಸೈನ್ ಔಟ್", adminPanel: "ಆಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್" },
    Kashmiri: { signIn: "سائن اِن", signOut: "سائن آؤٹ", adminPanel: "ایڈمن پینل" },
    Konkani: { signIn: "साइन इन", signOut: "साइन आउट", adminPanel: "ॲडमिन पॅनेल" },
    Maithili: { signIn: "साइन इन", signOut: "साइन आउट", adminPanel: "एडमिन पैनल" },
    Malayalam: { signIn: "സൈൻ ഇൻ", signOut: "സൈൻ ഔട്ട്", adminPanel: "അഡ്മിൻ പാനൽ" },
    Manipuri: { signIn: "সাইন ইন", signOut: "সাইন আউট", adminPanel: "এডমিন পেনেল" },
    Marathi: { signIn: "साइन इन", signOut: "साइन आउट", adminPanel: "अ‍ॅडमिन पॅनेल" },
    Nepali: { signIn: "साइन इन", signOut: "साइन आउट", adminPanel: "एडमिन प्यानल" },
    Odia: { signIn: "ସାଇନ୍ ଇନ୍", signOut: "ସାଇନ୍ ଆଉଟ୍", adminPanel: "ଅ୍ୟାଡମିନ୍ ପ୍ୟାନେଲ୍" },
    Punjabi: { signIn: "ਸਾਈਨ ਇਨ", signOut: "ਸਾਈਨ ਆਉਟ", adminPanel: "ਐਡਮਿਨ ਪੈਨਲ" },
    Sanskrit: { signIn: "प्रवेशः", signOut: "निर्गमनम्", adminPanel: "प्रशासक-पटलम्" },
    Santali: { signIn: "ᱥᱟᱭᱤᱱ ᱤᱱ", signOut: "ᱥᱟᱭᱤᱱ ᱟᱩᱴ", adminPanel: "ᱮᱰᱢᱤᱱ ᱯᱮᱱᱮᱞ" },
    Sindhi: { signIn: "سائن اِن", signOut: "سائن آئوٽ", adminPanel: "ايڊمن پينل" },
    Tamil: { signIn: "உள்நுழை", signOut: "வெளியேறு", adminPanel: "நிர்வாக பலகம்" },
    Telugu: { signIn: "సైన్ ఇన్", signOut: "సైన్ అవుట్", adminPanel: "అడ్మిన్ ప్యానెల్" },
    Urdu: { signIn: "سائن اِن", signOut: "سائن آؤٹ", adminPanel: "ایڈمن پینل" },
  };

  return labels[language] || labels.English;
};

export const UserMenu = ({ language }: UserMenuProps) => {
  const { user, isAdmin, username, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();

  const resolvedLanguage =
    language || (localStorage.getItem("preferredLanguage") as Language) || "English";
  const t = (key: string) => getTranslation(resolvedLanguage, key as any);
  const menuLabels = getMenuLabels(resolvedLanguage);

  // Get display name: prefer username, fall back to email prefix
  const displayName = username || user?.email?.split("@")[0] || "User";

  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setAuthDialogOpen(true)}>
          <User className="h-4 w-4 mr-2" />
          {menuLabels.signIn}
        </Button>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/history")}>
          <History className="h-4 w-4 mr-2" />
          {t("historyTitle")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <BarChart3 className="h-4 w-4 mr-2" />
          {t("dashboardTitle")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/recycling-centers")}>
          <MapPin className="h-4 w-4 mr-2" />
          {t("recyclingCentersTitle")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/tips")}>
          <Lightbulb className="h-4 w-4 mr-2" />
          {t("tipsTitle")}
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="h-4 w-4 mr-2" />
            {menuLabels.adminPanel}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {menuLabels.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
