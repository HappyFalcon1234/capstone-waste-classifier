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
import { type Language } from "@/lib/translations";
import { Separator } from "@/components/ui/separator";

interface SettingsDialogProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const TUTORIAL_STORAGE_KEY = 'ecosort-tutorial-seen';

export const SettingsDialog = ({ language, onLanguageChange }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);

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
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your EcoSort experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Language</h3>
            <LanguageSelector 
              language={language} 
              onLanguageChange={onLanguageChange} 
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Theme</h3>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Toggle dark/light mode</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Help</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReplayTutorial}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Replay Tutorial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
