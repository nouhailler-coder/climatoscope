/**
 * ClimatOSCOPE — Dataset & Synchronization Service
 * Implements cache-first offline architecture, data normalization, provenance tracking, and quality control.
 */

import { ArgoProvider } from '../api/adapters/argo';
import { CeresProvider } from '../api/adapters/ceres';
import { GistempProvider } from '../api/adapters/gistemp';
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
    calculationMethod: 'Moyenne arithmétique annuelle globale calculée à partir des moyennes mensuelles de surface du réseau NOAA GML.'
  },
  'ghg-n2o-noaa': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://gml.noaa.gov/hats/combined/N2O.html',
    calculationMethod: 'Mesures in situ et flacons du réseau mondial NOAA HATS (chromatographie en phase gazeuse ECD).'
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
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series',
    calculationMethod: 'Reconstruction matricielle spatiale NOAA NCEI NOAAGlobalTemp v5 combinant GHCNm v4 et ERSST v5 sur maillage 5°x5°.'
  },
  'temp-berkeley-earth': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://berkeleyearth.org/data/',
    calculationMethod: 'Méthode d\'analyse statistique Berkeley Earth utilisant un kriging spatial direct sur plus de 40 000 stations terrestres et HadSST4.'
  },
  'solar-tsi-lisird': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://lasp.colorado.edu/lisird/data/historical_tsi/',
    calculationMethod: 'Irradiance solaire totale (TSI) composite satellitaire (SORCE/TIM, TSIS-1/TIM et reconstructions composites LASP).'
  },
  'solar-sunspots-silso': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://www.sidc.be/silso/datafiles',
    calculationMethod: 'Nombre international de taches solaires normalisé (Observatoire Royal de Belgique, SILSO / SIDC).'
  },
  'ocean-ohc-argo-2000m': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://www.ncei.noaa.gov/access/global-ocean-heat-content/',
    calculationMethod: 'Contenu thermique océanique (0-2000m) intégré depuis les profils de flotteurs autonomes Argo et bathythermographes corrigés (NOAA NCEI).'
  },
  'ocean-ohc-argo-700m': {
    provenanceType: 'embedded_historical',
    sourceUrl: 'https://www.ncei.noaa.gov/access/global-ocean-heat-content/',
    calculationMethod: 'Contenu thermique océanique des couches supérieures (0-700m) NOAA NCEI / Argo.'
  },
  'energy-ceres-net-toa': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://ceres.larc.nasa.gov/data/',
    calculationMethod: 'Déséquilibre énergétique net au sommet de l\'atmosphère (EEI = ASR - OLR) mesuré par radiomètres spatiaux CERES EBAF.'
  },
  'energy-ceres-olr-toa': {
    provenanceType: 'embedded_historical',
    isDerived: true,
    sourceUrl: 'https://ceres.larc.nasa.gov/data/',
    calculationMethod: 'Composante infrarouge thermique sortante (Outgoing Longwave Radiation - OLR) mesurée au sommet de l\'atmosphère par NASA CERES.'
  },
  'energy-ceres-albedo-toa': {
    provenanceType: 'embedded_historical',
    isDerived: true,
    sourceUrl: 'https://ceres.larc.nasa.gov/data/',
    calculationMethod: 'Composante solaire réfléchie en ondes courtes et albédo TOA mesurés par les radiomètres CERES.'
  },
  'volcano-saod-giss': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://data.giss.nasa.gov/modelforce/strataer/',
    calculationMethod: 'Épaisseur optique des aérosols stratosphériques (SAOD à 550 nm) composite NASA GISS / satellites SAGE II, CALIOP, OMPS.'
  },
  'seaice-arctic-september-nsidc': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://nsidc.org/data/seaice_index',
    calculationMethod: 'Indice d\'étendue de la banquise arctique (seuil 15% de concentration de glace) au minimum annuel de septembre mesuré par micro-ondes passives satellitaires.'
  },
  'seaice-antarctic-february-nsidc': {
    provenanceType: 'live_feed',
    sourceUrl: 'https://nsidc.org/data/seaice_index',
    calculationMethod: 'Étendue de la banquise antarctique au minimum estival de février (NSIDC Sea Ice Index).'
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

class DatasetService {
  private noaaProvider = new NoaaGmlProvider();
  private noaaGhgProvider = new NoaaGhgProvider();
  private gistempProvider = new GistempProvider();
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
    // 1. Check in-memory
    if (!forceRefresh && this.memoryCache.has(datasetId)) {
      const cached = this.memoryCache.get(datasetId)!;
      return { dataset: cached, status: this.resolveStatus(cached) };
    }

    // 2. Check IndexedDB
    if (!forceRefresh) {
      try {
        const cached = await dbService.getDataset(datasetId);
        if (cached && cached.data && cached.data.length > 0) {
          // Re-enrich with latest provenance definitions in case metadata evolved
          const enrichedMeta = this.enrichMetadata(cached.metadata, datasetId, cached.data);
          cached.metadata = enrichedMeta;
          this.memoryCache.set(datasetId, cached);
          return { dataset: cached, status: this.resolveStatus(cached) };
        }
      } catch (err) {
        console.warn('Erreur lecture IndexedDB:', err);
      }
    }

    // 3. Fetch from provider
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
        const alt = this.gistempProvider.getAlternativeDataset('noaa');
        metadata = alt.metadata;
        points = alt.data;
        status = 'embedded_historical';
      } else if (datasetId.startsWith('temp-berkeley')) {
        const alt = this.gistempProvider.getAlternativeDataset('berkeley');
        metadata = alt.metadata;
        points = alt.data;
        status = 'embedded_historical';
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
      console.error(`Échec fetch ${datasetId}, tentative fallback cache:`, err);
      const cachedFallback = await dbService.getDataset(datasetId);
      if (cachedFallback) {
        this.memoryCache.set(datasetId, cachedFallback);
        return { dataset: cachedFallback, status: 'error' };
      }
      status = 'error';
    }

    const enrichedMeta = this.enrichMetadata(metadata, datasetId, points);

    const internal: InternalDataset = {
      metadata: enrichedMeta,
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

  private enrichMetadata(meta: DatasetMetadata, datasetId: string, points?: TimeSeriesPoint[]): DatasetMetadata {
    const provDef = PROVENANCE_REGISTRY[datasetId] || PROVENANCE_REGISTRY[meta.id] || {
      provenanceType: 'live_feed',
    };

    const enriched: DatasetMetadata = {
      ...meta,
      provenanceType: provDef.provenanceType,
      isDerived: provDef.isDerived ?? meta.isDerived ?? false,
      calculationMethod: provDef.calculationMethod ?? meta.calculationMethod,
      sourceUrl: provDef.sourceUrl ?? meta.sourceUrl,
    };

    if (points && points.length > 0) {
      enriched.lastObservationDate = points[points.length - 1].timestamp;
      enriched.startDate = points[0].timestamp;
      enriched.endDate = points[points.length - 1].timestamp;
    }

    return enriched;
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

  private getMetadataById(id: string): DatasetMetadata {
    let baseMeta: DatasetMetadata;
    if (id.startsWith('co2')) baseMeta = this.noaaProvider.getMetadata();
    else if (id === 'ghg-ch4-annual-noaa') {
      baseMeta = {
        ...this.noaaGhgProvider.getMetadata(),
        id: 'ghg-ch4-annual-noaa',
        name: 'Méthane Atmosphérique Global (CH₄ - Moyenne Annuelle)',
        frequency: 'annual'
      };
    } else if (id.startsWith('ghg-ch4')) baseMeta = this.noaaGhgProvider.getMetadata();
    else if (id === 'ghg-n2o-annual-noaa') {
      baseMeta = {
        ...this.noaaGhgProvider.getN2oMetadata(),
        id: 'ghg-n2o-annual-noaa',
        name: 'Protoxyde d\'Azote (N₂O - Moyenne Annuelle)',
        frequency: 'annual'
      };
    } else if (id.startsWith('ghg-n2o')) baseMeta = this.noaaGhgProvider.getN2oMetadata();
    else if (id.startsWith('ghg-aggi')) baseMeta = this.noaaGhgProvider.getAggiMetadata();
    else if (id.startsWith('temp-noaa')) baseMeta = this.gistempProvider.getAlternativeDataset('noaa').metadata;
    else if (id.startsWith('temp-berkeley')) baseMeta = this.gistempProvider.getAlternativeDataset('berkeley').metadata;
    else if (id.startsWith('temp')) baseMeta = this.gistempProvider.getMetadata();
    else if (id === 'solar-sunspots-silso') baseMeta = this.lisirdProvider.getSunspotsData().metadata;
    else if (id.startsWith('solar')) baseMeta = this.lisirdProvider.getMetadata();
    else if (id === 'ocean-ohc-argo-700m') baseMeta = this.argoProvider.get700mMetadata();
    else if (id.startsWith('ocean')) baseMeta = this.argoProvider.getMetadata();
    else if (id === 'energy-ceres-olr-toa') baseMeta = this.ceresProvider.getOlrMetadata();
    else if (id === 'energy-ceres-albedo-toa') baseMeta = this.ceresProvider.getAlbedoMetadata();
    else if (id.startsWith('energy-ceres')) baseMeta = this.ceresProvider.getMetadata();
    else if (id.startsWith('volcano')) baseMeta = this.volcanoProvider.getMetadata();
    else if (id === 'seaice-antarctic-february-nsidc') baseMeta = this.seaIceProvider.getAntarcticMetadata();
    else if (id === 'seaice-arctic-march-nsidc') baseMeta = this.seaIceProvider.getArcticMarchMetadata();
    else if (id === 'seaice-seasonal-cycle-nsidc') baseMeta = this.seaIceProvider.getSeasonalCycleMetadata();
    else if (id.startsWith('seaice')) baseMeta = this.seaIceProvider.getMetadata();
    else if (id === 'zonal-temp-northmid-era5') baseMeta = this.zonalProvider.getNorthMidMetadata();
    else if (id === 'zonal-temp-tropics-era5') baseMeta = this.zonalProvider.getTropicsMetadata();
    else if (id === 'zonal-temp-southmid-era5') baseMeta = this.zonalProvider.getSouthMidMetadata();
    else if (id === 'zonal-temp-antarctic-era5') baseMeta = this.zonalProvider.getAntarcticMetadata();
    else if (id.startsWith('zonal')) baseMeta = this.zonalProvider.getMetadata();
    else if (id === 'aerosols-so2-emissions-ceds') baseMeta = this.aerosolsProvider.getSo2Metadata();
    else if (id.startsWith('aerosols')) baseMeta = this.aerosolsProvider.getMetadata();
    else baseMeta = this.nasaPowerProvider.getMetadata();

    return this.enrichMetadata(baseMeta, id);
  }

  async getAllCatalogMetadata(): Promise<DatasetMetadata[]> {
    const list = [
      this.getMetadataById('solar-tsi-lisird'),
      this.getMetadataById('solar-sunspots-silso'),
      this.getMetadataById('co2-noaa-mauna-loa'),
      this.getMetadataById('ghg-ch4-noaa'),
      this.getMetadataById('ghg-ch4-annual-noaa'),
      this.getMetadataById('ghg-n2o-noaa'),
      this.getMetadataById('ghg-n2o-annual-noaa'),
      this.getMetadataById('ghg-aggi-noaa'),
      this.getMetadataById('temp-nasa-gistemp'),
      this.getMetadataById('temp-noaa-globaltemp'),
      this.getMetadataById('temp-berkeley-earth'),
      this.getMetadataById('zonal-temp-arctic-era5'),
      this.getMetadataById('zonal-temp-northmid-era5'),
      this.getMetadataById('zonal-temp-tropics-era5'),
      this.getMetadataById('zonal-temp-southmid-era5'),
      this.getMetadataById('zonal-temp-antarctic-era5'),
      this.getMetadataById('seaice-arctic-september-nsidc'),
      this.getMetadataById('seaice-antarctic-february-nsidc'),
      this.getMetadataById('seaice-arctic-march-nsidc'),
      this.getMetadataById('seaice-seasonal-cycle-nsidc'),
      this.getMetadataById('ocean-ohc-argo-2000m'),
      this.getMetadataById('ocean-ohc-argo-700m'),
      this.getMetadataById('energy-ceres-net-toa'),
      this.getMetadataById('energy-ceres-olr-toa'),
      this.getMetadataById('energy-ceres-albedo-toa'),
      this.getMetadataById('volcano-saod-giss'),
      this.getMetadataById('aerosols-cams-total-aod'),
      this.getMetadataById('aerosols-so2-emissions-ceds'),
      this.getMetadataById('nasa-power-daily-solar'),
    ];

    // For each dataset, if present in cache, extract last observation date
    return await Promise.all(
      list.map(async (meta) => {
        try {
          const cached = await dbService.getDataset(meta.id);
          if (cached && cached.data && cached.data.length > 0) {
            return this.enrichMetadata(meta, meta.id, cached.data);
          }
        } catch {}
        return meta;
      })
    );
  }
}

export const datasetService = new DatasetService();
