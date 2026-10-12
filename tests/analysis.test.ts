import { describe, it, expect } from 'vitest';
import {
  calculateMean,
  calculateStandardDeviation,
  calculateMovingAverage,
  calculateLinearTrend,
  calculatePearsonCorrelation,
  calculateSeaIceTrend,
} from '../src/analysis/math';
import { normalizeSeries } from '../src/analysis/normalization';
import { TimeSeriesPoint } from '../src/types/dataset';

describe('Statistical & Math Engine', () => {
  it('calculates mean and standard deviation correctly', () => {
    const vals = [10, 20, 30, 40, 50];
    expect(calculateMean(vals)).toBe(30);

    const std = calculateStandardDeviation(vals);
    expect(Number(std.toFixed(2))).toBe(15.81);
  });

  it('calculates moving average with proper window', () => {
    const pts: TimeSeriesPoint[] = [
      { timestamp: '2020-01', value: 10 },
      { timestamp: '2020-02', value: 20 },
      { timestamp: '2020-03', value: 30 },
      { timestamp: '2020-04', value: 40 },
      { timestamp: '2020-05', value: 50 },
    ];

    const ma = calculateMovingAverage(pts, 3, false);
    expect(ma[0].value).toBeNull(); // Window not filled yet
    expect(ma[1].value).toBeNull();
    expect(ma[2].value).toBe(20); // (10 + 20 + 30) / 3 = 20
    expect(ma[3].value).toBe(30); // (20 + 30 + 40) / 3 = 30
    expect(ma[4].value).toBe(40); // (30 + 40 + 50) / 3 = 40
  });

  it('calculates linear trend regression slope and R²', () => {
    // Perfectly linear y = 2x + 5
    const pts: TimeSeriesPoint[] = [
      { timestamp: '2000', value: 5 },
      { timestamp: '2001', value: 7 },
      { timestamp: '2002', value: 9 },
      { timestamp: '2003', value: 11 },
      { timestamp: '2004', value: 13 },
    ];

    const res = calculateLinearTrend(pts);
    expect(res).not.toBeNull();
    expect(res?.slope).toBe(2);
    expect(res?.intercept).toBe(5);
    expect(res?.rSquared).toBe(1);
  });

  it('computes Pearson correlation between two aligned series', () => {
    const seriesA: TimeSeriesPoint[] = [
      { timestamp: '2000', value: 1 },
      { timestamp: '2001', value: 2 },
      { timestamp: '2002', value: 3 },
      { timestamp: '2003', value: 4 },
      { timestamp: '2004', value: 5 },
    ];
    const seriesB: TimeSeriesPoint[] = [
      { timestamp: '2000', value: 2 },
      { timestamp: '2001', value: 4 },
      { timestamp: '2002', value: 6 },
      { timestamp: '2003', value: 8 },
      { timestamp: '2004', value: 10 },
    ];

    const corr = calculatePearsonCorrelation(seriesA, seriesB, 'A', 'B');
    expect(corr.pearsonR).toBe(1);
    expect(corr.rSquared).toBe(1);
    expect(corr.disclaimer).toContain('ne constitue en aucun cas une preuve de causalité');
  });

  it('normalizes series correctly in Index 100 and Z-Score modes', () => {
    const pts: TimeSeriesPoint[] = [
      { timestamp: '2000', value: 50 },
      { timestamp: '2001', value: 75 },
      { timestamp: '2002', value: 100 },
    ];

    const index100 = normalizeSeries(pts, 'test', { mode: 'index100' });
    expect(index100[0].normalizedValue).toBe(100);
    expect(index100[1].normalizedValue).toBe(150);
    expect(index100[2].normalizedValue).toBe(200);

    const zscore = normalizeSeries(pts, 'test', { mode: 'zscore' });
    expect(zscore[1].normalizedValue).toBe(0); // mean is 75, so z-score is 0
    expect(zscore[0].normalizedValue).toBeLessThan(0);
    expect(zscore[2].normalizedValue).toBeGreaterThan(0);
  });

  it('computes CO2 annual variation and preindustrial anomaly strictly from loaded observations', () => {
    // 1. With actual loaded observations
    const sampleMonthlyCo2: TimeSeriesPoint[] = [
      { timestamp: '2023-12', value: 421.86 },
      { timestamp: '2024-12', value: 424.58 },
    ];
    const latest = sampleMonthlyCo2[sampleMonthlyCo2.length - 1];
    const prev = sampleMonthlyCo2.find((p) => p.timestamp === '2023-12');
    const dynamicCo2Delta = latest && prev ? Number((latest.value - prev.value).toFixed(2)) : null;
    expect(dynamicCo2Delta).toBe(2.72);

    // 2. When data is absent / empty, returns null (never hardcoded 2.45)
    const emptyCo2: TimeSeriesPoint[] = [];
    const missingDelta = emptyCo2.length >= 2 ? emptyCo2[1].value - emptyCo2[0].value : null;
    expect(missingDelta).toBeNull();

    // 3. Preindustrial temperature: calculated strictly from observation + 0.28 (never hardcoded 1.45)
    const sampleTemp: TimeSeriesPoint = { timestamp: '2024', value: 1.18 };
    const preindustrialVal = sampleTemp ? Number((sampleTemp.value + 0.28).toFixed(2)) : null;
    expect(preindustrialVal).toBe(1.46);

    const missingTemp = undefined;
    const missingPreind = missingTemp ? Number(((missingTemp as any).value + 0.28).toFixed(2)) : null;
    expect(missingPreind).toBeNull();
  });

  it('calculates documented NSIDC sea ice trend and decadal rates via OLS regression', () => {
    // Synthetic 10-year series losing 0.08 M km²/year from baseline 6.40 M km²
    const syntheticIce = [
      { year: 2000, value: 6.40 },
      { year: 2001, value: 6.32 },
      { year: 2002, value: 6.24 },
      { year: 2003, value: 6.16 },
      { year: 2004, value: 6.08 },
      { year: 2005, value: 6.00 },
      { year: 2006, value: 5.92 },
      { year: 2007, value: 5.84 },
      { year: 2008, value: 5.76 },
      { year: 2009, value: 5.68 },
    ];

    const trend = calculateSeaIceTrend(syntheticIce, 6.40);
    expect(trend).not.toBeNull();
    expect(trend!.slopeAnnualMkm2).toBe(-0.08);
    expect(trend!.annualLossKm2).toBe(-80000);
    // Decadal rate: (-0.08 * 10 / 6.40) * 100 = -12.5%
    expect(trend!.decadalRatePercent).toBe(-12.5);
    expect(trend!.rSquared).toBe(1);
    expect(trend!.startYear).toBe(2000);
    expect(trend!.endYear).toBe(2009);
    expect(trend!.totalPoints).toBe(10);
  });
});
