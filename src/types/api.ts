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
  frequency?: 'annual' | 'monthly';
}

export interface DataProvider {
  id: string;
  name: string;
  getMetadata(): DatasetMetadata;
  fetchData(options?: FetchOptions): Promise<TimeSeriesPoint[]>;
}

export type CacheStatus =
  | 'live'                // En direct (récupéré depuis le réseau lors de la session)
  | 'recent_cache'        // Cache récent (< 24h)
  | 'stale_cache'         // Cache ancien (> 24h)
  | 'embedded_historical' // Historique embarqué (référence historique intégrée)
  | 'error'               // Source inaccessible
  | 'syncing'             // Synchronisation...
  | 'fresh'               // Alias compatibilité
  | 'cached';             // Alias compatibilité

export interface GeoLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationM?: number;
}
