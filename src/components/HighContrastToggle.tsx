import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const HIGH_CONTRAST_KEY = "ecosort-high-contrast";

export const HighContrastToggle = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(HIGH_CONTRAST_KEY);
    if (saved === "true") {
      setIsHighContrast(true);
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsHighContrast(checked);
    localStorage.setItem(HIGH_CONTRAST_KEY, String(checked));
    if (checked) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  return (
    <Switch
      checked={isHighContrast}
      onCheckedChange={handleToggle}
      aria-label="Toggle high contrast mode"
    />
  );
};
