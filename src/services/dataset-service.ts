/**
 * ClimatOSCOPE — Dataset & Synchronization Service
 * Implements cache-first offline architecture, data normalization, and quality control.
 */

import { ArgoProvider } from '../api/adapters/argo';
import { CeresProvider } from '../api/adapters/ceres';
import { GistempProvider } from '../api/adapters/gistemp';
import { LisirdProvider } from '../api/adapters/lisird';
import { NasaPowerProvider } from '../api/adapters/nasa-power';
import { NoaaGmlProvider } from '../api/adapters/noaa-gml';
import { VolcanoProvider } from '../api/adapters/volcano';
import { PRESET_LOCATIONS } from '../data/baseline/nasa-power-sample';
import { CacheStatus, GeoLocation } from '../types/api';
import { InternalDataset, TimeSeriesPoint } from '../types/dataset';
import { dbService } from './db';

class DatasetService {
  private noaaProvider = new NoaaGmlProvider();
  private gistempProvider = new GistempProvider();
  private lisirdProvider = new LisirdProvider();
  private nasaPowerProvider = new NasaPowerProvider();
  private argoProvider = new ArgoProvider();
  private ceresProvider = new CeresProvider();
  private volcanoProvider = new VolcanoProvider();

  // In-memory runtime cache
  private memoryCache = new Map<string, InternalDataset>();

  async getDataset(
    datasetId: string,
    forceRefresh: boolean = false
  ): Promise<{ dataset: InternalDataset; status: CacheStatus }> {
    // 1. Check in-memory
    if (!forceRefresh && this.memoryCache.has(datasetId)) {
      return { dataset: this.memoryCache.get(datasetId)!, status: 'cached' };
    }

    // 2. Check IndexedDB
    if (!forceRefresh) {
      try {
        const cached = await dbService.getDataset(datasetId);
        if (cached && cached.data && cached.data.length > 0) {
          this.memoryCache.set(datasetId, cached);
          return { dataset: cached, status: 'cached' };
        }
      } catch (err) {
        console.warn('Erreur lecture IndexedDB:', err);
      }
    }

    // 3. Fetch from provider
    let points: TimeSeriesPoint[] = [];
    let metadata = this.getMetadataById(datasetId);
    let status: CacheStatus = 'fresh';

    try {
      if (datasetId.startsWith('co2-noaa')) {
        points = await this.noaaProvider.fetchData({ forceRefresh });
      } else if (datasetId.startsWith('temp-nasa')) {
        points = await this.gistempProvider.fetchData({ forceRefresh });
      } else if (datasetId.startsWith('temp-noaa')) {
        const alt = this.gistempProvider.getAlternativeDataset('noaa');
        metadata = alt.metadata;
        points = alt.data;
      } else if (datasetId.startsWith('temp-berkeley')) {
        const alt = this.gistempProvider.getAlternativeDataset('berkeley');
        metadata = alt.metadata;
        points = alt.data;
      } else if (datasetId === 'solar-tsi-lisird') {
        points = await this.lisirdProvider.fetchData({ forceRefresh });
      } else if (datasetId === 'solar-sunspots-silso') {
        const spots = this.lisirdProvider.getSunspotsData();
        metadata = spots.metadata;
        points = spots.data;
      } else if (datasetId === 'ocean-ohc-argo-2000m') {
        points = await this.argoProvider.fetchData({ forceRefresh });
        metadata = this.argoProvider.getMetadata();
      } else if (datasetId === 'ocean-ohc-argo-700m') {
        points = this.argoProvider.get700mData();
        metadata = this.argoProvider.get700mMetadata();
      } else if (datasetId === 'energy-ceres-net-toa') {
        points = await this.ceresProvider.fetchData({ forceRefresh });
        metadata = this.ceresProvider.getMetadata();
      } else if (datasetId === 'energy-ceres-olr-toa') {
        points = this.ceresProvider.getOlrData();
        metadata = this.ceresProvider.getOlrMetadata();
      } else if (datasetId === 'energy-ceres-albedo-toa') {
        points = this.ceresProvider.getAlbedoData();
        metadata = this.ceresProvider.getAlbedoMetadata();
      } else if (datasetId === 'volcano-saod-giss') {
        points = await this.volcanoProvider.fetchData({ forceRefresh });
        metadata = this.volcanoProvider.getMetadata();
      } else if (datasetId.startsWith('nasa-power')) {
        points = await this.nasaPowerProvider.fetchData({ forceRefresh });
        metadata = this.nasaPowerProvider.getMetadata();
      } else {
        throw new Error(`Dataset non supporté: ${datasetId}`);
      }
    } catch (err) {
      console.error(`Échec fetch ${datasetId}, tentative fallback cache:`, err);
      const cachedFallback = await dbService.getDataset(datasetId);
      if (cachedFallback) {
        this.memoryCache.set(datasetId, cachedFallback);
        return { dataset: cachedFallback, status: 'error' };
      }
      status = 'error';
    }

    const internal: InternalDataset = {
      metadata,
      data: points,
      lastUpdated: new Date().toISOString(),
      localCacheVersion: 1,
    };

    // Save to IndexedDB & memory
    try {
      await dbService.saveDataset(internal);
    } catch (err) {
      console.warn('Erreur enregistrement IndexedDB:', err);
    }
    this.memoryCache.set(datasetId, internal);

    return { dataset: internal, status };
  }

  setNasaPowerLocation(location: GeoLocation) {
    this.nasaPowerProvider.setLocation(location);
  }

  getNasaPowerLocation(): GeoLocation {
    return this.nasaPowerProvider.getLocation();
  }

  getAvailableLocations(): GeoLocation[] {
    return PRESET_LOCATIONS;
  }

  private getMetadataById(id: string) {
    if (id.startsWith('co2')) return this.noaaProvider.getMetadata();
    if (id.startsWith('temp-noaa')) return this.gistempProvider.getAlternativeDataset('noaa').metadata;
    if (id.startsWith('temp-berkeley')) return this.gistempProvider.getAlternativeDataset('berkeley').metadata;
    if (id.startsWith('temp')) return this.gistempProvider.getMetadata();
    if (id === 'solar-sunspots-silso') return this.lisirdProvider.getSunspotsData().metadata;
    if (id.startsWith('solar')) return this.lisirdProvider.getMetadata();
    if (id === 'ocean-ohc-argo-700m') return this.argoProvider.get700mMetadata();
    if (id.startsWith('ocean')) return this.argoProvider.getMetadata();
    if (id === 'energy-ceres-olr-toa') return this.ceresProvider.getOlrMetadata();
    if (id === 'energy-ceres-albedo-toa') return this.ceresProvider.getAlbedoMetadata();
    if (id.startsWith('energy-ceres')) return this.ceresProvider.getMetadata();
    if (id.startsWith('volcano')) return this.volcanoProvider.getMetadata();
    return this.nasaPowerProvider.getMetadata();
  }

  async getAllCatalogMetadata() {
    return [
      this.lisirdProvider.getMetadata(),
      this.lisirdProvider.getSunspotsData().metadata,
      this.noaaProvider.getMetadata(),
      this.gistempProvider.getMetadata(),
      this.gistempProvider.getAlternativeDataset('noaa').metadata,
      this.gistempProvider.getAlternativeDataset('berkeley').metadata,
      this.argoProvider.getMetadata(),
      this.argoProvider.get700mMetadata(),
      this.ceresProvider.getMetadata(),
      this.ceresProvider.getOlrMetadata(),
      this.ceresProvider.getAlbedoMetadata(),
      this.volcanoProvider.getMetadata(),
      this.nasaPowerProvider.getMetadata(),
    ];
  }
}

export const datasetService = new DatasetService();
