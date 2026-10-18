/**
 * NASA GISS GISTEMP v4, NOAA GlobalTemp & Berkeley Earth Adapters
 * Independent implementations with genuine network downloads and authentic baseline observations.
 * All network methods propagate failures to avoid disguising fallbacks as live data.
 */

import {
  GISTEMP_METADATA,
  NOAA_TEMPANOMALY_METADATA,
  BERKELEY_TEMP_METADATA,
  getGistempAnnualData,
  getGistempMonthlyData,
  getNoaaGlobalTempData,
  getBerkeleyEarthData,
} from '../../data/baseline/temperature-gistemp';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class GistempProvider extends BaseDataProvider {
  id = 'temp-nasa-gistemp';
  name = 'NASA GISTEMP v4';

  getMetadata(): DatasetMetadata {
    return GISTEMP_METADATA;
  }

  /**
   * Fetches NASA GISTEMP LOTI CSV and extracts either annual or monthly observations.
   */
  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const isMonthly = options?.frequency === 'monthly';
    const url = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`GISTEMP HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('Year')) continue;
        const parts = line.split(',');
        const year = parts[0]?.trim();

        if (!year || !/^\d{4}$/.test(year)) continue;

        if (isMonthly) {
          // Columns 1 to 12 correspond to Jan through Dec
          for (let m = 0; m < 12; m++) {
            const monthStr = (m + 1).toString().padStart(2, '0');
            const valStr = parts[m + 1]?.trim();
            if (valStr && valStr !== '***') {
              const val = parseFloat(valStr);
              if (!isNaN(val)) {
                points.push({
                  timestamp: `${year}-${monthStr}`,
                  value: val,
                  qualityFlag: 'valid',
                });
              }
            }
          }
        } else {
          // Annual average is column index 13 (J-D)
          if (parts.length >= 14) {
            const annVal = parseFloat(parts[13]);
            if (!isNaN(annVal)) {
              points.push({
                timestamp: year,
                value: annVal,
                qualityFlag: 'valid',
              });
            }
          }
        }
      }

      if (points.length > (isMonthly ? 200 : 50)) return points;
      throw new Error('GISTEMP CSV données insuffisantes');
    } catch (err) {
      clearTimeout(timeoutId);
      throw new Error(`Échec du téléchargement NASA GISTEMP: ${(err as Error).message}`);
    }
  }

  /**
   * Dedicated method extracting all 12 monthly columns from official NASA GISTEMP CSV
   */
  async fetchMonthlyData(): Promise<TimeSeriesPoint[]> {
    return this.fetchData({ frequency: 'monthly' });
  }

  getMonthlyData(): TimeSeriesPoint[] {
    return getGistempMonthlyData();
  }

  getAnnualBaselineData(): TimeSeriesPoint[] {
    return getGistempAnnualData();
  }

  /**
   * Fetches alternative independent dataset directly from its official online endpoint
   */
  async fetchAlternativeDataset(
    source: 'noaa' | 'berkeley',
    options?: FetchOptions
  ): Promise<{ metadata: DatasetMetadata; data: TimeSeriesPoint[] }> {
    if (source === 'noaa') {
      const noaaProvider = new NoaaGlobalTempProvider();
      const data = await noaaProvider.fetchData(options);
      return { metadata: NOAA_TEMPANOMALY_METADATA, data };
    }

    const berkeleyProvider = new BerkeleyEarthProvider();
    const data = await berkeleyProvider.fetchData(options);
    return { metadata: BERKELEY_TEMP_METADATA, data };
  }

  /**
   * Synchronous reference fallback to verified independent baseline observations
   */
  getAlternativeDataset(source: 'noaa' | 'berkeley'): { metadata: DatasetMetadata; data: TimeSeriesPoint[] } {
    if (source === 'noaa') {
      return { metadata: NOAA_TEMPANOMALY_METADATA, data: getNoaaGlobalTempData() };
    }
    return { metadata: BERKELEY_TEMP_METADATA, data: getBerkeleyEarthData() };
  }
}

/**
 * Dedicated independent NOAA GlobalTemp v5 Provider
 * Uses NOAA NCEI Climate at a Glance API
 */
export class NoaaGlobalTempProvider extends BaseDataProvider {
  id = 'temp-noaa-globaltemp';
  name = 'NOAA GlobalTemp v5';

  getMetadata(): DatasetMetadata {
    return NOAA_TEMPANOMALY_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const url = 'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series/globe/land_ocean/12/12/1880-2025.json';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NOAA NCEI HTTP ${response.status}`);
      const json = await response.json();
      const dataObj = json?.data;

      if (!dataObj || typeof dataObj !== 'object') {
        throw new Error('Structure JSON NOAA NCEI inattendue');
      }

      const points: TimeSeriesPoint[] = [];
      for (const [key, entry] of Object.entries(dataObj)) {
        // key is YYYY12
        const year = key.substring(0, 4);
        const val = typeof entry === 'object' && entry !== null && 'value' in entry
          ? parseFloat((entry as any).value)
          : parseFloat(entry as any);

        if (/^\d{4}$/.test(year) && !isNaN(val)) {
          points.push({
            timestamp: year,
            value: Number(val.toFixed(2)),
            qualityFlag: 'valid',
          });
        }
      }

      if (points.length > 50) {
        return points.sort((a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10));
      }
      throw new Error('Données NOAA insuffisantes');
    } catch (err) {
      clearTimeout(timeoutId);
      throw new Error(`Échec du téléchargement NOAA GlobalTemp: ${(err as Error).message}`);
    }
  }

  getBaselineData(): TimeSeriesPoint[] {
    return getNoaaGlobalTempData();
  }
}

/**
 * Dedicated independent Berkeley Earth Surface Temperature Provider
 * Directly queries Berkeley Earth official repository
 */
export class BerkeleyEarthProvider extends BaseDataProvider {
  id = 'temp-berkeley-earth';
  name = 'Berkeley Earth Surface Temperature';

  getMetadata(): DatasetMetadata {
    return BERKELEY_TEMP_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const url = 'https://berkeley-earth-temperature.s3.us-west-1.amazonaws.com/Global/Land_and_Ocean_complete.txt';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Berkeley Earth HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      // Parse annual summary section (lines starting with year and has annual anomaly)
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('%')) continue;
        const parts = trimmed.split(/\s+/);
        // Annual format: Year Annual_Anomaly Uncertainty
        if (parts.length >= 3 && /^\d{4}$/.test(parts[0])) {
          const year = parts[0];
          const val = parseFloat(parts[1]);
          const unc = parseFloat(parts[2]);
          if (!isNaN(val)) {
            points.push({
              timestamp: year,
              value: Number(val.toFixed(2)),
              uncertainty: isNaN(unc) ? undefined : unc,
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length > 50) return points;
      throw new Error('Berkeley Earth données insuffisantes');
    } catch (err) {
      clearTimeout(timeoutId);
      throw new Error(`Échec du téléchargement Berkeley Earth: ${(err as Error).message}`);
    }
  }

  getBaselineData(): TimeSeriesPoint[] {
    return getBerkeleyEarthData();
  }
}
