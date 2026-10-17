/**
 * ClimatOSCOPE — Data Quality & Scientific Authenticity Validator
 * Rigorous physical bounds checking, chronological validation, and authentic observation certification.
 */

import { DataQualityReport, PhysicalSanityCheck, TimeSeriesPoint } from '../types/dataset';

export interface ValidationIssue {
  type:
    | 'invalid_date'
    | 'nan_value'
    | 'duplicate_date'
    | 'non_chronological'
    | 'temporal_gap'
    | 'outlier_suspect'
    | 'unphysical_value';
  timestamp?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface DatasetPhysicsDefinition {
  name: string;
  min: number;
  max: number;
  isAuthenticBaseline: boolean;
  notes: string;
}

const PHYSICAL_BOUNDS_MAP: Record<string, DatasetPhysicsDefinition> = {
  'co2-noaa-mauna-loa': {
    name: 'Concentration atmosphérique CO₂',
    min: 270,
    max: 480,
    isAuthenticBaseline: true,
    notes: 'Bornes réalistes Mauna Loa (280 ppm préindustriel à 450+ ppm contemporain)',
  },
  'ghg-ch4-noaa': {
    name: 'Concentration globale CH₄',
    min: 650,
    max: 2200,
    isAuthenticBaseline: true,
    notes: 'Bornes physiques CH₄ (722 ppb préindustriel à ~2000 ppb actuel)',
  },
  'ghg-n2o-noaa': {
    name: 'Concentration globale N₂O',
    min: 260,
    max: 370,
    isAuthenticBaseline: true,
    notes: 'Bornes physiques N₂O (270 ppb préindustriel à ~340 ppb actuel)',
  },
  'temp-nasa-gistemp': {
    name: 'Anomalie de température globale (NASA GISTEMP)',
    min: -2.5,
    max: 2.5,
    isAuthenticBaseline: true,
    notes: 'Bornes physiques d\'anomalie planétaire annuelle terre-océan (-2°C à +2.5°C vs 1951-1980)',
  },
  'temp-noaa-globaltemp': {
    name: 'Anomalie de température globale (NOAA GlobalTemp)',
    min: -2.5,
    max: 2.5,
    isAuthenticBaseline: true,
    notes: 'Bornes physiques d\'anomalie planétaire annuelle terre-océan (-2°C à +2.5°C vs 20e siècle)',
  },
  'temp-berkeley-earth': {
    name: 'Anomalie de température globale (Berkeley Earth)',
    min: -2.5,
    max: 2.5,
    isAuthenticBaseline: true,
    notes: 'Bornes physiques d\'anomalie planétaire annuelle terre-océan (-2°C à +2.5°C vs 1951-1980)',
  },
  'solar-tsi-lisird': {
    name: 'Irradiance solaire totale (TSI)',
    min: 1358,
    max: 1364,
    isAuthenticBaseline: true,
    notes: 'Constante solaire spatiale radiométrique SORCE/TSIS-1 (~1361 W/m² ± 1.5 W/m²)',
  },
  'solar-sunspots-silso': {
    name: 'Nombre de taches solaires (SSN)',
    min: 0,
    max: 400,
    isAuthenticBaseline: true,
    notes: 'Nombre de Wolf SILSO v2 (positif ou nul, maximum historique séculaire < 350)',
  },
  'ocean-ohc-argo-2000m': {
    name: 'Contenu thermique des océans (0-2000m)',
    min: -150,
    max: 550,
    isAuthenticBaseline: true,
    notes: 'Accumulation thermique océanique mondiale en Zettajoules (ZJ)',
  },
  'energy-ceres-net-toa': {
    name: 'Déséquilibre radiatif net au sommet de l\'atmosphère (EEI)',
    min: -1.5,
    max: 2.5,
    isAuthenticBaseline: true,
    notes: 'Déséquilibre énergétique net CERES EBAF (oscille entre 0 et +1.8 W/m²)',
  },
  'seaice-arctic-september-nsidc': {
    name: 'Étendue banquise arctique (septembre)',
    min: 1.5,
    max: 12.0,
    isAuthenticBaseline: true,
    notes: 'Minimum estival de glace de mer en Millions de km² (NSIDC Sea Ice Index)',
  },
  'seaice-antarctic-february-nsidc': {
    name: 'Étendue banquise antarctique (février)',
    min: 1.0,
    max: 10.0,
    isAuthenticBaseline: true,
    notes: 'Minimum estival antarctique en Millions de km² (NSIDC)',
  },
  'aerosols-cams-total-aod': {
    name: 'Épaisseur optique des aérosols (AOD 550nm)',
    min: 0.05,
    max: 0.40,
    isAuthenticBaseline: true,
    notes: 'AOD planétaire moyenne troposphérique CAMS',
  },
  'volcano-saod-giss': {
    name: 'Aérosols stratosphériques volcaniques (SAOD)',
    min: 0.001,
    max: 0.35,
    isAuthenticBaseline: true,
    notes: 'Épaisseur optique stratosphérique globale (pic Pinatubo 1991 ~0.15)',
  },
};

export function validateTimeSeriesData(
  data: TimeSeriesPoint[],
  datasetId: string,
  expectedFrequencyMonths: number = 1
): { report: DataQualityReport; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const seenTimestamps = new Set<string>();
  const temporalGaps: Array<{ from: string; to: string }> = [];

  const physicsDef = PHYSICAL_BOUNDS_MAP[datasetId];

  let validPoints = 0;
  let missingPoints = 0;
  let outlierCount = 0;
  let isMonotonicDate = true;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    const pt = data[i];

    // Check date format
    if (!pt.timestamp || isNaN(new Date(pt.timestamp).getTime())) {
      issues.push({
        type: 'invalid_date',
        timestamp: pt.timestamp,
        message: `Date non valide à l'index ${i}: "${pt.timestamp}"`,
        severity: 'error',
      });
    }

    // Check chronological order & duplicates
    if (i > 0) {
      if (pt.timestamp < data[i - 1].timestamp) {
        isMonotonicDate = false;
        issues.push({
          type: 'non_chronological',
          timestamp: pt.timestamp,
          message: `Date hors ordre chronologique: ${pt.timestamp} après ${data[i - 1].timestamp}`,
          severity: 'error',
        });
      } else if (pt.timestamp === data[i - 1].timestamp) {
        issues.push({
          type: 'duplicate_date',
          timestamp: pt.timestamp,
          message: `Date en double: ${pt.timestamp}`,
          severity: 'warning',
        });
      } else if (expectedFrequencyMonths > 0) {
        // Temporal gap detection
        const prevDate = new Date(data[i - 1].timestamp);
        const currDate = new Date(pt.timestamp);
        const diffMonths = (currDate.getFullYear() - prevDate.getFullYear()) * 12 + (currDate.getMonth() - prevDate.getMonth());
        if (diffMonths > expectedFrequencyMonths * 2) {
          temporalGaps.push({ from: data[i - 1].timestamp, to: pt.timestamp });
          issues.push({
            type: 'temporal_gap',
            timestamp: pt.timestamp,
            message: `Trou temporel détecté de ${data[i - 1].timestamp} à ${pt.timestamp} (${diffMonths} mois)`,
            severity: 'info',
          });
        }
      }
    }
    seenTimestamps.add(pt.timestamp);

    // Value check & physical plausibility
    if (typeof pt.value !== 'number' || isNaN(pt.value) || pt.value === null) {
      missingPoints++;
      issues.push({
        type: 'nan_value',
        timestamp: pt.timestamp,
        message: `Valeur manquante ou NaN à ${pt.timestamp}`,
        severity: 'warning',
      });
    } else {
      validPoints++;
      if (pt.value < min) min = pt.value;
      if (pt.value > max) max = pt.value;
      sum += pt.value;

      // Physical range bounds verification
      if (physicsDef) {
        if (pt.value < physicsDef.min || pt.value > physicsDef.max) {
          outlierCount++;
          issues.push({
            type: 'unphysical_value',
            timestamp: pt.timestamp,
            message: `Valeur hors limites physiques (${pt.value} hors de [${physicsDef.min}, ${physicsDef.max}]) à ${pt.timestamp}`,
            severity: 'error',
          });
        }
      }
    }
  }

  const totalPoints = data.length;
  const mean = validPoints > 0 ? sum / validPoints : 0;

  // Determine quality score including physical sanity
  let qualityScore: 'high' | 'medium' | 'low' = 'high';
  if (missingPoints / Math.max(1, totalPoints) > 0.05 || !isMonotonicDate || outlierCount > 0) {
    qualityScore = 'medium';
  }
  if (missingPoints / Math.max(1, totalPoints) > 0.20 || validPoints < 5 || outlierCount > 3) {
    qualityScore = 'low';
  }

  const sanityCheck: PhysicalSanityCheck | undefined = physicsDef
    ? {
        variableName: physicsDef.name,
        expectedRange: [physicsDef.min, physicsDef.max],
        isWithinBounds: outlierCount === 0,
        outlierCount,
        isAuthenticBaseline: physicsDef.isAuthenticBaseline,
        notes: physicsDef.notes,
      }
    : undefined;

  const report: DataQualityReport = {
    datasetId,
    totalPoints,
    validPoints,
    missingPoints,
    temporalGaps,
    min: min === Infinity ? 0 : min,
    max: max === -Infinity ? 0 : max,
    mean: Number(mean.toFixed(4)),
    isMonotonicDate,
    qualityScore,
    sanityCheck,
  };

  return { report, issues };
}
