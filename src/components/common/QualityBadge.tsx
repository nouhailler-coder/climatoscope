import React from 'react';
import { DataQualityReport } from '../../types/dataset';
import { ShieldCheck, ShieldAlert, CheckCircle } from 'lucide-react';

interface QualityBadgeProps {
  report: DataQualityReport | null;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ report }) => {
  if (!report) return null;

  const isHigh = report.qualityScore === 'high';
  const sanity = report.sanityCheck;

  const tooltipText = sanity
    ? `Qualité & Intégrité scientifique : ${report.validPoints}/${report.totalPoints} points. Bornes physiques [${sanity.expectedRange[0]} ; ${sanity.expectedRange[1]}] : ${sanity.isWithinBounds ? '100% conformes' : `${sanity.outlierCount} hors bornes`}. ${sanity.notes}`
    : `Qualité des données : ${report.validPoints}/${report.totalPoints} points valides. Pas de discontinuité anormale.`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition ${
        isHigh
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:border-emerald-600'
          : 'bg-amber-950/40 text-amber-300 border-amber-800/40 hover:border-amber-600'
      }`}
      title={tooltipText}
    >
      {isHigh ? (
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
      )}
      <span>
        Qualité : {isHigh ? 'Intégrité certifiée' : 'points partiels'} ({report.validPoints} pts)
      </span>
      {sanity?.isWithinBounds && (
        <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-emerald-400/80 bg-emerald-900/40 px-1 rounded">
          <CheckCircle className="w-2.5 h-2.5" /> Bornes OK
        </span>
      )}
    </div>
  );
};
