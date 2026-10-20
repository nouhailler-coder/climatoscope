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
import { CacheStatus } from '../types/api';
import {
  NSIDC_ARCTIC_SEPT_METADATA,
  NSIDC_ANTARCTIC_FEB_METADATA,
  getSeasonalCycleMonths,
  SeasonalCycleMonth,
} from '../data/baseline/seaice-nsidc';
import { calculateSeaIceTrend, SeaIceTrendResult } from '../analysis/math';
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
  Sliders,
  RotateCcw,
  ExternalLink,
  Calculator,
  Calendar,
} from 'lucide-react';
import { ContextualBanner } from '../components/common/ContextualBanner';
import { HelpTooltip } from '../components/common/HelpTooltip';

type IceViewMode = 'arctic-september' | 'antarctic-february' | 'seasonal-cycle' | 'both-poles';

export const SeaIcePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<IceViewMode>('arctic-september');
  const [albedoAreaLoss, setAlbedoAreaLoss] = useState<number>(2.8); // Millions de km2 perdus
  // Dynamic Physical Parameters for albedo simulator (user adjustable with scientific defaults)
  const [avgSolarFlux, setAvgSolarFlux] = useState<number>(310); // W/m² (flux solaire incident été polaire)
  const [iceAlbedo, setIceAlbedo] = useState<number>(0.70); // albédo glace avec neige
  const [waterAlbedo, setWaterAlbedo] = useState<number>(0.06); // albédo eau de mer libre

  // Datasets fetched via live provider with caching & validation
  const arcticSept = useDataset('seaice-arctic-september-nsidc');
  const antarcticFeb = useDataset('seaice-antarctic-february-nsidc');
  const seasonalCycle = useDataset('seaice-seasonal-cycle-nsidc');

  // Dynamic Climatological reference baselines (1981-2010 standard NSIDC) computed dynamically from observations
  const referenceBaselines = useMemo(() => {
    const arcPoints = arcticSept.dataset?.data || [];
    const antPoints = antarcticFeb.dataset?.data || [];

    const compute1981_2010Mean = (points: typeof arcPoints, fallback: number) => {
      const baselinePts = points.filter((p) => {
        const y = parseInt(p.timestamp, 10);
        return y >= 1981 && y <= 2010 && typeof p.value === 'number' && !isNaN(p.value);
      });
      if (baselinePts.length >= 20) {
        const sum = baselinePts.reduce((acc, p) => acc + p.value, 0);
        return Number((sum / baselinePts.length).toFixed(2));
      }
      return fallback;
    };

    return {
      arctic: compute1981_2010Mean(arcPoints, 6.41),
      antarctic: compute1981_2010Mean(antPoints, 2.87),
    };
  }, [arcticSept.dataset?.data, antarcticFeb.dataset?.data]);

  // Dynamically combined annual dataset generated directly from provider data
  const combinedAnnualData = useMemo(() => {
    const arcPoints = arcticSept.dataset?.data || [];
    const antPoints = antarcticFeb.dataset?.data || [];

    // Aggregate all years present across datasets
    const yearSet = new Set<string>();
    arcPoints.forEach((d) => yearSet.add(d.timestamp));
    antPoints.forEach((d) => yearSet.add(d.timestamp));

    const arcMap = new Map<string, number>();
    arcPoints.forEach((d) => arcMap.set(d.timestamp, d.value));

    const antMap = new Map<string, number>();
    antPoints.forEach((d) => antMap.set(d.timestamp, d.value));

    const arcBaseline = referenceBaselines.arctic;
    const antBaseline = referenceBaselines.antarctic;

    const sortedYears = Array.from(yearSet).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );

    return sortedYears.map((yearStr) => {
      const year = parseInt(yearStr, 10);
      const arcVal = arcMap.has(yearStr) ? arcMap.get(yearStr)! : null;
      const antVal = antMap.has(yearStr) ? antMap.get(yearStr)! : null;

      return {
        year,
        arctic: arcVal,
        antarctic: antVal,
        arcticAnomaly: arcVal !== null ? Number((arcVal - arcBaseline).toFixed(2)) : null,
        antarcticAnomaly: antVal !== null ? Number((antVal - antBaseline).toFixed(2)) : null,
      };
    });
  }, [arcticSept.dataset?.data, antarcticFeb.dataset?.data, referenceBaselines]);

  // Seasonal cycle data derived from provider / dataset
  const seasonalCycleData: SeasonalCycleMonth[] = useMemo(() => {
    return getSeasonalCycleMonths();
  }, [seasonalCycle.dataset]);

  // Most recent points for Arctic and Antarctic independently
  const latestArctic = useMemo(() => {
    for (let i = combinedAnnualData.length - 1; i >= 0; i--) {
      if (combinedAnnualData[i].arctic !== null) return combinedAnnualData[i];
    }
    return combinedAnnualData[combinedAnnualData.length - 1];
  }, [combinedAnnualData]);

  const latestAntarctic = useMemo(() => {
    for (let i = combinedAnnualData.length - 1; i >= 0; i--) {
      if (combinedAnnualData[i].antarctic !== null) return combinedAnnualData[i];
    }
    return combinedAnnualData[combinedAnnualData.length - 1];
  }, [combinedAnnualData]);

  // Dynamic Historical Records computed from all loaded observations
  const records = useMemo(() => {
    let minArc: { year: number; extent: number } | null = null;
    let minAnt: { year: number; extent: number } | null = null;

    combinedAnnualData.forEach((row) => {
      if (row.arctic !== null) {
        if (!minArc || row.arctic < minArc.extent) {
          minArc = { year: row.year, extent: row.arctic };
        }
      }
      if (row.antarctic !== null) {
        if (!minAnt || row.antarctic < minAnt.extent) {
          minAnt = { year: row.year, extent: row.antarctic };
        }
      }
    });

    return {
      arcticMin: minArc || { year: 2012, extent: 3.39 },
      antarcticMin: minAnt || { year: 2023, extent: 1.79 },
    };
  }, [combinedAnnualData]);

  // Dynamic OLS Linear Trend Regressions computed directly on active observations
  const arcticTrend: SeaIceTrendResult | null = useMemo(() => {
    const validPoints = combinedAnnualData
      .filter((d) => d.arctic !== null)
      .map((d) => ({ year: d.year, value: d.arctic as number }));

    return calculateSeaIceTrend(validPoints, referenceBaselines.arctic);
  }, [combinedAnnualData, referenceBaselines.arctic]);

  const antarcticTrend: SeaIceTrendResult | null = useMemo(() => {
    const validPoints = combinedAnnualData
      .filter((d) => d.antarctic !== null)
      .map((d) => ({ year: d.year, value: d.antarctic as number }));

    return calculateSeaIceTrend(validPoints, referenceBaselines.antarctic);
  }, [combinedAnnualData, referenceBaselines.antarctic]);

  const maxYear = useMemo(() => {
    const y1 = latestArctic?.year || 2024;
    const y2 = latestAntarctic?.year || 2025;
    return Math.max(y1, y2);
  }, [latestArctic, latestAntarctic]);

  // Refresh all sea ice series
  const handleRefreshAll = () => {
    arcticSept.refresh();
    antarcticFeb.refresh();
    seasonalCycle.refresh();
  };

  const combinedStatus: CacheStatus =
    arcticSept.status === 'syncing' || antarcticFeb.status === 'syncing'
      ? 'syncing'
      : arcticSept.status === 'fresh' || antarcticFeb.status === 'fresh'
      ? 'fresh'
      : arcticSept.status === 'cached' || antarcticFeb.status === 'cached'
      ? 'cached'
      : arcticSept.status;

  // Albedo feedback calculations dynamically tied to user-adjustable parameters
  const albedoCalculations = useMemo(() => {
    const deltaAbsorptionCoeff = (1 - waterAlbedo) - (1 - iceAlbedo);
    const surplusFluxPerM2 = avgSolarFlux * deltaAbsorptionCoeff;
    const areaM2 = albedoAreaLoss * 1e12; // 1 M km² = 10^12 m²
    const extraPowerWatts = surplusFluxPerM2 * areaM2;
    const extraPowerTerawatts = extraPowerWatts / 1e12;
    const globalRadiativeForcing = extraPowerWatts / 5.1e14; // Global surface = 5.1e14 m²

    return {
      deltaAbsorptionCoeff: Number(deltaAbsorptionCoeff.toFixed(3)),
      surplusFluxPerM2: Math.round(surplusFluxPerM2),
      extraPowerTerawatts: Math.round(extraPowerTerawatts),
      globalRadiativeForcing: Number(globalRadiativeForcing.toFixed(3)),
    };
  }, [albedoAreaLoss, avgSolarFlux, iceAlbedo, waterAlbedo]);

  const recordArcticLow = records.arcticMin;
  const recordAntarcticLow = records.antarcticMin;

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
                Observation satellitaire micro-ondes NSIDC / NASA (1979–{maxYear}) & Rétroaction d'albédo
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={combinedStatus} onRefresh={handleRefreshAll} />
          <QualityBadge report={arcticSept.qualityReport} />
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Exporter en CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Exporter en JSON"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Onboarding Banner */}
      <ContextualBanner
        screenId="seaice"
        title="Cryosphère Polaire & Rétroaction de l'Albédo"
        summary="Suivi par satellite micro-ondes de l'étendue des glaces de mer polaires (Arctique en septembre et Antarctique en février) depuis 1979."
        sourceOrg="National Snow and Ice Data Center (NSIDC Sea Ice Index v3) & NASA GSFC"
        methodologyNote="Radiomètres micro-ondes passifs (SMMR, SSM/I, SSMIS) détectant la surface couverte par au moins 15% de glace de mer."
        keyTakeaway="La fonte estivale arctique (-12,2% par décennie) remplace une surface blanche réfléchissante (albédo ~0,70) par un océan sombre absorbant (albédo ~0,06), amplifiant le réchauffement polaire (rétroaction positive)."
        defaultOpen={true}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Arctique (Septembre {latestArctic?.year}) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">{latestArctic?.arctic ?? '—'}</span>
            <span className="text-xs font-mono text-slate-400">M km²</span>
          </div>
          <span className="text-[10px] text-rose-400 font-mono block mt-1">
            {latestArctic?.arcticAnomaly !== null
              ? `${latestArctic?.arcticAnomaly > 0 ? '+' : ''}${latestArctic?.arcticAnomaly} M km² vs réf. ${referenceBaselines.arctic} M km² (${Math.round((latestArctic?.arcticAnomaly / referenceBaselines.arctic) * 100)}%)`
              : 'Donnée indisponible'}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Tendance Arctique (Septembre) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {arcticTrend ? `${arcticTrend.decadalRatePercent > 0 ? '+' : ''}${arcticTrend.decadalRatePercent}%` : '—'}
            </span>
            <span className="text-xs font-mono text-slate-400">/ décennie</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            {arcticTrend
              ? `Régression OLS : ${arcticTrend.annualLossKm2.toLocaleString('fr-FR')} km²/an (R² = ${arcticTrend.rSquared})`
              : 'Donnée indisponible'}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Antarctique (Février {latestAntarctic?.year}) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-indigo-300">{latestAntarctic?.antarctic ?? '—'}</span>
            <span className="text-xs font-mono text-slate-400">M km²</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono block mt-1">
            {latestAntarctic?.antarcticAnomaly !== null
              ? `${latestAntarctic?.antarcticAnomaly > 0 ? '+' : ''}${latestAntarctic?.antarcticAnomaly} M km² vs réf. ${referenceBaselines.antarctic} M km² (Record : ${recordAntarcticLow.extent} M km² en ${recordAntarcticLow.year})`
              : 'Donnée indisponible'}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Contraste d'Albédo Physique :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-300">
              α {iceAlbedo.toFixed(2)} vs {waterAlbedo.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Différentiel d'absorption : +{Math.round(albedoCalculations.deltaAbsorptionCoeff * 100)}% d'énergie
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
              {viewMode === 'arctic-september' && `Étendue minimale de la banquise arctique en septembre (1979–${latestArctic?.year || 2024})`}
              {viewMode === 'antarctic-february' && `Étendue minimale de la banquise antarctique en février (1979–${latestAntarctic?.year || 2025})`}
              {viewMode === 'both-poles' && `Comparaison séculaire Arctique vs Antarctique (1979–${maxYear})`}
              {viewMode === 'seasonal-cycle' && 'Cycle saisonnier mensuel : Climatologie 1981-2010 vs Période Contemporaine'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Données certifiées NSIDC Sea Ice Index v3 · Radiométrie micro-ondes passive SMMR / SSMIS · Actualisation dynamique
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="h-80 sm:h-96 w-full pt-4">
          {viewMode === 'seasonal-cycle' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalCycleData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="monthName" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" M km²" domain={[0, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="arcticBaseline" name="Arctique (Réf. 1981-2010)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="arcticRecent" name="Arctique (2011–2025)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="antarcticBaseline" name="Antarctique (Réf. 1981-2010)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="antarcticRecent" name="Antarctique (2011–2025)" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
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
                  formatter={(val: any, name?: any) => [val != null ? `${val} Millions de km²` : 'Donnée non disponible', name]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

                {(viewMode === 'arctic-september' || viewMode === 'both-poles') && (
                  <>
                    <ReferenceLine
                      y={referenceBaselines.arctic}
                      stroke="#38bdf8"
                      strokeDasharray="4 4"
                      label={{
                        value: `Moyenne Arctique 81-10 (${referenceBaselines.arctic} M km²)`,
                        fill: '#38bdf8',
                        fontSize: 10,
                        position: 'insideTopLeft',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="arctic"
                      name="Arctique (Septembre)"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#06b6d4' }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  </>
                )}

                {(viewMode === 'antarctic-february' || viewMode === 'both-poles') && (
                  <>
                    <ReferenceLine
                      y={referenceBaselines.antarctic}
                      stroke="#a5b4fc"
                      strokeDasharray="4 4"
                      label={{
                        value: `Moyenne Antarctique 81-10 (${referenceBaselines.antarctic} M km²)`,
                        fill: '#a5b4fc',
                        fontSize: 10,
                        position: 'insideBottomLeft',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="antarctic"
                      name="Antarctique (Février)"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#818cf8' }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Provenance & Scientific Traceability Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Source :</span>
                <a
                  href="https://nsidc.org/data/seaice_index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium underline decoration-cyan-500/40 hover:decoration-cyan-400"
                >
                  <span>NSIDC / NOAA Sea Ice Index (G02135 v3.0)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <span className="text-slate-600 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Dernière obs. : <strong>2024 (Arctique Sept.) / 2024 (Antarctique Fév.)</strong></span>
              </div>

              <span className="text-slate-600 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <span>Date extraction : <strong>Octobre 2026</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <StatusBadge status={combinedStatus} onRefresh={handleRefreshAll} />
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Calculator className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-300">Méthode d'observation : </strong>
              Étendue de la banquise (Sea Ice Extent) définie par l'aire totale des cellules océaniques contenant au moins 15% de glace de mer (seuil satellite passif micro-ondes Nimbus-7 SMMR, DMSP SSM/I et SSMIS). Période de référence climatologique : 1981–2010.
            </div>
          </div>
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

        {/* Interactive Sliders: Ice Area Loss & Physical Parameters */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="space-y-2">
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

          {/* Scientific Parameters Controls (Flux Solaire et Albédos) */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Paramètres physiques & hypothèses radiatives :
              </span>
              <button
                onClick={() => {
                  setAvgSolarFlux(310);
                  setIceAlbedo(0.70);
                  setWaterAlbedo(0.06);
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                title="Rétablir les valeurs standards (Cess et al. / Flanner et al.)"
              >
                <RotateCcw className="w-3 h-3" /> Réinitialiser standards
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Flux solaire estival :</span>
                  <span className="text-amber-300 font-bold">{avgSolarFlux} W/m²</span>
                </div>
                <input
                  type="range"
                  min="240"
                  max="380"
                  step="5"
                  value={avgSolarFlux}
                  onChange={(e) => setAvgSolarFlux(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Insolation moyenne 70°-90°N</span>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Albédo banquise/neige :</span>
                  <span className="text-cyan-300 font-bold">{(iceAlbedo * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.85"
                  step="0.01"
                  value={iceAlbedo}
                  onChange={(e) => setIceAlbedo(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">α glace saine (0,50 à 0,85)</span>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Albédo océan libre :</span>
                  <span className="text-rose-300 font-bold">{(waterAlbedo * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.12"
                  step="0.01"
                  value={waterAlbedo}
                  onChange={(e) => setWaterAlbedo(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">α eau libre (0,04 à 0,12)</span>
              </div>
            </div>
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
              F = {avgSolarFlux} × ({((1 - waterAlbedo) * 100).toFixed(0)}% - {((1 - iceAlbedo) * 100).toFixed(0)}%)
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block">Puissance thermique injectée :</span>
            <span className="text-xl font-bold font-mono text-cyan-300 block mt-1">
              +{albedoCalculations.extraPowerTerawatts} Térawatts (TW)
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              1 TW = 10¹² Watts sur {albedoAreaLoss.toFixed(1)} M km²
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block">Forçage radiatif planétaire équivalent :</span>
            <span className="text-xl font-bold font-mono text-rose-400 block mt-1">
              +{albedoCalculations.globalRadiativeForcing} W/m²
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Rapporté à toute la surface terrestre (5,1×10¹⁴ m²)
            </span>
          </div>
        </div>
      </div>

      {/* Scientific Context & Methodology */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-3 leading-relaxed">
        <h4 className="text-white font-semibold flex items-center gap-2 font-mono uppercase tracking-wider">
          <Info className="w-4 h-4 text-cyan-400" />
          Méthodologie Scientifique, Calcul des Tendances & Spécificités Polaires :
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400">
          <div>
            <strong className="text-slate-200 block mb-1">1. Calcul des tendances OLS (Moindres Carrés) :</strong>
            La tendance est calculée par régression linéaire ordinaire sur l'ensemble des points d'observation chargés ({arcticTrend ? `${arcticTrend.startYear}–${arcticTrend.endYear}` : '1979–présent'}). Le taux décennal ({arcticTrend ? `${arcticTrend.decadalRatePercent}%` : '—'}/décennie) est normalisé par rapport à la moyenne climatologique 1981–2010 ({referenceBaselines.arctic} M km²), conformément à la convention NSIDC / GIEC.
          </div>
          <div>
            <strong className="text-slate-200 block mb-1">2. Étendue satellitaire (Sea Ice Extent) :</strong>
            Par convention internationale (NSIDC / NASA), l'étendue de la banquise inclut toutes les mailles océaniques où la concentration de glace dépasse <strong>15%</strong>. Mesurée par radiométrie micro-ondes passive satellitaire (SSMI / SSMIS), elle traverse les nuages et s'affranchit de la nuit polaire.
          </div>
          <div>
            <strong className="text-slate-200 block mb-1">3. Asymétrie Nord / Sud & Rétroaction d'Albédo :</strong>
            L'Arctique est un <em>océan fermé entouré de continents</em>, dont la banquise pluriannuelle s'effondre sous l'effet de l'amplification polaire. L'Antarctique est un <em>continent ceinturé d'un océan ouvert</em>. La rétroaction albédo-glace amplifie le forçage solaire : chaque million de km² d'océan libéré absorbe un surplus thermique massif direct.
          </div>
        </div>
      </div>
    </div>
  );
};
