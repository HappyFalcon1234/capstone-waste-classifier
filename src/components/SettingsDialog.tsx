import { useState } from "react";
import { Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { getTranslation, type Language } from "@/lib/translations";
import { Separator } from "@/components/ui/separator";

interface SettingsDialogProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const TUTORIAL_STORAGE_KEY = 'ecosort-tutorial-v4-seen';

const RTL_LANGUAGES: Language[] = ['Urdu', 'Kashmiri', 'Sindhi'];

export const SettingsDialog = ({ language, onLanguageChange }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const t = (key: string) => getTranslation(language, key as any);
  const isRTL = RTL_LANGUAGES.includes(language);

  const handleReplayTutorial = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setOpen(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-md ${isRTL ? 'rtl-text' : ''}`}>
        <DialogHeader className={isRTL ? 'text-right' : ''}>
          <DialogTitle>{t("settings")}</DialogTitle>
          <DialogDescription>
            {t("settingsDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("language")}</h3>
            <LanguageSelector 
              language={language} 
              onLanguageChange={onLanguageChange} 
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("theme")}</h3>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">{t("themeToggle")}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("help")}</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReplayTutorial}
              className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <RotateCcw className="h-4 w-4" />
              {t("replayTutorial")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
