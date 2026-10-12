import React, { useState } from 'react';
import { ComparisonChart, SeriesConfig } from '../components/charts/ComparisonChart';
import { ScatterPlotChart } from '../components/charts/ScatterPlotChart';
import { useDataset } from '../hooks/useDataset';
import { exportMultiSeriesToCSV } from '../utils/export';
import { Scale, Info, Layers, Sliders, Download, ScatterChart as ScatterIcon } from 'lucide-react';

export const ComparatorPage: React.FC = () => {
  const tsi = useDataset('solar-tsi-lisird');
  const co2 = useDataset('co2-noaa-mauna-loa');
  const ch4 = useDataset('ghg-ch4-noaa');
  const n2o = useDataset('ghg-n2o-noaa');
  const aggi = useDataset('ghg-aggi-noaa');
  const temp = useDataset('temp-nasa-gistemp');
  const ocean = useDataset('ocean-ohc-argo-2000m');
  const ceres = useDataset('energy-ceres-net-toa');
  const volcano = useDataset('volcano-saod-giss');
  const ice = useDataset('seaice-arctic-september-nsidc');
  const antarcticIce = useDataset('seaice-antarctic-february-nsidc');
  const zonal = useDataset('zonal-temp-arctic-era5');
  const aerosols = useDataset('aerosols-cams-total-aod');
  const power = useDataset('nasa-power-radiation');

  // Series selection states
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({
    'solar-tsi-lisird': true,
    'co2-noaa-mauna-loa': true,
    'ghg-ch4-noaa': false,
    'ghg-n2o-noaa': false,
    'ghg-aggi-noaa': false,
    'temp-nasa-gistemp': true,
    'zonal-temp-arctic-era5': false,
    'seaice-arctic-september-nsidc': false,
    'seaice-antarctic-february-nsidc': false,
    'ocean-ohc-argo-2000m': false,
    'energy-ceres-net-toa': false,
    'volcano-saod-giss': false,
    'aerosols-cams-total-aod': false,
    'nasa-power-radiation': false,
  });

  const [showScatter, setShowScatter] = useState<boolean>(true);

  const toggleSeries = (id: string) => {
    setEnabledMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Compile series configs
  const seriesConfigs: SeriesConfig[] = [
    {
      id: 'solar-tsi-lisird',
      metadata: tsi.dataset?.metadata || {
        id: 'solar-tsi-lisird',
        name: 'Irradiance Solaire Totale (TSI)',
        shortName: '☀️ Soleil (TSI)',
        organization: 'NASA / LASP',
        source: 'LISIRD',
        sourceUrl: '',
        variable: 'TSI',
        variableSymbol: 'TSI',
        unit: 'Watts/m²',
        unitSymbol: 'W/m²',
        frequency: 'annual',
        startDate: '1880',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: tsi.dataset?.data || [],
      color: '#f59e0b', // amber
      enabled: !!enabledMap['solar-tsi-lisird'],
    },
    {
      id: 'co2-noaa-mauna-loa',
      metadata: co2.dataset?.metadata || {
        id: 'co2-noaa-mauna-loa',
        name: 'CO₂ Mauna Loa',
        shortName: '🧪 CO₂ (Mauna Loa)',
        organization: 'NOAA GML',
        source: 'NOAA',
        sourceUrl: '',
        variable: 'CO2',
        variableSymbol: 'CO₂',
        unit: 'ppm',
        unitSymbol: 'ppm',
        frequency: 'monthly',
        startDate: '1958',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: co2.dataset?.data || [],
      color: '#10b981', // emerald
      enabled: !!enabledMap['co2-noaa-mauna-loa'],
    },
    {
      id: 'ghg-ch4-noaa',
      metadata: ch4.dataset?.metadata || {
        id: 'ghg-ch4-noaa',
        name: 'Méthane Atmosphérique Global (CH₄)',
        shortName: '⚡ Méthane (CH₄)',
        organization: 'NOAA GML',
        source: 'NOAA MBL',
        sourceUrl: '',
        variable: 'CH4',
        variableSymbol: 'CH₄',
        unit: 'ppb',
        unitSymbol: 'ppb',
        frequency: 'monthly',
        startDate: '1983',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: ch4.dataset?.data || [],
      color: '#f59e0b', // amber
      enabled: !!enabledMap['ghg-ch4-noaa'],
    },
    {
      id: 'ghg-n2o-noaa',
      metadata: n2o.dataset?.metadata || {
        id: 'ghg-n2o-noaa',
        name: 'Protoxyde d’Azote (N₂O)',
        shortName: '🌾 Protoxyde d’azote (N₂O)',
        organization: 'NOAA GML',
        source: 'NOAA HATS',
        sourceUrl: '',
        variable: 'N2O',
        variableSymbol: 'N₂O',
        unit: 'ppb',
        unitSymbol: 'ppb',
        frequency: 'monthly',
        startDate: '2001',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: n2o.dataset?.data || [],
      color: '#818cf8', // indigo
      enabled: !!enabledMap['ghg-n2o-noaa'],
    },
    {
      id: 'ghg-aggi-noaa',
      metadata: aggi.dataset?.metadata || {
        id: 'ghg-aggi-noaa',
        name: 'Indice Forçage Cumulé (AGGI)',
        shortName: '📊 Indice AGGI NOAA',
        organization: 'NOAA GML',
        source: 'NOAA AGGI',
        sourceUrl: '',
        variable: 'AGGI',
        variableSymbol: 'AGGI',
        unit: 'Indice',
        unitSymbol: 'AGGI',
        frequency: 'annual',
        startDate: '1979',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: aggi.dataset?.data || [],
      color: '#fb7185', // rose-400
      enabled: !!enabledMap['ghg-aggi-noaa'],
    },
    {
      id: 'temp-nasa-gistemp',
      metadata: temp.dataset?.metadata || {
        id: 'temp-nasa-gistemp',
        name: 'Anomalie Température GISTEMP',
        shortName: '🌡️ Température (NASA)',
        organization: 'NASA GISS',
        source: 'GISTEMP v4',
        sourceUrl: '',
        variable: 'ΔT',
        variableSymbol: 'ΔT',
        unit: '°C',
        unitSymbol: '°C',
        frequency: 'annual',
        startDate: '1880',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: temp.dataset?.data || [],
      color: '#f43f5e', // rose
      enabled: !!enabledMap['temp-nasa-gistemp'],
    },
    {
      id: 'ocean-ohc-argo-2000m',
      metadata: ocean.dataset?.metadata || {
        id: 'ocean-ohc-argo-2000m',
        name: 'Contenu Thermique Océans (0-2000m)',
        shortName: '🌊 Océans (OHC)',
        organization: 'Argo / NOAA',
        source: 'NOAA NCEI',
        sourceUrl: '',
        variable: 'OHC',
        variableSymbol: 'OHC',
        unit: 'Zettajoules',
        unitSymbol: 'ZJ',
        frequency: 'annual',
        startDate: '1955',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: ocean.dataset?.data || [],
      color: '#3b82f6', // blue
      enabled: !!enabledMap['ocean-ohc-argo-2000m'],
    },
    {
      id: 'energy-ceres-net-toa',
      metadata: ceres.dataset?.metadata || {
        id: 'energy-ceres-net-toa',
        name: 'Bilan Énergétique Net (EEI)',
        shortName: '🌍 CERES Bilan Net',
        organization: 'NASA Langley',
        source: 'CERES EBAF',
        sourceUrl: '',
        variable: 'Net_TOA',
        variableSymbol: 'Net',
        unit: 'W/m²',
        unitSymbol: 'W/m²',
        frequency: 'annual',
        startDate: '2000',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: ceres.dataset?.data || [],
      color: '#eab308', // amber
      enabled: !!enabledMap['energy-ceres-net-toa'],
    },
    {
      id: 'volcano-saod-giss',
      metadata: volcano.dataset?.metadata || {
        id: 'volcano-saod-giss',
        name: 'Aérosols Stratosphériques (SAOD)',
        shortName: '🌋 Volcans (SAOD)',
        organization: 'NASA GISS',
        source: 'NASA GISS',
        sourceUrl: '',
        variable: 'SAOD',
        variableSymbol: 'SAOD',
        unit: 'Indice',
        unitSymbol: 'SAOD',
        frequency: 'annual',
        startDate: '1880',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: volcano.dataset?.data || [],
      color: '#f97316', // orange
      enabled: !!enabledMap['volcano-saod-giss'],
    },
    {
      id: 'zonal-temp-arctic-era5',
      metadata: zonal.dataset?.metadata || {
        id: 'zonal-temp-arctic-era5',
        name: 'Arctique (90°N–64°N) ERA5 / GISS',
        shortName: '🌎 Arctique ERA5',
        organization: 'Copernicus / GISS',
        source: 'ERA5 / GISS',
        sourceUrl: '',
        variable: 'ΔT_Arctique',
        variableSymbol: 'ΔT',
        unit: '°C',
        unitSymbol: '°C',
        frequency: 'annual',
        startDate: '1950',
        endDate: '2024',
        retrievedAt: '',
        description: '',
      },
      data: zonal.dataset?.data || [],
      color: '#a855f7', // purple
      enabled: !!enabledMap['zonal-temp-arctic-era5'],
    },
    {
      id: 'seaice-arctic-september-nsidc',
      metadata: ice.dataset?.metadata || {
        id: 'seaice-arctic-september-nsidc',
        name: 'Banquise Arctique (Septembre)',
        shortName: '🧊 Banquise Arctique',
        organization: 'NSIDC / NASA',
        source: 'NSIDC v3',
        sourceUrl: '',
        variable: 'Extent',
        variableSymbol: 'SIE',
        unit: 'M km²',
        unitSymbol: 'M km²',
        frequency: 'annual',
        startDate: '1979',
        endDate: '2024',
        retrievedAt: '',
        description: '',
      },
      data: ice.dataset?.data || [],
      color: '#06b6d4', // cyan
      enabled: !!enabledMap['seaice-arctic-september-nsidc'],
    },
    {
      id: 'seaice-antarctic-february-nsidc',
      metadata: antarcticIce.dataset?.metadata || {
        id: 'seaice-antarctic-february-nsidc',
        name: 'Banquise Antarctique (Février)',
        shortName: '🧊 Banquise Antarctique',
        organization: 'NSIDC / NASA',
        source: 'NSIDC v3',
        sourceUrl: '',
        variable: 'Extent',
        variableSymbol: 'SIE_Ant',
        unit: 'M km²',
        unitSymbol: 'M km²',
        frequency: 'annual',
        startDate: '1979',
        endDate: '2025',
        retrievedAt: '',
        description: '',
      },
      data: antarcticIce.dataset?.data || [],
      color: '#818cf8', // indigo
      enabled: !!enabledMap['seaice-antarctic-february-nsidc'],
    },
    {
      id: 'aerosols-cams-total-aod',
      metadata: aerosols.dataset?.metadata || {
        id: 'aerosols-cams-total-aod',
        name: 'Aérosols Troposphériques (AOD)',
        shortName: '☁️ Aérosols (AOD)',
        organization: 'Copernicus CAMS',
        source: 'CAMS EAC4',
        sourceUrl: '',
        variable: 'AOD_550',
        variableSymbol: 'AOD',
        unit: 'AOD',
        unitSymbol: 'AOD',
        frequency: 'annual',
        startDate: '2000',
        endDate: '2024',
        retrievedAt: '',
        description: '',
      },
      data: aerosols.dataset?.data || [],
      color: '#38bdf8', // sky
      enabled: !!enabledMap['aerosols-cams-total-aod'],
    },
    {
      id: 'nasa-power-radiation',
      metadata: power.dataset?.metadata || {
        id: 'nasa-power-radiation',
        name: 'Rayonnement Sol (NASA POWER)',
        shortName: '☀️ Rayonnement Sol',
        organization: 'NASA Langley',
        source: 'NASA POWER',
        sourceUrl: '',
        variable: 'ALLSKY_SW',
        variableSymbol: 'SW',
        unit: 'kWh/m²/j',
        unitSymbol: 'kWh/m²/j',
        frequency: 'monthly',
        startDate: '2015',
        endDate: '2024',
        retrievedAt: '',
        description: '',
      },
      data: power.dataset?.data || [],
      color: '#06b6d4', // cyan
      enabled: !!enabledMap['nasa-power-radiation'],
    },
  ];

  const activeSeries = seriesConfigs.filter((s) => s.enabled);

  const handleExportCSV = () => {
    if (activeSeries.length === 0) return;
    exportMultiSeriesToCSV(
      activeSeries.map((s) => ({ metadata: s.metadata, data: s.data })),
      'climatoscope_multi_series_aligned.csv'
    );
  };

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-700/40 text-indigo-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Écran Comparateur — Multi-Séries Synchronisées
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Superposition objective, normalisation mathématique et corrélation statistique
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSeries.length >= 2 && (
            <button
              onClick={() => setShowScatter(!showScatter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                showScatter
                  ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScatterIcon className="w-3.5 h-3.5" />
              <span>Nuage de dispersion</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={activeSeries.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition cursor-pointer"
            title="Exporter les séries synchronisées sélectionnées"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Explanatory Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Comment comparer des grandeurs physiques différentes ?</strong>
          <br />
          L’irradiance solaire s’exprime en <code className="text-amber-300 font-mono">W/m²</code>, la concentration de CO₂ en <code className="text-emerald-300 font-mono">ppm</code>, la température en <code className="text-rose-300 font-mono">°C</code> et le contenu thermique des océans en <code className="text-blue-300 font-mono">ZJ</code>.
          Pour les analyser sur un axe commun sans biais d'échelle, sélectionnez le <strong>Z-score</strong> (centré-réduit : nombre d'écarts-types par rapport à la moyenne) ou l'<strong>Indice 100</strong> (base 100 au point de départ).
        </div>
      </div>

      {/* Synchronized Comparison Chart */}
      <ComparisonChart seriesConfigs={seriesConfigs} onToggleSeries={toggleSeries} />

      {/* Optional Bivariate Scatter Plot between first two active series */}
      {showScatter && activeSeries.length >= 2 && (
        <ScatterPlotChart
          seriesA={{ metadata: activeSeries[0].metadata, data: activeSeries[0].data, color: activeSeries[0].color }}
          seriesB={{ metadata: activeSeries[1].metadata, data: activeSeries[1].data, color: activeSeries[1].color }}
          periodCutoff="1950"
        />
      )}

      {/* Methodological Guidance */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-3">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Clés d'interprétation des divergences historiques :
        </h4>
        <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
          <li>
            <strong className="text-slate-300">De 1880 à 1960 :</strong> L'irradiance solaire (TSI) et la température globale présentent toutes deux une légère hausse conjointe, suggérant une contribution solaire non négligeable au réchauffement du début du 20e siècle.
          </li>
          <li>
            <strong className="text-slate-300">Depuis 1960–1980 (Le grand découplage) :</strong> L'activité solaire mesurée par satellites diminue légèrement d'un cycle à l'autre (TSI en plateau ou légère baisse séculaire), tandis que la concentration de CO₂, l'anomalie de température et le contenu thermique des océans (OHC) augmentent de façon continue et accélérée.
          </li>
          <li>
            <strong className="text-slate-300">Rappel physique :</strong> Deux séries fortement corrélées (ex: CO₂ et OHC, |r| &gt; 0.98) nécessitent la validation d'un mécanisme physique de transfert radiatif pour passer de la corrélation statistique à la causalité établie.
          </li>
        </ul>
      </div>
    </div>
  );
};
