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
import { ThumbsUp, ThumbsDown, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getTranslation, getBinColorTranslation, type Language } from "@/lib/translations";
import { useFeedback } from "@/hooks/useFeedback";

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
  language: Language;
  uploadHistoryId?: string;
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
  language,
  uploadHistoryId,
}: ItemDetailDialogProps) => {
  const { toast } = useToast();
  const { submitFeedback } = useFeedback();
  const [feedback, setFeedback] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [showDescriptionRequired, setShowDescriptionRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const t = (key: string) => getTranslation(language, key as any);

  if (!item) return null;

  const handleFeedback = async (feedbackType: string) => {
    setSelectedFeedback(feedbackType);
    
    // If "No" is selected, require description before submitting
    if (feedbackType === "No") {
      setShowDescriptionRequired(true);
      return;
    }
    
    // For "Yes" or "I Don't Know", submit immediately
    setIsSubmitting(true);
    const success = await submitFeedback(
      item,
      feedbackType === "Yes" ? "yes" : "not_sure",
      undefined,
      uploadHistoryId
    );
    setIsSubmitting(false);
    
    if (success) {
      toast({
        title: t("feedbackReceived"),
        description: t("feedbackThanks"),
      });
    }
  };

  const handleSubmitFeedback = async () => {
    if (selectedFeedback === "No" && !feedback.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe what was incorrect about the prediction.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    const success = await submitFeedback(
      item,
      selectedFeedback === "No" ? "no" : selectedFeedback === "Yes" ? "yes" : "not_sure",
      feedback.trim() || undefined,
      uploadHistoryId
    );
    setIsSubmitting(false);
    
    if (success) {
      toast({
        title: t("feedbackReceived"),
        description: t("detailedFeedbackThanks"),
      });
      setFeedback("");
      setShowDescriptionRequired(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.item}</DialogTitle>
          <DialogDescription>
            {t("classificationDetails")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section */}
          {uploadedImage && (
            <div className="rounded-lg overflow-hidden border-2 border-primary shadow-lg">
              <div className="bg-muted/30 p-4 flex items-center justify-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded waste"
                  className="max-h-[400px] w-auto object-contain"
                />
              </div>
              <div className="bg-primary/10 p-3 text-center">
                <p className="text-sm font-medium text-foreground">
                  {t("selectedItem")}: <span className="text-primary">{item.item}</span>
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
                {getBinColorTranslation(language, item.binColor)}
              </Badge>
              <Badge variant="outline">
                {item.confidence}% {t("confident")}
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                {t("category")}
              </h3>
              <p className="text-foreground">{item.category}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                {t("disposalInstructions")}
              </h3>
              <p className="text-foreground leading-relaxed">{item.disposal}</p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {t("wasPredictionCorrect")}
              </p>
              <div className="flex gap-3">
                <Button
                  variant={selectedFeedback === "Yes" ? "default" : "outline"}
                  onClick={() => handleFeedback("Yes")}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {t("yes")}
                </Button>
                <Button
                  variant={selectedFeedback === "No" ? "default" : "outline"}
                  onClick={() => handleFeedback("No")}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  {t("no")}
                </Button>
                <Button
                  variant={selectedFeedback === "I Don't Know" ? "default" : "outline"}
                  onClick={() => handleFeedback("I Don't Know")}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {t("notSure")}
                </Button>
              </div>
            </div>

            {/* Description required for "No" feedback */}
            {showDescriptionRequired && selectedFeedback === "No" && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Please describe what was incorrect
                  </p>
                </div>
                <Textarea
                  placeholder="What was wrong with the prediction? What should it be instead?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
                <Button
                  onClick={handleSubmitFeedback}
                  className="w-full"
                  disabled={!feedback.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {t("submitFeedback")}
                </Button>
              </div>
            )}

            {/* Optional additional feedback for other responses */}
            {selectedFeedback && selectedFeedback !== "No" && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("additionalFeedback")}
                </p>
                <Textarea
                  placeholder={t("feedbackPlaceholder")}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px]"
                />
                {feedback.trim() && (
                  <Button
                    onClick={handleSubmitFeedback}
                    className="mt-2 w-full"
                    variant="secondary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {t("submitFeedback")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
