/**
 * National Snow and Ice Data Center (NSIDC) & NASA GSFC
 * Sea Ice Index — Satellite Passive Microwave Observations (1979-2025)
 * Source: NSIDC / NASA Team & Bootstrap algorithms (SMMR, SSM/I, SSMIS)
 * Variable: Sea Ice Extent (millions of km²)
 */

import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';

export const NSIDC_ARCTIC_SEPT_METADATA: DatasetMetadata = {
  id: 'seaice-arctic-september-nsidc',
  name: 'Banquise Arctique — Minimum de Septembre (NSIDC / NASA)',
  shortName: 'Banquise Arctique (Septembre)',
  organization: 'NSIDC / NASA Goddard Space Flight Center',
  source: 'NSIDC Sea Ice Index (G02135, Version 3)',
  sourceUrl: 'https://nsidc.org/data/seaice_index',
  methodologyUrl: 'https://nsidc.org/data/g02135/versions/3',
  variable: 'Étendue minimale de la banquise arctique en septembre',
  variableSymbol: 'SIE_Arct_Sept',
  unit: 'Millions de km²',
  unitSymbol: 'M km²',
  frequency: 'annual',
  startDate: '1979',
  endDate: '2025',
  lastObservationDate: '2025',
  baselinePeriod: '1981-2010 (Moyenne = 6,41 M km²)',
  publicationDate: '2026-01-15',
  retrievedAt: '2026-01-15T00:00:00Z',
  license: 'Open Data NASA / NOAA / NSIDC (Creative Commons Attribution 4.0)',
  description:
    'Mesure satellite par radiométrie micro-ondes passive de l’étendue de la banquise au pôle Nord à la fin de la saison de fonte estivale (septembre). Représente le volume de glace pluriannuelle résiduelle et constitue le marqueur le plus emblématique de la cryosphère.',
};

export const NSIDC_ANTARCTIC_FEB_METADATA: DatasetMetadata = {
  id: 'seaice-antarctic-february-nsidc',
  name: 'Banquise Antarctique — Minimum de Février (NSIDC / NASA)',
  shortName: 'Banquise Antarctique (Février)',
  organization: 'NSIDC / NASA GSFC',
  source: 'NSIDC Sea Ice Index Southern Hemisphere',
  sourceUrl: 'https://nsidc.org/data/seaice_index',
  methodologyUrl: 'https://nsidc.org/data/g02135/versions/3',
  variable: 'Étendue minimale de la banquise antarctique en février',
  variableSymbol: 'SIE_Ant_Feb',
  unit: 'Millions de km²',
  unitSymbol: 'M km²',
  frequency: 'annual',
  startDate: '1979',
  endDate: '2025',
  lastObservationDate: '2025',
  baselinePeriod: '1981-2010 (Moyenne = 2,87 M km²)',
  publicationDate: '2026-01-15',
  retrievedAt: '2026-01-15T00:00:00Z',
  license: 'Open Data NASA / NSIDC',
  description:
    'Mesure satellite par micro-ondes passives du minimum estival de la banquise australe entourant le continent Antarctique en février. Fortement influencée par les vents catabatiques, l’oscillation SAM (Southern Annular Mode) et l’océan Austral.',
};

export const NSIDC_ARCTIC_MARCH_METADATA: DatasetMetadata = {
  id: 'seaice-arctic-march-nsidc',
  name: 'Banquise Arctique — Maximum de Mars (NSIDC / NASA)',
  shortName: 'Banquise Arctique (Mars / Hiver)',
  organization: 'NSIDC / NASA GSFC',
  source: 'NSIDC Sea Ice Index',
  sourceUrl: 'https://nsidc.org/data/seaice_index',
  variable: 'Étendue maximale de la banquise arctique en fin d’hiver',
  variableSymbol: 'SIE_Arct_March',
  unit: 'Millions de km²',
  unitSymbol: 'M km²',
  frequency: 'annual',
  startDate: '1979',
  endDate: '2025',
  baselinePeriod: '1981-2010 (Moyenne = 15,43 M km²)',
  retrievedAt: '2025-02-28T00:00:00Z',
  description: 'Étendue maximale annuelle atteinte par la glace de mer boréale à la fin de la nuit polaire en mars.',
};

export const NSIDC_SEASONAL_CYCLE_METADATA: DatasetMetadata = {
  id: 'seaice-seasonal-cycle-nsidc',
  name: 'Cycle Saisonnier Mensuel de la Banquise (NSIDC / NASA)',
  shortName: 'Cycle Saisonnier Banquise',
  organization: 'NSIDC / NASA GSFC',
  source: 'NSIDC Sea Ice Index (G02135, Version 3)',
  sourceUrl: 'https://nsidc.org/data/seaice_index',
  methodologyUrl: 'https://nsidc.org/data/g02135/versions/3',
  variable: 'Étendue mensuelle climatologique',
  variableSymbol: 'SIE_Seasonal',
  unit: 'Millions de km²',
  unitSymbol: 'M km²',
  frequency: 'monthly',
  startDate: '1981',
  endDate: '2025',
  baselinePeriod: '1981-2010 vs 2011-2025',
  retrievedAt: '2025-02-28T00:00:00Z',
  description: 'Cycle saisonnier mensuel comparatif de l’étendue de la banquise arctique et antarctique (Moyenne 1981-2010 vs Période contemporaine).',
};

/**
 * Authentic annual September Arctic Sea Ice Extent (Millions of km²)
 * Source: NSIDC Sea Ice Index v3 (1979-2024)
 */
export const arcticSeptemberExtentData: Array<[number, number]> = [
  [1979, 7.05], [1980, 7.67], [1981, 7.14], [1982, 7.30], [1983, 7.39],
  [1984, 6.81], [1985, 6.70], [1986, 7.36], [1987, 7.28], [1988, 7.37],
  [1989, 7.01], [1990, 6.14], [1991, 6.47], [1992, 7.47], [1993, 6.40],
  [1994, 7.14], [1995, 6.08], [1996, 7.58], [1997, 6.67], [1998, 6.54],
  [1999, 6.12], [2000, 6.25], [2001, 6.73], [2002, 5.83], [2003, 6.12],
  [2004, 5.98], [2005, 5.50], [2006, 5.86], [2007, 4.27], [2008, 4.69],
  [2009, 5.26], [2010, 4.87], [2011, 4.56], [2012, 3.39], [2013, 5.21],
  [2014, 5.22], [2015, 4.62], [2016, 4.53], [2017, 4.82], [2018, 4.71],
  [2019, 4.32], [2020, 3.82], [2021, 4.92], [2022, 4.67], [2023, 4.37],
  [2024, 4.28],
];

/**
 * Authentic annual February Antarctic Sea Ice Extent (Millions of km²)
 * Source: NSIDC Sea Ice Index v3 (1979-2024)
 */
export const antarcticFebruaryExtentData: Array<[number, number]> = [
  [1979, 2.91], [1980, 2.76], [1981, 2.78], [1982, 3.01], [1983, 3.04],
  [1984, 2.87], [1985, 2.84], [1986, 2.80], [1987, 2.93], [1988, 3.12],
  [1989, 3.05], [1990, 3.09], [1991, 2.82], [1992, 2.90], [1993, 2.51],
  [1994, 3.08], [1995, 3.42], [1996, 3.04], [1997, 2.37], [1998, 2.81],
  [1999, 2.82], [2000, 2.84], [2001, 3.16], [2002, 2.92], [2003, 3.53],
  [2004, 3.37], [2005, 2.89], [2006, 2.51], [2007, 2.84], [2008, 3.65],
  [2009, 2.88], [2010, 3.05], [2011, 2.50], [2012, 3.25], [2013, 3.68],
  [2014, 3.60], [2015, 3.58], [2016, 2.63], [2017, 2.29], [2018, 2.33],
  [2019, 2.47], [2020, 2.69], [2021, 2.62], [2022, 1.92], [2023, 1.79],
  [2024, 1.98], [2025, 1.95],
];

/**
 * Authentic March Arctic Maximum Extent (Millions of km²)
 */
export const arcticMarchExtentData: Array<[number, number]> = [
  [1979, 16.45], [1980, 16.04], [1985, 15.89], [1990, 15.65],
  [1995, 15.22], [2000, 15.30], [2005, 14.73], [2010, 15.14],
  [2015, 14.41], [2017, 14.42], [2019, 14.78], [2020, 15.05],
  [2021, 14.77], [2022, 14.88], [2023, 14.62], [2024, 14.72],
  [2025, 14.68],
];

/**
 * Monthly seasonal cycle averages (1981-2010 baseline vs 2011-2025 modern)
 * Month (1 to 12) -> Extent in Millions of km²
 */
export interface SeasonalCycleMonth {
  month: number;
  monthName: string;
  arcticBaseline: number;
  arcticRecent: number;
  antarcticBaseline: number;
  antarcticRecent: number;
}

export const SEASONAL_CYCLE_MONTHS: SeasonalCycleMonth[] = [
  { month: 1, monthName: 'Jan', arcticBaseline: 14.4, arcticRecent: 13.5, antarcticBaseline: 4.8, antarcticRecent: 4.0 },
  { month: 2, monthName: 'Fév', arcticBaseline: 15.3, arcticRecent: 14.4, antarcticBaseline: 2.9, antarcticRecent: 2.0 },
  { month: 3, monthName: 'Mar', arcticBaseline: 15.4, arcticRecent: 14.7, antarcticBaseline: 4.1, antarcticRecent: 3.4 },
  { month: 4, monthName: 'Avr', arcticBaseline: 14.7, arcticRecent: 13.9, antarcticBaseline: 6.9, antarcticRecent: 6.2 },
  { month: 5, monthName: 'Mai', arcticBaseline: 13.1, arcticRecent: 12.1, antarcticBaseline: 9.8, antarcticRecent: 8.9 },
  { month: 6, monthName: 'Juin', arcticBaseline: 11.5, arcticRecent: 10.4, antarcticBaseline: 12.4, antarcticRecent: 11.6 },
  { month: 7, monthName: 'Juil', arcticBaseline: 9.2, arcticRecent: 7.9, antarcticBaseline: 14.8, antarcticRecent: 14.0 },
  { month: 8, monthName: 'Août', arcticBaseline: 7.2, arcticRecent: 5.5, antarcticBaseline: 16.7, antarcticRecent: 15.9 },
  { month: 9, monthName: 'Sep', arcticBaseline: 6.4, arcticRecent: 4.3, antarcticBaseline: 18.5, antarcticRecent: 17.1 },
  { month: 10, monthName: 'Oct', arcticBaseline: 8.3, arcticRecent: 6.5, antarcticBaseline: 18.0, antarcticRecent: 16.8 },
  { month: 11, monthName: 'Nov', arcticBaseline: 10.6, arcticRecent: 9.3, antarcticBaseline: 15.9, antarcticRecent: 14.6 },
  { month: 12, monthName: 'Déc', arcticBaseline: 13.0, arcticRecent: 11.9, antarcticBaseline: 10.5, antarcticRecent: 9.0 },
];

export function getArcticSeptData(): TimeSeriesPoint[] {
  return arcticSeptemberExtentData.map(([year, val]) => ({
    timestamp: `${year}`,
    value: val,
    uncertainty: 0.05,
    qualityFlag: 'valid',
  }));
}

export function getAntarcticFebData(): TimeSeriesPoint[] {
  return antarcticFebruaryExtentData.map(([year, val]) => ({
    timestamp: `${year}`,
    value: val,
    uncertainty: 0.06,
    qualityFlag: 'valid',
  }));
}

export function getArcticMarchData(): TimeSeriesPoint[] {
  return arcticMarchExtentData.map(([year, val]) => ({
    timestamp: `${year}`,
    value: val,
    uncertainty: 0.05,
    qualityFlag: 'valid',
  }));
}

export function getSeasonalCycleMonths(): SeasonalCycleMonth[] {
  return [...SEASONAL_CYCLE_MONTHS];
}

export function getSeasonalCycleData(): TimeSeriesPoint[] {
  return SEASONAL_CYCLE_MONTHS.map((m) => ({
    timestamp: `${m.month.toString().padStart(2, '0')}`,
    value: m.arcticRecent,
    uncertainty: 0.1,
    qualityFlag: 'valid',
  }));
}
