import { describe, it, expect } from 'vitest';
import {
  calculateMean,
  calculateStandardDeviation,
  calculateMovingAverage,
  calculateLinearTrend,
  calculatePearsonCorrelation,
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
});
