/**
 * Copernicus Atmosphere Monitoring Service (CAMS) & AERONET Aerosols Adapter
 */

import {
  CAMS_AOD_TOTAL_METADATA,
  CAMS_SO2_EMISSIONS_METADATA,
  getCamsTotalAodData,
  getSo2EmissionsData,
  getAerosolForcingData,
} from '../../data/baseline/aerosols-cams-aeronet';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class AerosolsProvider extends BaseDataProvider {
  id = 'aerosols-cams-total-aod';
  name = 'Copernicus CAMS & AERONET Tropospheric Aerosols';

  getMetadata(): DatasetMetadata {
    return CAMS_AOD_TOTAL_METADATA;
  }

  getSo2Metadata(): DatasetMetadata {
    return CAMS_SO2_EMISSIONS_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    return getCamsTotalAodData();
  }

  getSo2Data(): TimeSeriesPoint[] {
    return getSo2EmissionsData();
  }

  getForcingData(): TimeSeriesPoint[] {
    return getAerosolForcingData();
  }
}
