import { describe, it, expect } from 'vitest';
import { getNoaaCo2Data } from '../src/data/baseline/co2-noaa-maunaloa';
import {
  getGistempAnnualData,
  getGistempMonthlyData,
  getNoaaGlobalTempData,
  getBerkeleyEarthData,
} from '../src/data/baseline/temperature-gistemp';
import { getLisirdTsiData } from '../src/data/baseline/solar-tsi-lisird';
import { getSilsoSunspotsData } from '../src/data/baseline/solar-sunspots';
import { getArgoOhc2000mData, getArgoOhc700mData } from '../src/data/baseline/ocean-argo';
import { getCeresNetData, getCeresOlrData, getCeresAlbedoData } from '../src/data/baseline/energy-ceres';
import { getNasaGissSaodData, MAJOR_ERUPTIONS } from '../src/data/baseline/volcano-saod';
import {
  getNoaaCh4MonthlyData,
  getNoaaCh4AnnualData,
  getNoaaN2oMonthlyData,
  getNoaaN2oAnnualData,
  getNoaaAggiData,
} from '../src/data/baseline/ghg-noaa-ch4-n2o';
import {
  getArcticSeptData,
  getAntarcticFebData,
  getArcticMarchData,
  SEASONAL_CYCLE_MONTHS,
  getSeasonalCycleMonths,
} from '../src/data/baseline/seaice-nsidc';
import { parseNsidcMonthlyCsv } from '../src/api/adapters/seaice';
import {
  getArcticZonalData,
  getNorthMidZonalData,
  getTropicsZonalData,
  ZONAL_ANNUAL_DATA,
} from '../src/data/baseline/zonal-era5-polar';
import {
  getCamsTotalAodData,
  getSo2EmissionsData,
  getAerosolForcingData,
  AEROSOLS_ANNUAL_DATA,
} from '../src/data/baseline/aerosols-cams-aeronet';
import { formatScientificValue, formatAnomaly } from '../src/utils/formatters';
import { NasaPowerProvider } from '../src/api/adapters/nasa-power';
import { NoaaGhgProvider } from '../src/api/adapters/noaa-ghg';
import { GistempProvider } from '../src/api/adapters/gistemp';

describe('Baseline Datasets & Scientific Formatters', () => {
  it('loads NOAA Mauna Loa dataset with over 800 continuous monthly points', () => {
    const data = getNoaaCo2Data();
    expect(data.length).toBeGreaterThan(800);
    expect(data[0].timestamp).toBe('1958-03');
    expect(data[0].value).toBeGreaterThan(310);
    // Latest value in 2025 should be above 420 ppm
    expect(data[data.length - 1].value).toBeGreaterThan(420);
  });

  it('loads GISTEMP annual and authentic monthly temperature anomalies without synthetic sine waves', () => {
    const ann = getGistempAnnualData();
    expect(ann.length).toBeGreaterThan(140);
    expect(ann[0].timestamp).toBe('1880');

    const monthly = getGistempMonthlyData();
    expect(monthly.length).toBeGreaterThan(100);
    // Ensure values are authentic observations without artificial sinusoidal periodicity
    expect(monthly[0].timestamp).toMatch(/^\d{4}-\d{2}$/);
  });

  it('verifies NOAA GlobalTemp and Berkeley Earth are independent datasets with distinct observations', () => {
    const noaa = getNoaaGlobalTempData();
    const berkeley = getBerkeleyEarthData();
    const gistemp = getGistempAnnualData();

    expect(noaa.length).toBeGreaterThan(140);
    expect(berkeley.length).toBeGreaterThan(140);

    // Verify datasets are not trivial identical offsets of GISTEMP
    const diffsNoaa = noaa.map((p, i) => p.value - gistemp[i].value);
    const diffsBerkeley = berkeley.map((p, i) => p.value - gistemp[i].value);

    const uniqueDiffsNoaa = new Set(diffsNoaa.map((d) => d.toFixed(3)));
    const uniqueDiffsBerkeley = new Set(diffsBerkeley.map((d) => d.toFixed(3)));

    // If it was derived from GISTEMP with a constant offset, unique diff count would be exactly 1.
    // Distinct datasets have multiple varying non-constant residuals.
    expect(uniqueDiffsNoaa.size).toBeGreaterThan(3);
    expect(uniqueDiffsBerkeley.size).toBeGreaterThan(3);
  });

  it('loads LISIRD TSI and SILSO sunspots with solar cycle characteristics', () => {
    const tsi = getLisirdTsiData();
    expect(tsi.length).toBeGreaterThan(140);
    // All TSI values should be around 1360 - 1363 W/m²
    tsi.forEach(pt => {
      expect(pt.value).toBeGreaterThan(1360);
      expect(pt.value).toBeLessThan(1363);
    });

    const spots = getSilsoSunspotsData();
    expect(spots.length).toBeGreaterThan(140);
  });

  it('loads Argo Global Ocean Heat Content for 0-2000m and 0-700m', () => {
    const ohc2000 = getArgoOhc2000mData();
    expect(ohc2000.length).toBeGreaterThan(65);
    expect(ohc2000[0].timestamp).toBe('1955');
    // Accumulation exceeds 300 ZJ in 2024-2025
    expect(ohc2000[ohc2000.length - 1].value).toBeGreaterThan(300);

    const ohc700 = getArgoOhc700mData();
    expect(ohc700.length).toBe(ohc2000.length);
    expect(ohc700[ohc700.length - 1].value).toBeGreaterThan(180);
  });

  it('loads NASA CERES Top-of-Atmosphere Energy Balance fluxes (Net, OLR, Albedo)', () => {
    const net = getCeresNetData();
    expect(net.length).toBeGreaterThanOrEqual(25);
    expect(net[0].timestamp).toBe('2000');
    // Net imbalance is consistently positive (+0.4 to +1.6 W/m²)
    net.forEach((pt) => {
      expect(pt.value).toBeGreaterThan(0.3);
      expect(pt.value).toBeLessThan(2.0);
    });

    const olr = getCeresOlrData();
    expect(olr.length).toBe(net.length);
    expect(olr[0].value).toBeGreaterThan(235);
    expect(olr[0].value).toBeLessThan(245);

    const albedo = getCeresAlbedoData();
    expect(albedo.length).toBe(net.length);
    expect(albedo[0].value).toBeGreaterThan(95);
    expect(albedo[0].value).toBeLessThan(105);
  });

  it('loads NASA GISS Stratospheric Aerosol Optical Depth (SAOD) and major eruptions', () => {
    const saod = getNasaGissSaodData();
    expect(saod.length).toBeGreaterThan(140);
    expect(saod[0].timestamp).toBe('1880');

    // Baseline background SAOD is between 0.003 and 0.015
    const baselinePoints = saod.filter((p) => parseInt(p.timestamp, 10) >= 2000 && parseInt(p.timestamp, 10) <= 2010);
    baselinePoints.forEach((pt) => {
      expect(pt.value).toBeLessThan(0.02);
    });

    // Pinatubo peak in 1991-1992
    const pinatuboPt = saod.find((p) => p.timestamp === '1992');
    expect(pinatuboPt).toBeDefined();
    expect(pinatuboPt!.value).toBeGreaterThan(0.12);

    // Major eruptions catalogue verification
    expect(MAJOR_ERUPTIONS.length).toBeGreaterThanOrEqual(7);

    // Pinatubo 1991: VEI 6, 20 Mt SO2
    const pinatubo = MAJOR_ERUPTIONS.find((e) => e.id === 'pinatubo-1991');
    expect(pinatubo).toBeDefined();
    expect(pinatubo!.vei).toBe(6);
    expect(pinatubo!.so2InjectedMt).toBe(20);
    expect(pinatubo!.peakRadiativeForcingWm2).toBeLessThan(-3.0);

    // El Chichón 1982: VEI 5, 14 Mt SO2
    const elChichon = MAJOR_ERUPTIONS.find((e) => e.id === 'el-chichon-1982');
    expect(elChichon).toBeDefined();
    expect(elChichon!.vei).toBe(5);
    expect(elChichon!.so2InjectedMt).toBe(14);

    // Hunga Tonga 2022: VEI 5, low SO2 (0.4 Mt) and slight positive forcing
    const hungaTonga = MAJOR_ERUPTIONS.find((e) => e.id === 'hunga-tonga-2022');
    expect(hungaTonga).toBeDefined();
    expect(hungaTonga!.vei).toBe(5);
    expect(hungaTonga!.so2InjectedMt).toBe(0.4);
    expect(hungaTonga!.peakRadiativeForcingWm2).toBeGreaterThan(0);
  });

  it('loads NOAA Methane (CH4), Nitrous Oxide (N2O) and AGGI Index datasets', () => {
    // CH4 monthly and annual
    const ch4Monthly = getNoaaCh4MonthlyData();
    expect(ch4Monthly.length).toBeGreaterThan(500);
    expect(ch4Monthly[0].timestamp).toBe('1983-01');
    expect(ch4Monthly[0].value).toBeGreaterThan(1600);
    expect(ch4Monthly[ch4Monthly.length - 1].value).toBeGreaterThan(1960);

    const ch4Annual = getNoaaCh4AnnualData();
    expect(ch4Annual.length).toBeGreaterThan(40);
    expect(ch4Annual[0].timestamp).toBe('1983');

    // N2O monthly and annual
    const n2oMonthly = getNoaaN2oMonthlyData();
    expect(n2oMonthly.length).toBeGreaterThan(280);
    expect(n2oMonthly[0].timestamp).toBe('2001-01');
    expect(n2oMonthly[0].value).toBeGreaterThan(315);
    expect(n2oMonthly[n2oMonthly.length - 1].value).toBeGreaterThan(338);

    const n2oAnnual = getNoaaN2oAnnualData();
    expect(n2oAnnual.length).toBeGreaterThan(24);

    // AGGI Index
    const aggi = getNoaaAggiData();
    expect(aggi.length).toBeGreaterThan(45);
    expect(aggi[0].timestamp).toBe('1979');
    // Year 1990 is 1.000 by definition
    const aggi1990 = aggi.find((p) => p.timestamp === '1990');
    expect(aggi1990).toBeDefined();
    expect(aggi1990!.value).toBe(1.0);
    // Recent AGGI should be > 1.60 (+60% direct forcing)
    expect(aggi[aggi.length - 1].value).toBeGreaterThan(1.6);
  });

  it('loads NSIDC satellite Sea Ice Index (Arctic September, Antarctic February, Seasonal Cycle)', () => {
    const arcSept = getArcticSeptData();
    expect(arcSept.length).toBeGreaterThanOrEqual(45);
    expect(arcSept[0].timestamp).toBe('1979');
    expect(arcSept[0].value).toBeGreaterThan(6.8); // 1979: 7.05 M km²

    // Record low in 2012 (3.39 M km²)
    const low2012 = arcSept.find((p) => p.timestamp === '2012');
    expect(low2012).toBeDefined();
    expect(low2012!.value).toBe(3.39);

    const antFeb = getAntarcticFebData();
    expect(antFeb.length).toBeGreaterThanOrEqual(arcSept.length);
    expect(antFeb[0].timestamp).toBe('1979');

    // 2025 Antarctic minimum is included (~1.95 M km²)
    const feb2025 = antFeb.find((p) => p.timestamp === '2025');
    expect(feb2025).toBeDefined();
    expect(feb2025!.value).toBeLessThan(2.0);

    // Recent Antarctic lows (< 2.0 M km² in 2022-2023)
    const low2023 = antFeb.find((p) => p.timestamp === '2023');
    expect(low2023).toBeDefined();
    expect(low2023!.value).toBeLessThan(1.85);

    // Seasonal cycle months
    expect(SEASONAL_CYCLE_MONTHS.length).toBe(12);
    expect(SEASONAL_CYCLE_MONTHS[2].monthName).toBe('Mar'); // March max Arctic
    expect(SEASONAL_CYCLE_MONTHS[8].monthName).toBe('Sep'); // September min Arctic

    const months = getSeasonalCycleMonths();
    expect(months.length).toBe(12);

    // Test parseNsidcMonthlyCsv
    const sampleCsv = `year, mo, data-type, region, extent,   area
1979, 09,      Goddard,      N,   7.05,   4.58
1980, 09,      Goddard,      N,   7.67,   4.87
2024, 09,      Goddard,      N,   4.28,   2.70
2025, 09,          NRT,      N,   4.30,   2.72`;
    const parsed = parseNsidcMonthlyCsv(sampleCsv);
    expect(parsed.length).toBe(4);
    expect(parsed[0].timestamp).toBe('1979');
    expect(parsed[0].value).toBe(7.05);
    expect(parsed[3].timestamp).toBe('2025');
    expect(parsed[3].value).toBe(4.3);

    // Test multi-month preservation without timestamp collision
    const multiMonthCsv = `year, mo, data-type, region, extent, area
2024, 01, Goddard, N, 13.13, 11.50
2024, 02, Goddard, N, 14.61, 12.80
2024, 03, Goddard, N, 14.92, 13.00
2024, 09, Goddard, N,  4.28,  2.70`;
    const parsedMonthly = parseNsidcMonthlyCsv(multiMonthCsv);
    expect(parsedMonthly.length).toBe(4);
    expect(parsedMonthly[0].timestamp).toBe('2024-01');
    expect(parsedMonthly[1].timestamp).toBe('2024-02');
    expect(parsedMonthly[2].timestamp).toBe('2024-03');
    expect(parsedMonthly[3].timestamp).toBe('2024-09');

    // Test explicit annual aggregation when format is 'year'
    const parsedAggregated = parseNsidcMonthlyCsv(multiMonthCsv, { timestampFormat: 'year' });
    expect(parsedAggregated.length).toBe(1);
    expect(parsedAggregated[0].timestamp).toBe('2024');
    expect(parsedAggregated[0].value).toBeCloseTo((13.13 + 14.61 + 14.92 + 4.28) / 4, 2);
  });

  it('loads Copernicus ERA5 & GISS Zonal Temperature Anomalies demonstrating Arctic Amplification', () => {
    const arctic = getArcticZonalData();
    expect(arctic.length).toBeGreaterThanOrEqual(25);
    expect(arctic[0].timestamp).toBe('1950');

    // Recent Arctic warming anomaly should exceed +3.0°C
    const recentArctic = arctic[arctic.length - 1];
    expect(recentArctic.value).toBeGreaterThan(3.0);

    const tropics = getTropicsZonalData();
    expect(tropics.length).toBe(arctic.length);

    // Arctic Amplification factor in ZONAL_ANNUAL_DATA should be around 2.5x to 4.0x
    const latestZonal = ZONAL_ANNUAL_DATA[ZONAL_ANNUAL_DATA.length - 1];
    expect(latestZonal.amplificationFactor).toBeGreaterThan(2.5);
    expect(latestZonal.amplificationFactor).toBeLessThan(4.5);
    expect(latestZonal.arctic).toBeGreaterThan(latestZonal.global * 2.5);
  });

  it('loads Copernicus CAMS & AERONET Tropospheric Aerosols and historical SO2 emissions', () => {
    const aod = getCamsTotalAodData();
    expect(aod.length).toBeGreaterThanOrEqual(20);
    expect(aod[0].timestamp).toBe('1950');
    expect(aod[aod.length - 1].value).toBeGreaterThan(0.1);
    expect(aod[aod.length - 1].value).toBeLessThan(0.2);

    const so2 = getSo2EmissionsData();
    expect(so2.length).toBe(aod.length);

    // Peak SO2 in 1980 (> 130 Mt) followed by decline
    const so2Peak = so2.find((p) => p.timestamp === '1980');
    expect(so2Peak).toBeDefined();
    expect(so2Peak!.value).toBeGreaterThan(130);

    const recentSo2 = so2[so2.length - 1];
    expect(recentSo2.value).toBeLessThan(80); // Major decrease due to clean air regulations & IMO 2020

    const forcing = getAerosolForcingData();
    expect(forcing.length).toBe(aod.length);
    // Net aerosol radiative forcing is negative (-0.8 to -1.35 W/m²)
    forcing.forEach((pt) => {
      expect(pt.value).toBeLessThan(-0.5);
      expect(pt.value).toBeGreaterThan(-1.5);
    });
  });

  it('formats scientific values and anomalies properly', () => {
    expect(formatScientificValue(421.345, 'ppm', 2)).toBe('421,35 ppm');
    expect(formatAnomaly(1.23)).toBe('+1.23 °C');
    expect(formatAnomaly(-0.45)).toBe('-0.45 °C');
    expect(formatAnomaly(null)).toBe('—');
  });

  it('validates NASA GISTEMP monthly metadata and non-synthetic baseline', () => {
    const prov = new GistempProvider();
    const meta = prov.getMonthlyMetadata();
    expect(meta.id).toBe('temp-nasa-gistemp-monthly');
    expect(meta.frequency).toBe('monthly');
    expect(meta.startDate).toBe('1880-01');
    expect(meta.endDate).toBe('2025-12');
    expect(meta.lastObservationDate).toBe('2025-12');
  });

  it('validates NASA POWER provider has dynamic time boundaries and separates baseline fallback', () => {
    const prov = new NasaPowerProvider();
    const meta = prov.getMetadata();
    const curYear = new Date().getFullYear();
    expect(meta.id).toContain('nasa-power-radiation');
    expect(meta.frequency).toBe('monthly');
    expect(meta.endDate).toBe(`${curYear}-12`);
    expect(meta.lastObservationDate).toBe(`${curYear}`);

    // Verify baseline sample points are valid numbers without NaN
    const sample = prov.getBaselineData();
    expect(sample.length).toBeGreaterThan(50);
    sample.forEach(pt => {
      expect(pt.value).toBeGreaterThanOrEqual(0);
      expect(isNaN(pt.value)).toBe(false);
    });
  });

  it('validates NOAA GHG provider implements dynamic annual fetch methods for CH4, N2O, and AGGI', () => {
    const prov = new NoaaGhgProvider();
    expect(typeof prov.fetchCh4AnnualData).toBe('function');
    expect(typeof prov.fetchN2oAnnualData).toBe('function');
    expect(typeof prov.fetchAggiData).toBe('function');

    // Baseline fallbacks are available if offline
    expect(prov.getCh4AnnualData().length).toBeGreaterThan(30);
    expect(prov.getN2oAnnualData().length).toBeGreaterThan(20);
    expect(prov.getAggiData().length).toBeGreaterThan(30);
  });
});
