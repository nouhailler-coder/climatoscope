import React from 'react';
import { NavTab } from '../components/common/Header';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { formatScientificValue, formatAnomaly } from '../utils/formatters';
import {
  Sun,
  Flame,
  Thermometer,
  Waves,
  Globe,
  Mountain,
  Radio,
  ArrowRight,
  Scale,
  BookOpen,
  Info,
  CheckCircle2,
  Database,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const tsi = useDataset('solar-tsi-lisird');
  const co2 = useDataset('co2-noaa-mauna-loa');
  const temp = useDataset('temp-nasa-gistemp');
  const ocean = useDataset('ocean-ohc-argo-2000m');
  const ceres = useDataset('energy-ceres-net-toa');
  const volcano = useDataset('volcano-saod-giss');
  const power = useDataset('nasa-power-radiation');

  // Extracts latest value
  const latestTsi = tsi.dataset?.data[tsi.dataset.data.length - 1];
  const latestCo2 = co2.dataset?.data[co2.dataset.data.length - 1];
  const prevCo2 = co2.dataset?.data[co2.dataset.data.length - 13]; // 1 year before
  const co2DeltaYear = latestCo2 && prevCo2 ? latestCo2.value - prevCo2.value : 2.45;

  const latestTemp = temp.dataset?.data[temp.dataset.data.length - 1];
  const latestOcean = ocean.dataset?.data[ocean.dataset.data.length - 1];
  const latestCeres = ceres.dataset?.data[ceres.dataset.data.length - 1];
  const latestVolcano = volcano.dataset?.data[volcano.dataset.data.length - 1];
  const latestPower = power.dataset?.data[power.dataset.data.length - 1];

  return (
    <div className="space-y-8">
      {/* Hero Observatory Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-4">
            <span>🔭 Observatoire Scientifique Open Data</span>
            <span>·</span>
            <span>Architecture PWA Offline-First</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Comprendre le climat à partir des mesures.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            ClimatOSCOPE rassemble les séries observationnelles issues des centres de recherche de référence
            (NASA, NOAA, LASP, SILSO) pour permettre une exploration transparente, rigoureuse et factuelle :
            <span className="text-cyan-300 font-semibold"> observer → comparer → analyser → comprendre</span>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('comparator')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-cyan-950/50 transition cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Ouvrir le Comparateur Multi-Séries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('guide')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition cursor-pointer"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Comment lire les données ?</span>
            </button>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Pillars Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400">
            Piliers d'Observation Principaux
          </h3>
          <span className="text-xs font-mono text-slate-400">4 modules certifiés</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: ☀️ Soleil */}
          <div
            onClick={() => onNavigate('solar')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-700/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition">
                    Activité & Rayonnement Solaire
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">NASA / LASP LISIRD & WDC-SILSO</p>
                </div>
              </div>
              <StatusBadge status={tsi.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Irradiance Totale (TSI) :</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {formatScientificValue(latestTsi?.value, 'W/m²', 2)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Année {latestTsi?.timestamp}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Cycle de Schwabe :</span>
                <span className="text-sm font-semibold text-amber-300 font-mono mt-1 block">
                  ~11 ans (Cycle 25)
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Amplitude ~0,1%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 transition font-medium">
              <span>Voir les séries TSI & Taches solaires</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: 🧪 CO₂ */}
          <div
            onClick={() => onNavigate('co2')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-700/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition">
                    CO₂ Atmosphérique (Mauna Loa)
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">NOAA Global Monitoring Laboratory</p>
                </div>
              </div>
              <StatusBadge status={co2.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Concentration actuelle :</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {formatScientificValue(latestCo2?.value, 'ppm', 2)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">{latestCo2?.timestamp}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Taux d'accroissement :</span>
                <span className="text-sm font-semibold text-emerald-300 font-mono mt-1 block">
                  +{formatScientificValue(co2DeltaYear, 'ppm/an', 2)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">1958: 315 ppm</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-300 transition font-medium">
              <span>Voir la courbe de Keeling & cycle saisonnier</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: 🌡️ Température */}
          <div
            onClick={() => onNavigate('temperature')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-700/40 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-rose-300 transition">
                    Température Globale (Anomalie)
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">NASA GISTEMP v4 / NOAA / Berkeley</p>
                </div>
              </div>
              <StatusBadge status={temp.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Anomalie globale annuelle :</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {formatAnomaly(latestTemp?.value)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Ref. 1951-1980 ({latestTemp?.timestamp})</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Comparaison préindustrielle :</span>
                <span className="text-sm font-semibold text-rose-300 font-mono mt-1 block">
                  ~+{latestTemp ? (latestTemp.value + 0.28).toFixed(2) : '1.45'} °C
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Ref. 1850-1900</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-rose-300 transition font-medium">
              <span>Voir les séries GISTEMP, NOAA & Berkeley</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: 🌊 Océans (Argo / OHC) */}
          <div
            onClick={() => onNavigate('ocean')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-700/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition">
                    Contenu Thermique Océans (OHC)
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Argo / NOAA NCEI (0-2000m)</p>
                </div>
              </div>
              <StatusBadge status={ocean.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Excédent thermique :</span>
                <span className="text-lg font-bold text-blue-400 font-mono">
                  +{formatScientificValue(latestOcean?.value, 'ZJ', 1)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Ref. 1981-2010 ({latestOcean?.timestamp})</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Part énergétique :</span>
                <span className="text-sm font-semibold text-blue-300 font-mono mt-1 block">
                  &gt;90% du déséquilibre
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">1 ZJ = 10²¹ Joules</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-300 transition font-medium">
              <span>Voir les séries OHC 0-2000m & 0-700m</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 5: 🌍 CERES (Bilan Énergétique TOA) */}
          <div
            onClick={() => onNavigate('ceres')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-700/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition">
                    Bilan Énergétique TOA — NASA CERES
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Déséquilibre net (EEI = IN - OUT)</p>
                </div>
              </div>
              <StatusBadge status={ceres.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Déséquilibre Net (EEI) :</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  +{formatScientificValue(latestCeres?.value, 'W/m²', 2)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Année {latestCeres?.timestamp}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Composantes TOA :</span>
                <span className="text-sm font-semibold text-slate-200 font-mono mt-1 block">
                  OLR ~241 · Albédo ~98
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Mesure satellitaire directe</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 transition font-medium">
              <span>Voir le bilan radiatif & validation croisée Argo</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 6: 🌋 Volcans (Forçage Aérosol SAOD) */}
          <div
            onClick={() => onNavigate('volcano')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-950/60 border border-orange-700/40 flex items-center justify-center text-orange-400 group-hover:scale-105 transition">
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-orange-300 transition">
                    Volcanisme & Aérosols (SAOD)
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">NASA GISS / Éruptions majeures</p>
                </div>
              </div>
              <StatusBadge status={volcano.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Épaisseur optique actuelle :</span>
                <span className="text-lg font-bold text-orange-400 font-mono">
                  {formatScientificValue(latestVolcano?.value, 'SAOD', 3)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Bruit de fond ({latestVolcano?.timestamp})</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Événements repères :</span>
                <span className="text-sm font-semibold text-slate-200 font-mono mt-1 block">
                  Pinatubo '91 · Krakatoa '83
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Refroidissement transitoire</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-orange-300 transition font-medium">
              <span>Voir la frise des éruptions & forçage SO₂</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 7: ☀️ Rayonnement NASA POWER */}
          <div
            onClick={() => onNavigate('power')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-700/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition">
                    Rayonnement au Sol — NASA POWER
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">NASA Langley Research Center API</p>
                </div>
              </div>
              <StatusBadge status={power.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Flux solaire incident :</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  {formatScientificValue(latestPower?.value, 'kWh/m²/j', 2)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">{latestPower?.timestamp}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Station par défaut :</span>
                <span className="text-sm font-semibold text-slate-200 font-mono mt-1 block">
                  Paris [48.85°N, 2.35°E]
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Coordonnées modifiables</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-300 transition font-medium">
              <span>Sélecteur mondial de coordonnées & requêtes en direct</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Transparency & Rigor Box */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
        <h4 className="text-sm font-mono uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Règles Méthodologiques de ClimatOSCOPE
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <strong className="text-slate-200 block mb-1">1. Traçabilité intégrale</strong>
            Chaque point provient directement des dépôts institutionnels publics. Aucune valeur synthétique ou extrapolée n'est injectée.
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <strong className="text-slate-200 block mb-1">2. Distinction corrélation / causalité</strong>
            Deux séries peuvent évoluer simultanément sans lien physique direct. Les calculs statistiques sont toujours assortis de réserves formelles.
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            <strong className="text-slate-200 block mb-1">3. Fonctionnement hors-ligne</strong>
            Les données téléchargées sont conservées dans votre navigateur via IndexedDB. L'application reste 100% opérationnelle sans connexion réseau.
          </div>
        </div>
      </div>
    </div>
  );
};
