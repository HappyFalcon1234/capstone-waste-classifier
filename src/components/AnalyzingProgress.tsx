import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getTranslation, type Language } from "@/lib/translations";

const STAGE_KEYS = [
  { key: "progressUploading", duration: 800 },
  { key: "progressDetectingEdges", duration: 1200 },
  { key: "progressDetectingObjects", duration: 1500 },
  { key: "progressClassifying", duration: 2000 },
  { key: "progressWritingInstructions", duration: 3000 },
] as const;

interface AnalyzingProgressProps {
  language: Language;
  analysisComplete?: boolean;
}

export const AnalyzingProgress = ({ language, analysisComplete }: AnalyzingProgressProps) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const t = (key: string) => getTranslation(language, key as any);

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
      if (currentStage < STAGE_KEYS.length - 1) {
        currentStage++;
        setStageIndex(currentStage);
        setTimeout(advanceStage, STAGE_KEYS[currentStage].duration);
      }
    };

    const timeout = setTimeout(advanceStage, STAGE_KEYS[0].duration);
    return () => clearTimeout(timeout);
  }, []);

  // Set to 100% when analysis is complete
  useEffect(() => {
    if (analysisComplete) {
      setProgress(100);
    }
  }, [analysisComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-16 w-16 text-primary animate-spin" />
      <p className="text-lg font-medium text-foreground animate-pulse">
        {t(STAGE_KEYS[stageIndex].key)}
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
