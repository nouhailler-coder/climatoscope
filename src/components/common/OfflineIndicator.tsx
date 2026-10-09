import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-900/90 border border-amber-600/50 backdrop-blur px-3 py-2 text-xs font-medium text-amber-200 shadow-xl">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Mode hors-ligne actif — Consultation des données locales en cache</span>
    </div>
  );
};
