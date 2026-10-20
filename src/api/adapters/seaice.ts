/**
 * National Snow and Ice Data Center (NSIDC) & NASA GSFC Adapter
 * Sea Ice Index (Arctic September, Antarctic February, Arctic March)
 */

import {
  NSIDC_ARCTIC_SEPT_METADATA,
  NSIDC_ANTARCTIC_FEB_METADATA,
  NSIDC_ARCTIC_MARCH_METADATA,
  NSIDC_SEASONAL_CYCLE_METADATA,
  SEASONAL_CYCLE_MONTHS,
  SeasonalCycleMonth,
  getArcticSeptData,
  getAntarcticFebData,
  getArcticMarchData,
  getSeasonalCycleData,
  getSeasonalCycleMonths,
} from '../../data/baseline/seaice-nsidc';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export interface NsidcParseOptions {
  targetMonth?: number; // 1-12
  targetRegion?: 'N' | 'S'; // North or South
  variable?: 'extent' | 'area'; // Default 'extent'
  timestampFormat?: 'year' | 'monthly';
}

/**
 * Robust parser for NSIDC Sea Ice Index v3 monthly CSV files.
 * Format: year, mo, data-type, region, extent, area
 * Dynamically resolves columns, filters by month/region, and prevents timestamp collisions.
 */
export function parseNsidcMonthlyCsv(
  csvText: string,
  options?: NsidcParseOptions
): TimeSeriesPoint[] {
  const lines = csvText.split('\n');
  if (lines.length === 0) return [];

  // 1. Detect column positions from header
  let yearCol = 0;
  let moCol = 1;
  let typeCol = 2;
  let regionCol = 3;
  let extentCol = 4;
  let areaCol = 5;

  const firstLine = lines[0]?.toLowerCase() || '';
  if (firstLine.includes('year') && firstLine.includes(',')) {
    const headers = firstLine.split(',').map((h) => h.trim());
    const yIdx = headers.findIndex((h) => h === 'year');
    const mIdx = headers.findIndex((h) => h === 'mo' || h === 'month');
    const tIdx = headers.findIndex((h) => h.includes('type'));
    const rIdx = headers.findIndex((h) => h === 'region');
    const eIdx = headers.findIndex((h) => h === 'extent');
    const aIdx = headers.findIndex((h) => h === 'area');

    if (yIdx !== -1) yearCol = yIdx;
    if (mIdx !== -1) moCol = mIdx;
    if (tIdx !== -1) typeCol = tIdx;
    if (rIdx !== -1) regionCol = rIdx;
    if (eIdx !== -1) extentCol = eIdx;
    if (aIdx !== -1) areaCol = aIdx;
  }

  const valCol = options?.variable === 'area' ? areaCol : extentCol;

  // 2. Parse raw records
  interface RawRecord {
    year: string;
    month: number;
    monthStr: string;
    region: string;
    dataType: string;
    value: number;
  }

  const rawRecords: RawRecord[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('year') || line.startsWith('Year')) continue;

    const parts = line.split(',').map((p) => p.trim());
    if (parts.length > Math.max(yearCol, moCol, valCol)) {
      const year = parts[yearCol];
      const mo = parseInt(parts[moCol], 10);
      const region = (parts[regionCol] || '').toUpperCase();
      const dataType = parts[typeCol] || '';
      const val = parseFloat(parts[valCol]);

      if (!/^\d{4}$/.test(year) || isNaN(mo) || mo < 1 || mo > 12) continue;
      if (isNaN(val) || val <= 0 || val >= 30) continue; // valid ice extent/area range

      // Filter by requested month if specified
      if (options?.targetMonth !== undefined && mo !== options.targetMonth) {
        continue;
      }

      // Filter by requested region if specified
      if (options?.targetRegion && region && region !== options.targetRegion.toUpperCase()) {
        continue;
      }

      rawRecords.push({
        year,
        month: mo,
        monthStr: mo.toString().padStart(2, '0'),
        region,
        dataType,
        value: Number(val.toFixed(2)),
      });
    }
  }

  if (rawRecords.length === 0) return [];

  // 3. Determine timestamp format and collision prevention
  const distinctMonths = new Set(rawRecords.map((r) => r.month));

  // Case A: Multiple months present and annual series explicitly requested without a single target month
  if (options?.timestampFormat === 'year' && options?.targetMonth === undefined && distinctMonths.size > 1) {
    // Group by year and deduplicate Goddard vs NRT per month before annual aggregation
    const monthMap = new Map<string, RawRecord>();
    for (const rec of rawRecords) {
      const ymKey = `${rec.year}-${rec.monthStr}`;
      const existing = monthMap.get(ymKey);
      const isGoddard = rec.dataType.toLowerCase().includes('goddard');
      if (!existing || isGoddard) {
        monthMap.set(ymKey, rec);
      }
    }

    // Explicit annual mean aggregation across all valid months of each year
    const yearBuckets = new Map<string, number[]>();
    for (const rec of monthMap.values()) {
      const list = yearBuckets.get(rec.year) || [];
      list.push(rec.value);
      yearBuckets.set(rec.year, list);
    }

    const points: TimeSeriesPoint[] = [];
    for (const [year, vals] of yearBuckets.entries()) {
      const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
      points.push({
        timestamp: year,
        value: Number(avg.toFixed(2)),
        uncertainty: 0.05,
        qualityFlag: 'valid',
      });
    }

    points.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return points;
  }

  // Case B: Monthly series, single target month, or single month dataset
  // Preserve 'YYYY-MM' whenever distinct months > 1 to guarantee zero collision and prevent accidental overwriting
  const useYearOnly =
    (options?.timestampFormat === 'year' && (options?.targetMonth !== undefined || distinctMonths.size === 1)) ||
    (options?.timestampFormat !== 'monthly' && options?.targetMonth !== undefined) ||
    (options?.timestampFormat !== 'monthly' && distinctMonths.size === 1);

  // Group by timestamp key (prefer Goddard over NRT for identical period)
  const map = new Map<string, TimeSeriesPoint>();

  for (const rec of rawRecords) {
    const tsKey = useYearOnly ? rec.year : `${rec.year}-${rec.monthStr}`;
    const isGoddard = rec.dataType.toLowerCase().includes('goddard');

    const existing = map.get(tsKey);
    if (!existing || isGoddard) {
      map.set(tsKey, {
        timestamp: tsKey,
        value: rec.value,
        uncertainty: 0.05,
        qualityFlag: 'valid',
      });
    }
  }

  const points = Array.from(map.values());
  points.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return points;
}

/**
 * Helper to fetch from NSIDC with fallback mirrors and merge with baseline.
 */
async function fetchNsidcSeries(
  urls: string[],
  fallbackFn: () => TimeSeriesPoint[],
  options?: NsidcParseOptions
): Promise<TimeSeriesPoint[]> {
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        const parsed = parseNsidcMonthlyCsv(text, options);

        if (parsed.length >= 20) {
          // Merge with baseline to guarantee 100% coverage and include any new recent years
          const baseline = fallbackFn();
          const map = new Map<string, TimeSeriesPoint>();
          baseline.forEach((p) => map.set(p.timestamp, p));
          parsed.forEach((p) => map.set(p.timestamp, p));

          return Array.from(map.values()).sort(
            (a, b) => a.timestamp.localeCompare(b.timestamp)
          );
        }
      }
    } catch {
      // Continue to next mirror or fallback
    }
  }

  throw new Error('Échec du téléchargement direct NSIDC Sea Ice Index (tous miroirs indisponibles)');
}

export class SeaIceProvider extends BaseDataProvider {
  id = 'seaice-arctic-september-nsidc';
  name = 'NSIDC Sea Ice Index';

  getMetadata(): DatasetMetadata {
    return NSIDC_ARCTIC_SEPT_METADATA;
  }

  getAntarcticMetadata(): DatasetMetadata {
    return NSIDC_ANTARCTIC_FEB_METADATA;
  }

  getArcticMarchMetadata(): DatasetMetadata {
    return NSIDC_ARCTIC_MARCH_METADATA;
  }

  getSeasonalCycleMetadata(): DatasetMetadata {
    return NSIDC_SEASONAL_CYCLE_METADATA;
  }

  /**
   * Arctic September minimum extent (1979-present)
   */
  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const urls = [
      'https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/north/monthly/data/N_09_extent_v3.0.csv',
      'https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_09_extent_v3.0.csv',
    ];
    return fetchNsidcSeries(urls, getArcticSeptData, {
      targetMonth: 9,
      targetRegion: 'N',
      variable: 'extent',
      timestampFormat: 'year',
    });
  }

  /**
   * Antarctic February minimum extent (1979-present)
   */
  async fetchAntarcticData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const urls = [
      'https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/south/monthly/data/S_02_extent_v3.0.csv',
      'https://noaadata.apps.nsidc.org/NOAA/G02135/south/monthly/data/S_02_extent_v3.0.csv',
    ];
    return fetchNsidcSeries(urls, getAntarcticFebData, {
      targetMonth: 2,
      targetRegion: 'S',
      variable: 'extent',
      timestampFormat: 'year',
    });
  }

  /**
   * Arctic March winter maximum extent (1979-present)
   */
  async fetchArcticMarchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const urls = [
      'https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/north/monthly/data/N_03_extent_v3.0.csv',
      'https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_03_extent_v3.0.csv',
    ];
    return fetchNsidcSeries(urls, getArcticMarchData, {
      targetMonth: 3,
      targetRegion: 'N',
      variable: 'extent',
      timestampFormat: 'year',
    });
  }

  /**
   * Monthly seasonal cycle dataset
   */
  async fetchSeasonalCycleData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    return getSeasonalCycleData();
  }

  getArcticSeptData(): TimeSeriesPoint[] {
    return getArcticSeptData();
  }

  getAntarcticData(): TimeSeriesPoint[] {
    return getAntarcticFebData();
  }

  getArcticMarchData(): TimeSeriesPoint[] {
    return getArcticMarchData();
  }

  getSeasonalCycleData(): TimeSeriesPoint[] {
    return getSeasonalCycleData();
  }

  getSeasonalCycleMonths(): SeasonalCycleMonth[] {
    return getSeasonalCycleMonths();
  }
}
