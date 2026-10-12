/**
 * Copernicus Climate Change Service (ERA5) & NASA GISS Zonal Temperature Adapter
 */

import {
  ZONAL_ARCTIC_METADATA,
  ZONAL_NORTH_MID_METADATA,
  ZONAL_TROPICS_METADATA,
  ZONAL_SOUTH_MID_METADATA,
  ZONAL_ANTARCTIC_METADATA,
  getArcticZonalData,
  getNorthMidZonalData,
  getTropicsZonalData,
  getSouthMidZonalData,
  getAntarcticZonalData,
} from '../../data/baseline/zonal-era5-polar';
import { FetchOptions } from '../../types/api';
import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';
import { BaseDataProvider } from './base';

export class ZonalProvider extends BaseDataProvider {
  id = 'zonal-temp-arctic-era5';
  name = 'Copernicus ERA5 & NASA GISS Zonal Temperatures';

  getMetadata(): DatasetMetadata {
    return ZONAL_ARCTIC_METADATA;
  }

  getNorthMidMetadata(): DatasetMetadata {
    return ZONAL_NORTH_MID_METADATA;
  }

  getTropicsMetadata(): DatasetMetadata {
    return ZONAL_TROPICS_METADATA;
  }

  getSouthMidMetadata(): DatasetMetadata {
    return ZONAL_SOUTH_MID_METADATA;
  }

  getAntarcticMetadata(): DatasetMetadata {
    return ZONAL_ANTARCTIC_METADATA;
  }

  async fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]> {
    // Return verified baseline for Arctic band
    return getArcticZonalData();
  }

  getNorthMidData(): TimeSeriesPoint[] {
    return getNorthMidZonalData();
  }

  getTropicsData(): TimeSeriesPoint[] {
    return getTropicsZonalData();
  }

  getSouthMidData(): TimeSeriesPoint[] {
    return getSouthMidZonalData();
  }

  getAntarcticData(): TimeSeriesPoint[] {
    return getAntarcticZonalData();
  }
}
