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
} from 'recharts';
import { calculatePearsonCorrelation, CORRELATION_DISCLAIMER } from '../../analysis/math';
import { normalizeSeries } from '../../analysis/normalization';
import { NormalizationMode, TimeSeriesPoint, DatasetMetadata } from '../../types/dataset';
import { AlertCircle, Sliders, Scale } from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';

export interface SeriesConfig {
  id: string;
  metadata: DatasetMetadata;
  data: TimeSeriesPoint[];
  color: string;
  enabled: boolean;
}

export type PeriodPreset = '1880-2025' | '1900-2025' | '1950-2025' | '1980-2025' | '2000-2025';

interface ComparisonChartProps {
  seriesConfigs: SeriesConfig[];
  onToggleSeries: (id: string) => void;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  seriesConfigs,
  onToggleSeries,
}) => {
  const [normMode, setNormMode] = useState<NormalizationMode>('zscore');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('1950-2025');

  // Filter series by date range
  const dateCutoff = useMemo(() => {
    const [start] = periodPreset.split('-');
    return start;
  }, [periodPreset]);

  // Active series
  const activeSeries = useMemo(() => {
    return seriesConfigs.filter((s) => s.enabled);
  }, [seriesConfigs]);

  // Compute normalized series for active datasets
  const normalizedSeriesMap = useMemo(() => {
    const map = new Map<string, Array<{ timestamp: string; val: number }>>();

    activeSeries.forEach((s) => {
      // Filter points after cutoff
      const filtered = s.data.filter((p) => p.timestamp >= dateCutoff);
      // Normalize
      const norm = normalizeSeries(filtered, s.id, { mode: normMode });
      map.set(
        s.id,
        norm.map((p) => ({ timestamp: p.timestamp.substring(0, 4), val: p.normalizedValue }))
      );
    });

    return map;
  }, [activeSeries, dateCutoff, normMode]);

  // Build merged chronological aligned timeline (by year)
  const mergedTimeline = useMemo(() => {
    const yearSet = new Set<string>();

    normalizedSeriesMap.forEach((pts) => {
      pts.forEach((p) => yearSet.add(p.timestamp));
    });

    const sortedYears = Array.from(yearSet).sort();

    return sortedYears.map((year) => {
      const row: Record<string, any> = { year };
      activeSeries.forEach((s) => {
        const pts = normalizedSeriesMap.get(s.id);
        const match = pts?.find((p) => p.timestamp === year);
        row[s.id] = match !== undefined ? match.val : null;
      });
      return row;
    });
  }, [normalizedSeriesMap, activeSeries]);

  // Compute pairwise Pearson correlation for the first 2 active series
  const correlationInfo = useMemo(() => {
    if (activeSeries.length < 2) return null;
    const sA = activeSeries[0];
    const sB = activeSeries[1];

    const filteredA = sA.data.filter((p) => p.timestamp >= dateCutoff);
    const filteredB = sB.data.filter((p) => p.timestamp >= dateCutoff);

    return calculatePearsonCorrelation(filteredA, filteredB, sA.metadata.shortName, sB.metadata.shortName);
  }, [activeSeries, dateCutoff]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      {/* Series selection badges */}
      <div className="mb-6">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
          Séries à superposer :
        </label>
        <div className="flex flex-wrap gap-2">
          {seriesConfigs.map((s) => {
            return (
              <button
                key={s.id}
                onClick={() => onToggleSeries(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  s.enabled
                    ? 'bg-slate-800/90 text-white shadow-md'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
                }`}
                style={{
                  borderColor: s.enabled ? s.color : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.enabled ? s.color : '#64748b' }}
                />
                <span>{s.metadata.shortName}</span>
                <span className="text-[10px] text-slate-400 font-mono">({s.metadata.unitSymbol})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: Normalization mode & Period presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
        <div>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mb-1.5">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode de normalisation mathématique :</span>
            <HelpTooltip
              title="Modes de normalisation"
              content="Le Z-score (centré-réduit) divise l'écart à la moyenne par l'écart-type, rendant comparables des grandeurs aux échelles dissemblables (ppm, W/m², °C). L'Indice 100 fixe la valeur de départ à 100."
            />
          </span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            {[
              { id: 'zscore' as NormalizationMode, label: 'Z-Score (Écart-type)', desc: '(x - μ) / σ' },
              { id: 'index100' as NormalizationMode, label: 'Indice 100', desc: 'Base 100 au départ' },
              { id: 'anomaly' as NormalizationMode, label: 'Anomalie', desc: 'Différence à la moyenne' },
              { id: 'raw' as NormalizationMode, label: 'Valeurs brutes', desc: 'Unités physiques' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setNormMode(mode.id)}
                className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
                  normMode === mode.id
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={mode.desc}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Période d'observation :
          </span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            {(['1880-2025', '1900-2025', '1950-2025', '1980-2025', '2000-2025'] as PeriodPreset[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPeriodPreset(p)}
                  className={`px-2.5 py-1.5 rounded-md transition font-mono cursor-pointer ${
                    periodPreset === p
                      ? 'bg-slate-800 text-cyan-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[380px] sm:h-[440px] w-full">
        {activeSeries.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
            Veuillez sélectionner au moins une série à afficher ci-dessus.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedTimeline} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.7} />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                minTickGap={30}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                domain={['auto', 'auto']}
                width={65}
                unit={normMode === 'zscore' ? ' σ' : normMode === 'index100' ? ' pts' : ''}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => {
                  const nameStr = String(name || '');
                  if (val === null || val === undefined) return ['—', nameStr];
                  const s = seriesConfigs.find((cfg) => cfg.id === nameStr);
                  const num = Number(val);
                  const suffix =
                    normMode === 'zscore'
                      ? ' σ'
                      : normMode === 'index100'
                      ? ' (base 100)'
                      : ` ${s?.metadata.unitSymbol || ''}`;
                  return [`${num.toFixed(2)}${suffix}`, s?.metadata.shortName || nameStr];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(val) => {
                  const s = seriesConfigs.find((cfg) => cfg.id === val);
                  return <span className="text-slate-300 font-mono">{s?.metadata.shortName || val}</span>;
                }}
              />

              {activeSeries.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Correlation panel (Active if >= 2 series) */}
      {correlationInfo && (
        <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Analyse de Corrélation Statistique :
              </span>
              <span className="text-xs text-cyan-300 font-mono">
                {correlationInfo.seriesA} ↔ {correlationInfo.seriesB}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {correlationInfo.commonPointsCount} années synchronisées ({dateCutoff}–2025)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs font-mono">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 block text-[11px]">Coefficient de Pearson (r) :</span>
              <span
                className={`text-base font-bold ${
                  correlationInfo.pearsonR > 0.5
                    ? 'text-cyan-400'
                    : correlationInfo.pearsonR < -0.5
                    ? 'text-blue-400'
                    : 'text-slate-300'
                }`}
              >
                {correlationInfo.pearsonR > 0 ? '+' : ''}
                {correlationInfo.pearsonR}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 block text-[11px]">Coefficient R² (variance expliquée) :</span>
              <span className="text-base font-bold text-slate-200">
                {(correlationInfo.rSquared * 100).toFixed(1)} %
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 block text-[11px]">Diagnostic mathématique :</span>
              <span className="text-slate-300 text-[11px] block mt-0.5">
                {correlationInfo.interpretation}
              </span>
            </div>
          </div>

          {/* Scientific Disclaimer (Non-negotiable requirement #4) */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-semibold block mb-0.5">
                Règle épistémologique essentielle :
              </strong>
              {CORRELATION_DISCLAIMER}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
