import { useEffect, useRef, useState } from "react";

interface ParallaxImageProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

export function ParallaxImage({ src, alt, children }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate parallax offset based on element position
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Apply parallax with a subtle speed factor
      setOffset(distanceFromCenter * 0.15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in" ref={containerRef}>
      <div className="w-full rounded-xl overflow-hidden shadow-2xl">
        <div 
          className="w-full h-[400px] md:h-[600px] overflow-hidden"
          style={{ transform: `translateY(${offset * 0.5}px)` }}
        >
          <img 
            src={src}
            alt={alt}
            className="w-full h-[120%] object-cover transition-transform duration-100"
            style={{ transform: `translateY(${-offset}px)` }}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
