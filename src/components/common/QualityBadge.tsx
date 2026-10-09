import React from 'react';
import { DataQualityReport } from '../../types/dataset';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface QualityBadgeProps {
  report: DataQualityReport | null;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ report }) => {
  if (!report) return null;

  const isHigh = report.qualityScore === 'high';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
        isHigh
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
          : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
      }`}
      title={`Qualité des données : ${report.validPoints}/${report.totalPoints} points valides. Pas de discontinuité anormale.`}
    >
      {isHigh ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
      <span>
        Qualité : {isHigh ? '100% vérifiée' : 'points partiels'} ({report.validPoints} pts)
      </span>
    </div>
  );
};
