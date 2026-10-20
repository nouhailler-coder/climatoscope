/**
 * WDC-SILSO, Royal Observatory of Belgium, Brussels
 * International Sunspot Number v2.0 (SSN)
 * Source: World Data Center SILSO / Royal Observatory of Belgium
 * Variable: Sunspot Number (adimensionnel)
 */

import { DatasetMetadata, TimeSeriesPoint } from '../../types/dataset';

export const SILSO_SUNSPOTS_METADATA: DatasetMetadata = {
  id: 'solar-sunspots-silso',
  name: 'Nombre de Taches Solaires (SSN) — WDC-SILSO',
  shortName: 'Taches solaires (SILSO)',
  organization: 'Observatoire Royal de Belgique / WDC-SILSO',
  source: 'World Data Center SILSO, Royal Observatory of Belgium',
  sourceUrl: 'https://www.sidc.be/silso/datafiles',
  methodologyUrl: 'https://www.sidc.be/silso/snversion2',
  variable: 'Nombre international de taches solaires',
  variableSymbol: 'SSN',
  unit: 'Indice sans unité (comptage pondéré des groupes et taches)',
  unitSymbol: 'nombre',
  frequency: 'annual',
  startDate: '1880',
  endDate: '2025',
  lastObservationDate: '2025',
  publicationDate: '2026-01-15',
  retrievedAt: '2026-01-15T00:00:00Z',
  license: 'Creative Commons CC-BY-NC 4.0',
  description:
    'Série continue historique du nombre de taches solaires (formule de Wolf révisée v2.0 en 2015). Permet de tracer les cycles solaires de Schwabe (~11 ans) et d’analyser le magnétisme de l’étoile.',
};

/**
 * Authentic annual mean sunspot numbers v2.0 (1880 - 2025)
 */
export const sunspotsAnnualAnchors: Array<[number, number]> = [
  [1880, 53.7], [1881, 90.5], [1882, 99.4], [1883, 106.1], [1884, 105.8],
  [1885, 86.4], [1886, 42.4], [1887, 21.8], [1888, 11.2], [1889, 10.4],
  [1890, 11.8], [1891, 59.5], [1892, 121.7], [1893, 142.0], [1894, 130.0],
  [1895, 106.7], [1896, 69.4], [1897, 43.6], [1898, 44.5], [1899, 19.9],
  [1900, 15.7], [1901, 4.6], [1902, 8.5], [1903, 40.8], [1904, 70.1],
  [1905, 105.5], [1906, 90.1], [1907, 102.8], [1908, 80.9], [1909, 73.2],
  [1910, 31.1], [1911, 9.5], [1912, 6.0], [1913, 2.4], [1914, 16.2],
  [1915, 79.0], [1916, 95.0], [1917, 173.6], [1918, 134.6], [1919, 105.7],
  [1920, 62.7], [1921, 43.5], [1922, 23.7], [1923, 9.7], [1924, 27.9],
  [1925, 74.0], [1926, 106.5], [1927, 114.7], [1928, 129.7], [1929, 108.2],
  [1930, 59.4], [1931, 35.1], [1932, 18.6], [1933, 9.2], [1934, 14.6],
  [1935, 60.2], [1936, 132.8], [1937, 190.6], [1938, 182.6], [1939, 148.0],
  [1940, 113.0], [1941, 79.2], [1942, 50.8], [1943, 27.1], [1944, 16.1],
  [1945, 55.3], [1946, 154.3], [1947, 214.7], [1948, 193.0], [1949, 190.7],
  [1950, 118.9], [1951, 95.6], [1952, 45.4], [1953, 20.1], [1954, 6.6],
  [1955, 54.2], [1956, 200.7], [1957, 269.3], [1958, 261.7], [1959, 225.1],
  [1960, 159.0], [1961, 76.4], [1962, 53.4], [1963, 39.9], [1964, 15.0],
  [1965, 22.0], [1966, 66.8], [1967, 132.9], [1968, 150.0], [1969, 149.4],
  [1970, 148.0], [1971, 94.4], [1972, 97.6], [1973, 54.1], [1974, 49.2],
  [1975, 22.5], [1976, 18.4], [1977, 39.3], [1978, 131.0], [1979, 220.1],
  [1980, 218.9], [1981, 198.9], [1982, 162.4], [1983, 91.0], [1984, 60.5],
  [1985, 20.6], [1986, 14.8], [1987, 33.9], [1988, 123.0], [1989, 211.1],
  [1990, 191.8], [1991, 203.3], [1992, 133.0], [1993, 76.1], [1994, 44.9],
  [1995, 25.1], [1996, 11.6], [1997, 28.9], [1998, 88.3], [1999, 136.3],
  [2000, 173.9], [2001, 170.4], [2002, 163.6], [2003, 99.3], [2004, 65.3],
  [2005, 45.8], [2006, 24.7], [2007, 12.6], [2008, 4.2], [2009, 4.8],
  [2010, 24.9], [2011, 80.8], [2012, 84.5], [2013, 94.0], [2014, 113.3],
  [2015, 69.8], [2016, 39.8], [2017, 21.7], [2018, 7.0], [2019, 3.6],
  [2020, 8.8], [2021, 29.6], [2022, 83.0], [2023, 125.4], [2024, 155.8],
  [2025, 140.2]
];

export function getSilsoSunspotsData(): TimeSeriesPoint[] {
  return sunspotsAnnualAnchors.map(([year, val]) => ({
    timestamp: year.toString(),
    value: val,
    qualityFlag: 'valid',
  }));
}
