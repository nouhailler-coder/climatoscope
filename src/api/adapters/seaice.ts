/**
 * National Snow and Ice Data Center (NSIDC) & NASA GSFC Adapter
 * Sea Ice Index (Arctic September, Antarctic February, Arctic March)
 */

import {
  NSIDC_ARCTIC_SEPT_METADATA,
  NSIDC_ANTARCTIC_FEB_METADATA,
  NSIDC_ARCTIC_MARCH_METADATA,
  getArcticSeptData,
  getAntarcticFebData,
  getArcticMarchData,
} from '../../data/baseline/seaice-nsidc';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

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

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    // Attempt fetch from NSIDC public data endpoint
    const url = 'https://masie_web.apps.nsidc.org/pub/DATASETS/NOAA/G02135/north/monthly/data/N_09_extent_v3.0.csv';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NSIDC HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 5) {
          const year = parts[0].trim();
          const extent = parseFloat(parts[4].trim());
          if (!isNaN(extent) && extent > 0) {
            points.push({
              timestamp: year,
              value: Number(extent.toFixed(2)),
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length > 20) return points;
    } catch {
      // Graceful fallback to verified satellite baseline
    }

    return getArcticSeptData();
  }

  getAntarcticData(): TimeSeriesPoint[] {
    return getAntarcticFebData();
  }

  getArcticMarchData(): TimeSeriesPoint[] {
    return getArcticMarchData();
  }
}
