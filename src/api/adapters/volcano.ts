/**
 * NASA GISS Stratospheric Aerosol Optical Depth Adapter
 * Source: NASA GISS (Sato et al.)
 */

import {
  NASA_GISS_SAOD_METADATA,
  MAJOR_ERUPTIONS,
  getNasaGissSaodData,
  VolcanicEruption,
} from '../../data/baseline/volcano-saod';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class VolcanoProvider extends BaseDataProvider {
  id = 'volcano-saod-giss';
  name = 'NASA GISS Stratospheric Aerosol Optical Depth';

  getMetadata(): DatasetMetadata {
    return NASA_GISS_SAOD_METADATA;
  }

  getEruptionsList(): VolcanicEruption[] {
    return MAJOR_ERUPTIONS;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    // NASA GISS SAOD table endpoint
    const url = 'https://data.giss.nasa.gov/modelforce/strataer/tau_table.txt';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NASA GISS SAOD HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split('\n');
      const points: TimeSeriesPoint[] = [];

      for (const line of lines) {
        if (!line.trim() || line.startsWith('#') || line.startsWith('Year')) continue;
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const year = parts[0].substring(0, 4);
          const val = parseFloat(parts[1]);
          if (!isNaN(val) && val >= 0 && val < 1.0) {
            points.push({
              timestamp: year,
              value: val,
              qualityFlag: 'valid',
            });
          }
        }
      }

      if (points.length > 50) return points;
      throw new Error('Données SAOD incomplètes');
    } catch (err) {
      throw new Error(`Échec du téléchargement NASA GISS SAOD: ${(err as Error).message}`);
    }
  }

  getBaselineData(): TimeSeriesPoint[] {
    return getNasaGissSaodData();
  }
}
