import { useState, useEffect } from 'react';
import { X, ArrowDown, Upload, Palette, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoachMark {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  arrowDirection: 'up' | 'down' | 'left' | 'right';
}

const coachMarks: CoachMark[] = [
  {
    id: 'upload',
    title: 'Upload an Image',
    description: 'Take a photo or upload an image of waste to get started',
    icon: <Upload className="h-5 w-5" />,
    position: { top: '35%', left: '50%' },
    arrowDirection: 'up',
  },
  {
    id: 'bins',
    title: 'Color-Coded Bins',
    description: 'Learn about the different bin colors used in India',
    icon: <Palette className="h-5 w-5" />,
    position: { bottom: '35%', left: '50%' },
    arrowDirection: 'down',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Change language and theme preferences',
    icon: <Settings className="h-5 w-5" />,
    position: { top: '80px', right: '100px' },
    arrowDirection: 'up',
  },
  {
    id: 'info',
    title: 'Scroll for More',
    description: 'Learn about waste management challenges in India',
    icon: <Info className="h-5 w-5" />,
    position: { bottom: '100px', left: '50%' },
    arrowDirection: 'down',
  },
];

const TUTORIAL_STORAGE_KEY = 'ecosort-tutorial-seen';

export function TutorialOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!hasSeenTutorial) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  };

  const handleNext = () => {
    if (currentStep < coachMarks.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleSkip = () => {
    handleDismiss();
  };

  if (!isVisible) return null;

  const currentMark = coachMarks[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in"
        onClick={handleSkip}
      />

      {/* Coach mark */}
      <div
        className="absolute pointer-events-auto animate-scale-in"
        style={{
          ...currentMark.position,
          transform: currentMark.position.left === '50%' ? 'translateX(-50%)' : undefined,
        }}
      >
        {/* Arrow indicator */}
        {currentMark.arrowDirection === 'up' && (
          <div className="flex justify-center mb-2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-primary rotate-180" />
          </div>
        )}

        {/* Content card */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xl max-w-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              {currentMark.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">
                {currentMark.title}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                {currentMark.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 -mt-1 -mr-1"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress and actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex gap-1.5">
              {coachMarks.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs h-7 px-2"
              >
                Skip
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="text-xs h-7 px-3"
              >
                {currentStep < coachMarks.length - 1 ? 'Next' : 'Got it'}
              </Button>
            </div>
          </div>
        </div>

        {/* Arrow indicator (down) */}
        {currentMark.arrowDirection === 'down' && (
          <div className="flex justify-center mt-2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
