/**
 * ClimatOSCOPE — Data Quality Validator
 * Scientific integrity validation without destructive filtering.
 */

import { DataQualityReport, TimeSeriesPoint } from '../types/dataset';

export interface ValidationIssue {
  type: 'invalid_date' | 'nan_value' | 'duplicate_date' | 'non_chronological' | 'temporal_gap' | 'outlier_suspect';
  timestamp?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export function validateTimeSeriesData(
  data: TimeSeriesPoint[],
  datasetId: string,
  expectedFrequencyMonths: number = 1
): { report: DataQualityReport; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const seenTimestamps = new Set<string>();
  const temporalGaps: Array<{ from: string; to: string }> = [];

  let validPoints = 0;
  let missingPoints = 0;
  let isMonotonicDate = true;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    const pt = data[i];

    // Check date format
    if (!pt.timestamp || isNaN(new Date(pt.timestamp).getTime())) {
      issues.push({
        type: 'invalid_date',
        timestamp: pt.timestamp,
        message: `Date non valide à l'index ${i}: "${pt.timestamp}"`,
        severity: 'error',
      });
    }

    // Check chronological order & duplicates
    if (i > 0) {
      if (pt.timestamp < data[i - 1].timestamp) {
        isMonotonicDate = false;
        issues.push({
          type: 'non_chronological',
          timestamp: pt.timestamp,
          message: `Date hors ordre chronologique: ${pt.timestamp} après ${data[i - 1].timestamp}`,
          severity: 'error',
        });
      } else if (pt.timestamp === data[i - 1].timestamp) {
        issues.push({
          type: 'duplicate_date',
          timestamp: pt.timestamp,
          message: `Date en double: ${pt.timestamp}`,
          severity: 'warning',
        });
      } else if (expectedFrequencyMonths > 0) {
        // Temporal gap detection
        const prevDate = new Date(data[i - 1].timestamp);
        const currDate = new Date(pt.timestamp);
        const diffMonths = (currDate.getFullYear() - prevDate.getFullYear()) * 12 + (currDate.getMonth() - prevDate.getMonth());
        if (diffMonths > expectedFrequencyMonths * 2) {
          temporalGaps.push({ from: data[i - 1].timestamp, to: pt.timestamp });
          issues.push({
            type: 'temporal_gap',
            timestamp: pt.timestamp,
            message: `Trou temporel détecté de ${data[i - 1].timestamp} à ${pt.timestamp} (${diffMonths} mois)`,
            severity: 'info',
          });
        }
      }
    }
    seenTimestamps.add(pt.timestamp);

    // Value check
    if (typeof pt.value !== 'number' || isNaN(pt.value) || pt.value === null) {
      missingPoints++;
      issues.push({
        type: 'nan_value',
        timestamp: pt.timestamp,
        message: `Valeur manquante ou NaN à ${pt.timestamp}`,
        severity: 'warning',
      });
    } else {
      validPoints++;
      if (pt.value < min) min = pt.value;
      if (pt.value > max) max = pt.value;
      sum += pt.value;
    }
  }

  const totalPoints = data.length;
  const mean = validPoints > 0 ? sum / validPoints : 0;

  // Determine quality score
  let qualityScore: 'high' | 'medium' | 'low' = 'high';
  if (missingPoints / Math.max(1, totalPoints) > 0.05 || !isMonotonicDate) {
    qualityScore = 'medium';
  }
  if (missingPoints / Math.max(1, totalPoints) > 0.20 || validPoints < 5) {
    qualityScore = 'low';
  }

  const report: DataQualityReport = {
    datasetId,
    totalPoints,
    validPoints,
    missingPoints,
    temporalGaps,
    min: min === Infinity ? 0 : min,
    max: max === -Infinity ? 0 : max,
    mean: Number(mean.toFixed(4)),
    isMonotonicDate,
    qualityScore,
  };

  return { report, issues };
}
