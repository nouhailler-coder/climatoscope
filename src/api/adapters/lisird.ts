/**
 * NASA/LASP LISIRD & SILSO Solar Data Adapter
 * Source: LASP LISIRD (HAPI / REST) & WDC-SILSO
 */

import { LISIRD_TSI_METADATA, getLisirdTsiData } from '../../data/baseline/solar-tsi-lisird';
import { SILSO_SUNSPOTS_METADATA, getSilsoSunspotsData } from '../../data/baseline/solar-sunspots';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class LisirdProvider extends BaseDataProvider {
  id = 'solar-tsi-lisird';
  name = 'NASA/LASP LISIRD TSI';

  getMetadata(): DatasetMetadata {
    return LISIRD_TSI_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    // LISIRD HAPI or REST endpoint
    const url = 'https://lasp.colorado.edu/lisird/latis/dap/historical_tsi.csv';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`LISIRD HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (const line of lines) {
        if (!line.trim() || line.startsWith('#') || line.startsWith('time')) continue;
        const parts = line.split(',');
        if (parts.length >= 2) {
          const year = parts[0].substring(0, 4);
          const val = parseFloat(parts[1]);
          if (!isNaN(val) && val > 1300 && val < 1400) {
            points.push({
              timestamp: year,
              value: val,
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length > 30) return points;
      throw new Error('Données LISIRD incomplètes');
    } catch (err) {
      throw new Error(`Échec du téléchargement LASP LISIRD TSI: ${(err as Error).message}`);
    }
  }

  getBaselineData(): TimeSeriesPoint[] {
    return getLisirdTsiData();
  }

  getSunspotsData(): { metadata: DatasetMetadata; data: TimeSeriesPoint[] } {
    return {
      metadata: SILSO_SUNSPOTS_METADATA,
      data: getSilsoSunspotsData(),
    };
  }
}
