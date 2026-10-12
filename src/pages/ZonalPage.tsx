/**
 * ClimatOSCOPE — Module Réanalyses Copernicus ERA5 & Amplification Polaire
 * Décomposition du réchauffement par bandes latitudinales (1950-2024)
 * Mise en évidence rigoureuse de l'amplification arctique (3 à 4x la moyenne mondiale).
 */

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Area,
} from 'recharts';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { ZONAL_ANNUAL_DATA } from '../data/baseline/zonal-era5-polar';
import { exportToCsv, exportToJson } from '../utils/export';
import {
  Download,
  Info,
  Globe,
  TrendingUp,
  Layers,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

export const ZonalPage: React.FC = () => {
  const arctic = useDataset('zonal-temp-arctic-era5');
  const [selectedBands, setSelectedBands] = useState<Record<string, boolean>>({
    arctic: true,
    northMid: true,
    tropics: false,
    southMid: false,
    antarctic: false,
    global: true,
  });

  const toggleBand = (key: string) => {
    setSelectedBands((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const latestRecord = ZONAL_ANNUAL_DATA[ZONAL_ANNUAL_DATA.length - 1];
  const baselineRecord = ZONAL_ANNUAL_DATA[0];

  const handleExport = (format: 'csv' | 'json') => {
    const exportData = ZONAL_ANNUAL_DATA.map((r) => ({
      Annee: r.year,
      Arctique_90N_64N_C: r.arctic,
      Tempere_Nord_64N_24N_C: r.northMid,
      Tropiques_24N_24S_C: r.tropics,
      Tempere_Sud_24S_64S_C: r.southMid,
      Antarctique_64S_90S_C: r.antarctic,
      Moyenne_Mondiale_C: r.global,
      Facteur_Amplification_Arctique: r.amplificationFactor,
    }));
    if (format === 'csv') {
      exportToCsv(exportData, `climatoscpe-zonal-era5-${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      exportToJson(exportData, `climatoscpe-zonal-era5-${new Date().toISOString().slice(0, 10)}.json`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-950/60 border border-violet-700/40 text-violet-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 🌎 Réanalyses ERA5 & Amplification Polaire
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Anomalies thermiques décomposées par bandes de latitude (Copernicus ERA5 & NASA GISS)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={arctic.status} onRefresh={arctic.refresh} />
          <QualityBadge report={arctic.qualityReport} />
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Arctique (90°N–64°N, {latestRecord.year}) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">+{latestRecord.arctic.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-400">°C</span>
          </div>
          <span className="text-[10px] text-rose-300 font-mono block mt-1">
            Anomalie vs climatologie 1951-1980
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Moyenne Globale ({latestRecord.year}) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-300">+{latestRecord.global.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-400">°C</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Terre + Océan mondial
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Facteur d'Amplification Arctique :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">{latestRecord.amplificationFactor.toFixed(1)}×</span>
            <span className="text-xs font-mono text-slate-400">plus rapide</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono block mt-1">
            Ratio (ΔT Arctique / ΔT Global)
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Ceinture Tropicale (24°N–24°S) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">+{latestRecord.tropics.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-400">°C</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Forte inertie des océans chauds
          </span>
        </div>
      </div>

      {/* Latitudinal Band Selector Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-violet-400" />
          Activer / Désactiver les zones latitudinales :
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'arctic', label: 'Arctique (90°N–64°N)', color: '#f43f5e', border: 'border-rose-500/50' },
            { id: 'northMid', label: 'Tempéré Nord (64°N–24°N)', color: '#fb923c', border: 'border-orange-500/50' },
            { id: 'tropics', label: 'Tropiques (24°N–24°S)', color: '#10b981', border: 'border-emerald-500/50' },
            { id: 'southMid', label: 'Tempéré Sud (24°S–64°S)', color: '#06b6d4', border: 'border-cyan-500/50' },
            { id: 'antarctic', label: 'Antarctique (64°S–90°S)', color: '#8b5cf6', border: 'border-purple-500/50' },
            { id: 'global', label: 'Moyenne Globale', color: '#facc15', border: 'border-yellow-500/50' },
          ].map((band) => (
            <button
              key={band.id}
              onClick={() => toggleBand(band.id)}
              className={`px-3 py-1.5 rounded-lg border font-mono transition cursor-pointer flex items-center gap-1.5 ${
                selectedBands[band.id]
                  ? `bg-slate-800 text-white ${band.border} shadow-sm`
                  : 'bg-slate-950/50 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: band.color }} />
              {band.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Évolution comparée des anomalies de température par bande de latitude (1950–2024)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Référence climatologique standard 1951-1980 (0,00°C) · Réanalyses Copernicus ERA5 & GISTEMP
            </p>
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={ZONAL_ANNUAL_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" °C" domain={[-0.6, 4.2]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any, name?: any) => [`${val > 0 ? '+' : ''}${val} °C`, name]}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />

              {selectedBands.arctic && (
                <Line
                  type="monotone"
                  dataKey="arctic"
                  name="Arctique (90°N–64°N)"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 2, fill: '#f43f5e' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {selectedBands.northMid && (
                <Line
                  type="monotone"
                  dataKey="northMid"
                  name="Tempéré Nord (64°N–24°N)"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={{ r: 1.5, fill: '#fb923c' }}
                />
              )}

              {selectedBands.tropics && (
                <Line
                  type="monotone"
                  dataKey="tropics"
                  name="Tropiques (24°N–24°S)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 1.5, fill: '#10b981' }}
                />
              )}

              {selectedBands.southMid && (
                <Line
                  type="monotone"
                  dataKey="southMid"
                  name="Tempéré Sud (24°S–64°S)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 1.5, fill: '#06b6d4' }}
                />
              )}

              {selectedBands.antarctic && (
                <Line
                  type="monotone"
                  dataKey="antarctic"
                  name="Antarctique (64°S–90°S)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 1.5, fill: '#8b5cf6' }}
                />
              )}

              {selectedBands.global && (
                <Line
                  type="monotone"
                  dataKey="global"
                  name="Moyenne Mondiale"
                  stroke="#facc15"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#facc15' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Physics Breakdown: Why is the Arctic warming 3 to 4x faster? */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-700/50 text-rose-300 text-xs font-mono mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Mécanismes Biophysiques Fondamentaux</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Pourquoi le pôle Nord se réchauffe-t-il 3 à 4 fois plus vite que l'équateur ?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mt-1">
            L'amplification polaire résulte de la conjonction de trois rétroactions positives indépendantes bien documentées dans les bilans radiatifs et de transfert d'énergie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
              <span className="w-6 h-6 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-800 text-xs">1</span>
              Rétroaction Glace-Albédo
            </div>
            <p className="text-slate-400 leading-relaxed">
              La disparition de la banquise d'été et la fonte précoce du manteau neigeux continental remplacent des surfaces hautement réflectives (albédo ~0,70) par des eaux libres sombres (albédo ~0,06) qui emmagasinent la chaleur solaire jusqu'à l'automne.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
              <span className="w-6 h-6 rounded-lg bg-amber-950 flex items-center justify-center border border-amber-800 text-xs">2</span>
              Rétroaction du Gradient Vertical (Lapse-Rate)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Aux tropiques, la convection profonde distribue la chaleur sur toute la hauteur de la troposphère jusqu'à 15 km. En Arctique, l'inversion thermique emprisonne l'air froid au sol et confine tout le réchauffement dans une couche limite superficielle mince (inférieure à 1 km), démultipliant la hausse de température mesurée au sol.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-mono">
              <span className="w-6 h-6 rounded-lg bg-rose-950 flex items-center justify-center border border-rose-800 text-xs">3</span>
              Transport Méridien de Chaleur & Vapeur
            </div>
            <p className="text-slate-400 leading-relaxed">
              L'atmosphère plus chaude contient plus de vapeur d'eau (+7% par °C selon Clausius-Clapeyron). Les rivières atmosphériques et ondulations du courant-jet (jet stream) transportent des flux massifs de chaleur et d'humidité des moyennes latitudes vers le bassin arctique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
