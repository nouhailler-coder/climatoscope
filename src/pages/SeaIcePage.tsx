/**
 * ClimatOSCOPE — Module Cryosphère & Banquise (NSIDC / Sea Ice Index)
 * Suivi par satellite micro-ondes de l'étendue des glaces de mer polaires (1979-2024)
 * Rétroaction physique de l'albédo glace-océan.
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
  BarChart,
  Bar,
} from 'recharts';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import {
  arcticSeptemberExtentData,
  antarcticFebruaryExtentData,
  SEASONAL_CYCLE_MONTHS,
} from '../data/baseline/seaice-nsidc';
import { exportToCsv, exportToJson } from '../utils/export';
import {
  Download,
  Info,
  Layers,
  Sparkles,
  Compass,
  Zap,
  TrendingDown,
  Sun,
  ShieldAlert,
} from 'lucide-react';

type IceViewMode = 'arctic-september' | 'antarctic-february' | 'seasonal-cycle' | 'both-poles';

export const SeaIcePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<IceViewMode>('arctic-september');
  const [albedoAreaLoss, setAlbedoAreaLoss] = useState<number>(2.8); // Millions de km2 perdus

  // Datasets
  const arcticSept = useDataset('seaice-arctic-september-nsidc');
  const antarcticFeb = useDataset('seaice-antarctic-february-nsidc');

  // Combined annual dataset
  const combinedAnnualData = useMemo(() => {
    return arcticSeptemberExtentData.map(([year, arcVal]) => {
      const antPoint = antarcticFebruaryExtentData.find(([y]) => y === year);
      const antVal = antPoint ? antPoint[1] : null;
      const arcBaseline = 6.41; // 1981-2010 mean
      const antBaseline = 2.87; // 1981-2010 mean

      return {
        year,
        arctic: arcVal,
        antarctic: antVal,
        arcticAnomaly: Number((arcVal - arcBaseline).toFixed(2)),
        antarcticAnomaly: antVal ? Number((antVal - antBaseline).toFixed(2)) : null,
      };
    });
  }, []);

  // Albedo feedback calculations
  // Insolation moyenne reçue en été polaire (W/m2) ~ 300 W/m2
  // Albédo glace de mer avec neige = 0.70 (réfléchit 70%, absorbe 30%)
  // Albédo eau libre océan = 0.06 (réfléchit 6%, absorbe 94%)
  // Surplus d'absorption = 94% - 30% = 64% de l'insolation incidente
  const albedoCalculations = useMemo(() => {
    const avgSolarFlux = 310; // W/m²
    const iceAlbedo = 0.70;
    const waterAlbedo = 0.06;
    const deltaAbsorptionCoeff = (1 - waterAlbedo) - (1 - iceAlbedo); // 0.64
    const surplusFluxPerM2 = avgSolarFlux * deltaAbsorptionCoeff; // ~198.4 W/m²
    const areaM2 = albedoAreaLoss * 1e12; // 1 M km² = 10^12 m²
    const extraPowerWatts = surplusFluxPerM2 * areaM2; // Watts
    const extraPowerTerawatts = extraPowerWatts / 1e12; // Térawatts (TW)
    // À l'échelle globale de la Terre (Surface = 5.1 x 10^14 m²)
    const globalRadiativeForcing = extraPowerWatts / (5.1e14); // W/m²

    return {
      surplusFluxPerM2: Math.round(surplusFluxPerM2),
      extraPowerTerawatts: Math.round(extraPowerTerawatts),
      globalRadiativeForcing: Number(globalRadiativeForcing.toFixed(3)),
    };
  }, [albedoAreaLoss]);

  const latestArctic = combinedAnnualData[combinedAnnualData.length - 1];
  const recordArcticLow = { year: 2012, extent: 3.39 };
  const recordAntarcticLow = { year: 2023, extent: 1.79 };

  const handleExport = (format: 'csv' | 'json') => {
    const exportData = combinedAnnualData.map((d) => ({
      Annee: d.year,
      Banquise_Arctique_Septembre_Mkm2: d.arctic,
      Anomalie_Arctique_Mkm2: d.arcticAnomaly,
      Banquise_Antarctique_Fevrier_Mkm2: d.antarctic,
      Anomalie_Antarctique_Mkm2: d.antarcticAnomaly,
    }));
    if (format === 'csv') {
      exportToCsv(exportData, `climatoscpe-banquise-nsidc-${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      exportToJson(exportData, `climatoscpe-banquise-nsidc-${new Date().toISOString().slice(0, 10)}.json`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-700/40 text-cyan-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 🧊 Cryosphère & Banquise Polaire
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Observation satellitaire micro-ondes NSIDC / NASA (1979–2024) & Rétroaction d'albédo
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={arcticSept.status} onRefresh={arcticSept.refresh} />
          <QualityBadge report={arcticSept.qualityReport} />
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
              title="Exporter en CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
              title="Exporter en JSON"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Arctique (Septembre {latestArctic?.year}) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">{latestArctic?.arctic}</span>
            <span className="text-xs font-mono text-slate-400">M km²</span>
          </div>
          <span className="text-[10px] text-rose-400 font-mono block mt-1">
            {latestArctic?.arcticAnomaly} M km² vs 1981-2010 (-33%)
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Tendance Arctique (Septembre) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">-12,2%</span>
            <span className="text-xs font-mono text-slate-400">/ décennie</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Perte de ~78 000 km²/an depuis 1979
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Antarctique (Février {latestArctic?.year}) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-indigo-300">{latestArctic?.antarctic}</span>
            <span className="text-xs font-mono text-slate-400">M km²</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono block mt-1">
            Record bas historique en 2023 ({recordAntarcticLow.extent} M km²)
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Contraste d'Albédo Physique :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-300">~0,70 vs 0,06</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            L'eau libre absorbe 94% du rayonnement
          </span>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          Mode d'affichage de la banquise :
        </span>
        <div className="inline-flex flex-wrap rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs gap-1">
          {[
            { id: 'arctic-september' as IceViewMode, label: 'Arctique (Septembre · Minimum)' },
            { id: 'antarctic-february' as IceViewMode, label: 'Antarctique (Février · Minimum)' },
            { id: 'both-poles' as IceViewMode, label: 'Deux Pôles Simultanés' },
            { id: 'seasonal-cycle' as IceViewMode, label: 'Cycle Saisonnier Mensuel' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
                viewMode === mode.id
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {viewMode === 'arctic-september' && 'Étendue minimale de la banquise arctique en septembre (1979–2024)'}
              {viewMode === 'antarctic-february' && 'Étendue minimale de la banquise antarctique en février (1979–2024)'}
              {viewMode === 'both-poles' && 'Comparaison séculaire Arctique vs Antarctique (Millions de km²)'}
              {viewMode === 'seasonal-cycle' && 'Cycle saisonnier mensuel : Climatologie 1981-2010 vs Période Récente'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Données certifiées NSIDC Sea Ice Index v3 · Radiométrie micro-ondes passive SMMR / SSMIS
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="h-80 sm:h-96 w-full pt-4">
          {viewMode === 'seasonal-cycle' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SEASONAL_CYCLE_MONTHS} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="monthName" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" M km²" domain={[0, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="arcticBaseline" name="Arctique (Ref. 1981-2010)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="arcticRecent" name="Arctique (2011-2024)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="antarcticBaseline" name="Antarctique (Ref. 1981-2010)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="antarcticRecent" name="Antarctique (2011-2024)" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedAnnualData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" M km²" domain={[1, 8.5]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any, name?: any) => [`${val} Millions de km²`, name]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

                {(viewMode === 'arctic-september' || viewMode === 'both-poles') && (
                  <>
                    <ReferenceLine y={6.41} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: 'Moyenne Arctique 81-10 (6,41 M km²)', fill: '#38bdf8', fontSize: 10, position: 'insideTopLeft' }} />
                    <Line
                      type="monotone"
                      dataKey="arctic"
                      name="Arctique (Septembre)"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#06b6d4' }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}

                {(viewMode === 'antarctic-february' || viewMode === 'both-poles') && (
                  <>
                    <ReferenceLine y={2.87} stroke="#a5b4fc" strokeDasharray="4 4" label={{ value: 'Moyenne Antarctique 81-10 (2,87 M km²)', fill: '#a5b4fc', fontSize: 10, position: 'insideBottomLeft' }} />
                    <Line
                      type="monotone"
                      dataKey="antarctic"
                      name="Antarctique (Février)"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#818cf8' }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Interactive Physics Simulator: Ice-Albedo Feedback */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-mono mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Simulateur Physique — Rétroaction Glace-Albédo (Ice-Albedo Feedback)</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Impact Énergétique de la Perte de Surface Réfléchissante
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mt-1">
              La glace recouverte de neige réfléchit 70% de la lumière solaire vers l'espace (<span className="text-cyan-300 font-mono">albédo α ≈ 0,70</span>).
              Lorsque cette glace fond, elle cède la place à un océan sombre dont l'albédo n'est que de <span className="text-rose-300 font-mono">α ≈ 0,06</span>,
              absorbant <strong>94%</strong> du flux solaire direct et chauffant l'océan de l'intérieur.
            </p>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Surface de banquise perdue par rapport à 1979 :</span>
            <span className="text-cyan-400 font-bold text-sm">{albedoAreaLoss.toFixed(1)} Millions de km²</span>
          </div>
          <input
            type="range"
            min="0"
            max="5.0"
            step="0.1"
            value={albedoAreaLoss}
            onChange={(e) => setAlbedoAreaLoss(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 M km² (Inchangé)</span>
            <span>2,8 M km² (Perte moyenne actuelle)</span>
            <span>5,0 M km² (Océan Arctique libre de glace)</span>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block">Surplus de flux absorbé au m² :</span>
            <span className="text-xl font-bold font-mono text-amber-300 block mt-1">
              +{albedoCalculations.surplusFluxPerM2} W/m²
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Sur la zone d'eau libre estivale
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block">Puissance thermique injectée :</span>
            <span className="text-xl font-bold font-mono text-cyan-300 block mt-1">
              +{albedoCalculations.extraPowerTerawatts} Térawatts (TW)
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              1 TW = 10¹² Joules chaque seconde
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block">Forçage radiatif planétaire équivalent :</span>
            <span className="text-xl font-bold font-mono text-rose-400 block mt-1">
              +{albedoCalculations.globalRadiativeForcing} W/m²
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Rapporté à toute la surface du globe
            </span>
          </div>
        </div>
      </div>

      {/* Scientific Context & Methodology */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-3 leading-relaxed">
        <h4 className="text-white font-semibold flex items-center gap-2 font-mono uppercase tracking-wider">
          <Info className="w-4 h-4 text-cyan-400" />
          Protocole de mesure & Spécificités polaires :
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400">
          <div>
            <strong className="text-slate-200 block mb-1">1. Qu'est-ce que l'« étendue » (Sea Ice Extent) ?</strong>
            Par convention internationale (NSIDC / NASA), l'étendue de la banquise inclut toutes les zones océaniques où la concentration de glace de mer dépasse <strong>15%</strong>.
            Cette mesure est insensible aux nuages et aux nuits polaires grâce aux ondes radar et micro-ondes passives (capteurs SSMI/SSMIS).
          </div>
          <div>
            <strong className="text-slate-200 block mb-1">2. Asymétrie Nord / Sud :</strong>
            L'Arctique est un <em>océan fermé entouré de terres</em>, où la banquise pluriannuelle s'est fortement amincie. L'Antarctique est un <em>continent glacé entouré d'un océan ouvert</em>, dont la banquise est principalement saisonnière. Après des décennies de stabilité relative, l'Antarctique a connu depuis 2016 une série d'effondrements hivernaux et estivaux sans précédent.
          </div>
        </div>
      </div>
    </div>
  );
};
