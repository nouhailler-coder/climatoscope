import React, { useState } from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { exportDatasetToCSV, exportDatasetToJSON } from '../utils/export';
import { Waves, Info, Download, ShieldCheck, Layers } from 'lucide-react';

export const ArgoPage: React.FC = () => {
  const [depthLayer, setDepthLayer] = useState<'2000m' | '700m'>('2000m');
  const datasetId = depthLayer === '2000m' ? 'ocean-ohc-argo-2000m' : 'ocean-ohc-argo-700m';
  const ocean = useDataset(datasetId);

  const handleExport = (format: 'csv' | 'json') => {
    if (!ocean.dataset) return;
    if (format === 'csv') {
      exportDatasetToCSV(ocean.dataset.metadata, ocean.dataset.data);
    } else {
      exportDatasetToJSON(ocean.dataset.metadata, ocean.dataset.data);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-700/40 text-blue-400">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 🌊 Océans — Contenu Thermique (Argo / NOAA)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Ocean Heat Content (OHC) — Programme International Argo & NOAA NCEI
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={ocean.status} onRefresh={ocean.refresh} />
          <QualityBadge report={ocean.qualityReport} />
          {ocean.dataset && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExport('csv')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter la série en CSV"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter la série en JSON"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layer Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-400" />
          Sélectionner la couche bathymétrique :
        </span>
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          {[
            { id: '2000m' as const, label: '0 – 2 000 mètres (Océan Global)', desc: 'Indicateur maître de stockage' },
            { id: '700m' as const, label: '0 – 700 mètres (Océan Supérieur)', desc: 'Couche couplée atmosphérique' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDepthLayer(item.id)}
              className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
                depthLayer === item.id
                  ? 'bg-slate-800 text-blue-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanatory Context: Why OHC matters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Pourquoi le contenu thermique des océans (OHC) est-il la métrique reine ?</strong>
          <br />
          L'eau possédant une capacité thermique volumique environ <strong>3 300 fois supérieure</strong> à celle de l'air, plus de <strong className="text-blue-300">90% de l'excédent d'énergie</strong> capté par la Terre s'accumule dans les océans (contre seulement ~1% dans l'atmosphère et ~3% dans les sols).
          Contrairement aux températures de l'air qui oscillent fortement sous l'effet des saisons et d'El Niño, le contenu thermique des océans montre une accumulation quasi-continue et sans répit, constituant le thermomètre le plus robuste du déséquilibre énergétique planétaire.
        </div>
      </div>

      {/* Main OHC Chart */}
      {ocean.dataset && (
        <TimeSeriesChart
          data={ocean.dataset.data}
          metadata={ocean.dataset.metadata}
          color="#3b82f6"
          showMovingAverageDefault={false}
          baselineZero={true}
        />
      )}

      {/* Energy partitioning breakdown box */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-3">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Répartition physique de l'excédent thermique planétaire (Bilan énergétique) :
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-lg font-bold text-blue-400 block">89 – 91 %</span>
            <span className="text-[11px] text-slate-300">Océans mondiaux</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-lg font-bold text-cyan-400 block">4 – 5 %</span>
            <span className="text-[11px] text-slate-300">Cryosphère (fonte glaces)</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-lg font-bold text-emerald-400 block">3 – 4 %</span>
            <span className="text-[11px] text-slate-300">Continents & sols</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-lg font-bold text-amber-400 block">~ 1 %</span>
            <span className="text-[11px] text-slate-300">Atmosphère</span>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed pt-1">
          1 Zettajoule (1 ZJ = 10²¹ Joules) équivaut à environ 278 milliards de mégawattheures. L'accumulation mesurée de plus de 300 ZJ depuis 1980 correspond à un forçage net continu absorbé d'environ <strong>0,8 à 0,9 W/m²</strong> sur l'ensemble de la surface du globe.
        </p>
      </div>
    </div>
  );
};
