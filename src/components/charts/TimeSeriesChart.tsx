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
} from 'recharts';
import { calculateMovingAverage, calculateLinearTrend } from '../../analysis/math';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { formatScientificValue, formatYearOrMonth } from '../../utils/formatters';
import { ExternalLink, TrendingUp, Sliders } from 'lucide-react';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  metadata: DatasetMetadata;
  color?: string;
  showMovingAverageDefault?: boolean;
  baselineZero?: boolean;
}

export type PeriodFilter = '10y' | '30y' | '100y' | 'max';

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  metadata,
  color = '#06b6d4', // cyan-500
  showMovingAverageDefault = false,
  baselineZero = false,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('max');
  const [movingAvgWindow, setMovingAvgWindow] = useState<number>(showMovingAverageDefault ? 12 : 0);
  const [showTrend, setShowTrend] = useState<boolean>(false);

  // Filter data by chosen period
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (period === 'max') return data;

    const latestPoint = data[data.length - 1];
    const latestYear = parseInt(latestPoint.timestamp.substring(0, 4), 10);
    const yearsBack = period === '10y' ? 10 : period === '30y' ? 30 : 100;
    const cutoffYear = latestYear - yearsBack;

    return data.filter((p) => {
      const y = parseInt(p.timestamp.substring(0, 4), 10);
      return y >= cutoffYear;
    });
  }, [data, period]);

  // Compute moving average
  const movingAvgData = useMemo(() => {
    if (movingAvgWindow <= 1) return null;
    return calculateMovingAverage(filteredData, movingAvgWindow, true);
  }, [filteredData, movingAvgWindow]);

  // Compute linear trend
  const trendResult = useMemo(() => {
    if (!showTrend) return null;
    return calculateLinearTrend(filteredData);
  }, [filteredData, showTrend]);

  // Merge into chart payload
  const chartPayload = useMemo(() => {
    return filteredData.map((pt, idx) => {
      let trendVal: number | null = null;
      if (trendResult && trendResult.slope !== undefined) {
        trendVal = Number((trendResult.intercept + trendResult.slope * idx).toFixed(4));
      }

      return {
        timestamp: pt.timestamp,
        value: pt.value,
        movingAvg: movingAvgData ? movingAvgData[idx]?.value : null,
        trend: trendVal,
      };
    });
  }, [filteredData, movingAvgData, trendResult]);

  // Quick stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const values = filteredData.map((p) => p.value).filter((v) => typeof v === 'number' && !isNaN(v));
    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const delta = lastVal - firstVal;

    return { firstVal, lastVal, minVal, maxVal, delta, count: values.length };
  }, [filteredData]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Aucune donnée disponible pour cette série.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100 font-sans tracking-tight">
              {metadata.name}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700/60">
              {metadata.unitSymbol}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organisme : <span className="text-slate-300 font-medium">{metadata.organization}</span>
            {metadata.baselinePeriod && (
              <span className="ml-2 text-cyan-400/90">· Réf. {metadata.baselinePeriod}</span>
            )}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            {(['10y', '30y', '100y', 'max'] as PeriodFilter[]).map((p) => {
              const labels: Record<PeriodFilter, string> = {
                '10y': '10 ans',
                '30y': '30 ans',
                '100y': '100 ans',
                max: 'Max',
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                    period === p
                      ? 'bg-slate-800 text-cyan-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Moving average selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <span className="px-2 py-1 text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <Sliders className="w-3 h-3" /> MM:
            </span>
            {[
              { w: 0, l: 'Off' },
              { w: 12, l: '12m' },
              { w: 60, l: '5a' },
              { w: 120, l: '10a' },
            ].map((opt) => (
              <button
                key={opt.w}
                onClick={() => setMovingAvgWindow(opt.w)}
                className={`px-2 py-1 rounded-md transition font-mono text-[11px] cursor-pointer ${
                  movingAvgWindow === opt.w
                    ? 'bg-slate-800 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>

          {/* Trend toggle */}
          <button
            onClick={() => setShowTrend(!showTrend)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
              showTrend
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tendance</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Dernière Valeur
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-100 font-mono">
              {formatScientificValue(stats.lastVal, metadata.unitSymbol)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {filteredData[filteredData.length - 1]?.timestamp}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Évolution Période
            </span>
            <div
              className={`text-base sm:text-lg font-bold font-mono ${
                stats.delta > 0 ? 'text-amber-400' : stats.delta < 0 ? 'text-blue-400' : 'text-slate-200'
              }`}
            >
              {stats.delta > 0 ? '+' : ''}
              {formatScientificValue(stats.delta, metadata.unitSymbol)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Depuis {filteredData[0]?.timestamp}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Minimum Observé
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-200 font-mono">
              {formatScientificValue(stats.minVal, metadata.unitSymbol)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Sur la plage</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Maximum Observé
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-200 font-mono">
              {formatScientificValue(stats.maxVal, metadata.unitSymbol)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Sur la plage</span>
          </div>
        </div>
      )}

      {/* The Chart */}
      <div className="h-[340px] sm:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartPayload} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.7} />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => (v.length > 4 ? v.substring(0, 4) : v)}
              minTickGap={35}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              domain={['auto', 'auto']}
              unit={` ${metadata.unitSymbol}`}
              width={70}
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
              labelFormatter={(lbl: any) => formatYearOrMonth(String(lbl ?? ''))}
              formatter={(val: any, name: any) => {
                if (val === null || val === undefined) return ['—', String(name || '')];
                const num = Number(val);
                const nameStr = String(name || '');
                const labelMap: Record<string, string> = {
                  value: metadata.shortName || 'Mesure brute',
                  movingAvg: `Moyenne mobile (${movingAvgWindow} pts)`,
                  trend: 'Régression linéaire',
                };
                return [`${num.toFixed(3)} ${metadata.unitSymbol}`, labelMap[nameStr] || nameStr];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(val) => {
                const labelMap: Record<string, string> = {
                  value: 'Données observées',
                  movingAvg: `Moyenne lissée (${movingAvgWindow} pts)`,
                  trend: 'Tendance linéaire',
                };
                return <span className="text-slate-300 font-mono">{labelMap[val] || val}</span>;
              }}
            />

            {baselineZero && <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />}

            {/* Main raw line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={movingAvgWindow > 0 ? 1 : 1.75}
              opacity={movingAvgWindow > 0 ? 0.45 : 1}
              dot={filteredData.length < 40 ? { r: 3, fill: color } : false}
              isAnimationActive={false}
            />

            {/* Smoothed moving average */}
            {movingAvgWindow > 0 && (
              <Line
                type="monotone"
                dataKey="movingAvg"
                stroke="#f59e0b" // amber-500
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Linear trend */}
            {showTrend && (
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#a855f7" // purple-500
                strokeWidth={1.75}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Linear trend mathematical detail if active */}
      {showTrend && trendResult && (
        <div className="mt-3 bg-purple-950/30 border border-purple-800/40 rounded-xl p-3 text-xs text-purple-200 font-mono flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>Pente : {trendResult.slope > 0 ? '+' : ''}{trendResult.slope} {metadata.unitSymbol}/pt</span>
            <span>R² (détermination) : {trendResult.rSquared}</span>
          </div>
          <span className="text-[11px] text-purple-400">
            Régression des moindres carrés
          </span>
        </div>
      )}

      {/* Provenance Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          <span>Source : </span>
          <a
            href={metadata.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition"
          >
            {metadata.source} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Fréquence : {metadata.frequency} · Plage : {metadata.startDate} → {metadata.endDate}
        </div>
      </div>
    </div>
  );
};
