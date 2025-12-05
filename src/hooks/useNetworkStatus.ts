import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality
    const connection = (navigator as any).connection;
    if (connection) {
      const checkConnectionQuality = () => {
        const effectiveType = connection.effectiveType;
        setIsSlowConnection(effectiveType === 'slow-2g' || effectiveType === '2g');
      };
      checkConnectionQuality();
      connection.addEventListener('change', checkConnectionQuality);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', checkConnectionQuality);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isSlowConnection };
}
