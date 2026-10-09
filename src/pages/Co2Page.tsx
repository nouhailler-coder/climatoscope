import React from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { Flame, Info, ExternalLink } from 'lucide-react';

export const Co2Page: React.FC = () => {
  const co2 = useDataset('co2-noaa-mauna-loa');

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 2 — 🧪 Dioxyde de Carbone (CO₂)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Série continue de l’Observatoire de Mauna Loa (Hawaï) — NOAA GML / Scripps
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={co2.status} onRefresh={co2.refresh} />
          <QualityBadge report={co2.qualityReport} />
        </div>
      </div>

      {/* Explanatory Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          La <strong>courbe de Keeling</strong> mesure la fraction molaire du CO₂ en air sec à 3397 m d’altitude sur le volcan Mauna Loa.
          Deux phénomènes s’y superposent de manière spectaculaire :
          <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-400">
            <li>
              <strong className="text-slate-200">Le cycle biosphérique saisonnier</strong> : une oscillation annuelle de ~6 ppm due à la photosynthèse des forêts de l’hémisphère Nord (consommation printanière de CO₂ et restitution automnale).
            </li>
            <li>
              <strong className="text-slate-200">La tendance séculaire</strong> : une augmentation soutenue passant de ~315 ppm en 1958 à plus de 425 ppm aujourd'hui.
            </li>
          </ul>
        </div>
      </div>

      {/* Graphique principal : CO2 ppm */}
      {co2.dataset && (
        <TimeSeriesChart
          data={co2.dataset.data}
          metadata={co2.dataset.metadata}
          color="#10b981"
          showMovingAverageDefault={true}
        />
      )}

      {/* Scientific Notes on CO2 Forcing */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider">
          Forçage radiatif du dioxyde de carbone :
        </h4>
        <p>
          En physique atmosphérique (spectroscopie de transfert radiatif), l'effet de serre additionnel du CO₂ suit une relation logarithmique (formule simplifiée de Myhre et al. 1998, adoptée par le GIEC) :
          <code className="text-emerald-300 font-mono ml-2">ΔF = 5.35 × ln(C / C₀) W/m²</code>, où C₀ est la concentration préindustrielle (~280 ppm).
        </p>
        <p>
          Pour C = 425 ppm, le forçage radiatif instantané direct du CO₂ est d'environ :
          <code className="text-cyan-300 font-mono ml-2">ΔF ≈ 5.35 × ln(425 / 280) ≈ +2.23 W/m²</code> au sommet de la troposphère.
        </p>
      </div>
    </div>
  );
};
