import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { getTranslation, type Language } from "@/lib/translations";

interface ProjectInfoDialogProps {
  language: Language;
}

export const ProjectInfoDialog = ({ language }: ProjectInfoDialogProps) => {
  const t = (key: string) => getTranslation(language, key as any);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">Project information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-popover z-50" 
        align="start"
        side="bottom"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">{t("aboutThisProject")}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("projectDescription")}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
