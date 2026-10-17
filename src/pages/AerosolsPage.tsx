/**
 * ClimatOSCOPE — Module Aérosols Troposphériques & Qualité de l'Air (CAMS / AERONET)
 * Épaisseur optique des aérosols (AOD 550nm), spéciation chimique et forçage radiatif.
 * Distingue rigoureusement les aérosols stratosphériques (volcans) des aérosols troposphériques.
 * Effet Twomey & Paradoxe de la dépollution (IMO 2020).
 */

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { AEROSOLS_ANNUAL_DATA } from '../data/baseline/aerosols-cams-aeronet';
import { exportToCsv, exportToJson } from '../utils/export';
import {
  Download,
  Info,
  Cloud,
  Layers,
  Sparkles,
  Zap,
  TrendingDown,
  Sun,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Calculator,
  Calendar,
} from 'lucide-react';

type AerosolGraphView = 'total-aod' | 'speciation' | 'forcing-so2' | 'paradox';

export const AerosolsPage: React.FC = () => {
  const [view, setView] = useState<AerosolGraphView>('speciation');
  const [reductionPercent, setReductionPercent] = useState<number>(50); // % de réduction des sulfates

  const aod = useDataset('aerosols-cams-total-aod');

  const latest = AEROSOLS_ANNUAL_DATA[AEROSOLS_ANNUAL_DATA.length - 1];
  const peakSo2Year = AEROSOLS_ANNUAL_DATA.reduce((max, r) => (r.so2EmissionsMt > max.so2EmissionsMt ? r : max), AEROSOLS_ANNUAL_DATA[0]);

  // Unmasking warming calculation
  // Total net forcing of anthropogenic aerosols is around -1.1 W/m² (masquant ~0.35°C à 0.45°C de réchauffement)
  // Formule simplifiée : ΔT_démasqué = (Forçage masqué éliminé) * Climat_Sensibilité_Transitoire
  const unmaskingCalc = useMemo(() => {
    const baselineMaskingForcing = 1.05; // W/m² de forçage négatif masquant
    const unmaskedForcing = (baselineMaskingForcing * (reductionPercent / 100)); // W/m²
    // Sensibilité climatique transitoire (TCR ~ 0.45 à 0.55 °C par W/m²)
    const unmaskedTempRise = Number((unmaskedForcing * 0.48).toFixed(2));

    return {
      unmaskedForcing: Number(unmaskedForcing.toFixed(2)),
      unmaskedTempRise,
    };
  }, [reductionPercent]);

  const handleExport = (format: 'csv' | 'json') => {
    const exportData = AEROSOLS_ANNUAL_DATA.map((r) => ({
      Annee: r.year,
      AOD_Totale_550nm: r.totalAod,
      Sulfates_SO4: r.sulfate,
      Poussieres_Desertiques: r.dust,
      Carbone_Suie: r.blackCarbon,
      Matiere_Organique: r.organicMatter,
      Sel_Marin: r.seaSalt,
      Emissions_SO2_Mt: r.so2EmissionsMt,
      Forcage_Net_Wm2: r.netForcingWm2,
    }));
    if (format === 'csv') {
      exportToCsv(exportData, `climatoscpe-aerosols-cams-${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      exportToJson(exportData, `climatoscpe-aerosols-cams-${new Date().toISOString().slice(0, 10)}.json`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-700/40 text-sky-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module ☁️ Aérosols Troposphériques & Qualité de l'Air
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Copernicus CAMS & AERONET (2000–2024) · Spéciation chimique & Effet "Parasol" (Twomey)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={aod.status} onRefresh={aod.refresh} />
          <QualityBadge report={aod.qualityReport} />
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Épaisseur Optique AOD ({latest.year}) :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-sky-300">{latest.totalAod.toFixed(3)}</span>
            <span className="text-xs font-mono text-slate-400">à 550 nm</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Moyenne planétaire troposphérique
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Forçage Radiatif Net des Aérosols :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">{latest.netForcingWm2.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-400">W/m²</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono block mt-1">
            Effet refroidissant masquant ~⅓ des GES
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Émissions Mondiales de SO₂ :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-300">{latest.so2EmissionsMt.toFixed(1)}</span>
            <span className="text-xs font-mono text-slate-400">Mt/an</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono block mt-1">
            -46% depuis le pic de 1980 ({peakSo2Year.so2EmissionsMt} Mt)
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block">Durée de vie Troposphérique :</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-300">5 à 10 jours</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Lessivés par les précipitations (pluies)
          </span>
        </div>
      </div>

      {/* Crucial Pedagogical Differentiation Box: Troposphere vs Stratosphere */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-sm font-mono uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Distinction fondamentale : Aérosols Troposphériques vs Stratosphériques (Volcans)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-sky-400 font-bold mb-1.5 font-mono">
              <span>☁️ Aérosols Troposphériques (Ce module)</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li><strong>Altitude :</strong> 0 à 12 km (troposphère vivante).</li>
              <li><strong>Origine :</strong> Activités humaines continues (centrales à charbon, navires, feux de forêt) + poussières désertiques et embruns marins.</li>
              <li><strong>Durée de vie :</strong> <strong>5 à 10 jours</strong> seulement. Ils doivent être continuellement réémis.</li>
              <li><strong>Action climatique :</strong> Effet refroidissant persistant (masque ~0,4°C de réchauffement).</li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-orange-400 font-bold mb-1.5 font-mono">
              <span>🌋 Aérosols Stratosphériques (Module Volcans)</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li><strong>Altitude :</strong> 15 à 35 km (stratosphère sèche au-dessus des nuages).</li>
              <li><strong>Origine :</strong> Éruptions volcaniques pliniennes explosives injectant du SO₂ à haute altitude (Pinatubo, El Chichón).</li>
              <li><strong>Durée de vie :</strong> <strong>1 à 3 ans</strong> (absence de pluie pour les lessiver).</li>
              <li><strong>Action climatique :</strong> Choc de refroidissement brutal mais transitoire qui disparaît totalement.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-sky-400" />
          Sélectionner le mode d'observation des aérosols :
        </span>
        <div className="inline-flex flex-wrap rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs gap-1">
          {[
            { id: 'speciation' as AerosolGraphView, label: 'Spéciation Chimique (CAMS)' },
            { id: 'forcing-so2' as AerosolGraphView, label: 'Forçage Net vs Émissions SO₂' },
            { id: 'total-aod' as AerosolGraphView, label: 'AOD Troposphérique Totale' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setView(mode.id)}
              className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
                view === mode.id
                  ? 'bg-slate-800 text-sky-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {view === 'speciation' && 'Composition et spéciation des aérosols troposphériques (1950–2024)'}
              {view === 'forcing-so2' && 'Forçage radiatif net des aérosols (W/m²) vs Émissions mondiales de SO₂ (Mt/an)'}
              {view === 'total-aod' && 'Épaisseur optique moyenne globale AOD à 550 nm (CAMS EAC4 / AERONET)'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Réanalyses atmosphériques Copernicus CAMS & Système mondial CEDS
            </p>
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full pt-4">
          {view === 'speciation' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={AEROSOLS_ANNUAL_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 0.18]} unit=" AOD" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any, name?: any) => [`${val} AOD`, name]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="sulfate" stackId="1" name="Sulfates SO₄ (Industrie / Navires)" stroke="#38bdf8" fill="#0284c7" />
                <Area type="monotone" dataKey="dust" stackId="1" name="Poussières Minérales (Déserts)" stroke="#fbbf24" fill="#d97706" />
                <Area type="monotone" dataKey="organicMatter" stackId="1" name="Matière Organique (Feux / Biomasse)" stroke="#34d399" fill="#059669" />
                <Area type="monotone" dataKey="blackCarbon" stackId="1" name="Carbone Suie (Combustion)" stroke="#f87171" fill="#dc2626" />
                <Area type="monotone" dataKey="seaSalt" stackId="1" name="Embruns Marins (Sel)" stroke="#818cf8" fill="#4f46e5" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {view === 'forcing-so2' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={AEROSOLS_ANNUAL_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 11, fill: '#38bdf8' }} unit=" W/m²" domain={[-1.6, 0]} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 11, fill: '#f59e0b' }} unit=" Mt" domain={[0, 150]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netForcingWm2"
                  name="Forçage Radiatif Net des Aérosols (W/m²)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#38bdf8' }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="so2EmissionsMt"
                  name="Émissions Mondiales de SO₂ (Mt/an)"
                  fill="#f59e0b"
                  opacity={0.4}
                  radius={[3, 3, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {view === 'total-aod' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={AEROSOLS_ANNUAL_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0.1, 0.18]} unit=" AOD" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="totalAod"
                  name="AOD Troposphérique Totale (550nm)"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#0ea5e9' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Provenance & Scientific Traceability Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Source :</span>
                <a
                  href="https://atmosphere.copernicus.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-medium underline decoration-sky-500/40 hover:decoration-sky-400"
                >
                  <span>Copernicus Atmosphere CAMS (EAC4) & CEDS Global</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <span className="text-slate-600 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Dernière obs. : <strong>2024 (CAMS) / 2023 (CEDS)</strong></span>
              </div>

              <span className="text-slate-600 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <span>Date extraction : <strong>Octobre 2026</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <StatusBadge status={aod.status} lastUpdated="Octobre 2026" />
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Calculator className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-300">Méthode de calcul (Série dérivée) : </strong>
              Épaisseur optique spectrale totale à 550 nm (AOD) réanalysée par assimilation satellitaire CAMS EAC4. Forçage radiatif effectif (ERF) calculé d'après les formulations radiatives du GIEC AR6 Chapitre 7 (Tableau 7.8). Émissions SO₂ issues de l'inventaire historique CEDS v2024_07_08.
            </div>
          </div>
        </div>
      </div>

      {/* The Clean Air Paradox Simulator */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-xs font-mono mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Simulateur Physique — Le Paradoxe de la Dépollution (The Clean Air Paradox)</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Effet Parasol : Que se passe-t-il lorsque l'on dépollue l'atmosphère ?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mt-1">
            Les aérosols de sulfate réfléchissent directement la lumière et rendent les nuages plus denses et plus brillants (<span className="text-cyan-300 font-mono">effet Twomey</span>).
            En éliminant les émissions de soufre pour protéger la santé publique et les pluies acides, l'effet parasol disparaît et le réchauffement caché sous-jacent est instantanément « démasqué ».
          </p>
        </div>

        {/* Interactive Slider */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Pourcentage des aérosols refroidissants éliminés :</span>
            <span className="text-amber-400 font-bold text-sm">{reductionPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={reductionPercent}
            onChange={(e) => setReductionPercent(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (Situation actuelle)</span>
            <span>~50% (Règle maritime IMO 2020 + fermetures charbon)</span>
            <span>100% (Décarbonation & dépollution totale)</span>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block">Forçage masqué démasqué :</span>
            <span className="text-xl font-bold font-mono text-amber-300 block mt-1">
              +{unmaskingCalc.unmaskedForcing} W/m²
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Rayonnement solaire supplémentaire absorbé par la surface
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block">Réchauffement transitoire immédiat révélé :</span>
            <span className="text-xl font-bold font-mono text-rose-400 block mt-1">
              +{unmaskingCalc.unmaskedTempRise} °C
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Réponse thermique quasi-immédiate (5 à 15 ans)
            </span>
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono leading-relaxed">
          💡 <strong>Le cas réel de l'OMI 2020 (Réglementation maritime) :</strong> Au 1er janvier 2020, l'Organisation Maritime Internationale a imposé une baisse de 86% de la teneur en soufre des carburants marins (de 3,5% à 0,5%).
          Cela a éliminé plus de 8 Mt de SO₂ par an sur les océans, dissipant les traînées de condensation des navires (ship tracks) et provoquant un surplus d'absorption solaire mesuré par les satellites CERES particulièrement marqué sur l'Atlantique Nord en 2023–2024.
        </div>
      </div>
    </div>
  );
};
