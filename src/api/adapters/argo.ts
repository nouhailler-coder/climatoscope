/**
 * International Argo Program & NOAA NCEI Ocean Heat Content Adapter
 * Source: NOAA NCEI / Argo Array
 */

import {
  ARGO_OHC_2000M_METADATA,
  ARGO_OHC_700M_METADATA,
  getArgoOhc2000mData,
  getArgoOhc700mData,
} from '../../data/baseline/ocean-argo';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class ArgoProvider extends BaseDataProvider {
  id = 'ocean-ohc-argo-2000m';
  name = 'Argo & NOAA NCEI Ocean Heat Content';

  getMetadata(): DatasetMetadata {
    return ARGO_OHC_2000M_METADATA;
  }

  get700mMetadata(): DatasetMetadata {
    return ARGO_OHC_700M_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    // Official NOAA NCEI table
    const url = 'https://www.ncei.noaa.gov/data/oceans/woa/DATA_ANALYSIS/3M_HEAT_CONTENT/DATA/basin/yearly/h22-w0-2000m.dat';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NOAA NCEI OHC HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (const line of lines) {
        if (!line.trim() || line.startsWith('#')) continue;
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const year = parts[0].substring(0, 4);
          const val = parseFloat(parts[1]);
          if (!isNaN(val)) {
            points.push({
              timestamp: year,
              value: Number((val * 10).toFixed(1)), // convert 10^22 J to ZJ (10^21 J)
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length > 30) return points;
      throw new Error('Données OHC incomplètes');
    } catch {
      return getArgoOhc2000mData();
    }
  }

  get700mData(): TimeSeriesPoint[] {
    return getArgoOhc700mData();
  }
}
