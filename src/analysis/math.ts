/**
 * ClimatOSCOPE — Scientific Mathematical & Statistical Engine
 * Rigorous calculations for climate data analysis.
 */

import { CorrelationResult, LinearTrendResult, TimeSeriesPoint } from '../types/dataset';

export const CORRELATION_DISCLAIMER =
  "Les deux séries présentent une évolution mathématique mesurée sur cette période. Attention : une corrélation statistique ne constitue en aucun cas une preuve de causalité.";

/**
 * Calculates a centred or backward moving average for a time series.
 * @param data Array of time series points
 * @param window Window size (e.g., 12 for 12 months, 60 for 5 years)
 * @param centered If true, centers the window around the point
 */
export function calculateMovingAverage(
  data: TimeSeriesPoint[],
  window: number,
  centered: boolean = false
): Array<{ timestamp: string; value: number | null }> {
  if (!data || data.length === 0 || window <= 1) {
    return (data || []).map(p => ({ timestamp: p.timestamp, value: p.value }));
  }

  const result: Array<{ timestamp: string; value: number | null }> = [];
  const halfWindow = Math.floor(window / 2);

  for (let i = 0; i < data.length; i++) {
    let start: number;
    let end: number;

    if (centered) {
      start = i - halfWindow;
      end = i + halfWindow;
    } else {
      start = i - window + 1;
      end = i;
    }

    if (start < 0 || end >= data.length) {
      result.push({ timestamp: data[i].timestamp, value: null });
      continue;
    }

    let sum = 0;
    let count = 0;
    for (let k = start; k <= end; k++) {
      const val = data[k].value;
      if (typeof val === 'number' && !isNaN(val)) {
        sum += val;
        count++;
      }
    }

    // Require at least 80% valid points in window
    if (count >= window * 0.8) {
      result.push({
        timestamp: data[i].timestamp,
        value: Number((sum / count).toFixed(4)),
      });
    } else {
      result.push({ timestamp: data[i].timestamp, value: null });
    }
  }

  return result;
}

/**
 * Calculates the mean of an array of numbers.
 */
export function calculateMean(values: number[]): number {
  if (!values.length) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

/**
 * Calculates standard deviation.
 */
export function calculateStandardDeviation(values: number[], mean?: number): number {
  if (values.length <= 1) return 0;
  const m = mean ?? calculateMean(values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates linear regression (y = a*x + b) and R².
 */
export function calculateLinearTrend(data: TimeSeriesPoint[]): LinearTrendResult | null {
  const valid = data.filter(d => typeof d.value === 'number' && !isNaN(d.value));
  const n = valid.length;
  if (n < 2) return null;

  // Use indices or years as x
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = valid[i].value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Pearson r²
  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denR === 0 ? 0 : numR / denR;
  const rSquared = r * r;

  return {
    slope: Number(slope.toFixed(6)),
    intercept: Number(intercept.toFixed(4)),
    rSquared: Number(rSquared.toFixed(4)),
    unit: '',
    annualRate: Number((slope * 12).toFixed(4)), // Assuming monthly data, rate per year
  };
}

export interface SeaIceTrendResult {
  slopeAnnualMkm2: number;      // Pente annuelle OLS en Millions de km²/an
  annualLossKm2: number;        // Perte annuelle en km²/an
  decadalRatePercent: number;   // Tendance relative en %/décennie vs moyenne de référence
  rSquared: number;             // Coefficient de détermination R²
  startYear: number;
  endYear: number;
  totalPoints: number;
  baselineMean: number;         // Moyenne de la période de référence utilisée (M km²)
}

/**
 * Calculates documented Ordinary Least Squares (OLS) trend for sea ice time series.
 * Follows NSIDC standardized methodology: decadal rate is expressed relative to
 * the 1981-2010 reference climatology average (or user-defined baseline mean).
 */
export function calculateSeaIceTrend(
  points: Array<{ year: number; value: number }>,
  baselineMean?: number
): SeaIceTrendResult | null {
  const valid = points.filter(p => typeof p.value === 'number' && !isNaN(p.value) && p.value > 0);
  const n = valid.length;
  if (n < 3) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = valid[i].year;
    const y = valid[i].value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denR === 0 ? 0 : numR / denR;
  const rSquared = r * r;

  const refMean = baselineMean && baselineMean > 0 ? baselineMean : sumY / n;
  const decadalRatePercent = (slope * 10 / refMean) * 100;
  const annualLossKm2 = slope * 1_000_000;

  return {
    slopeAnnualMkm2: Number(slope.toFixed(4)),
    annualLossKm2: Math.round(annualLossKm2),
    decadalRatePercent: Number(decadalRatePercent.toFixed(2)),
    rSquared: Number(rSquared.toFixed(3)),
    startYear: valid[0].year,
    endYear: valid[valid.length - 1].year,
    totalPoints: n,
    baselineMean: Number(refMean.toFixed(2)),
  };
}

/**
 * Calculates Pearson correlation coefficient between two time series matched by timestamp.
 */
export function calculatePearsonCorrelation(
  seriesA: TimeSeriesPoint[],
  seriesB: TimeSeriesPoint[],
  nameA: string = 'Série A',
  nameB: string = 'Série B'
): CorrelationResult {
  const mapB = new Map<string, number>();
  seriesB.forEach(p => {
    if (typeof p.value === 'number' && !isNaN(p.value)) {
      mapB.set(p.timestamp.substring(0, 7), p.value);
    }
  });

  const commonPairs: Array<{ x: number; y: number; ts: string }> = [];

  seriesA.forEach(p => {
    const key = p.timestamp.substring(0, 7);
    if (mapB.has(key) && typeof p.value === 'number' && !isNaN(p.value)) {
      commonPairs.push({
        x: p.value,
        y: mapB.get(key)!,
        ts: key,
      });
    }
  });

  const n = commonPairs.length;
  if (n < 5) {
    return {
      seriesA: nameA,
      seriesB: nameB,
      commonPointsCount: n,
      pearsonR: 0,
      rSquared: 0,
      periodStart: commonPairs[0]?.ts || 'N/A',
      periodEnd: commonPairs[n - 1]?.ts || 'N/A',
      interpretation: 'Nombre de points synchrones insuffisant pour une corrélation robuste (min 5).',
      disclaimer: CORRELATION_DISCLAIMER,
    };
  }

  const xVals = commonPairs.map(p => p.x);
  const yVals = commonPairs.map(p => p.y);

  const meanX = calculateMean(xVals);
  const meanY = calculateMean(yVals);

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = commonPairs[i].x - meanX;
    const dy = commonPairs[i].y - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const denom = Math.sqrt(denX * denY);
  const r = denom === 0 ? 0 : num / denom;
  const rSquared = r * r;

  let interpretation = '';
  const absR = Math.abs(r);
  if (absR >= 0.8) {
    interpretation = `Forte corrélation linéaire ${r > 0 ? 'positive' : 'négative'} (|r| = ${r.toFixed(2)}).`;
  } else if (absR >= 0.5) {
    interpretation = `Corrélation linéaire modérée ${r > 0 ? 'positive' : 'négative'} (|r| = ${r.toFixed(2)}).`;
  } else if (absR >= 0.2) {
    interpretation = `Corrélation linéaire faible (|r| = ${r.toFixed(2)}).`;
  } else {
    interpretation = `Quasi-absence de corrélation linéaire (|r| = ${r.toFixed(2)}).`;
  }

  return {
    seriesA: nameA,
    seriesB: nameB,
    commonPointsCount: n,
    pearsonR: Number(r.toFixed(4)),
    rSquared: Number(rSquared.toFixed(4)),
    periodStart: commonPairs[0].ts,
    periodEnd: commonPairs[n - 1].ts,
    interpretation,
    disclaimer: CORRELATION_DISCLAIMER,
  };
}
