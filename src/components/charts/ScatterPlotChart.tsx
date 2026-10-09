import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { calculateMean } from '../../analysis/math';
import { TimeSeriesPoint, DatasetMetadata } from '../../types/dataset';
import { CORRELATION_DISCLAIMER } from '../../analysis/math';
import { AlertCircle } from 'lucide-react';

interface ScatterPlotChartProps {
  seriesA: { metadata: DatasetMetadata; data: TimeSeriesPoint[]; color: string };
  seriesB: { metadata: DatasetMetadata; data: TimeSeriesPoint[]; color: string };
  periodCutoff?: string;
}

export const ScatterPlotChart: React.FC<ScatterPlotChartProps> = ({
  seriesA,
  seriesB,
  periodCutoff = '1950',
}) => {
  // Synchronize pairs by year
  const { pairs, minX, maxX, regressionLine, r, rSquared } = useMemo(() => {
    const mapB = new Map<string, number>();
    seriesB.data.forEach((p) => {
      const year = p.timestamp.substring(0, 4);
      if (year >= periodCutoff && typeof p.value === 'number' && !isNaN(p.value)) {
        mapB.set(year, p.value);
      }
    });

    const pts: Array<{ x: number; y: number; year: string }> = [];
    seriesA.data.forEach((p) => {
      const year = p.timestamp.substring(0, 4);
      if (year >= periodCutoff && mapB.has(year) && typeof p.value === 'number' && !isNaN(p.value)) {
        pts.push({
          x: p.value,
          y: mapB.get(year)!,
          year,
        });
      }
    });

    if (pts.length < 3) {
      return { pairs: [], minX: 0, maxX: 0, regressionLine: [], r: 0, rSquared: 0 };
    }

    const xVals = pts.map((p) => p.x);
    const yVals = pts.map((p) => p.y);
    const minXVal = Math.min(...xVals);
    const maxXVal = Math.max(...xVals);

    const meanX = calculateMean(xVals);
    const meanY = calculateMean(yVals);

    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].x - meanX;
      const dy = pts[i].y - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const slope = denX === 0 ? 0 : num / denX;
    const intercept = meanY - slope * meanX;

    const rVal = Math.sqrt(denX * denY) === 0 ? 0 : num / Math.sqrt(denX * denY);
    const r2Val = rVal * rVal;

    // Line start and end
    const linePts = [
      { x: minXVal, lineY: Number((intercept + slope * minXVal).toFixed(3)) },
      { x: maxXVal, lineY: Number((intercept + slope * maxXVal).toFixed(3)) },
    ];

    return {
      pairs: pts,
      minX: minXVal,
      maxX: maxXVal,
      regressionLine: linePts,
      r: Number(rVal.toFixed(4)),
      rSquared: Number(r2Val.toFixed(4)),
    };
  }, [seriesA, seriesB, periodCutoff]);

  if (pairs.length < 3) {
    return (
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center text-xs font-mono text-slate-400">
        Pas assez de points synchrones ({pairs.length}) pour tracer le nuage de dispersion.
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-inner">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Diagramme de Dispersion Bivarié ({seriesA.metadata.shortName} ➔ {seriesB.metadata.shortName})
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {pairs.length} années comparées ({periodCutoff}–2025)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
            r = {r > 0 ? '+' : ''}{r}
          </span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            R² = {(rSquared * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              type="number"
              dataKey="x"
              name={seriesA.metadata.shortName}
              unit={` ${seriesA.metadata.unitSymbol}`}
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              domain={['auto', 'auto']}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={seriesB.metadata.shortName}
              unit={` ${seriesB.metadata.unitSymbol}`}
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              domain={['auto', 'auto']}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                fontSize: '11px',
                color: '#f8fafc',
              }}
              formatter={(val: any, name: any, item: any) => {
                if (name === 'lineY') return [Number(val).toFixed(2), 'Droite de régression'];
                return [`${Number(val).toFixed(2)}`, String(name)];
              }}
              labelFormatter={(_: any, payload: any) => {
                const pt = payload?.[0]?.payload;
                return pt?.year ? `Année ${pt.year}` : 'Point';
              }}
            />

            {/* Scatter points */}
            <Scatter
              name={`${seriesA.metadata.shortName} vs ${seriesB.metadata.shortName}`}
              data={pairs}
              fill={seriesB.color}
              opacity={0.8}
            />

            {/* Regression line */}
            <Line
              data={regressionLine}
              dataKey="lineY"
              type="linear"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-amber-300/90 font-mono">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <span>{CORRELATION_DISCLAIMER}</span>
      </div>
    </div>
  );
};
