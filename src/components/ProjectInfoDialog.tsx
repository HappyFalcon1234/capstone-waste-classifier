import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface ProjectInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectInfoDialog = ({ open, onOpenChange }: ProjectInfoDialogProps) => {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onOpenChange(true)}
        className="relative"
      >
        <Info className="h-5 w-5" />
        <span className="sr-only">Project information</span>
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About This Project
            </DialogTitle>
            <DialogDescription className="pt-4 text-base leading-relaxed">
              This is a Capstone Project by DVDT in the subject of AI for the Board Exam session 2025-2026.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
