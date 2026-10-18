/**
 * NASA POWER API Adapter
 * Real REST queries to the NASA Langley Research Center POWER API
 * Endpoint: https://power.larc.nasa.gov/api/temporal/monthly/point
 */

import { PRESET_LOCATIONS, getNasaPowerMetadata, getNasaPowerSampleData } from '../../data/baseline/nasa-power-sample';
import { GeoLocation, FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class NasaPowerProvider extends BaseDataProvider {
  id = 'nasa-power-radiation';
  name = 'NASA POWER Radiation & Meteorology';
  private currentLocation: GeoLocation;

  constructor(initialLocation?: GeoLocation) {
    super();
    this.currentLocation = initialLocation || PRESET_LOCATIONS[0];
  }

  setLocation(location: GeoLocation) {
    this.currentLocation = location;
  }

  getLocation(): GeoLocation {
    return this.currentLocation;
  }

  getMetadata(): DatasetMetadata {
    return getNasaPowerMetadata(this.currentLocation);
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    const lat = options?.latitude ?? this.currentLocation.latitude;
    const lon = options?.longitude ?? this.currentLocation.longitude;
    const currentYear = new Date().getFullYear();
    const endYear = currentYear;
    const startYear = Math.max(2015, currentYear - 10);

    const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=JSON`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NASA POWER API HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const rawValues = json?.properties?.parameter?.ALLSKY_SFC_SW_DWN;

      if (!rawValues || typeof rawValues !== 'object') {
        throw new Error('Structure JSON NASA POWER inattendue');
      }

      const points: TimeSeriesPoint[] = [];
      for (const [key, val] of Object.entries(rawValues)) {
        // key is YYYYMM (13 is annual mean in NASA POWER, e.g. 202013)
        if (key.length === 6) {
          const year = key.substring(0, 4);
          const month = key.substring(4, 6);
          if (month !== '13') { // ignore 13 which is annual average
            const numVal = Number(val);
            if (!isNaN(numVal) && numVal !== -999) { // NASA POWER uses -999 for missing
              points.push({
                timestamp: `${year}-${month}`,
                value: numVal,
                qualityFlag: 'valid',
              });
            }
          }
        }
      }

      if (points.length === 0) {
        throw new Error('Aucune donnée valide extraite du payload NASA POWER');
      }

      return points;
    } catch (err) {
      throw new Error(`Échec du téléchargement NASA POWER API: ${(err as Error).message}`);
    }
  }

  getBaselineData(): TimeSeriesPoint[] {
    return getNasaPowerSampleData(this.currentLocation.id);
  }
}
