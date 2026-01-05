import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STAGES = [
  { text: "Uploading image...", duration: 800 },
  { text: "Detecting edges...", duration: 1200 },
  { text: "Detecting objects...", duration: 1500 },
  { text: "Classifying waste types...", duration: 2000 },
  { text: "Writing disposal instructions...", duration: 3000 },
];

export const AnalyzingProgress = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 95%
        if (prev >= 95) return prev;
        const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.3;
        return Math.min(95, prev + increment);
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Stage progression
    let currentStage = 0;
    const advanceStage = () => {
      if (currentStage < STAGES.length - 1) {
        currentStage++;
        setStageIndex(currentStage);
        setTimeout(advanceStage, STAGES[currentStage].duration);
      }
    };

    const timeout = setTimeout(advanceStage, STAGES[0].duration);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-16 w-16 text-primary animate-spin" />
      <p className="text-lg font-medium text-foreground animate-pulse">
        {STAGES[stageIndex].text}
      </p>
      <div className="w-48">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-sm text-muted-foreground font-mono">
        {Math.round(progress)}%
      </p>
    </div>
  );
};
