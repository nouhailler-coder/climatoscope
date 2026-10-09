import React from 'react';
import { CacheStatus } from '../../types/api';
import { CheckCircle2, Database, AlertTriangle, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: CacheStatus;
  lastUpdated?: string;
  onRefresh?: () => void;
  compact?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, lastUpdated, onRefresh, compact }) => {
  let badgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50';
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  let label = 'Données à jour';

  if (status === 'cached') {
    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-700/50';
    icon = <Database className="w-3.5 h-3.5 text-amber-400" />;
    label = 'Données en cache local';
  } else if (status === 'error') {
    badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-700/50';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    label = 'Source distante inaccessible';
  } else if (status === 'syncing') {
    badgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50';
    icon = <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />;
    label = 'Synchronisation...';
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${badgeColor}`}
        title={lastUpdated ? `Dernière mise à jour : ${new Date(lastUpdated).toLocaleDateString('fr-FR')}` : undefined}
      >
        {icon}
        <span>{label}</span>
      </span>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
          title="Actualiser la source"
          aria-label="Actualiser la source de données"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
