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

/**
 * Robust parser for NSIDC Sea Ice Index v3 monthly CSV files.
 * Format: year, mo, data-type, region, extent, area
 */
export function parseNsidcMonthlyCsv(csvText: string): TimeSeriesPoint[] {
  const lines = csvText.split('\n');
  const points: TimeSeriesPoint[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('year') || line.startsWith('Year')) continue;

    const parts = line.split(',').map((p) => p.trim());
    if (parts.length >= 5) {
      const year = parts[0];
      const extent = parseFloat(parts[4]);

      if (/^\d{4}$/.test(year) && !isNaN(extent) && extent > 0 && extent < 30) {
        points.push({
          timestamp: year,
          value: Number(extent.toFixed(2)),
          uncertainty: 0.05,
          qualityFlag: 'valid',
        });
      }
    }
  }

  // Sort ascending by year
  points.sort((a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10));
  return points;
}

/**
 * Helper to fetch from NSIDC with fallback mirrors and merge with baseline.
 */
async function fetchNsidcSeries(
  urls: string[],
  fallbackFn: () => TimeSeriesPoint[]
): Promise<TimeSeriesPoint[]> {
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        const parsed = parseNsidcMonthlyCsv(text);

        if (parsed.length >= 20) {
          // Merge with baseline to guarantee 100% coverage and include any new recent years
          const baseline = fallbackFn();
          const map = new Map<string, TimeSeriesPoint>();
          baseline.forEach((p) => map.set(p.timestamp, p));
          parsed.forEach((p) => map.set(p.timestamp, p));

          return Array.from(map.values()).sort(
            (a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10)
          );
        }
      }
    } catch {
      // Continue to next mirror or fallback
    }
  }

  return fallbackFn();
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
    return fetchNsidcSeries(urls, getArcticSeptData);
  }

  /**
   * Antarctic February minimum extent (1979-present)
   */
  async fetchAntarcticData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const urls = [
      'https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/south/monthly/data/S_02_extent_v3.0.csv',
      'https://noaadata.apps.nsidc.org/NOAA/G02135/south/monthly/data/S_02_extent_v3.0.csv',
    ];
    return fetchNsidcSeries(urls, getAntarcticFebData);
  }

  /**
   * Arctic March winter maximum extent (1979-present)
   */
  async fetchArcticMarchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const urls = [
      'https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/north/monthly/data/N_03_extent_v3.0.csv',
      'https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/N_03_extent_v3.0.csv',
    ];
    return fetchNsidcSeries(urls, getArcticMarchData);
  }

  /**
   * Monthly seasonal cycle dataset
   */
  async fetchSeasonalCycleData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    return getSeasonalCycleData();
  }

  getAntarcticData(): TimeSeriesPoint[] {
    return getAntarcticFebData();
  }

  getArcticMarchData(): TimeSeriesPoint[] {
    return getArcticMarchData();
  }

  getSeasonalCycleMonths(): SeasonalCycleMonth[] {
    return getSeasonalCycleMonths();
  }
}
