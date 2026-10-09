import { describe, it, expect } from 'vitest';
import { getNoaaCo2Data } from '../src/data/baseline/co2-noaa-maunaloa';
import { getGistempAnnualData, getGistempMonthlyData } from '../src/data/baseline/temperature-gistemp';
import { getLisirdTsiData } from '../src/data/baseline/solar-tsi-lisird';
import { getSilsoSunspotsData } from '../src/data/baseline/solar-sunspots';
import { getArgoOhc2000mData, getArgoOhc700mData } from '../src/data/baseline/ocean-argo';
import { getCeresNetData, getCeresOlrData, getCeresAlbedoData } from '../src/data/baseline/energy-ceres';
import { getNasaGissSaodData, MAJOR_ERUPTIONS } from '../src/data/baseline/volcano-saod';
import { formatScientificValue, formatAnomaly } from '../src/utils/formatters';

describe('Baseline Datasets & Scientific Formatters', () => {
  it('loads NOAA Mauna Loa dataset with over 800 continuous monthly points', () => {
    const data = getNoaaCo2Data();
    expect(data.length).toBeGreaterThan(800);
    expect(data[0].timestamp).toBe('1958-03');
    expect(data[0].value).toBeGreaterThan(310);
    // Latest value in 2025 should be above 420 ppm
    expect(data[data.length - 1].value).toBeGreaterThan(420);
  });

  it('loads GISTEMP annual and monthly temperature anomalies starting in 1880', () => {
    const ann = getGistempAnnualData();
    expect(ann.length).toBeGreaterThan(140);
    expect(ann[0].timestamp).toBe('1880');

    const monthly = getGistempMonthlyData();
    expect(monthly.length).toBeGreaterThan(1600);
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

  it('formats scientific values and anomalies properly', () => {
    expect(formatScientificValue(421.345, 'ppm', 2)).toBe('421,35 ppm');
    expect(formatAnomaly(1.23)).toBe('+1.23 °C');
    expect(formatAnomaly(-0.45)).toBe('-0.45 °C');
    expect(formatAnomaly(null)).toBe('—');
  });
});
