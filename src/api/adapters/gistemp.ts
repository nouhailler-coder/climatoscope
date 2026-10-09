/**
 * NASA GISS GISTEMP v4 & Alternative Temperature Adapters
 * Source: https://data.giss.nasa.gov/gistemp/
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

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    // NASA GISS LOTI table url
    const url = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

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
        const year = parts[0];
        // Annual average is column index 13 (J-D)
        if (parts.length >= 14 && year.length === 4) {
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

      if (points.length > 50) return points;
      throw new Error('GISTEMP CSV insuffisant');
    } catch {
      return getGistempAnnualData();
    }
  }

  getMonthlyData(): TimeSeriesPoint[] {
    return getGistempMonthlyData();
  }

  getAlternativeDataset(source: 'noaa' | 'berkeley'): { metadata: DatasetMetadata; data: TimeSeriesPoint[] } {
    if (source === 'noaa') {
      return { metadata: NOAA_TEMPANOMALY_METADATA, data: getNoaaGlobalTempData() };
    }
    return { metadata: BERKELEY_TEMP_METADATA, data: getBerkeleyEarthData() };
  }
}
