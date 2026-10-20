import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Area,
} from 'recharts';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { ContextualBanner } from '../components/common/ContextualBanner';
import { HelpTooltip } from '../components/common/HelpTooltip';
import { MAJOR_ERUPTIONS, VolcanicEruption } from '../data/baseline/volcano-saod';
import { useDataset } from '../hooks/useDataset';
import { exportDatasetToCSV, exportDatasetToJSON } from '../utils/export';
import { formatScientificValue } from '../utils/formatters';
import {
  Flame,
  Info,
  Download,
  ShieldCheck,
  Sparkles,
  MapPin,
  Layers,
  Thermometer,
  Sliders,
  Calculator,
  Compass,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Activity,
} from 'lucide-react';

type ChartMode = 'saod' | 'combined-temp' | 'forcing';
type PeriodFilter = 'all' | 'satellite' | 'pinatubo' | 'el-chichon' | 'hunga-tonga';

interface VeiLevel {
  level: number;
  label: string;
  ejectaVolume: string;
  plumeHeight: string;
  frequency: string;
  historicalExample: string;
  climateImpact: string;
  badgeColor: string;
}

const VEI_LEVELS: VeiLevel[] = [
  {
    level: 0,
    label: 'Hawaïen (Effusif)',
    ejectaVolume: '< 10 000 m³',
    plumeHeight: '< 100 m',
    frequency: 'Quotidien / Continu',
    historicalExample: 'Kīlauea (Hawaï)',
    climateImpact: 'Nul (pas d’injection stratosphérique)',
    badgeColor: 'text-slate-400 bg-slate-900 border-slate-700',
  },
  {
    level: 1,
    label: 'Strombolien',
    ejectaVolume: '> 10 000 m³',
    plumeHeight: '100 m – 1 km',
    frequency: 'Quotidien',
    historicalExample: 'Stromboli (Italie)',
    climateImpact: 'Nul',
    badgeColor: 'text-slate-400 bg-slate-900 border-slate-700',
  },
  {
    level: 2,
    label: 'Vulcanien',
    ejectaVolume: '> 1 000 000 m³',
    plumeHeight: '1 – 5 km',
    frequency: 'Hebdomadaire',
    historicalExample: 'Galeras (Colombie, 1992)',
    climateImpact: 'Nul (confiné à la troposphère basse)',
    badgeColor: 'text-slate-300 bg-slate-900 border-slate-700',
  },
  {
    level: 3,
    label: 'Sub-Plinien',
    ejectaVolume: '> 10 000 000 m³',
    plumeHeight: '3 – 15 km',
    frequency: 'Annuel (~25/an)',
    historicalExample: 'Nevado del Ruiz (1985)',
    climateImpact: 'Négligeable (retombée rapide)',
    badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-800/60',
  },
  {
    level: 4,
    label: 'Plinien',
    ejectaVolume: '> 0,1 km³',
    plumeHeight: '10 – 25 km',
    frequency: '~1 fois par an',
    historicalExample: 'Eyjafjallajökull (2010)',
    climateImpact: 'Faible à modéré local si riche en SO₂',
    badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-700',
  },
  {
    level: 5,
    label: 'Paroxystique',
    ejectaVolume: '> 1 km³',
    plumeHeight: '> 25 km (stratosphère)',
    frequency: '~1 tous les 10-12 ans',
    historicalExample: 'El Chichón (1982), Hunga Tonga (2022), St Helens (1980), Agung (1963)',
    climateImpact: 'Important : pénétration stratosphérique, forçage mondial transitoire (-0,2°C à -0,3°C)',
    badgeColor: 'text-orange-400 bg-orange-950/90 border-orange-600 font-bold',
  },
  {
    level: 6,
    label: 'Colossal',
    ejectaVolume: '> 10 km³',
    plumeHeight: '> 30 km (haute stratosphère)',
    frequency: '~1 tous les 100 ans',
    historicalExample: 'Pinatubo (1991), Krakatoa (1883), Katmai / Novarupta (1912), Santa María (1902)',
    climateImpact: 'Majeur : voile d’aérosols hémisphérique/global, baisse de ~0,4°C à 0,5°C pendant 2 à 3 ans',
    badgeColor: 'text-rose-400 bg-rose-950/90 border-rose-600 font-bold',
  },
  {
    level: 7,
    label: 'Super-Colossal',
    ejectaVolume: '> 100 km³',
    plumeHeight: '> 40 km',
    frequency: '~1 tous les 1 000 ans',
    historicalExample: 'Tambora (1815 — « année sans été » 1816), Santorin (~1600 av. J.-C.)',
    climateImpact: 'Sévère : perturbation climatique multi-annuelle planétaire (-1°C à -1,5°C mondial)',
    badgeColor: 'text-purple-400 bg-purple-950/90 border-purple-600 font-bold',
  },
  {
    level: 8,
    label: 'Méga-Colossal (Supervolcan)',
    ejectaVolume: '> 1 000 km³',
    plumeHeight: '> 50 km',
    frequency: '~1 tous les 50 000 ans',
    historicalExample: 'Toba (~74 000 BP), Yellowstone (Huckleberry Ridge)',
    climateImpact: 'Hiver volcanique pluriannuel majeur',
    badgeColor: 'text-red-400 bg-red-950/90 border-red-500 font-bold',
  },
];

export const VolcanoPage: React.FC = () => {
  const volcano = useDataset('volcano-saod-giss');
  const temp = useDataset('temp-nasa-gistemp');

  const [selectedEruption, setSelectedEruption] = useState<VolcanicEruption>(MAJOR_ERUPTIONS[5]); // Default to Pinatubo 1991
  const [chartMode, setChartMode] = useState<ChartMode>('combined-temp');
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [activeTab, setActiveTab] = useState<'chart' | 'eruptions' | 'vei-scale' | 'simulator'>('chart');

  // Simulator state
  const [simSo2, setSimSo2] = useState<number>(20); // Default to Pinatubo's 20 Mt

  const handleExport = (format: 'csv' | 'json') => {
    if (!volcano.dataset) return;
    if (format === 'csv') {
      exportDatasetToCSV(volcano.dataset.metadata, volcano.dataset.data);
    } else {
      exportDatasetToJSON(volcano.dataset.metadata, volcano.dataset.data);
    }
  };

  // Compile combined time series for Chart (SAOD + GISTEMP + Radiative Forcing)
  const chartData = useMemo(() => {
    if (!volcano.dataset) return [];

    const saodPoints = volcano.dataset.data;
    const tempPoints = temp.dataset?.data || [];

    // Map temp by year
    const tempMap = new Map<string, number>();
    tempPoints.forEach((p) => {
      const year = p.timestamp.substring(0, 4);
      tempMap.set(year, p.value);
    });

    let filteredSaod = saodPoints;
    if (period === 'satellite') {
      filteredSaod = saodPoints.filter((p) => parseInt(p.timestamp, 10) >= 1970);
    } else if (period === 'pinatubo') {
      filteredSaod = saodPoints.filter((p) => {
        const y = parseInt(p.timestamp, 10);
        return y >= 1988 && y <= 1998;
      });
    } else if (period === 'el-chichon') {
      filteredSaod = saodPoints.filter((p) => {
        const y = parseInt(p.timestamp, 10);
        return y >= 1978 && y <= 1988;
      });
    } else if (period === 'hunga-tonga') {
      filteredSaod = saodPoints.filter((p) => {
        const y = parseInt(p.timestamp, 10);
        return y >= 2018 && y <= 2025;
      });
    }

    return filteredSaod.map((p) => {
      const year = p.timestamp;
      const saodVal = p.value;
      const tVal = tempMap.has(year) ? tempMap.get(year)! : null;
      // Formula: ΔF_volcan ≈ -21 × SAOD (W/m²)
      const forcingVal = Number((-21 * saodVal).toFixed(3));

      // Find if this year matches a major eruption
      const eruptionMatch = MAJOR_ERUPTIONS.find((e) => e.year.toString() === year);

      return {
        year,
        saod: saodVal,
        temperature: tVal,
        forcing: forcingVal,
        eruptionName: eruptionMatch ? eruptionMatch.name : null,
      };
    });
  }, [volcano.dataset, temp.dataset, period]);

  // Simulator derived results
  const simResults = useMemo(() => {
    // Empirical relations based on Hansen et al. (2005) & Sato et al. (1993)
    const peakSaod = Number((simSo2 * 0.00775).toFixed(3));
    const radiativeForcing = Number((-21 * peakSaod).toFixed(2));
    // Transient climate response to pulse: ~0.12 °C per W/m²
    const estimatedCooling = Number((radiativeForcing * 0.12).toFixed(2));

    return {
      peakSaod,
      radiativeForcing,
      estimatedCooling,
    };
  }, [simSo2]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-orange-950/80 border border-orange-700/50 text-orange-400 shadow-lg shadow-orange-950/40">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
                  <span>Module 🌋 Volcanisme & Forçage Aérosol Stratosphérique</span>
                  <HelpTooltip
                    title="Aérosols Volcaniques Stratosphériques"
                    content="Les éruptions explosives injectent du dioxyde de soufre (SO₂) dans la stratosphère, formant des gouttelettes d'acide sulfurique (H₂SO₄) qui réfléchissent le rayonnement solaire et refroidissent temporairement la surface."
                  />
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                  V0.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Épaisseur optique SAOD (NASA GISS Sato et al.) & Indice VEI (Smithsonian GVP)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={volcano.status} onRefresh={volcano.refresh} />
          <QualityBadge report={volcano.qualityReport} />
          {volcano.dataset && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExport('csv')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter les données SAOD en CSV"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter les données SAOD en JSON"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Onboarding Banner */}
      <ContextualBanner
        screenId="volcano_saod"
        title="Forçage radiatif volcanique & Épaisseur optique SAOD"
        summary="Les grandes éruptions explosives (VEI ≥ 5) projettent des millions de tonnes de dioxyde de soufre (SO₂) au-delà de la tropopause, créant un voile réflecteur d'aérosols sulfatés qui persiste 1 à 3 ans."
        sourceOrg="NASA GISS (Sato et al.) & Smithsonian Institution Global Volcanism Program"
        methodologyNote="Épaisseur optique des aérosols stratosphériques à 550 nm (SAOD). Relation empirique du forçage radiatif : ΔF_volcan ≈ -21 × SAOD (W/m²), induisant une baisse transitoire des températures de surface."
        keyTakeaway="Contrairement aux gaz à effet de serre persistants (CO₂ : siècles à millénaires), le forçage volcanique est un forçage pulsé et transitoire : les aérosols retombent par sédimentation et lessivage en 2 ans environ."
        defaultOpen={true}
      />

      {/* Main Educational Context Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed shadow-lg">
        <div className="flex items-start gap-3.5">
          <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div>
              <strong className="text-white text-sm">
                Comment les éruptions volcaniques modulent-elles temporairement le climat terrestre ?
              </strong>
            </div>
            <p>
              Lorsqu'une éruption explosive majeure (indice VEI ≥ 5) propulse du <strong>dioxyde de soufre (SO₂)</strong> dans la <strong>stratosphère</strong> (au-delà de 15 à 30 km d'altitude), ce gaz réagit photochimiquement avec la vapeur d'eau pour former des micro-gouttelettes d'<strong>acide sulfurique (aérosols sulfatés H₂SO₄)</strong>.
            </p>
            <p>
              Ces aérosols diffusent et réfléchissent une fraction du rayonnement solaire incident vers l'espace, augmentant l'<strong>épaisseur optique des aérosols (SAOD à 550 nm)</strong>. Cela induit un forçage radiatif négatif transitoire (jusqu'à <strong>-3,3 W/m² pour le Pinatubo</strong> en 1991). Contrairement aux gaz à effet de serre qui s'accumulent pendant des siècles, ces aérosols sédimentent naturellement en <strong>1 à 3 ans</strong>, ramenant le bilan radiatif à son équilibre.
            </p>
          </div>
        </div>
      </div>

      {/* Section Sub-Nav: Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'chart'
              ? 'bg-slate-900 text-orange-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Graphiques & Couplage Température</span>
        </button>

        <button
          onClick={() => setActiveTab('eruptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'eruptions'
              ? 'bg-slate-900 text-orange-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Éruptions Majeures ({MAJOR_ERUPTIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vei-scale')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'vei-scale'
              ? 'bg-slate-900 text-orange-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Échelle VEI & Règle du Soufre</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'simulator'
              ? 'bg-slate-900 text-orange-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulateur de Forçage Volcanique</span>
        </button>
      </div>

      {/* TAB 1: CHART VIEW */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          {/* Chart Controls Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Mode selection */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                Mode d'affichage :
              </span>
              <button
                onClick={() => setChartMode('combined-temp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  chartMode === 'combined-temp'
                    ? 'bg-orange-950/80 text-orange-300 border-orange-500/80 shadow-md font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span>SAOD + Température GISTEMP (Double Axe)</span>
              </button>

              <button
                onClick={() => setChartMode('saod')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  chartMode === 'saod'
                    ? 'bg-orange-950/80 text-orange-300 border-orange-500/80 shadow-md font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Épaisseur Optique SAOD Seule</span>
              </button>

              <button
                onClick={() => setChartMode('forcing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                  chartMode === 'forcing'
                    ? 'bg-orange-950/80 text-orange-300 border-orange-500/80 shadow-md font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Forçage Radiatif Calculé (W/m²)</span>
              </button>
            </div>

            {/* Period zoom preset */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 mr-1">Zoom :</span>
              {[
                { id: 'all', label: '1880–2025' },
                { id: 'satellite', label: 'Ère Satellite (1970–)' },
                { id: 'pinatubo', label: 'Focus Pinatubo (1988–1998)' },
                { id: 'el-chichon', label: 'Focus El Chichón (1978–1988)' },
                { id: 'hunga-tonga', label: 'Focus Hunga Tonga (2018–2025)' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id as PeriodFilter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                    period === p.id
                      ? 'bg-slate-800 text-orange-400 border-slate-700 font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {chartMode === 'combined-temp' && 'Couplage SAOD & Anomalie Thermique Mondiale (GISTEMP)'}
                    {chartMode === 'saod' && 'Épaisseur Optique des Aérosols Stratosphériques (SAOD à 550 nm)'}
                    {chartMode === 'forcing' && 'Perturbation du Bilan d’Énergie au Sommet (ΔF en W/m²)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Sources : NASA Goddard Institute for Space Studies (GISS Sato et al.) & GISTEMP v4
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-orange-400">
                  <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                  SAOD (550nm)
                </span>
                {chartMode === 'combined-temp' && (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    Température GISTEMP (°C)
                  </span>
                )}
                {chartMode === 'forcing' && (
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                    Forçage ΔF (W/m²)
                  </span>
                )}
              </div>
            </div>

            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="year"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                    minTickGap={25}
                  />

                  {/* Left Y-Axis: SAOD or Forcing */}
                  {chartMode !== 'forcing' ? (
                    <YAxis
                      yAxisId="left"
                      stroke="#f97316"
                      tick={{ fill: '#fdba74', fontSize: 11, fontFamily: 'monospace' }}
                      domain={[0, (dataMax: number) => Math.max(0.16, Math.ceil(dataMax * 100) / 100)]}
                      label={{
                        value: 'SAOD (550 nm)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#fdba74',
                        fontSize: 11,
                        fontFamily: 'monospace',
                      }}
                    />
                  ) : (
                    <YAxis
                      yAxisId="left"
                      stroke="#3b82f6"
                      tick={{ fill: '#93c5fd', fontSize: 11, fontFamily: 'monospace' }}
                      domain={[-3.5, 0.5]}
                      label={{
                        value: 'Forçage ΔF (W/m²)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#93c5fd',
                        fontSize: 11,
                        fontFamily: 'monospace',
                      }}
                    />
                  )}

                  {/* Right Y-Axis: Temperature anomaly when in combined mode */}
                  {chartMode === 'combined-temp' && (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#f43f5e"
                      tick={{ fill: '#fda4af', fontSize: 11, fontFamily: 'monospace' }}
                      domain={[-0.6, 1.4]}
                      label={{
                        value: 'Anomalie Température (°C)',
                        angle: 90,
                        position: 'insideRight',
                        fill: '#fda4af',
                        fontSize: 11,
                        fontFamily: 'monospace',
                      }}
                    />
                  )}

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any, name?: any) => {
                      if (name === 'SAOD') return [`${val} (adimensionnel)`, 'Épaisseur Optique SAOD'];
                      if (name === 'Température') return [`${val > 0 ? '+' : ''}${val} °C`, 'Anomalie GISTEMP'];
                      if (name === 'Forçage') return [`${val} W/m²`, 'Forçage Radiatif Estimé'];
                      return [String(val), String(name ?? '')];
                    }}
                    labelFormatter={(label) => {
                      const erupt = MAJOR_ERUPTIONS.find((e) => e.year.toString() === label);
                      return `Année ${label}${erupt ? ` — Éruption: ${erupt.name} (VEI ${erupt.vei})` : ''}`;
                    }}
                  />

                  {/* Baseline 0 reference */}
                  <ReferenceLine yAxisId="left" y={0} stroke="#475569" strokeDasharray="2 2" />
                  {chartMode === 'combined-temp' && (
                    <ReferenceLine yAxisId="right" y={0} stroke="#64748b" strokeDasharray="2 2" />
                  )}

                  {/* Major Eruption markers */}
                  <ReferenceLine
                    yAxisId="left"
                    x="1991"
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    label={{ value: 'Pinatubo', fill: '#fb923c', fontSize: 10, position: 'top' }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x="1982"
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    label={{ value: 'El Chichón', fill: '#fb923c', fontSize: 10, position: 'top' }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x="1963"
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    label={{ value: 'Agung', fill: '#fb923c', fontSize: 10, position: 'top' }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    x="1883"
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    label={{ value: 'Krakatoa', fill: '#fb923c', fontSize: 10, position: 'top' }}
                  />

                  {/* SAOD Line / Area */}
                  {chartMode !== 'forcing' && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="saod"
                      name="SAOD"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={{ r: 2, fill: '#ea580c' }}
                      activeDot={{ r: 6, fill: '#fb923c' }}
                    />
                  )}

                  {/* Temperature Anomaly Line */}
                  {chartMode === 'combined-temp' && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="temperature"
                      name="Température"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ r: 1.5, fill: '#e11d48' }}
                      activeDot={{ r: 5, fill: '#f43f5e' }}
                    />
                  )}

                  {/* Forcing Area/Line */}
                  {chartMode === 'forcing' && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="forcing"
                      name="Forçage"
                      stroke="#3b82f6"
                      fill="#1e3a8a"
                      fillOpacity={0.3}
                      strokeWidth={2.5}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Pedagogy footnote under chart */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>
                  Observez les pics du <strong>Pinatubo (1991)</strong> et d'<strong>El Chichón (1982)</strong> : la chute de température globale (GISTEMP) est nette pendant 12 à 24 mois.
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Résorption complète en 2–3 ans par retombée gravitaire
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ERUPTIONS GALLERY & INSPECTOR */}
      {(activeTab === 'eruptions' || activeTab === 'chart') && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Éruptions Volcaniques Majeures de l'Ère Instrumentale :
            </span>
            <span className="text-[11px] font-mono text-slate-400">Sélectionnez un événement pour l'analyser</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {MAJOR_ERUPTIONS.map((erupt) => {
              const isSelected = selectedEruption?.id === erupt.id;
              return (
                <button
                  key={erupt.id}
                  onClick={() => setSelectedEruption(erupt)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-orange-950/90 border-orange-500 shadow-lg text-white ring-1 ring-orange-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono text-orange-400 flex items-center justify-between">
                      <span className="font-bold">{erupt.year}</span>
                      <span className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold">
                        VEI {erupt.vei}
                      </span>
                    </div>
                    <div className="text-xs font-bold font-sans mt-1 truncate text-slate-200">
                      {erupt.name}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-2 truncate">
                    {erupt.country}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Eruption Details Sheet */}
          {selectedEruption && (
            <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-orange-300 font-sans">{selectedEruption.name}</span>
                  <span className="text-slate-400 font-normal">({selectedEruption.date})</span>
                  <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800/80 text-[10px] font-bold">
                    Indice VEI {selectedEruption.vei} / 8
                  </span>
                </div>
                <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedEruption.country} · Volcan : {selectedEruption.volcano}</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans mb-4 text-xs sm:text-sm">
                {selectedEruption.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-mono">SO₂ injecté (stratosphère) :</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{selectedEruption.so2InjectedMt} Mt</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-mono">Pic SAOD (550nm) :</span>
                  <span className="text-orange-300 font-bold text-sm mt-0.5 block">{selectedEruption.peakSaod}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-mono">Forçage radiatif crête :</span>
                  <span
                    className={`font-bold text-sm mt-0.5 block ${
                      selectedEruption.peakRadiativeForcingWm2 < 0 ? 'text-blue-400' : 'text-amber-400'
                    }`}
                  >
                    {selectedEruption.peakRadiativeForcingWm2 > 0 ? '+' : ''}
                    {selectedEruption.peakRadiativeForcingWm2} W/m²
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-mono">Impact thermique mondial :</span>
                  <span
                    className={`font-bold text-sm mt-0.5 block ${
                      selectedEruption.globalCoolingAnomalyC < 0 ? 'text-blue-400' : 'text-amber-400'
                    }`}
                  >
                    {selectedEruption.globalCoolingAnomalyC > 0 ? '+' : ''}
                    {selectedEruption.globalCoolingAnomalyC} °C
                  </span>
                </div>
              </div>

              {/* Specific focus highlight for Hunga Tonga vs Pinatubo */}
              {selectedEruption.id === 'hunga-tonga-2022' && (
                <div className="mt-3 p-3 rounded-lg bg-cyan-950/50 border border-cyan-800/40 text-cyan-200 text-xs font-sans leading-relaxed">
                  <strong>💡 Singularité physique de Hunga Tonga :</strong> L'éruption s'étant produite sous la surface de l'océan, elle a vaporisé une masse colossale d'eau de mer (~150 millions de tonnes de H₂O) envoyée jusqu'à 57 km d'altitude. La vapeur d'eau étant un gaz à effet de serre naturel, et l'injection de soufre étant très faible (0,4 Mt), Hunga Tonga a provoqué un forçage légèrement <em>positif</em> inhabituel, à l'opposé des grandes éruptions terrestres comme le Pinatubo.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VEI SCALE & SULFUR PARADOX */}
      {activeTab === 'vei-scale' && (
        <div className="space-y-6">
          {/* VEI Explanatory Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-950 border border-orange-800/60 text-orange-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  L'Indice d'Explosivité Volcanique (VEI de Newhall & Self, 1982)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Échelle logarithmique semi-quantitative de 0 à 8 basée sur le volume de produits expulsés
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              L'indice VEI quantifie la violence d'une éruption à partir du volume de téphra (cendres, lapillis, bombes volcaniques) et de la hauteur de la colonne éruptive. Chaque degré à partir de VEI 2 représente une multiplication par 10 du volume de matière.
            </p>

            {/* VEI Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Indice</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Volume de Téphra</th>
                    <th className="py-2.5 px-3">Hauteur du Panache</th>
                    <th className="py-2.5 px-3">Fréquence</th>
                    <th className="py-2.5 px-3">Exemple historique</th>
                    <th className="py-2.5 px-3">Impact Climatique Typique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {VEI_LEVELS.map((v) => (
                    <tr key={v.level} className="hover:bg-slate-950/40 transition">
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded border text-[11px] ${v.badgeColor}`}>
                          VEI {v.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{v.label}</td>
                      <td className="py-2.5 px-3 text-slate-300">{v.ejectaVolume}</td>
                      <td className="py-2.5 px-3 text-cyan-300">{v.plumeHeight}</td>
                      <td className="py-2.5 px-3 text-slate-400">{v.frequency}</td>
                      <td className="py-2.5 px-3 text-amber-300 font-sans">{v.historicalExample}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{v.climateImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* The Sulfur Paradox Card */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-6 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-amber-300 font-sans flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Le paradoxe fondamental : Pourquoi le VEI seul ne prédit pas le forçage climatique ?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1 font-mono text-[11px]">1. Les cendres retombent en quelques jours</strong>
                Le VEI mesure la masse totale de roche et de cendres éjectées. Cependant, les poussières minérales sont denses et de taille microscopique à millimétrique : sous l'action de la gravité, 99% d'entre elles retombent au sol en quelques jours à quelques semaines. Elles n'ont donc aucun impact climatique durable.
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <strong className="text-white block mb-1 font-mono text-[11px]">2. Seul le soufre stratosphérique compte</strong>
                Le véritable moteur climatique est le <strong>dioxyde de soufre (SO₂) gazeux</strong> qui parvient à franchir la tropopause (&gt; 15 km d'altitude). Là, en l'absence de nuages et de pluie pour le lessiver, il s'oxyde en aérosols sulfatés (H₂SO₄) d'environ 0,5 µm qui diffusent la lumière du soleil pendant 1 à 3 ans.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SIMULATOR & PHYSICS CALCULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-950 border border-orange-800/60 text-orange-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Simulateur Physique de Forçage Volcanique Instantané
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Calculez le forçage radiatif (W/m²) et la baisse thermique (°C) selon la masse de SO₂ injectée
                </p>
              </div>
            </div>

            {/* Slider & Presets */}
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-mono text-slate-300">
                  Masse de SO₂ injectée dans la stratosphère :
                </label>
                <span className="text-base font-bold font-mono text-orange-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                  {simSo2} Mt (Millions de tonnes)
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="35"
                step="0.5"
                value={simSo2}
                onChange={(e) => setSimSo2(parseFloat(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Fast Presets Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-mono text-slate-400">Charger une éruption réelle :</span>
                {[
                  { name: 'Hunga Tonga 2022', so2: 0.4 },
                  { name: 'Mont Agung 1963', so2: 12 },
                  { name: 'El Chichón 1982', so2: 14 },
                  { name: 'Pinatubo 1991', so2: 20 },
                  { name: 'Krakatoa 1883', so2: 20 },
                  { name: 'Super-éruption fictive', so2: 35 },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSimSo2(item.so2)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                  >
                    {item.name} ({item.so2} Mt)
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Results Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-[11px] font-mono text-slate-400 block">Pic SAOD (550nm) estimé :</span>
                <span className="text-2xl font-bold font-mono text-orange-400 mt-1 block">
                  {simResults.peakSaod}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  ~ {simSo2} × 0.00775
                </span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-[11px] font-mono text-slate-400 block">Forçage Radiatif Crête (ΔF) :</span>
                <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
                  {simResults.radiativeForcing} W/m²
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  ΔF ≈ -21 × SAOD
                </span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-[11px] font-mono text-slate-400 block">Refroidissement mondial maximal :</span>
                <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                  {simResults.estimatedCooling} °C
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  Transitoire sur 12 à 24 mois
                </span>
              </div>
            </div>

            {/* Decay Timeline Explanation */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <strong className="text-white block font-sans">
                ⏱️ Cinétique de résorption des aérosols :
              </strong>
              <p className="leading-relaxed">
                Les aérosols sulfatés suivent une décroissance exponentielle dans la stratosphère avec un temps caractéristique (e-folding time) d'environ <strong>12 mois</strong>.
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-[11px] pt-1">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Année 1 :</span>
                  <span className="text-orange-400 font-bold">100% de l'impact</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Année 2 :</span>
                  <span className="text-orange-300 font-bold">~37% de résiduel</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Année 3 :</span>
                  <span className="text-slate-300 font-bold">&lt; 10% (retour bruit de fond)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Physics & Radiative Formula Reference Banner */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-3 shadow-lg">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-400" />
          Formulation Physique du Forçage et de la Décroissance (Hansen et al. / Sato et al.) :
        </h4>
        <p className="leading-relaxed">
          La relation empirique établie par les modélisations de transfert radiatif de la NASA relie directement l'épaisseur optique globale moyenne (SAOD à 550 nm) au forçage instantané :
        </p>
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 text-center text-sm">
          ΔF_volcan ≈ -21 × SAOD  (W/m²)
        </div>
        <p className="text-[11px] leading-relaxed">
          Lors du pic du Pinatubo en 1992 (SAOD ≈ 0,155), le forçage radiatif a atteint environ <strong>-3,3 W/m²</strong>, ce qui a temporairement surpassé le forçage anthropique positif de l'époque et provoqué un creux bien visible sur la courbe des températures globales GISTEMP. Dès 1994-1995, le voile d'aérosols s'étant résorbé, la température globale a repris sa tendance séculaire.
        </p>
      </div>
    </div>
  );
};
