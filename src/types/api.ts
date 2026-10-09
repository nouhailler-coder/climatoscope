/**
 * ClimatOSCOPE — API & Provider interfaces
 */
import { DatasetMetadata, TimeSeriesPoint } from './dataset';

export interface FetchOptions {
  startDate?: string;
  endDate?: string;
  forceRefresh?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface DataProvider {
  id: string;
  name: string;
  getMetadata(): DatasetMetadata;
  fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]>;
}

export type CacheStatus = 'fresh' | 'cached' | 'error' | 'syncing';

export interface GeoLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationM?: number;
}
