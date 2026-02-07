import { useState, useEffect, useCallback } from 'react';
import { X, ArrowDown, Upload, Palette, Menu, Scroll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

interface CoachMark {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selector: string;
  mobileSelector?: string;
  arrowDirection: 'up' | 'down' | 'left' | 'right';
  preferredCardPosition: 'above' | 'below';
  requiresDropdown?: boolean;
}

const coachMarks: CoachMark[] = [
  {
    id: 'upload',
    title: 'Classify Your Waste',
    description: 'Upload or take a photo of any waste item to instantly identify the correct bin for disposal',
    icon: <Upload className="h-5 w-5" />,
    selector: '[data-tutorial="upload"]',
    arrowDirection: 'down',
    preferredCardPosition: 'above',
  },
  {
    id: 'bins',
    title: 'Indian Bin Color System',
    description: 'Tap any bin to see example items.',
    icon: <Palette className="h-5 w-5" />,
    selector: '[data-tutorial="bins"]',
    arrowDirection: 'up',
    preferredCardPosition: 'above',
  },
  {
    id: 'menu',
    title: 'Your EcoSort Menu',
    description: 'Click here to access all your personal features',
    icon: <Menu className="h-5 w-5" />,
    selector: '[data-tutorial="settings"]',
    arrowDirection: 'down',
    preferredCardPosition: 'below',
  },
  {
    id: 'menu-content',
    title: 'Explore Your Features',
    description: 'Access your Dashboard, History, Recycling Centers, Eco Tips, and more from this menu',
    icon: <Menu className="h-5 w-5" />,
    selector: '[data-tutorial="menu-content"]',
    arrowDirection: 'left',
    preferredCardPosition: 'below',
    requiresDropdown: true,
  },
  {
    id: 'info',
    title: 'Why It Matters',
    description: 'Scroll down to learn about India\'s waste crisis and how proper segregation makes a difference',
    icon: <Scroll className="h-5 w-5" />,
    selector: '[data-tutorial="info"]',
    arrowDirection: 'up',
    preferredCardPosition: 'above',
  },
];

// Updated key to trigger new tutorial for existing users  
const TUTORIAL_STORAGE_KEY = 'ecosort-tutorial-v5-seen';

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
  const [actualCardPosition, setActualCardPosition] = useState<'above' | 'below'>('above');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, loading } = useAuth();
  

  const scrollToElement = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const cardHeight = 180; // Approximate card height
    const padding = 100;
    
    // Check if element is in viewport with enough space for card
    const needsScroll = 
      rect.top < padding + cardHeight || 
      rect.bottom > viewportHeight - padding;
    
    if (needsScroll) {
      const targetScrollY = window.scrollY + rect.top - viewportHeight / 2 + rect.height / 2;
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth'
      });
    }
  }, []);

  const updateHighlightPosition = useCallback(() => {
    const currentMark = coachMarks[currentStep];
    const selector = isMobile && currentMark.mobileSelector 
      ? currentMark.mobileSelector 
      : currentMark.selector;
    const element = document.querySelector(selector);
    
    if (element) {
      const padding = isMobile ? 8 : 12;
      const cardHeight = 180;
      const gap = 16;

      let combinedRect: DOMRect;

      combinedRect = element.getBoundingClientRect();
      
      // Determine actual card position based on available space
      const spaceAbove = combinedRect.top;
      const spaceBelow = window.innerHeight - combinedRect.bottom;
      
      let cardPos: 'above' | 'below';
      if (currentMark.preferredCardPosition === 'above') {
        cardPos = spaceAbove > cardHeight + gap ? 'above' : 'below';
      } else {
        cardPos = spaceBelow > cardHeight + gap ? 'below' : 'above';
      }
      setActualCardPosition(cardPos);
      
      setHighlightRect({
        top: combinedRect.top - padding,
        left: combinedRect.left - padding,
        width: combinedRect.width + padding * 2,
        height: combinedRect.height + padding * 2,
      });
    }
  }, [currentStep, isMobile]);

  // Handle dropdown opening/closing for menu item steps
  const openDropdownIfNeeded = useCallback(() => {
    const currentMark = coachMarks[currentStep];
    if (currentMark.requiresDropdown && !dropdownOpen) {
      // Use custom event to reliably open the controlled dropdown
      window.dispatchEvent(new Event('tutorial-dropdown-open'));
      setDropdownOpen(true);
    } else if (!currentMark.requiresDropdown && dropdownOpen) {
      // Use custom event to close the dropdown
      window.dispatchEvent(new Event('tutorial-dropdown-close'));
      setDropdownOpen(false);
    }
  }, [currentStep, dropdownOpen]);

  // Auto-scroll and handle dropdown when step changes
  useEffect(() => {
    if (isVisible) {
      const currentMark = coachMarks[currentStep];
      
      // Handle dropdown opening first
      openDropdownIfNeeded();
      
      // Dropdown items render in a Radix portal — retry until found
      const delay = currentMark.requiresDropdown ? 200 : 0;
      let retryCount = 0;
      const maxRetries = 5;
      
      const tryFindAndHighlight = () => {
        const selector = isMobile && currentMark.mobileSelector 
          ? currentMark.mobileSelector 
          : currentMark.selector;
        const element = document.querySelector(selector);
        
        if (element) {
          scrollToElement(element);
          setTimeout(updateHighlightPosition, 400);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryFindAndHighlight, 100);
        }
      };
      
      const timer = setTimeout(tryFindAndHighlight, delay);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible, isMobile, scrollToElement, updateHighlightPosition, openDropdownIfNeeded]);

  useEffect(() => {
    // Only show tutorial for signed-in users who haven't seen it
    if (loading) return;
    if (!user) return;
    
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Scroll to top on tutorial start
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

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
    // Close dropdown if open
    if (dropdownOpen) {
      window.dispatchEvent(new Event('tutorial-dropdown-close'));
      setDropdownOpen(false);
    }
    setIsVisible(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Calculate card position based on highlight and available space
  const getCardStyle = (): React.CSSProperties => {
    if (!highlightRect) return {};
    
    const cardWidth = isMobile ? 280 : 320;
    const gap = isMobile ? 24 : 16;
    const minTopOffset = isMobile ? 80 : 60; // Ensure card doesn't go behind browser UI
    
    const horizontalLeft = Math.max(16, Math.min(
      highlightRect.left + highlightRect.width / 2 - cardWidth / 2,
      window.innerWidth - cardWidth - 16
    ));
    
    if (actualCardPosition === 'above') {
      const cardTop = Math.max(minTopOffset, highlightRect.top - 180 - gap);
      return {
        top: cardTop,
        left: horizontalLeft,
        width: cardWidth,
      };
    } else {
      // Push the card further down for better visibility
      const extraOffset = isMobile ? 32 : 24;
      return {
        top: Math.max(minTopOffset, highlightRect.top + highlightRect.height + gap + extraOffset),
        left: horizontalLeft,
        width: cardWidth,
      };
    }
  };

  // Calculate arrow position to point at the highlighted element
  const getArrowStyle = (): React.CSSProperties => {
    if (!highlightRect) return {};
    
    const cardWidth = isMobile ? 280 : 320;
    const cardLeft = Math.max(16, Math.min(
      highlightRect.left + highlightRect.width / 2 - cardWidth / 2,
      window.innerWidth - cardWidth - 16
    ));
    
    // Calculate horizontal offset for arrow to point at center of highlighted element
    const highlightCenterX = highlightRect.left + highlightRect.width / 2;
    const arrowOffsetFromCardLeft = highlightCenterX - cardLeft;
    
    return {
      marginLeft: Math.max(20, Math.min(arrowOffsetFromCardLeft - 12, cardWidth - 44)),
    };
  };

  const showArrowUp = actualCardPosition === 'below';
  const showArrowDown = actualCardPosition === 'above';

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: dropdownOpen ? 'none' : undefined }}>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }} onClick={handleSkip}>
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
        className="absolute pointer-events-none transition-all duration-300"
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
        className="absolute pointer-events-auto animate-scale-in transition-all duration-300"
        style={getCardStyle()}
        key={currentStep}
      >
        {/* Arrow indicator pointing up (card is below element) */}
        {showArrowUp && (
          <div className="flex mb-2 animate-bounce" style={getArrowStyle()}>
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

        {/* Arrow indicator pointing down (card is above element) */}
        {showArrowDown && (
          <div className="flex mt-2 animate-bounce" style={getArrowStyle()}>
            <ArrowDown className="h-6 w-6 text-primary" />
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
