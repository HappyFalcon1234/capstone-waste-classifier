import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

interface ItemDetailDialogProps {
  item: WasteItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadedImage?: string;
}

const getBinColorClass = (binColor: string) => {
  const color = binColor.toLowerCase();
  if (color.includes("blue")) return "bg-recyclable";
  if (color.includes("green")) return "bg-organic";
  if (color.includes("red")) return "bg-hazardous";
  if (color.includes("yellow")) return "bg-yellow-500";
  return "bg-muted";
};

export const ItemDetailDialog = ({
  item,
  open,
  onOpenChange,
  uploadedImage,
}: ItemDetailDialogProps) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  if (!item) return null;

  const handleFeedback = (feedbackType: string) => {
    setSelectedFeedback(feedbackType);
    toast({
      title: "Feedback Received",
      description: `Thank you for letting us know the prediction was ${feedbackType.toLowerCase()}!`,
    });
  };

  const handleSubmitFeedback = () => {
    if (feedback.trim()) {
      toast({
        title: "Additional Feedback Received",
        description: "Thank you for your detailed feedback!",
      });
      setFeedback("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.item}</DialogTitle>
          <DialogDescription>
            Classification details and feedback
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section with Bounding Box */}
          {uploadedImage && (
            <div className="rounded-lg overflow-hidden border-2 border-primary shadow-lg">
              <div className="relative bg-muted/30 p-4 flex items-center justify-center">
                <div className="relative inline-block max-w-full">
                  <img
                    src={uploadedImage}
                    alt="Uploaded waste"
                    className="max-h-[400px] w-auto object-contain"
                  />
                  {/* Simulated bounding box - centered for visual effect */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-4 border-primary rounded-lg w-3/4 h-3/4 pointer-events-none shadow-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 p-3 text-center">
                <p className="text-sm font-medium text-foreground">
                  Selected item: <span className="text-primary">{item.item}</span>
                </p>
              </div>
            </div>
          )}

          {/* Item Details */}
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge
                className={`${getBinColorClass(item.binColor)} text-white`}
                variant="secondary"
              >
                {item.binColor} Bin
              </Badge>
              <Badge variant="outline">
                {item.confidence}% confident
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Category
              </h3>
              <p className="text-foreground">{item.category}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Disposal Instructions
              </h3>
              <p className="text-foreground leading-relaxed">{item.disposal}</p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Was this prediction correct?
              </p>
              <div className="flex gap-3">
                <Button
                  variant={selectedFeedback === "Yes" ? "default" : "outline"}
                  onClick={() => handleFeedback("Yes")}
                  className="flex-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Yes
                </Button>
                <Button
                  variant={selectedFeedback === "No" ? "default" : "outline"}
                  onClick={() => handleFeedback("No")}
                  className="flex-1"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  No
                </Button>
                <Button
                  variant={selectedFeedback === "I Don't Know" ? "default" : "outline"}
                  onClick={() => handleFeedback("I Don't Know")}
                  className="flex-1"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Not Sure
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Additional feedback (optional)
              </p>
              <Textarea
                placeholder="Share any additional thoughts or corrections..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[80px]"
              />
              {feedback.trim() && (
                <Button
                  onClick={handleSubmitFeedback}
                  className="mt-2 w-full"
                  variant="secondary"
                >
                  Submit Feedback
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
