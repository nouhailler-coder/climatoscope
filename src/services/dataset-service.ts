/**
 * ClimatOSCOPE — Dataset & Synchronization Service
 * Implements cache-first offline architecture with TTL expiration, data normalization, provenance tracking, and quality control.
 */

import { ArgoProvider } from '../api/adapters/argo';
import { CeresProvider } from '../api/adapters/ceres';
import { GistempProvider, NoaaGlobalTempProvider, BerkeleyEarthProvider } from '../api/adapters/gistemp';
import { LisirdProvider } from '../api/adapters/lisird';
import { NasaPowerProvider } from '../api/adapters/nasa-power';
import { NoaaGhgProvider } from '../api/adapters/noaa-ghg';
import { NoaaGmlProvider } from '../api/adapters/noaa-gml';
import { VolcanoProvider } from '../api/adapters/volcano';
import { SeaIceProvider } from '../api/adapters/seaice';
import { ZonalProvider } from '../api/adapters/zonal';
import { AerosolsProvider } from '../api/adapters/aerosols';
import { PRESET_LOCATIONS } from '../data/baseline/nasa-power-sample';
import { CacheStatus, GeoLocation } from '../types/api';
import { DatasetMetadata, DatasetProvenanceType, InternalDataset, TimeSeriesPoint } from '../types/dataset';
import { dbService } from './db';

interface ProvenanceDefinition {
  provenanceType: DatasetProvenanceType;
  isDerived?: boolean;
  calculationMethod?: string;
  sourceUrl?: string;
}

const PROVENANCE_REGISTRY: Record<string, ProvenanceDefinition> = {
  'co2-noaa-mauna-loa': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://gml.noaa.gov/ccgg/trends/',
    calculationMethod: 'Mesure directe par spectrométrie infrarouge non dispersive (NDIR) à l\'observatoire du Mauna Loa (NOAA GML).'
  },
  'ghg-ch4-noaa': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://gml.noaa.gov/ccgg/trends_ch4/',
    calculationMethod: 'Réseau mondial d\'échantillonnage de surface NOAA/GML, spectrométrie de masse et chromatographie.'
  },
  'ghg-ch4-annual-noaa': {
    provenanceType: 'derived',
    isDerived: true,
    sourceUrl: 'https://gml.noaa.gov/ccgg/trends_ch4/',
    calculationMethod: 'Moyenne arithmétique annuelle calculée à partir des concentrations mensuelles de surface du réseau mondial NOAA GML.'
  },
  'ghg-n2o-noaa': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://gml.noaa.gov/hats/combined/N2O.html',
    calculationMethod: 'Réseau d\'échantillonnage mondial NOAA Halocarbons and other Atmospheric Trace Species (HATS).'
  },
  'ghg-n2o-annual-noaa': {
    provenanceType: 'derived',
    isDerived: true,
    sourceUrl: 'https://gml.noaa.gov/hats/combined/N2O.html',
    calculationMethod: 'Moyenne arithmétique annuelle globale calculée à partir des observations mensuelles de surface NOAA HATS.'
  },
  'ghg-aggi-noaa': {
    provenanceType: 'derived',
    isDerived: true,
    sourceUrl: 'https://gml.noaa.gov/aggi/',
    calculationMethod: 'Indice Annuel des Gaz à Effet de Serre NOAA (AGGI = [ΔF(t) - ΔF(1750)] / [ΔF(1990) - ΔF(1750)]). Ratio du forçage radiatif direct par rapport à 1990 (défini à 1.000).'
  },
  'temp-nasa-gistemp': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://data.giss.nasa.gov/gistemp/',
    calculationMethod: 'Analyse GISS Surface Temperature (GISTEMP v4) combinant stations terrestres GHCN v4 et températures de surface de la mer ERSST v5 (maille 250 km).'
  },
  'temp-noaa-globaltemp': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series',
    calculationMethod: 'Reconstruction matricielle spatiale indépendante NOAA NCEI NOAAGlobalTemp v5 combinant GHCNm v4 et ERSST v5 sur maillage 5°x5° (téléchargement direct API NCEI).'
  },
  'temp-berkeley-earth': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://berkeleyearth.org/data/',
    calculationMethod: 'Méthode d\'analyse statistique indépendante Berkeley Earth utilisant un kriging spatial direct sur plus de 40 000 stations terrestres et HadSST4.'
  },
  'solar-tsi-lisird': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://lasp.colorado.edu/lisird/data/historical_tsi/',
    calculationMethod: 'Composite d\'irradiance solaire totale (TSI) étalonné sur les radiomètres spatiaux absolus SORCE/TIM et TSIS-1 (LASP).'
  },
  'solar-sunspots-silso': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://www.sidc.be/silso/datafiles',
    calculationMethod: 'Nombre International de Taches Solaires (SSN v2.0) compilé par le centre mondial WDC-SILSO de l\'Observatoire Royal de Belgique.'
  },
  'ocean-ohc-argo-2000m': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://www.ncei.noaa.gov/access/global-ocean-heat-content/',
    calculationMethod: 'Intégration volumétrique de l\'enthalpie océanique (0-2000m) calculée à partir des profils in situ du réseau mondial de 4 000 flotteurs autonomes Argo.'
  },
  'ocean-ohc-argo-700m': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://www.nodc.noaa.gov/OC5/3M_HEAT_CONTENT/',
    calculationMethod: 'Contenu thermique océanique historique de surface (0-700 m) reconstruit par NOAA NCEI (bathythermographes et Argo).'
  },
  'energy-ceres-net-toa': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://ceres.larc.nasa.gov/',
    calculationMethod: 'Déséquilibre énergétique net au sommet de l\'atmosphère (EEI = ASR - OLR) mesuré par radiomètres spatiaux CERES EBAF Ed4.2.'
  },
  'energy-ceres-olr-toa': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://ceres.larc.nasa.gov/data/',
    calculationMethod: 'Composante infrarouge thermique sortante (Outgoing Longwave Radiation - OLR) mesurée au sommet de l\'atmosphère par NASA CERES.'
  },
  'energy-ceres-albedo-toa': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://ceres.larc.nasa.gov/data/',
    calculationMethod: 'Flux solaire réfléchi (SW_out) mesuré par radiométrie satellitaire CERES au sommet de l\'atmosphère.'
  },
  'volcano-saod-giss': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://data.giss.nasa.gov/modelforce/strataer/',
    calculationMethod: 'Épaisseur optique des aérosols stratosphériques (SAOD à 550 nm) issue de lidars, photomètres et satellites SAGE/CALIOP (NASA GISS).'
  },
  'seaice-arctic-september-nsidc': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://nsidc.org/data/seaice_index',
    calculationMethod: 'Étendue minimale de la banquise arctique (septembre) par télédétection micro-ondes passive satellitaire (NSIDC Sea Ice Index v3).'
  },
  'seaice-antarctic-february-nsidc': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://nsidc.org/data/seaice_index',
    calculationMethod: 'Étendue minimale de la banquise antarctique (février) mesurée par capteurs micro-ondes satellitaires passifs (NSIDC).'
  },
  'seaice-arctic-march-nsidc': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://nsidc.org/data/seaice_index',
    calculationMethod: 'Étendue de la banquise arctique au maximum hivernal de mars (NSIDC Sea Ice Index).'
  },
  'seaice-seasonal-cycle-nsidc': {
    provenanceType: 'live_feed',
    isDerived: true,
    sourceUrl: 'https://nsidc.org/data/seaice_index',
    calculationMethod: 'Cycle saisonnier mensuel climatologique (1981-2010) et extrêmes récents calculés à partir des séries journalières et mensuelles NSIDC.'
  },
  'zonal-temp-arctic-era5': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://climate.copernicus.eu/climate-reanalysis',
    calculationMethod: 'Anomalie de température surfacique issue de la réanalyse Copernicus ERA5 moyennée sur la calotte arctique (90°N–64°N).'
  },
  'zonal-temp-northmid-era5': {
    provenanceType: 'derived',
    isDerived: true,
    sourceUrl: 'https://climate.copernicus.eu/',
    calculationMethod: 'Anomalie thermique surfacique ERA5 pondérée par le cosinus de la latitude sur la bande tempérée nord (64°N–44°N).'
  },
  'zonal-temp-tropics-era5': {
    provenanceType: 'derived',
    isDerived: true,
    sourceUrl: 'https://climate.copernicus.eu/',
    calculationMethod: 'Anomalie thermique surfacique ERA5 pondérée sur la zone intertropicale (24°N–24°S).'
  },
  'zonal-temp-southmid-era5': {
    provenanceType: 'derived',
    isDerived: true,
    sourceUrl: 'https://climate.copernicus.eu/',
    calculationMethod: 'Anomalie thermique surfacique ERA5 sur la bande tempérée australe (44°S–64°S).'
  },
  'zonal-temp-antarctic-era5': {
    provenanceType: 'derived',
    isDerived: true,
    sourceUrl: 'https://climate.copernicus.eu/',
    calculationMethod: 'Anomalie thermique surfacique ERA5 sur la calotte antarctique (64°S–90°S).'
  },
  'aerosols-cams-total-aod': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://atmosphere.copernicus.eu/aerosols',
    calculationMethod: 'Épaisseur optique totale des aérosols (AOD à 550 nm) issue de la réanalyse atmosphérique Copernicus CAMS.'
  },
  'aerosols-so2-emissions-ceds': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://www.pnnl.gov/projects/community-emissions-data-system-ceds',
    calculationMethod: 'Inventaire mondial historique des émissions anthropiques de SO₂ du Community Emissions Data System (CEDS / PNNL).'
  },
  'nasa-power-daily-solar': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://power.larc.nasa.gov/',
    calculationMethod: 'Insolation journalière reçue au sol (ALLSKY_SFC_SW_DWN en kWh/m²/j) extraite via l\'API NASA Langley POWER.'
  }
};

/**
 * Cache TTL policy (Time-To-Live) per dataset in milliseconds
 * Live series expire after 24 hours; slower annual/satellite series expire after 7 to 30 days.
 */
export const DATASET_TTL_MS: Record<string, number> = {
  // Live atmospheric & temperature: 24h
  'co2-noaa-mauna-loa': 24 * 60 * 60 * 1000,
  'ghg-ch4-noaa': 24 * 60 * 60 * 1000,
  'ghg-n2o-noaa': 24 * 60 * 60 * 1000,
  'temp-nasa-gistemp': 24 * 60 * 60 * 1000,
  'temp-noaa-globaltemp': 24 * 60 * 60 * 1000,
  'temp-berkeley-earth': 24 * 60 * 60 * 1000,
  'seaice-arctic-september-nsidc': 24 * 60 * 60 * 1000,
  'seaice-antarctic-february-nsidc': 24 * 60 * 60 * 1000,
  'seaice-arctic-march-nsidc': 24 * 60 * 60 * 1000,
  'nasa-power-radiation': 24 * 60 * 60 * 1000,
  // Slower / satellite / annual: 7 days
  'solar-tsi-lisird': 7 * 24 * 60 * 60 * 1000,
  'ocean-ohc-argo-2000m': 7 * 24 * 60 * 60 * 1000,
  'energy-ceres-net-toa': 7 * 24 * 60 * 60 * 1000,
  'volcano-saod-giss': 30 * 24 * 60 * 60 * 1000,
  'zonal-temp-arctic-era5': 7 * 24 * 60 * 60 * 1000,
  'aerosols-cams-total-aod': 7 * 24 * 60 * 60 * 1000,
};

class DatasetService {
  private noaaProvider = new NoaaGmlProvider();
  private noaaGhgProvider = new NoaaGhgProvider();
  private gistempProvider = new GistempProvider();
  private noaaTempProvider = new NoaaGlobalTempProvider();
  private berkeleyTempProvider = new BerkeleyEarthProvider();
  private lisirdProvider = new LisirdProvider();
  private nasaPowerProvider = new NasaPowerProvider();
  private argoProvider = new ArgoProvider();
  private ceresProvider = new CeresProvider();
  private volcanoProvider = new VolcanoProvider();
  private seaIceProvider = new SeaIceProvider();
  private zonalProvider = new ZonalProvider();
  private aerosolsProvider = new AerosolsProvider();

  // In-memory runtime cache
  private memoryCache = new Map<string, InternalDataset>();

  private resolveStatus(dataset: InternalDataset): CacheStatus {
    const prov = dataset.metadata.provenanceType;
    if (prov === 'embedded_historical') {
      return 'embedded_historical';
    }
    const ageMs = Date.now() - new Date(dataset.lastUpdated).getTime();
    return ageMs > 24 * 60 * 60 * 1000 ? 'stale_cache' : 'recent_cache';
  }

  async getDataset(
    datasetId: string,
    forceRefresh: boolean = false
  ): Promise<{ dataset: InternalDataset; status: CacheStatus }> {
    const ttl = DATASET_TTL_MS[datasetId] ?? (24 * 60 * 60 * 1000);

    // 1. Check in-memory and IndexedDB cache
    let cached: InternalDataset | null = null;
    if (this.memoryCache.has(datasetId)) {
      cached = this.memoryCache.get(datasetId)!;
    } else {
      try {
        const fromDb = await dbService.getDataset(datasetId);
        if (fromDb && fromDb.data && fromDb.data.length > 0) {
          cached = fromDb;
          cached.metadata = this.enrichMetadata(cached.metadata, datasetId, cached.data);
          this.memoryCache.set(datasetId, cached);
        }
      } catch (err) {
        console.warn('Erreur lecture IndexedDB:', err);
      }
    }

    // 2. Cache validity check with TTL
    if (cached && !forceRefresh) {
      if (cached.metadata.provenanceType === 'embedded_historical') {
        return { dataset: cached, status: 'embedded_historical' };
      }

      const ageMs = Date.now() - new Date(cached.lastUpdated).getTime();
      if (ageMs < ttl) {
        // Cache is fresh within TTL
        return { dataset: cached, status: 'recent_cache' };
      }
      // Cache has expired (ageMs >= ttl), attempt live refresh below!
    }

    // 3. Fetch from provider (either forceRefresh, cache expired, or no cache)
    let points: TimeSeriesPoint[] = [];
    let metadata = this.getMetadataById(datasetId);
    let status: CacheStatus = 'live';

    try {
      if (datasetId.startsWith('co2-noaa')) {
        points = await this.noaaProvider.fetchData({ forceRefresh });
      } else if (datasetId === 'ghg-ch4-noaa') {
        points = await this.noaaGhgProvider.fetchData({ forceRefresh });
        metadata = this.noaaGhgProvider.getMetadata();
      } else if (datasetId === 'ghg-ch4-annual-noaa') {
        points = this.noaaGhgProvider.getCh4AnnualData();
        metadata = {
          ...this.noaaGhgProvider.getMetadata(),
          id: 'ghg-ch4-annual-noaa',
          name: 'Méthane Atmosphérique Global (CH₄ - Moyenne Annuelle)',
          frequency: 'annual'
        };
        status = 'embedded_historical';
      } else if (datasetId === 'ghg-n2o-noaa') {
        points = await this.noaaGhgProvider.fetchN2oData({ forceRefresh });
        metadata = this.noaaGhgProvider.getN2oMetadata();
      } else if (datasetId === 'ghg-n2o-annual-noaa') {
        points = this.noaaGhgProvider.getN2oAnnualData();
        metadata = {
          ...this.noaaGhgProvider.getN2oMetadata(),
          id: 'ghg-n2o-annual-noaa',
          name: 'Protoxyde d\'Azote (N₂O - Moyenne Annuelle)',
          frequency: 'annual'
        };
        status = 'embedded_historical';
      } else if (datasetId === 'ghg-aggi-noaa') {
        points = this.noaaGhgProvider.getAggiData();
        metadata = this.noaaGhgProvider.getAggiMetadata();
        status = 'embedded_historical';
      } else if (datasetId.startsWith('temp-nasa')) {
        points = await this.gistempProvider.fetchData({ forceRefresh });
      } else if (datasetId.startsWith('temp-noaa')) {
        // Real independent NOAA GlobalTemp provider with live API fetch
        points = await this.noaaTempProvider.fetchData({ forceRefresh });
        metadata = this.noaaTempProvider.getMetadata();
      } else if (datasetId.startsWith('temp-berkeley')) {
        // Real independent Berkeley Earth provider with live download
        points = await this.berkeleyTempProvider.fetchData({ forceRefresh });
        metadata = this.berkeleyTempProvider.getMetadata();
      } else if (datasetId === 'solar-tsi-lisird') {
        points = await this.lisirdProvider.fetchData({ forceRefresh });
      } else if (datasetId === 'solar-sunspots-silso') {
        const spots = this.lisirdProvider.getSunspotsData();
        metadata = spots.metadata;
        points = spots.data;
        status = 'embedded_historical';
      } else if (datasetId === 'ocean-ohc-argo-2000m') {
        points = await this.argoProvider.fetchData({ forceRefresh });
        metadata = this.argoProvider.getMetadata();
      } else if (datasetId === 'ocean-ohc-argo-700m') {
        points = this.argoProvider.get700mData();
        metadata = this.argoProvider.get700mMetadata();
        status = 'embedded_historical';
      } else if (datasetId === 'energy-ceres-net-toa') {
        points = await this.ceresProvider.fetchData({ forceRefresh });
        metadata = this.ceresProvider.getMetadata();
      } else if (datasetId === 'energy-ceres-olr-toa') {
        points = this.ceresProvider.getOlrData();
        metadata = this.ceresProvider.getOlrMetadata();
        status = 'embedded_historical';
      } else if (datasetId === 'energy-ceres-albedo-toa') {
        points = this.ceresProvider.getAlbedoData();
        metadata = this.ceresProvider.getAlbedoMetadata();
        status = 'embedded_historical';
      } else if (datasetId === 'volcano-saod-giss') {
        points = await this.volcanoProvider.fetchData({ forceRefresh });
        metadata = this.volcanoProvider.getMetadata();
      } else if (datasetId === 'seaice-arctic-september-nsidc') {
        points = await this.seaIceProvider.fetchData({ forceRefresh });
        metadata = this.seaIceProvider.getMetadata();
      } else if (datasetId === 'seaice-antarctic-february-nsidc') {
        points = await this.seaIceProvider.fetchAntarcticData({ forceRefresh });
        metadata = this.seaIceProvider.getAntarcticMetadata();
      } else if (datasetId === 'seaice-arctic-march-nsidc') {
        points = await this.seaIceProvider.fetchArcticMarchData({ forceRefresh });
        metadata = this.seaIceProvider.getArcticMarchMetadata();
      } else if (datasetId === 'seaice-seasonal-cycle-nsidc') {
        points = await this.seaIceProvider.fetchSeasonalCycleData({ forceRefresh });
        metadata = this.seaIceProvider.getSeasonalCycleMetadata();
      } else if (datasetId === 'zonal-temp-arctic-era5') {
        points = await this.zonalProvider.fetchData({ forceRefresh });
        metadata = this.zonalProvider.getMetadata();
      } else if (datasetId === 'zonal-temp-northmid-era5') {
        points = this.zonalProvider.getNorthMidData();
        metadata = this.zonalProvider.getNorthMidMetadata();
        status = 'embedded_historical';
      } else if (datasetId === 'zonal-temp-tropics-era5') {
        points = this.zonalProvider.getTropicsData();
        metadata = this.zonalProvider.getTropicsMetadata();
        status = 'embedded_historical';
      } else if (datasetId === 'zonal-temp-southmid-era5') {
        points = this.zonalProvider.getSouthMidData();
        metadata = this.zonalProvider.getSouthMidMetadata();
        status = 'embedded_historical';
      } else if (datasetId === 'zonal-temp-antarctic-era5') {
        points = this.zonalProvider.getAntarcticData();
        metadata = this.zonalProvider.getAntarcticMetadata();
        status = 'embedded_historical';
      } else if (datasetId === 'aerosols-cams-total-aod') {
        points = await this.aerosolsProvider.fetchData({ forceRefresh });
        metadata = this.aerosolsProvider.getMetadata();
      } else if (datasetId === 'aerosols-so2-emissions-ceds') {
        points = this.aerosolsProvider.getSo2Data();
        metadata = this.aerosolsProvider.getSo2Metadata();
        status = 'embedded_historical';
      } else if (datasetId.startsWith('nasa-power')) {
        points = await this.nasaPowerProvider.fetchData({ forceRefresh });
        metadata = this.nasaPowerProvider.getMetadata();
      } else {
        throw new Error(`Dataset non supporté: ${datasetId}`);
      }
    } catch (err) {
      console.warn(`Échec fetch direct pour ${datasetId}, bascule sur cache ou repli historique:`, err);
      // 1. If previous cached version exists in IndexedDB/memory, return it with status 'stale_cache'
      if (cached && cached.data && cached.data.length > 0) {
        return { dataset: cached, status: 'stale_cache' };
      }

      // 2. If no cache exists, load authentic embedded historical baseline with honest provenance
      points = this.getBaselinePoints(datasetId);
      metadata = this.enrichMetadata(metadata, datasetId, points);
      metadata.provenanceType = 'embedded_historical';

      const fallbackDataset: InternalDataset = {
        metadata,
        data: points,
        // Authentic reference date, never confused with the present timestamp
        lastUpdated: metadata.retrievedAt || metadata.endDate || '2025-01-15T00:00:00Z',
        localCacheVersion: 1,
      };

      this.memoryCache.set(datasetId, fallbackDataset);
      return { dataset: fallbackDataset, status: 'embedded_historical' };
    }

    // Enrich metadata with latest observation date and calculation method
    metadata = this.enrichMetadata(metadata, datasetId, points);

    const internalDataset: InternalDataset = {
      metadata,
      data: points,
      lastUpdated: new Date().toISOString(),
      localCacheVersion: 1,
    };

    // Save to runtime and persistent offline storage
    this.memoryCache.set(datasetId, internalDataset);
    try {
      await dbService.saveDataset(internalDataset);
    } catch (err) {
      console.warn(`Impossible d'enregistrer ${datasetId} dans IndexedDB:`, err);
    }

    return { dataset: internalDataset, status };
  }

  private enrichMetadata(
    meta: DatasetMetadata,
    datasetId: string,
    points?: TimeSeriesPoint[]
  ): DatasetMetadata {
    const prov = PROVENANCE_REGISTRY[datasetId];
    const enriched = { ...meta };

    if (prov) {
      enriched.provenanceType = prov.provenanceType;
      if (prov.isDerived !== undefined) enriched.isDerived = prov.isDerived;
      if (prov.calculationMethod) enriched.calculationMethod = prov.calculationMethod;
      if (prov.sourceUrl) enriched.sourceUrl = prov.sourceUrl;
    }

    if (points && points.length > 0) {
      const lastPt = points[points.length - 1];
      const firstPt = points[0];
      enriched.lastObservationDate = lastPt.timestamp;
      enriched.startDate = firstPt.timestamp;
      enriched.endDate = lastPt.timestamp;
    }

    return enriched;
  }

  getMetadataById(datasetId: string): DatasetMetadata {
    let baseMeta: DatasetMetadata;

    if (datasetId.startsWith('co2-noaa')) {
      baseMeta = this.noaaProvider.getMetadata();
    } else if (datasetId.startsWith('ghg-ch4')) {
      baseMeta = this.noaaGhgProvider.getMetadata();
    } else if (datasetId.startsWith('ghg-n2o')) {
      baseMeta = this.noaaGhgProvider.getN2oMetadata();
    } else if (datasetId === 'ghg-aggi-noaa') {
      baseMeta = this.noaaGhgProvider.getAggiMetadata();
    } else if (datasetId.startsWith('temp-nasa')) {
      baseMeta = this.gistempProvider.getMetadata();
    } else if (datasetId.startsWith('temp-noaa')) {
      baseMeta = this.noaaTempProvider.getMetadata();
    } else if (datasetId.startsWith('temp-berkeley')) {
      baseMeta = this.berkeleyTempProvider.getMetadata();
    } else if (datasetId === 'solar-tsi-lisird') {
      baseMeta = this.lisirdProvider.getMetadata();
    } else if (datasetId === 'solar-sunspots-silso') {
      baseMeta = this.lisirdProvider.getSunspotsData().metadata;
    } else if (datasetId === 'ocean-ohc-argo-2000m') {
      baseMeta = this.argoProvider.getMetadata();
    } else if (datasetId === 'ocean-ohc-argo-700m') {
      baseMeta = this.argoProvider.get700mMetadata();
    } else if (datasetId === 'energy-ceres-net-toa') {
      baseMeta = this.ceresProvider.getMetadata();
    } else if (datasetId === 'energy-ceres-olr-toa') {
      baseMeta = this.ceresProvider.getOlrMetadata();
    } else if (datasetId === 'energy-ceres-albedo-toa') {
      baseMeta = this.ceresProvider.getAlbedoMetadata();
    } else if (datasetId === 'volcano-saod-giss') {
      baseMeta = this.volcanoProvider.getMetadata();
    } else if (datasetId === 'seaice-arctic-september-nsidc') {
      baseMeta = this.seaIceProvider.getMetadata();
    } else if (datasetId === 'seaice-antarctic-february-nsidc') {
      baseMeta = this.seaIceProvider.getAntarcticMetadata();
    } else if (datasetId === 'seaice-arctic-march-nsidc') {
      baseMeta = this.seaIceProvider.getArcticMarchMetadata();
    } else if (datasetId === 'seaice-seasonal-cycle-nsidc') {
      baseMeta = this.seaIceProvider.getSeasonalCycleMetadata();
    } else if (datasetId === 'zonal-temp-arctic-era5') {
      baseMeta = this.zonalProvider.getMetadata();
    } else if (datasetId === 'zonal-temp-northmid-era5') {
      baseMeta = this.zonalProvider.getNorthMidMetadata();
    } else if (datasetId === 'zonal-temp-tropics-era5') {
      baseMeta = this.zonalProvider.getTropicsMetadata();
    } else if (datasetId === 'zonal-temp-southmid-era5') {
      baseMeta = this.zonalProvider.getSouthMidMetadata();
    } else if (datasetId === 'zonal-temp-antarctic-era5') {
      baseMeta = this.zonalProvider.getAntarcticMetadata();
    } else if (datasetId === 'aerosols-cams-total-aod') {
      baseMeta = this.aerosolsProvider.getMetadata();
    } else if (datasetId === 'aerosols-so2-emissions-ceds') {
      baseMeta = this.aerosolsProvider.getSo2Metadata();
    } else if (datasetId.startsWith('nasa-power')) {
      baseMeta = this.nasaPowerProvider.getMetadata();
    } else {
      baseMeta = {
        id: datasetId,
        name: datasetId,
        shortName: datasetId,
        organization: 'Organisme non spécifié',
        source: 'Catalogue open-data',
        sourceUrl: '',
        variable: 'Mesure physique',
        variableSymbol: 'X',
        unit: 'Unité standard',
        unitSymbol: '',
        frequency: 'annual',
        startDate: '1880',
        endDate: '2025',
        retrievedAt: new Date().toISOString(),
        description: 'Dataset scientifique du catalogue ClimatOSCOPE.',
      };
    }

    return this.enrichMetadata(baseMeta, datasetId);
  }

  getBaselinePoints(datasetId: string): TimeSeriesPoint[] {
    if (datasetId.startsWith('co2-noaa')) {
      return this.noaaProvider.getBaselineData();
    } else if (datasetId === 'ghg-ch4-noaa') {
      return this.noaaGhgProvider.getCh4BaselineData();
    } else if (datasetId === 'ghg-ch4-annual-noaa') {
      return this.noaaGhgProvider.getCh4AnnualData();
    } else if (datasetId === 'ghg-n2o-noaa') {
      return this.noaaGhgProvider.getN2oBaselineData();
    } else if (datasetId === 'ghg-n2o-annual-noaa') {
      return this.noaaGhgProvider.getN2oAnnualData();
    } else if (datasetId === 'ghg-aggi-noaa') {
      return this.noaaGhgProvider.getAggiData();
    } else if (datasetId.startsWith('temp-nasa')) {
      return this.gistempProvider.getAnnualBaselineData();
    } else if (datasetId.startsWith('temp-noaa')) {
      return this.noaaTempProvider.getBaselineData();
    } else if (datasetId.startsWith('temp-berkeley')) {
      return this.berkeleyTempProvider.getBaselineData();
    } else if (datasetId === 'solar-tsi-lisird') {
      return this.lisirdProvider.getBaselineData();
    } else if (datasetId === 'solar-sunspots-silso') {
      return this.lisirdProvider.getSunspotsData().data;
    } else if (datasetId === 'ocean-ohc-argo-2000m') {
      return this.argoProvider.getBaselineData();
    } else if (datasetId === 'ocean-ohc-argo-700m') {
      return this.argoProvider.get700mData();
    } else if (datasetId === 'energy-ceres-net-toa') {
      return this.ceresProvider.getBaselineData();
    } else if (datasetId === 'energy-ceres-olr-toa') {
      return this.ceresProvider.getOlrData();
    } else if (datasetId === 'energy-ceres-albedo-toa') {
      return this.ceresProvider.getAlbedoData();
    } else if (datasetId === 'volcano-saod-giss') {
      return this.volcanoProvider.getBaselineData();
    } else if (datasetId === 'seaice-arctic-september-nsidc') {
      return this.seaIceProvider.getArcticSeptData();
    } else if (datasetId === 'seaice-antarctic-february-nsidc') {
      return this.seaIceProvider.getAntarcticData();
    } else if (datasetId === 'seaice-arctic-march-nsidc') {
      return this.seaIceProvider.getArcticMarchData();
    } else if (datasetId === 'seaice-seasonal-cycle-nsidc') {
      return this.seaIceProvider.getSeasonalCycleData();
    } else if (datasetId === 'zonal-temp-arctic-era5') {
      return this.zonalProvider.getArcticData();
    } else if (datasetId === 'zonal-temp-northmid-era5') {
      return this.zonalProvider.getNorthMidData();
    } else if (datasetId === 'zonal-temp-tropics-era5') {
      return this.zonalProvider.getTropicsData();
    } else if (datasetId === 'zonal-temp-southmid-era5') {
      return this.zonalProvider.getSouthMidData();
    } else if (datasetId === 'zonal-temp-antarctic-era5') {
      return this.zonalProvider.getAntarcticData();
    } else if (datasetId === 'aerosols-cams-total-aod') {
      return this.aerosolsProvider.getBaselineData();
    } else if (datasetId === 'aerosols-so2-emissions-ceds') {
      return this.aerosolsProvider.getSo2Data();
    } else if (datasetId.startsWith('nasa-power')) {
      return this.nasaPowerProvider.getBaselineData();
    }
    return [];
  }

  getAllCatalogMetadata(): DatasetMetadata[] {
    const ids = [
      'temp-nasa-gistemp',
      'temp-noaa-globaltemp',
      'temp-berkeley-earth',
      'co2-noaa-mauna-loa',
      'ghg-ch4-noaa',
      'ghg-ch4-annual-noaa',
      'ghg-n2o-noaa',
      'ghg-n2o-annual-noaa',
      'ghg-aggi-noaa',
      'solar-tsi-lisird',
      'solar-sunspots-silso',
      'ocean-ohc-argo-2000m',
      'ocean-ohc-argo-700m',
      'energy-ceres-net-toa',
      'energy-ceres-olr-toa',
      'energy-ceres-albedo-toa',
      'volcano-saod-giss',
      'seaice-arctic-september-nsidc',
      'seaice-antarctic-february-nsidc',
      'seaice-arctic-march-nsidc',
      'seaice-seasonal-cycle-nsidc',
      'zonal-temp-arctic-era5',
      'zonal-temp-northmid-era5',
      'zonal-temp-tropics-era5',
      'zonal-temp-southmid-era5',
      'zonal-temp-antarctic-era5',
      'aerosols-cams-total-aod',
      'aerosols-so2-emissions-ceds',
      'nasa-power-daily-solar'
    ];

    return ids.map((id) => this.getMetadataById(id));
  }

  setNasaPowerLocation(loc: GeoLocation) {
    this.nasaPowerProvider.setLocation(loc);
  }

  getNasaPowerLocation(): GeoLocation {
    return this.nasaPowerProvider.getLocation();
  }

  async clearAllCaches(): Promise<void> {
    this.memoryCache.clear();
    await dbService.clearCache();
  }
}

export const datasetService = new DatasetService();
