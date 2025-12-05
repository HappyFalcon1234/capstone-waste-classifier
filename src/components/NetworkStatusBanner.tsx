import { WifiOff, Wifi, Zap, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { translations } from '@/lib/translations';

interface NetworkStatusBannerProps {
  language: string;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  isModelLoading?: boolean;
  modelLoadProgress?: number;
}

export function NetworkStatusBanner({
  language,
  isOfflineMode,
  onToggleOfflineMode,
  isModelLoading,
  modelLoadProgress,
}: NetworkStatusBannerProps) {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const t = translations[language as keyof typeof translations] || translations.English;

  if (isModelLoading) {
    return (
      <div className="bg-accent/20 border border-accent/30 rounded-lg p-3 flex items-center gap-3">
        <Loader2 className="h-5 w-5 text-accent animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t.loadingOfflineModel || 'Loading offline model...'}
          </p>
          <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${modelLoadProgress || 0}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-3">
        <WifiOff className="h-5 w-5 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t.offlineMode || 'Offline Mode'}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.offlineModeDescription || 'Using local AI model for classification'}
          </p>
        </div>
      </div>
    );
  }

  if (isSlowConnection) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-3">
        <Zap className="h-5 w-5 text-yellow-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t.slowConnection || 'Slow Connection Detected'}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.slowConnectionDescription || 'Images will be compressed for faster uploads'}
          </p>
        </div>
        <button
          onClick={onToggleOfflineMode}
          className="text-xs px-3 py-1 rounded-md bg-accent/20 hover:bg-accent/30 text-accent-foreground transition-colors"
        >
          {isOfflineMode ? (t.useOnlineMode || 'Use Online') : (t.useOfflineMode || 'Use Offline')}
        </button>
      </div>
    );
  }

  if (isOfflineMode) {
    return (
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex items-center gap-3">
        <WifiOff className="h-5 w-5 text-accent" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t.offlineModeEnabled || 'Offline Mode Enabled'}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.offlineModeEnabledDescription || 'Using local AI for faster, private classification'}
          </p>
        </div>
        <button
          onClick={onToggleOfflineMode}
          className="text-xs px-3 py-1 rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
        >
          {t.useOnlineMode || 'Use Online'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex items-center gap-3">
      <Wifi className="h-5 w-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {t.onlineMode || 'Online Mode'}
        </p>
        <p className="text-xs text-muted-foreground">
          {t.onlineModeDescription || 'Using cloud AI for accurate classification'}
        </p>
      </div>
      <button
        onClick={onToggleOfflineMode}
        className="text-xs px-3 py-1 rounded-md bg-accent/20 hover:bg-accent/30 text-accent-foreground transition-colors"
      >
        {t.useOfflineMode || 'Use Offline'}
      </button>
    </div>
  );
}
