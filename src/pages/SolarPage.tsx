import React from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { Sun, Activity, Info, ExternalLink } from 'lucide-react';

export const SolarPage: React.FC = () => {
  const tsi = useDataset('solar-tsi-lisird');
  const spots = useDataset('solar-sunspots-silso');

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-700/40 text-amber-400">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 1 — ☀️ Soleil & Activité Solaire
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Irradiance Solaire Totale (TSI) & Taches solaires (SILSO)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={tsi.status} onRefresh={tsi.refresh} />
          <QualityBadge report={tsi.qualityReport} />
        </div>
      </div>

      {/* Explanatory Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          L’<strong>Irradiance Solaire Totale (TSI)</strong> représente la puissance électromagnétique émise par le Soleil reçue par unité de surface au sommet de l’atmosphère terrestre (à une distance moyenne de 1 UA, soit 149,6 millions de km).
          Mesurée depuis 1978 par radiomètres spatiaux (ERB, ACRIM, SORCE/TIM, TSIS-1), sa valeur moyenne est de <strong className="text-amber-300">~1361 W/m²</strong> et oscille d'environ <strong>1 W/m² (0,07%)</strong> selon le cycle magnétique de 11 ans (cycle de Schwabe).
        </div>
      </div>

      {/* Graphique 1: TSI dans le temps */}
      {tsi.dataset && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Graphique 1 — Irradiance Solaire Totale (TSI)
            </h3>
            <span className="text-xs text-slate-400 font-mono">1880 → 2025</span>
          </div>
          <TimeSeriesChart
            data={tsi.dataset.data}
            metadata={tsi.dataset.metadata}
            status={tsi.status}
            color="#f59e0b"
            showMovingAverageDefault={false}
          />
        </div>
      )}

      {/* Graphique 2: Activité solaire / Taches solaires */}
      {spots.dataset && (
        <div className="mt-8">
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Graphique 2 — Nombre International de Taches Solaires (Sunspots SSN)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Série de référence historique WDC-SILSO (1880–2025) · Archive stable non actualisée en direct
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Cycle de Schwabe ~11 ans</span>
              <StatusBadge status={spots.status} onRefresh={spots.refresh} compact />
            </div>
          </div>
          <TimeSeriesChart
            data={spots.dataset.data}
            metadata={spots.dataset.metadata}
            status={spots.status}
            color="#38bdf8"
            showMovingAverageDefault={true}
          />
        </div>
      )}

      {/* Scientific Notes on Solar Role */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider">
          Analyse physique du forçage solaire :
        </h4>
        <p>
          Comme la Terre est une sphère en rotation et qu'elle réfléchit environ 30% du rayonnement incident (albédo planétaire α ≈ 0.30), la puissance solaire moyenne absorbée par mètre carré de surface terrestre se calcule par :
          <code className="text-cyan-300 font-mono ml-2">F_solaire = (TSI × (1 - α)) / 4 ≈ (1361 × 0.70) / 4 ≈ 238 W/m²</code>.
        </p>
        <p>
          La variation de ±0,5 W/m² de la TSI au cours d'un cycle solaire correspond donc à une modulation au sommet de l'atmosphère d'environ <strong>±0,09 W/m²</strong> de forçage radiatif net.
        </p>
      </div>
    </div>
  );
};
