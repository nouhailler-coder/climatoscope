/**
 * NOAA Global Monitoring Laboratory — Trace Greenhouse Gases Adapter (CH4, N2O, AGGI)
 * Real data provider for Methane, Nitrous Oxide, and Annual Greenhouse Gas Index.
 * Network calls propagate failures to the dataset service to avoid disguising fallbacks as live data.
 */

import {
  NOAA_CH4_METADATA,
  NOAA_N2O_METADATA,
  NOAA_AGGI_METADATA,
  getNoaaCh4MonthlyData,
  getNoaaCh4AnnualData,
  getNoaaN2oMonthlyData,
  getNoaaN2oAnnualData,
  getNoaaAggiData,
} from '../../data/baseline/ghg-noaa-ch4-n2o';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class NoaaGhgProvider extends BaseDataProvider {
  id = 'ghg-ch4-noaa';
  name = 'NOAA GML Global Methane & Trace Gases';

  getMetadata(): DatasetMetadata {
    return NOAA_CH4_METADATA;
  }

  getN2oMetadata(): DatasetMetadata {
    return NOAA_N2O_METADATA;
  }

  getAggiMetadata(): DatasetMetadata {
    return NOAA_AGGI_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const url = 'https://gml.noaa.gov/webdata/ccgg/trends/ch4/ch4_mm_gl.txt';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NOAA GML CH4 HTTP ${response.status}`);

      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (const line of lines) {
        if (line.startsWith('#') || !line.trim()) continue;
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const value = parseFloat(parts[3]);
          if (!isNaN(value) && value > 1000 && value < 3000) {
            points.push({
              timestamp: `${year}-${month}`,
              value,
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length > 50) return points;
      throw new Error('Données NOAA CH4 incomplètes');
    } catch (err) {
      clearTimeout(timeoutId);
      throw new Error(`Échec du téléchargement NOAA CH4: ${(err as Error).message}`);
    }
  }

  getCh4AnnualData(): TimeSeriesPoint[] {
    return getNoaaCh4AnnualData();
  }

  getCh4BaselineData(): TimeSeriesPoint[] {
    return getNoaaCh4MonthlyData();
  }

  async fetchN2oData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const url = 'https://gml.noaa.gov/webdata/hats/n2o/combined/HATS_global_N2O.txt';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NOAA GML N2O HTTP ${response.status}`);

      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (const line of lines) {
        if (line.startsWith('#') || !line.trim()) continue;
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const value = parseFloat(parts[2]);
          if (!isNaN(value) && value > 250 && value < 500) {
            points.push({
              timestamp: `${year}-${month}`,
              value,
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length > 30) return points;
      throw new Error('Données NOAA N2O incomplètes');
    } catch (err) {
      clearTimeout(timeoutId);
      throw new Error(`Échec du téléchargement NOAA N2O: ${(err as Error).message}`);
    }
  }

  getN2oAnnualData(): TimeSeriesPoint[] {
    return getNoaaN2oAnnualData();
  }

  getN2oBaselineData(): TimeSeriesPoint[] {
    return getNoaaN2oMonthlyData();
  }

  getAggiData(): TimeSeriesPoint[] {
    return getNoaaAggiData();
  }
}
