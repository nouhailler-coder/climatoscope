import React from 'react';
import { CacheStatus } from '../../types/api';
import { CheckCircle2, Database, AlertTriangle, RefreshCw, Radio, Clock, BookOpen } from 'lucide-react';

interface StatusBadgeProps {
  status: CacheStatus;
  lastUpdated?: string;
  lastObservationDate?: string;
  retrievedAt?: string;
  onRefresh?: () => void;
  compact?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  lastUpdated,
  lastObservationDate,
  retrievedAt,
  onRefresh,
  compact,
}) => {
  let badgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50';
  let icon = <Radio className="w-3.5 h-3.5 text-emerald-400" />;
  let label = compact ? 'En direct' : 'Flux en direct';

  if (status === 'live' || status === 'fresh') {
    badgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50';
    icon = <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />;
    label = compact ? 'En direct' : 'Flux en direct';
  } else if (status === 'recent_cache') {
    badgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50';
    icon = <Database className="w-3.5 h-3.5 text-cyan-400" />;
    label = compact ? 'Cache récent' : 'Cache récent (< 24h)';
  } else if (status === 'stale_cache') {
    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-700/50';
    icon = <Clock className="w-3.5 h-3.5 text-amber-400" />;
    label = compact ? 'Cache ancien' : 'Cache ancien (> 24h)';
  } else if (status === 'cached') {
    badgeColor = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50';
    icon = <Database className="w-3.5 h-3.5 text-cyan-400" />;
    label = compact ? 'Cache local' : 'Données en cache local';
  } else if (status === 'embedded_historical') {
    badgeColor = 'bg-purple-950/80 text-purple-300 border-purple-700/50';
    icon = <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
    label = compact ? 'Historique' : 'Historique embarqué';
  } else if (status === 'error') {
    badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-700/50';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    label = compact ? 'Inaccessible' : 'Source distante inaccessible';
  } else if (status === 'syncing') {
    badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-700/50';
    icon = <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
    label = 'Synchronisation...';
  }

  const tooltipParts: string[] = [];
  if (lastObservationDate) tooltipParts.push(`Dernière observation : ${lastObservationDate}`);
  if (retrievedAt) tooltipParts.push(`Date de récupération : ${retrievedAt}`);
  if (lastUpdated) tooltipParts.push(`Date de cache : ${new Date(lastUpdated).toLocaleDateString('fr-FR')}`);
  const titleText = tooltipParts.length > 0 ? tooltipParts.join(' · ') : undefined;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${badgeColor}`}
        title={titleText}
      >
        {icon}
        <span>{label}</span>
      </span>

      {onRefresh && status !== 'embedded_historical' && (
        <button
          onClick={onRefresh}
          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
          title="Actualiser la source en direct"
          aria-label="Actualiser la source de données"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
