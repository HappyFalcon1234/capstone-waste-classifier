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
import { useState, useEffect, useRef } from "react";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!uploadedImage || !item?.bbox || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (!ctx) return;

    const drawHighlight = () => {
      // Set canvas size to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Draw translucent red rectangle over the item
      if (item.bbox) {
        const x = (item.bbox.x / 100) * canvas.width;
        const y = (item.bbox.y / 100) * canvas.height;
        const width = (item.bbox.width / 100) * canvas.width;
        const height = (item.bbox.height / 100) * canvas.height;

        ctx.fillStyle = "rgba(239, 68, 68, 0.3)"; // Translucent red
        ctx.strokeStyle = "rgba(239, 68, 68, 0.8)"; // Stronger red border
        ctx.lineWidth = 3;
        
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
      }
    };

    if (img.complete) {
      drawHighlight();
    } else {
      img.onload = drawHighlight;
    }
  }, [uploadedImage, item]);

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
          {/* Image Section */}
          {uploadedImage && (
            <div className="rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Uploaded waste"
                  className="w-full h-auto hidden"
                />
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                />
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
