import { describe, it, expect } from 'vitest';
import { validateTimeSeriesData } from '../src/analysis/quality';
import { TimeSeriesPoint } from '../src/types/dataset';

describe('Data Quality Validator', () => {
  it('flags non-chronological points and duplicate dates', () => {
    const corrupted: TimeSeriesPoint[] = [
      { timestamp: '2020-01', value: 10 },
      { timestamp: '2020-03', value: 15 },
      { timestamp: '2020-02', value: 12 }, // out of order
      { timestamp: '2020-02', value: 12 }, // duplicate
    ];

    const { report, issues } = validateTimeSeriesData(corrupted, 'test-corrupt');
    expect(report.isMonotonicDate).toBe(false);
    expect(issues.some(i => i.type === 'non_chronological')).toBe(true);
    expect(issues.some(i => i.type === 'duplicate_date')).toBe(true);
  });

  it('detects missing NaN points without crashing', () => {
    const withHoles: TimeSeriesPoint[] = [
      { timestamp: '2020-01', value: 10 },
      { timestamp: '2020-02', value: NaN },
      { timestamp: '2020-03', value: 30 },
    ];

    const { report, issues } = validateTimeSeriesData(withHoles, 'test-holes');
    expect(report.missingPoints).toBe(1);
    expect(report.validPoints).toBe(2);
    expect(report.mean).toBe(20);
    expect(issues.some(i => i.type === 'nan_value')).toBe(true);
  });

  it('validates a high-quality scientific dataset', () => {
    const clean: TimeSeriesPoint[] = [
      { timestamp: '2020-01', value: 10 },
      { timestamp: '2020-02', value: 12 },
      { timestamp: '2020-03', value: 14 },
      { timestamp: '2020-04', value: 16 },
      { timestamp: '2020-05', value: 18 },
    ];

    const { report, issues } = validateTimeSeriesData(clean, 'test-clean');
    expect(report.qualityScore).toBe('high');
    expect(report.isMonotonicDate).toBe(true);
    expect(report.missingPoints).toBe(0);
    expect(report.min).toBe(10);
    expect(report.max).toBe(18);
  });
});
