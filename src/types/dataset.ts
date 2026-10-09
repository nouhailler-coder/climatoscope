/**
 * ClimatOSCOPE — Core Data Types
 * Follows strict scientific data provenance standards.
 */

export interface TimeSeriesPoint {
  timestamp: string; // ISO format: YYYY-MM or YYYY-MM-DD or YYYY
  value: number;
  uncertainty?: number;
  qualityFlag?: 'valid' | 'interpolated' | 'preliminary' | 'suspect';
}

export interface DatasetMetadata {
  id: string;
  name: string;
  shortName: string;
  organization: string;
  source: string;
  sourceUrl: string;
  methodologyUrl?: string;
  variable: string;
  variableSymbol: string;
  unit: string;
  unitSymbol: string;
  frequency: 'monthly' | 'annual' | 'daily';
  startDate: string;
  endDate: string;
  baselinePeriod?: string; // e.g. "1951-1980" for GISTEMP
  retrievedAt: string;
  license?: string;
  description: string;
  isProxyOrReconstruction?: boolean;
}

export interface InternalDataset {
  metadata: DatasetMetadata;
  data: TimeSeriesPoint[];
  lastUpdated: string;
  localCacheVersion: number;
}

export type NormalizationMode = 'raw' | 'index100' | 'anomaly' | 'zscore';

export interface NormalizedPoint {
  timestamp: string;
  originalValue: number;
  normalizedValue: number;
  datasetId: string;
}

export interface CorrelationResult {
  seriesA: string;
  seriesB: string;
  commonPointsCount: number;
  pearsonR: number;
  rSquared: number;
  periodStart: string;
  periodEnd: string;
  interpretation: string;
  disclaimer: string;
}

export interface LinearTrendResult {
  slope: number; // change per year or month
  intercept: number;
  rSquared: number;
  unit: string;
  annualRate: number; // normalized per decade or per year
}

export interface DataQualityReport {
  datasetId: string;
  totalPoints: number;
  validPoints: number;
  missingPoints: number;
  temporalGaps: Array<{ from: string; to: string }>;
  min: number;
  max: number;
  mean: number;
  isMonotonicDate: boolean;
  qualityScore: 'high' | 'medium' | 'low';
}
