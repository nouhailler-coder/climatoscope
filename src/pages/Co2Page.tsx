import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { exportDatasetToCSV, exportDatasetToJSON } from '../utils/export';
import { formatScientificValue } from '../utils/formatters';
import {
  Flame,
  Zap,
  Wheat,
  Activity,
  Layers,
  Info,
  Download,
  ShieldCheck,
  Clock,
  Gauge,
  TrendingUp,
  Sliders,
  Calculator,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ContextualBanner } from '../components/common/ContextualBanner';
import { HelpTooltip } from '../components/common/HelpTooltip';

type GhgTab = 'co2' | 'ch4' | 'n2o' | 'aggi' | 'summary';

interface GasProfile {
  id: string;
  symbol: string;
  name: string;
  formula: string;
  unit: string;
  preindustrial: number;
  current: number;
  lifetime: string;
  gwp20: number;
  gwp100: number;
  radiativeForcingWm2: number;
  sharePercent: number;
  mainSources: string;
  sinkMechanism: string;
  badgeColor: string;
}

const GAS_PROFILES: Record<'co2' | 'ch4' | 'n2o', GasProfile> = {
  co2: {
    id: 'co2',
    symbol: 'CO₂',
    name: 'Dioxyde de carbone',
    formula: 'CO₂',
    unit: 'ppm',
    preindustrial: 280,
    current: 427,
    lifetime: 'Multi-séculaire (> 100 à 1 000 ans)',
    gwp20: 1,
    gwp100: 1,
    radiativeForcingWm2: 2.23,
    sharePercent: 66,
    mainSources: 'Combustion d’énergies fossiles (charbon, pétrole, gaz), déforestation, cimenteries',
    sinkMechanism: 'Absorption par l’océan (dissolution/pompe biologique) et la biosphère continentale',
    badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-700',
  },
  ch4: {
    id: 'ch4',
    symbol: 'CH₄',
    name: 'Méthane atmosphérique',
    formula: 'CH₄',
    unit: 'ppb',
    preindustrial: 722,
    current: 1978,
    lifetime: 'Court (~9 à 11,8 ans)',
    gwp20: 84,
    gwp100: 28,
    radiativeForcingWm2: 0.54, // direct; ~0.9 W/m² with indirect ozone and water vapor
    sharePercent: 16,
    mainSources: 'Fuites de combustibles fossiles (gaz, pétrole, mines de charbon), élevage ruminant, riziculture, décharges',
    sinkMechanism: 'Oxydation chimique troposphérique par les radicaux hydroxyles (•OH) produisant du CO₂ et H₂O',
    badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-700',
  },
  n2o: {
    id: 'n2o',
    symbol: 'N₂O',
    name: 'Protoxyde d’azote',
    formula: 'N₂O',
    unit: 'ppb',
    preindustrial: 270,
    current: 340,
    lifetime: 'Long (~114 à 120 ans)',
    gwp20: 264,
    gwp100: 273,
    radiativeForcingWm2: 0.22,
    sharePercent: 6,
    mainSources: 'Engrais azotés de synthèse en agriculture, effluents d’élevage, procédés chimiques industriels',
    sinkMechanism: 'Photolyse et réaction avec l’oxygène atomique excité O(¹D) dans la haute stratosphère',
    badgeColor: 'text-indigo-400 bg-indigo-950/80 border-indigo-700',
  },
};

export const Co2Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GhgTab>('co2');

  const co2 = useDataset('co2-noaa-mauna-loa');
  const ch4 = useDataset('ghg-ch4-noaa');
  const n2o = useDataset('ghg-n2o-noaa');
  const aggi = useDataset('ghg-aggi-noaa');

  // Methane mitigation simulator state
  const [ch4CutPercent, setCh4CutPercent] = useState<number>(30); // 30% reduction scenario (Global Methane Pledge)

  // Dynamically extracted latest points and pre-industrial ratios from loaded datasets
  const latestCo2Point = co2.dataset?.data && co2.dataset.data.length > 0
    ? co2.dataset.data[co2.dataset.data.length - 1]
    : undefined;
  const latestCh4Point = ch4.dataset?.data && ch4.dataset.data.length > 0
    ? ch4.dataset.data[ch4.dataset.data.length - 1]
    : undefined;
  const latestN2oPoint = n2o.dataset?.data && n2o.dataset.data.length > 0
    ? n2o.dataset.data[n2o.dataset.data.length - 1]
    : undefined;
  const latestAggiPoint = aggi.dataset?.data && aggi.dataset.data.length > 0
    ? aggi.dataset.data[aggi.dataset.data.length - 1]
    : undefined;

  const ch4IncreasePercent = latestCh4Point?.value != null
    ? Math.round(((latestCh4Point.value - 722) / 722) * 100)
    : null;
  const n2oIncreasePercent = latestN2oPoint?.value != null
    ? Math.round(((latestN2oPoint.value - 270) / 270) * 100)
    : null;
  const aggiPercentOver1990 = latestAggiPoint?.value != null
    ? Math.round((latestAggiPoint.value - 1) * 100)
    : null;

  // Determine current active dataset based on tab
  const currentActiveDataset = useMemo(() => {
    if (activeTab === 'co2') return co2;
    if (activeTab === 'ch4') return ch4;
    if (activeTab === 'n2o') return n2o;
    if (activeTab === 'aggi') return aggi;
    return co2;
  }, [activeTab, co2, ch4, n2o, aggi]);

  const handleExport = (format: 'csv' | 'json') => {
    if (!currentActiveDataset.dataset) return;
    if (format === 'csv') {
      exportDatasetToCSV(currentActiveDataset.dataset.metadata, currentActiveDataset.dataset.data);
    } else {
      exportDatasetToJSON(currentActiveDataset.dataset.metadata, currentActiveDataset.dataset.data);
    }
  };

  // Methane mitigation simulation calculation
  const simResults = useMemo(() => {
    // Current methane forcing direct + indirect is ~0.9 W/m²
    // 30% cut leads to atmospheric reduction of ~300 ppb in 15 years
    const avoidedForcingWm2 = Number((0.9 * (ch4CutPercent / 100) * 0.75).toFixed(3));
    const avoidedWarmingC = Number((avoidedForcingWm2 * 0.45).toFixed(2));

    return {
      avoidedForcingWm2,
      avoidedWarmingC,
    };
  }, [ch4CutPercent]);

  return (
    <div className="space-y-8">
      {/* Title & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 shadow-lg shadow-emerald-950/40">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                  Module 🧪 Gaz à Effet de Serre Atmosphériques (CO₂, CH₄, N₂O & AGGI)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  V0.5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Réseau mondial de surveillance atmosphérique — NOAA Global Monitoring Laboratory (GML)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            status={currentActiveDataset.status}
            onRefresh={currentActiveDataset.refresh}
          />
          <QualityBadge report={currentActiveDataset.qualityReport} />
          {currentActiveDataset.dataset && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExport('csv')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter les données de la série active en CSV"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter les données de la série active en JSON"
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
        screenId="co2"
        title="Gaz à Effet de Serre à Longue Durée de Vie (CO₂, CH₄, N₂O)"
        summary="Mesures de précision des concentrations atmosphériques globales et forçage radiatif cumulé (Indice AGGI NOAA)."
        sourceOrg="NOAA Global Monitoring Laboratory (GML) & Scripps Institution"
        methodologyNote="Spectrométrie infrarouge NDIR à l'observatoire de Mauna Loa et réseau de flacons de la couche limite marine mondiale."
        keyTakeaway="Le forçage radiatif direct des gaz à effet de serre a augmenté de plus de 50% depuis 1990 (AGGI > 1.50). Le CO₂ reste le contributeur prédominant (66%), suivi par le méthane CH₄ (16%)."
        defaultOpen={true}
      />

      {/* Gas Switcher Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('co2')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'co2'
              ? 'bg-slate-900 text-emerald-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Flame className="w-4 h-4 text-emerald-400" />
          <span>CO₂ (Mauna Loa)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {latestCo2Point?.value != null ? `${latestCo2Point.value.toFixed(1)} ppm` : 'CO₂'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ch4')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'ch4'
              ? 'bg-slate-900 text-amber-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>CH₄ (Méthane Global)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {latestCh4Point?.value != null ? `${Math.round(latestCh4Point.value)} ppb` : 'CH₄'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('n2o')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'n2o'
              ? 'bg-slate-900 text-indigo-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Wheat className="w-4 h-4 text-indigo-400" />
          <span>N₂O (Protoxyde d’azote)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {latestN2oPoint?.value != null ? `${latestN2oPoint.value.toFixed(1)} ppb` : 'N₂O'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('aggi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'aggi'
              ? 'bg-slate-900 text-rose-400 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Gauge className="w-4 h-4 text-rose-400" />
          <span>Indice AGGI (Forçage Total)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {aggiPercentOver1990 !== null ? `+${aggiPercentOver1990}% / 1990` : 'AGGI'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition cursor-pointer border-t border-x ${
            activeTab === 'summary'
              ? 'bg-slate-900 text-cyan-300 border-slate-700 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Bilan Comparatif & PRG</span>
        </button>
      </div>

      {/* CO2 VIEW */}
      {activeTab === 'co2' && (
        <div className="space-y-6">
          {/* Explanatory Context */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed flex items-start gap-3.5 shadow-lg">
            <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <strong className="text-white text-sm">
                La Courbe de Keeling — L'enregistrement continu pionnier du CO₂
              </strong>
              <p>
                Mesurée depuis mars 1958 à 3 397 m d’altitude sur le volcan Mauna Loa à Hawaï, la fraction molaire du CO₂ en air sec combine deux dynamiques fondamentales :
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                <li>
                  <strong className="text-slate-200 font-sans">Le cycle biosphérique saisonnier</strong> : oscillation annuelle de ~6 ppm due à la photosynthèse boréale (captation printanière et restitution automnale).
                </li>
                <li>
                  <strong className="text-slate-200 font-sans">La hausse séculaire</strong> : passage de 315 ppm en 1958 à plus de 427 ppm aujourd'hui, avec un rythme d'accumulation actuel supérieur à <strong>+2,4 ppm par an</strong>.
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Concentration actuelle :</span>
              <span className="text-emerald-400 font-bold text-base mt-0.5 block">~427 ppm</span>
              <span className="text-[10px] text-slate-400 block">Mauna Loa (2025)</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Niveau préindustriel :</span>
              <span className="text-slate-200 font-bold text-base mt-0.5 block">280 ppm</span>
              <span className="text-[10px] text-slate-400 block">Glace Law Dome / EPICA</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Augmentation relative :</span>
              <span className="text-emerald-300 font-bold text-base mt-0.5 block">+52,5 %</span>
              <span className="text-[10px] text-slate-400 block">Depuis ~1750</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Forçage direct (ΔF) :</span>
              <span className="text-rose-400 font-bold text-base mt-0.5 block">+2,23 W/m²</span>
              <span className="text-[10px] text-slate-400 block">5.35 × ln(C / C₀)</span>
            </div>
          </div>

          {/* CO2 Chart */}
          {co2.dataset && (
            <TimeSeriesChart
              data={co2.dataset.data}
              metadata={co2.dataset.metadata}
              status={co2.status}
              color="#10b981"
              showMovingAverageDefault={true}
            />
          )}

          {/* Scientific Radiative Forcing Formula */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2.5">
            <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Loi logarithmique du forçage radiatif du CO₂ (Myhre et al., 1998 / GIEC) :
            </h4>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono text-emerald-300 text-center text-sm">
              ΔF = 5.35 × ln(C / C₀)  (W/m²)
            </div>
            <p className="leading-relaxed">
              En raison de la saturation optique partielle des bandes d'absorption infrarouge à 15 µm au centre de la bande, chaque molécule supplémentaire de CO₂ absorbe un peu moins que la précédente. Pour ajouter à nouveau <strong>+3,7 W/m²</strong> (valeur correspondant à un doublement), il faut passer de 280 à 560 ppm, puis de 560 à 1 120 ppm.
            </p>
          </div>
        </div>
      )}

      {/* CH4 VIEW */}
      {activeTab === 'ch4' && (
        <div className="space-y-6">
          {/* Explanatory Context */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed flex items-start gap-3.5 shadow-lg">
            <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <strong className="text-white text-sm">
                Le Méthane Atmosphérique (CH₄) — Le deuxième contributeur et levier d'action rapide
              </strong>
              <p>
                Le méthane est un gaz à effet de serre puissant dont la concentration mondiale a plus que{' '}
                <strong>
                  doublé ({ch4IncreasePercent !== null ? `+${ch4IncreasePercent}%` : 'donnée indisponible'})
                </strong>{' '}
                depuis l'ère préindustrielle (passant de 722 ppb en 1750 à{' '}
                {latestCh4Point?.value != null
                  ? `${formatScientificValue(latestCh4Point.value, 'ppb', 1)}`
                  : 'donnée indisponible'}
                {latestCh4Point?.timestamp ? ` en ${latestCh4Point.timestamp}` : ''}).
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                <li>
                  <strong className="text-slate-200 font-sans">Plateau 1999–2006</strong> : la croissance s'était stabilisée pendant 7 ans suite à l'effondrement des fuites pétrolières/gazières de l'ex-URSS et à la régulation des décharges.
                </li>
                <li>
                  <strong className="text-slate-200 font-sans">Forte accélération post-2007</strong> : reprise vigoureuse liée aux zones humides tropicales, à l'essor des combustibles fossiles non conventionnels et aux décharges du Sud global.
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Concentration actuelle :</span>
              <span className="text-amber-400 font-bold text-base mt-0.5 block">
                {latestCh4Point?.value != null ? formatScientificValue(latestCh4Point.value, 'ppb', 1) : 'Donnée indisponible'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {latestCh4Point?.timestamp ? `NOAA Global MBL (${latestCh4Point.timestamp})` : 'NOAA Global MBL'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Niveau préindustriel :</span>
              <span className="text-slate-200 font-bold text-base mt-0.5 block">722 ppb</span>
              <span className="text-[10px] text-slate-400 block">GIEC AR6 (Law Dome, 1750)</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Augmentation relative :</span>
              <span className="text-amber-300 font-bold text-base mt-0.5 block">
                {ch4IncreasePercent !== null ? `+${ch4IncreasePercent} %` : 'Donnée indisponible'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {latestCh4Point?.timestamp ? `Mesure observée (${latestCh4Point.timestamp})` : 'Calculé vs 1750'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Durée de vie dans l'air :</span>
              <span className="text-cyan-300 font-bold text-base mt-0.5 block">~11,8 ans</span>
              <span className="text-[10px] text-slate-400 block">Puits par radicaux •OH</span>
            </div>
          </div>

          {/* CH4 Chart */}
          {ch4.dataset && (
            <TimeSeriesChart
              data={ch4.dataset.data}
              metadata={ch4.dataset.metadata}
              status={ch4.status}
              color="#f59e0b"
              showMovingAverageDefault={true}
            />
          )}

          {/* Methane Chemistry & Rapid Mitigation Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
            <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Pourquoi le méthane est-il le levier d'action le plus rapide pour le climat ?
            </h4>
            <p className="leading-relaxed">
              Contrairement au CO₂ dont une fraction persiste des millénaires, le méthane est détruit dans l'atmosphère par réaction avec les <strong>radicaux hydroxyles (•OH)</strong> en une douzaine d'années.
            </p>
            <p className="leading-relaxed">
              Conséquence physique directe : <strong>si les émissions mondiales de méthane diminuent, sa concentration dans l'air baisse rapidement</strong>, réduisant quasi immédiatement le forçage radiatif et ralentissant le rythme du réchauffement à l'horizon 2030–2040.
            </p>
          </div>
        </div>
      )}

      {/* N2O VIEW */}
      {activeTab === 'n2o' && (
        <div className="space-y-6">
          {/* Explanatory Context */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed flex items-start gap-3.5 shadow-lg">
            <Wheat className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <strong className="text-white text-sm">
                Le Protoxyde d’Azote (N₂O) — Le géant discret de l'agriculture et de la couche d'ozone
              </strong>
              <p>
                Troisième gaz à effet de serre à longue durée de vie, le protoxyde d'azote (« gaz hilarant ») provient à plus de 70% des émissions anthropiques liées à l'usage des <strong>engrais azotés de synthèse</strong> et aux effluents d'élevage.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                <li>
                  <strong className="text-slate-200 font-sans">Durée de vie séculaire (~114 ans)</strong> : une fois émis dans la troposphère, le N₂O ne réagit pas avec les radicaux OH et diffuse lentement vers la haute atmosphère.
                </li>
                <li>
                  <strong className="text-slate-200 font-sans">Double impact</strong> : en plus de son forçage radiatif (PRG-100 = 273), il est devenu le principal agent chimique d'appauvrissement de la couche d'ozone stratosphérique au 21e siècle.
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Concentration actuelle :</span>
              <span className="text-indigo-400 font-bold text-base mt-0.5 block">
                {latestN2oPoint?.value != null ? formatScientificValue(latestN2oPoint.value, 'ppb', 1) : 'Donnée indisponible'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {latestN2oPoint?.timestamp ? `NOAA Global MBL (${latestN2oPoint.timestamp})` : 'NOAA Global MBL'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Niveau préindustriel :</span>
              <span className="text-slate-200 font-bold text-base mt-0.5 block">270 ppb</span>
              <span className="text-[10px] text-slate-400 block">GIEC AR6 (EPICA, 1750)</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Croissance séculaire :</span>
              <span className="text-indigo-300 font-bold text-base mt-0.5 block">
                {n2oIncreasePercent !== null ? `+${n2oIncreasePercent} %` : 'Donnée indisponible'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {latestN2oPoint?.timestamp ? `Mesure observée (${latestN2oPoint.timestamp})` : 'Calculé vs 1750'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Pouvoir réchauffant (PRG) :</span>
              <span className="text-cyan-300 font-bold text-base mt-0.5 block">273 × CO₂</span>
              <span className="text-[10px] text-slate-400 block">À horizon 100 ans</span>
            </div>
          </div>

          {/* N2O Chart */}
          {n2o.dataset && (
            <TimeSeriesChart
              data={n2o.dataset.data}
              metadata={n2o.dataset.metadata}
              status={n2o.status}
              color="#6366f1"
              showMovingAverageDefault={false}
            />
          )}

          {/* N2O Nitrogen Cycle Notes */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2.5">
            <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider flex items-center gap-2">
              <Wheat className="w-4 h-4 text-indigo-400" />
              La perturbation du cycle de l'azote :
            </h4>
            <p className="leading-relaxed">
              Le procédé Haber-Bosch (synthèse industrielle de l'ammoniac pour les engrais) a plus que doublé les flux d'azote réactif sur Terre. Dans les sols agricoles, les bactéries nitrifiantes et dénitrifiantes convertissent une fraction de cet azote en N₂O gazeux.
            </p>
            <p className="leading-relaxed">
              L'absence de puits troposphérique rend la résorption du N₂O particulièrement lente, nécessitant des politiques d'efficacité agronomique à l'échelle décennale.
            </p>
          </div>
        </div>
      )}

      {/* AGGI VIEW */}
      {activeTab === 'aggi' && (
        <div className="space-y-6">
          {/* Explanatory Context */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed flex items-start gap-3.5 shadow-lg">
            <Gauge className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <strong className="text-white text-sm">
                L'Indice Annuel des Gaz à Effet de Serre (NOAA AGGI) — Le thermomètre du forçage total
              </strong>
              <p>
                Créé par les chercheurs de la NOAA (Butler & Montzka), l'indice <strong>AGGI</strong> quantifie l'évolution du forçage radiatif cumulé imposé par l'ensemble des gaz à effet de serre à longue durée de vie (CO₂, CH₄, N₂O, CFC-11, CFC-12 et 15 gaz mineurs).
              </p>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 text-xs">
                Année 1990 (Signature Protocole de Kyoto) = 1.000 (Forçage = 2,163 W/m²)
                <br />
                Année 2025 = 1.632 (Forçage direct total &gt; 3,53 W/m², soit <strong>+63,2% d'énergie piégée supplémentaire</strong>)
              </div>
            </div>
          </div>

          {/* AGGI Chart */}
          {aggi.dataset && (
            <TimeSeriesChart
              data={aggi.dataset.data}
              metadata={aggi.dataset.metadata}
              status={aggi.status}
              color="#f43f5e"
              showMovingAverageDefault={false}
              baselineZero={false}
            />
          )}

          {/* Breakdown Pie/Bar Representation */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Répartition du Forçage Radiatif Direct Total Actuel (~3,53 W/m²) :
            </h4>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    CO₂ (Dioxyde de carbone)
                  </span>
                  <span className="text-emerald-400 font-bold">~2,23 W/m² (66%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '66%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    CH₄ (Méthane direct)
                  </span>
                  <span className="text-amber-400 font-bold">~0,54 W/m² (16%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '16%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    Halocarbures (CFCs, HCFCs, HFCs)
                  </span>
                  <span className="text-cyan-400 font-bold">~0,41 W/m² (12%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    N₂O (Protoxyde d'azote)
                  </span>
                  <span className="text-indigo-400 font-bold">~0,22 W/m² (6%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY & GWP COMPARISON & SIMULATOR VIEW */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Comparative Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Tableau Comparatif des Principaux Gaz à Effet de Serre
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Physique radiative, durées de vie atmosphérique et Potentiel de Réchauffement Global (GIEC AR6)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Gaz</th>
                    <th className="py-2.5 px-3">Préindustriel</th>
                    <th className="py-2.5 px-3">Actuel (2025)</th>
                    <th className="py-2.5 px-3">Variation</th>
                    <th className="py-2.5 px-3">Durée de Vie</th>
                    <th className="py-2.5 px-3">PRG 20 ans</th>
                    <th className="py-2.5 px-3">PRG 100 ans</th>
                    <th className="py-2.5 px-3">Forçage direct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(['co2', 'ch4', 'n2o'] as const).map((key) => {
                    const g = GAS_PROFILES[key];
                    const diff = (((g.current - g.preindustrial) / g.preindustrial) * 100).toFixed(1);
                    return (
                      <tr key={g.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          <span className={`px-2 py-0.5 rounded border text-[11px] ${g.badgeColor}`}>
                            {g.symbol}
                          </span>
                          <span className="ml-2 font-sans">{g.name}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {g.preindustrial} {g.unit}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {g.current} {g.unit}
                        </td>
                        <td className="py-3 px-3 text-rose-400 font-bold">+{diff} %</td>
                        <td className="py-3 px-3 text-slate-300 font-sans">{g.lifetime}</td>
                        <td className="py-3 px-3 text-amber-300 font-bold">{g.gwp20} ×</td>
                        <td className="py-3 px-3 text-cyan-300 font-bold">{g.gwp100} ×</td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          +{g.radiativeForcingWm2} W/m²
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Methane Mitigation Simulator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-800/60 text-amber-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Simulateur d'Atténuation Rapide du Méthane (Global Methane Pledge)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Estimez le forçage évité et le ralentissement thermique selon la réduction des fuites de CH₄
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-mono text-slate-300">
                  Objectif de réduction des émissions de CH₄ d'ici 2030 :
                </label>
                <span className="text-base font-bold font-mono text-amber-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                  -{ch4CutPercent} %
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={ch4CutPercent}
                onChange={(e) => setCh4CutPercent(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-mono text-slate-400">Scénarios prédéfinis :</span>
                {[
                  { label: 'Modéré (-15%)', val: 15 },
                  { label: 'Global Methane Pledge (-30%)', val: 30 },
                  { label: 'Ambitieux Net-Zero (-45%)', val: 45 },
                ].map((sc) => (
                  <button
                    key={sc.label}
                    onClick={() => setCh4CutPercent(sc.val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-[11px] font-mono text-slate-400 block">
                  Forçage radiatif net évité :
                </span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                  -{simResults.avoidedForcingWm2} W/m²
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  Effet combiné direct + ozone troposphérique
                </span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-[11px] font-mono text-slate-400 block">
                  Réchauffement évité d'ici 2045-2050 :
                </span>
                <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                  ~ -{simResults.avoidedWarmingC} °C
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  Équivalent à plusieurs années de décalage thermique
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
