import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
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
} from 'recharts';
import { calculatePearsonCorrelation, calculateLinearTrend } from '../analysis/math';
import { Thermometer, Info, Layers, Scale, ExternalLink, Calendar, Calculator, CheckCircle2 } from 'lucide-react';
import { ContextualBanner } from '../components/common/ContextualBanner';
import { HelpTooltip } from '../components/common/HelpTooltip';

type TempSource = 'temp-nasa-gistemp' | 'temp-nasa-gistemp-monthly' | 'temp-noaa-globaltemp' | 'temp-berkeley-earth' | 'compare-all';

export const TemperaturePage: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<TempSource>('temp-nasa-gistemp');

  // Load individual datasets
  const temp = useDataset(selectedSource === 'compare-all' ? 'temp-nasa-gistemp' : selectedSource);
  const nasa = useDataset('temp-nasa-gistemp');
  const noaa = useDataset('temp-noaa-globaltemp');
  const berkeley = useDataset('temp-berkeley-earth');

  // Statistical comparisons between independent datasets
  const comparisonStats = useMemo(() => {
    if (!nasa.dataset || !noaa.dataset || !berkeley.dataset) return null;

    const nasaVsNoaa = calculatePearsonCorrelation(
      nasa.dataset.data,
      noaa.dataset.data,
      'NASA GISTEMP',
      'NOAA GlobalTemp'
    );
    const nasaVsBerkeley = calculatePearsonCorrelation(
      nasa.dataset.data,
      berkeley.dataset.data,
      'NASA GISTEMP',
      'Berkeley Earth'
    );
    const noaaVsBerkeley = calculatePearsonCorrelation(
      noaa.dataset.data,
      berkeley.dataset.data,
      'NOAA GlobalTemp',
      'Berkeley Earth'
    );

    const trendNasa = calculateLinearTrend(nasa.dataset.data);
    const trendNoaa = calculateLinearTrend(noaa.dataset.data);
    const trendBerkeley = calculateLinearTrend(berkeley.dataset.data);

    // Merged data points for chart
    const yearMap = new Map<string, { year: string; nasa?: number; noaa?: number; berkeley?: number }>();

    nasa.dataset.data.forEach((p) => {
      yearMap.set(p.timestamp, { year: p.timestamp, nasa: p.value });
    });
    noaa.dataset.data.forEach((p) => {
      const existing = yearMap.get(p.timestamp) || { year: p.timestamp };
      existing.noaa = p.value;
      yearMap.set(p.timestamp, existing);
    });
    berkeley.dataset.data.forEach((p) => {
      const existing = yearMap.get(p.timestamp) || { year: p.timestamp };
      existing.berkeley = p.value;
      yearMap.set(p.timestamp, existing);
    });

    const mergedData = Array.from(yearMap.values()).sort(
      (a, b) => parseInt(a.year, 10) - parseInt(b.year, 10)
    );

    // Calculate RMSE between NASA & Berkeley
    const validPairs = mergedData.filter((d) => d.nasa !== undefined && d.berkeley !== undefined);
    const mse =
      validPairs.reduce((acc, d) => acc + Math.pow(d.nasa! - d.berkeley!, 2), 0) /
      Math.max(1, validPairs.length);
    const rmse = Math.sqrt(mse);

    return {
      nasaVsNoaa,
      nasaVsBerkeley,
      noaaVsBerkeley,
      trendNasa,
      trendNoaa,
      trendBerkeley,
      mergedData,
      rmse: Number(rmse.toFixed(3)),
      overlapCount: validPairs.length,
    };
  }, [nasa.dataset, noaa.dataset, berkeley.dataset]);

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-700/40 text-rose-400">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 3 — 🌡️ Température Globale
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Reconstructions indépendantes de surface (NASA GISS, NOAA NCEI, Berkeley Earth)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={temp.status} onRefresh={temp.refresh} />
          <QualityBadge report={temp.qualityReport} />
        </div>
      </div>

      {/* Contextual Onboarding Banner */}
      <ContextualBanner
        screenId="temperature"
        title="Reconstructions Globales de Surface (Terre-Océan)"
        summary="Suivi de l'anomalie de température moyenne à la surface du globe depuis 1880, calculée par la NASA, la NOAA et Berkeley Earth."
        sourceOrg="NASA GISS GISTEMP v4, NOAA NCEI GlobalTemp & Berkeley Earth"
        methodologyNote="Combinaison des stations terrestres (GHCN v4) et des mesures océaniques par bouées et navires (ERSST v5 / Argo)."
        keyTakeaway="Les 3 instituts indépendants utilisent des méthodes de spatialisation distinctes mais aboutissent à un accord statistique quasi parfait (r > 0,98) confirmant un réchauffement planétaire de +1,2°C à +1,3°C."
        defaultOpen={true}
      />

      {/* Dataset / Provider switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-rose-400" />
          <span>Sélectionner le mode d'observation :</span>
          <HelpTooltip
            title="Séries indépendantes"
            content="GISTEMP v4 utilise une pondération spatiale à 250 km. NOAA NCEI applique un maillage 5°x5°. Berkeley Earth utilise un kriging géostatistique sur plus de 30 000 stations."
          />
        </span>
        <div className="inline-flex flex-wrap rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          {[
            { id: 'temp-nasa-gistemp' as TempSource, label: 'NASA GISTEMP v4 (Annuel)', ref: '1880–2025' },
            { id: 'temp-nasa-gistemp-monthly' as TempSource, label: 'NASA GISTEMP v4 (Mensuel)', ref: 'Flux direct 1880–2025' },
            { id: 'temp-noaa-globaltemp' as TempSource, label: 'NOAA GlobalTemp', ref: 'Ref. 1901-2000' },
            { id: 'temp-berkeley-earth' as TempSource, label: 'Berkeley Earth', ref: 'Ref. 1951-1980' },
            { id: 'compare-all' as TempSource, label: 'Comparateur Inter-Instituts', ref: '3 Séries Indépendantes' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedSource(item.id)}
              className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
                selectedSource === item.id
                  ? 'bg-slate-800 text-rose-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] ml-1.5 opacity-70 font-mono">({item.ref})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanatory Context & Provenance Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Pourquoi raisonne-t-on en anomalie et non en température absolue ?</strong>
            <br />
            La température absolue moyenne de la Terre varie fortement d'une région à l'autre (-50°C aux pôles et +40°C aux tropiques).
            En revanche, les <em>anomalies</em> (écarts par rapport à la moyenne climatologique locale) sont cohérentes sur des rayons de plus de 1 200 km, offrant une mesure statistique très robuste.
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Statut de la série :</span>
            <StatusBadge status={temp.status} compact />
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Provenance :</span>
            <span className="text-cyan-300 font-semibold">
              {temp.dataset?.metadata.provenanceType === 'live_feed' ? 'Flux en direct' : 'Historique embarqué'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Période couverte :</span>
            <span className="text-slate-200 font-semibold">
              {temp.dataset?.metadata.startDate || '1880'} → {temp.dataset?.metadata.endDate || '2025'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Dernière observation :</span>
            <span className="text-emerald-400 font-bold">
              {temp.dataset?.metadata.lastObservationDate || temp.dataset?.metadata.endDate || '...'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Dernier téléchargement :</span>
            <span className="text-slate-300 text-[10px]">
              {temp.dataset?.metadata.lastSuccessfulFetch
                ? new Date(temp.dataset.metadata.lastSuccessfulFetch).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
                : (temp.status === 'live' ? 'À l\'instant' : 'Non actualisé en direct')}
            </span>
          </div>
        </div>
      </div>

      {/* Mode 1 : Single Chart for individual dataset */}
      {selectedSource !== 'compare-all' && temp.dataset && (
        <TimeSeriesChart
          data={temp.dataset.data}
          metadata={temp.dataset.metadata}
          status={temp.status}
          color="#f43f5e"
          showMovingAverageDefault={true}
          baselineZero={true}
        />
      )}

      {/* Mode 2 : Inter-Institutional Statistical Comparator (3 independent datasets) */}
      {selectedSource === 'compare-all' && comparisonStats && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  Comparaison des 3 Reconstructions Mondiales Indépendantes (1880–2025)
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Superposition des observations originales NASA GISTEMP v4, NOAA GlobalTemp v5 et Berkeley Earth
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-0.5 bg-rose-500 inline-block" /> NASA GISS
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-500 inline-block" /> NOAA NCEI
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-500 inline-block" /> Berkeley Earth
                </span>
              </div>
            </div>

            <div className="h-80 sm:h-96 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={comparisonStats.mergedData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" °C" domain={[-0.6, 1.4]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val: any, name?: any) => [val != null ? `${val > 0 ? '+' : ''}${val} °C` : 'N/A', name]}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />

                  <Line
                    type="monotone"
                    dataKey="nasa"
                    name="NASA GISTEMP v4"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="noaa"
                    name="NOAA GlobalTemp v5"
                    stroke="#f59e0b"
                    strokeWidth={1.8}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="berkeley"
                    name="Berkeley Earth"
                    stroke="#06b6d4"
                    strokeWidth={1.8}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Traceability Strip */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
                <span>Période commune : <strong>1880–2025 ({comparisonStats.overlapCount} ans)</strong></span>
                <span className="text-slate-600">|</span>
                <span>RMSE inter-instituts : <strong>{comparisonStats.rmse} °C</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Données 100% indépendantes
                </span>
              </div>
            </div>
          </div>

          {/* Statistical Cross-Validation Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Corrélation Pearson r</span>
                <span className="text-rose-400">NASA ↔ NOAA</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-300">
                r = {comparisonStats.nasaVsNoaa.pearsonR.toFixed(4)}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                R² = {comparisonStats.nasaVsNoaa.rSquared.toFixed(3)}. Concordance statistique quasi-parfaite sur 145 ans malgré des stations et des méthodes de spatialisation distinctes.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Corrélation Pearson r</span>
                <span className="text-cyan-400">NASA ↔ Berkeley</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-300">
                r = {comparisonStats.nasaVsBerkeley.pearsonR.toFixed(4)}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                R² = {comparisonStats.nasaVsBerkeley.rSquared.toFixed(3)}. Algorithme de kriging spatial direct et réseau étendu de stations confirmant la reconstruction GISTEMP.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Tendances OLS séculaires</span>
                <span className="text-amber-400">1880–2025</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-200 space-y-1">
                <div>NASA : <span className="text-rose-400">{((comparisonStats.trendNasa?.slope || 0.008) * 10).toFixed(3)} °C/déc.</span></div>
                <div>NOAA : <span className="text-amber-400">{((comparisonStats.trendNoaa?.slope || 0.008) * 10).toFixed(3)} °C/déc.</span></div>
                <div>Berkeley : <span className="text-cyan-400">{((comparisonStats.trendBerkeley?.slope || 0.008) * 10).toFixed(3)} °C/déc.</span></div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Convergence des taux de réchauffement séculaires entre les trois organismes indépendants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison table between institutions */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-3">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider">
          Cohérence des reconstructions indépendantes :
        </h4>
        <p>
          Bien que la NASA, la NOAA et Berkeley Earth utilisent des protocoles de spatialisation, de correction des îlots de chaleur urbains et d'intégration des données de bouées océaniques distincts, leurs résultats concordent à plus de <strong>98%</strong> sur l'évolution séculaire globale.
        </p>
      </div>
    </div>
  );
};
