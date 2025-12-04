import { useState, useEffect, useCallback } from 'react';
import { X, ArrowDown, Upload, Palette, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface CoachMark {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selector: string;
  mobileSelector?: string;
  arrowDirection: 'up' | 'down' | 'left' | 'right';
  cardPosition: 'above' | 'below' | 'left' | 'right';
}

const coachMarks: CoachMark[] = [
  {
    id: 'upload',
    title: 'Upload an Image',
    description: 'Take a photo or upload an image of waste to get started',
    icon: <Upload className="h-5 w-5" />,
    selector: '[data-tutorial="upload"]',
    arrowDirection: 'down',
    cardPosition: 'above',
  },
  {
    id: 'bins',
    title: 'Color-Coded Bins',
    description: 'Learn about the different bin colors used in India',
    icon: <Palette className="h-5 w-5" />,
    selector: '[data-tutorial="bins"]',
    arrowDirection: 'up',
    cardPosition: 'above',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Change language and theme preferences',
    icon: <Settings className="h-5 w-5" />,
    selector: '[data-tutorial="settings"]',
    arrowDirection: 'down',
    cardPosition: 'below',
  },
  {
    id: 'info',
    title: 'Scroll for More',
    description: 'Learn about waste management challenges in India',
    icon: <Info className="h-5 w-5" />,
    selector: '[data-tutorial="info"]',
    arrowDirection: 'up',
    cardPosition: 'above',
  },
];

const TUTORIAL_STORAGE_KEY = 'ecosort-tutorial-seen';

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const isMobile = useIsMobile();

  const updateHighlightPosition = useCallback(() => {
    const currentMark = coachMarks[currentStep];
    const selector = isMobile && currentMark.mobileSelector 
      ? currentMark.mobileSelector 
      : currentMark.selector;
    const element = document.querySelector(selector);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = isMobile ? 8 : 12;
      setHighlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }
  }, [currentStep, isMobile]);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      updateHighlightPosition();
      window.addEventListener('resize', updateHighlightPosition);
      window.addEventListener('scroll', updateHighlightPosition);
      return () => {
        window.removeEventListener('resize', updateHighlightPosition);
        window.removeEventListener('scroll', updateHighlightPosition);
      };
    }
  }, [isVisible, updateHighlightPosition]);

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

  if (!isVisible || !highlightRect) return null;

  const currentMark = coachMarks[currentStep];

  // Calculate card position based on highlight
  const getCardStyle = (): React.CSSProperties => {
    if (!highlightRect) return {};
    
    const cardWidth = isMobile ? 280 : 320;
    const gap = 16;
    
    if (currentMark.cardPosition === 'above') {
      return {
        bottom: `calc(100vh - ${highlightRect.top}px + ${gap}px)`,
        left: Math.max(16, Math.min(
          highlightRect.left + highlightRect.width / 2 - cardWidth / 2,
          window.innerWidth - cardWidth - 16
        )),
        width: cardWidth,
      };
    } else if (currentMark.cardPosition === 'below') {
      return {
        top: highlightRect.top + highlightRect.height + gap,
        left: Math.max(16, Math.min(
          highlightRect.left + highlightRect.width / 2 - cardWidth / 2,
          window.innerWidth - cardWidth - 16
        )),
        width: cardWidth,
      };
    }
    return {};
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={handleSkip}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={highlightRect.left}
              y={highlightRect.top}
              width={highlightRect.width}
              height={highlightRect.height}
              rx={isMobile ? 12 : 16}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tutorial-mask)"
          className="animate-fade-in"
        />
      </svg>

      {/* Pulsing highlight ring */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: highlightRect.top,
          left: highlightRect.left,
          width: highlightRect.width,
          height: highlightRect.height,
        }}
      >
        <div 
          className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse"
          style={{ boxShadow: '0 0 0 4px hsl(var(--primary) / 0.3)' }}
        />
        <div 
          className="absolute inset-0 rounded-xl border-2 border-primary/50"
          style={{
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      </div>

      {/* Coach mark card */}
      <div
        className="absolute pointer-events-auto animate-scale-in"
        style={getCardStyle()}
      >
        {/* Arrow indicator pointing up */}
        {currentMark.arrowDirection === 'up' && currentMark.cardPosition === 'above' && (
          <div className="flex justify-center mt-2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-primary" />
          </div>
        )}

        {/* Arrow indicator pointing down */}
        {currentMark.arrowDirection === 'down' && currentMark.cardPosition === 'below' && (
          <div className="flex justify-center mb-2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-primary rotate-180" />
          </div>
        )}

        {/* Content card */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xl">
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
                    index === currentStep ? 'bg-primary' : index < currentStep ? 'bg-primary/50' : 'bg-muted'
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

        {/* Arrow indicator pointing down (for above cards) */}
        {currentMark.arrowDirection === 'down' && currentMark.cardPosition === 'above' && (
          <div className="flex justify-center mb-2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-primary" />
          </div>
        )}

        {/* Arrow indicator pointing up (for below cards) */}
        {currentMark.arrowDirection === 'up' && currentMark.cardPosition === 'below' && (
          <div className="flex justify-center mt-2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-primary rotate-180" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
