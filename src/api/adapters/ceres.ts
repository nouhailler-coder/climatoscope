/**
 * NASA CERES API Adapter
 * Source: NASA Langley Research Center / Atmospheric Science Data Center (ASDC)
 */

import {
  CERES_NET_METADATA,
  CERES_OLR_METADATA,
  CERES_ALBEDO_METADATA,
  getCeresNetData,
  getCeresOlrData,
  getCeresAlbedoData,
  getCeresSolarInData,
} from '../../data/baseline/energy-ceres';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class CeresProvider extends BaseDataProvider {
  id = 'energy-ceres-net-toa';
  name = 'NASA CERES Earth Radiation Budget';

  getMetadata(): DatasetMetadata {
    return CERES_NET_METADATA;
  }

  getOlrMetadata(): DatasetMetadata {
    return CERES_OLR_METADATA;
  }

  getAlbedoMetadata(): DatasetMetadata {
    return CERES_ALBEDO_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    // CERES EBAF ASDC public endpoint
    const url = 'https://ceres.larc.nasa.gov/data/ebaf-toa/yearly_global_means.csv';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NASA CERES HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (const line of lines) {
        if (!line.trim() || line.startsWith('#') || line.startsWith('year')) continue;
        const parts = line.split(',');
        if (parts.length >= 2) {
          const year = parts[0].substring(0, 4);
          const netVal = parseFloat(parts[1]);
          if (!isNaN(netVal)) {
            points.push({
              timestamp: year,
              value: netVal,
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length >= 10) return points;
      throw new Error('Données CERES incomplètes');
    } catch {
      return getCeresNetData();
    }
  }

  getOlrData(): TimeSeriesPoint[] {
    return getCeresOlrData();
  }

  getAlbedoData(): TimeSeriesPoint[] {
    return getCeresAlbedoData();
  }

  getSolarInData(): TimeSeriesPoint[] {
    return getCeresSolarInData();
  }
}
