/**
 * ClimatOSCOPE — Series Normalization Engine
 * Allows objective multi-series comparison without distortion.
 */

import { NormalizationMode, NormalizedPoint, TimeSeriesPoint } from '../types/dataset';
import { calculateMean, calculateStandardDeviation } from './math';

export interface NormalizationOptions {
  mode: NormalizationMode;
  baselineStart?: string;
  baselineEnd?: string;
}

/**
 * Normalizes a time series according to the requested mode.
 */
export function normalizeSeries(
  data: TimeSeriesPoint[],
  datasetId: string,
  options: NormalizationOptions
): NormalizedPoint[] {
  if (!data || data.length === 0) return [];

  const valid = data.filter(d => typeof d.value === 'number' && !isNaN(d.value));
  if (valid.length === 0) return [];

  switch (options.mode) {
    case 'raw':
      return valid.map(p => ({
        timestamp: p.timestamp,
        originalValue: p.value,
        normalizedValue: p.value,
        datasetId,
      }));

    case 'index100': {
      // Base 100 on the first valid point or mean of the first year
      const basePoint = valid[0];
      const baseValue = basePoint.value;
      if (baseValue === 0) {
        return valid.map(p => ({
          timestamp: p.timestamp,
          originalValue: p.value,
          normalizedValue: 100,
          datasetId,
        }));
      }

      return valid.map(p => ({
        timestamp: p.timestamp,
        originalValue: p.value,
        normalizedValue: Number(((p.value / baseValue) * 100).toFixed(3)),
        datasetId,
      }));
    }

    case 'anomaly': {
      // If baseline period specified, compute baseline mean; otherwise overall mean
      let baselineSubset = valid;
      if (options.baselineStart || options.baselineEnd) {
        const filtered = valid.filter(p => {
          const matchStart = !options.baselineStart || p.timestamp >= options.baselineStart;
          const matchEnd = !options.baselineEnd || p.timestamp <= options.baselineEnd;
          return matchStart && matchEnd;
        });
        if (filtered.length > 0) {
          baselineSubset = filtered;
        }
      }

      const mean = calculateMean(baselineSubset.map(p => p.value));
      return valid.map(p => ({
        timestamp: p.timestamp,
        originalValue: p.value,
        normalizedValue: Number((p.value - mean).toFixed(4)),
        datasetId,
      }));
    }

    case 'zscore': {
      const vals = valid.map(p => p.value);
      const mean = calculateMean(vals);
      const std = calculateStandardDeviation(vals, mean);

      if (std === 0) {
        return valid.map(p => ({
          timestamp: p.timestamp,
          originalValue: p.value,
          normalizedValue: 0,
          datasetId,
        }));
      }

      return valid.map(p => ({
        timestamp: p.timestamp,
        originalValue: p.value,
        normalizedValue: Number(((p.value - mean) / std).toFixed(3)),
        datasetId,
      }));
    }

    default:
      return valid.map(p => ({
        timestamp: p.timestamp,
        originalValue: p.value,
        normalizedValue: p.value,
        datasetId,
      }));
  }
}
