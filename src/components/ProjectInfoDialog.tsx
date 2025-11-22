import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export const ProjectInfoDialog = () => {
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
            <h4 className="font-semibold text-sm">About This Project</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a Capstone Project by DVDT in the subject of AI for the Board Exam session 2025-2026.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
