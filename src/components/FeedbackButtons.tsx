import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FeedbackButtons = () => {
  const { toast } = useToast();

  const handleFeedback = (feedback: string) => {
    toast({
      title: "Feedback Received",
      description: `Thank you for letting us know the prediction was ${feedback.toLowerCase()}!`,
    });
  };

  return (
    <div className="border-t border-border pt-6">
      <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
        Was this prediction correct?
      </p>
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => handleFeedback("Yes")}
          className="flex-1 max-w-[150px]"
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Yes
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFeedback("No")}
          className="flex-1 max-w-[150px]"
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          No
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFeedback("I Don't Know")}
          className="flex-1 max-w-[150px]"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          I Don't Know
        </Button>
      </div>
    </div>
  );
};
