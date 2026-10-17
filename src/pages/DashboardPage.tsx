import React from 'react';
import { NavTab } from '../components/common/Header';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { formatScientificValue, formatAnomaly } from '../utils/formatters';
import { calculateSeaIceTrend } from '../analysis/math';
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
  Compass,
  Cloud,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const tsi = useDataset('solar-tsi-lisird');
  const spots = useDataset('solar-sunspots-silso');
  const co2 = useDataset('co2-noaa-mauna-loa');
  const ch4 = useDataset('ghg-ch4-noaa');
  const temp = useDataset('temp-nasa-gistemp');
  const zonal = useDataset('zonal-temp-arctic-era5');
  const ice = useDataset('seaice-arctic-september-nsidc');
  const ocean = useDataset('ocean-ohc-argo-2000m');
  const ceres = useDataset('energy-ceres-net-toa');
  const ceresOlr = useDataset('energy-ceres-olr-toa');
  const ceresAlbedo = useDataset('energy-ceres-albedo-toa');
  const volcano = useDataset('volcano-saod-giss');
  const aerosols = useDataset('aerosols-cams-total-aod');
  const power = useDataset('nasa-power-radiation');

  // Extracts latest values directly from loaded datasets
  const latestTsi = tsi.dataset?.data && tsi.dataset.data.length > 0 ? tsi.dataset.data[tsi.dataset.data.length - 1] : undefined;
  const spotsData = spots.dataset?.data;
  const latestSpots = spotsData && spotsData.length > 0 ? spotsData[spotsData.length - 1] : undefined;

  const co2Data = co2.dataset?.data;
  const latestCo2 = co2Data && co2Data.length > 0 ? co2Data[co2Data.length - 1] : undefined;
  const latestCh4 = ch4.dataset?.data && ch4.dataset.data.length > 0 ? ch4.dataset.data[ch4.dataset.data.length - 1] : undefined;

  // Calculate CO2 variation over 1 year strictly from loaded observations
  const prevCo2 = React.useMemo(() => {
    if (!co2Data || co2Data.length < 2 || !latestCo2) return undefined;
    if (latestCo2.timestamp.includes('-')) {
      const [yearStr, monthStr] = latestCo2.timestamp.split('-');
      const targetTimestamp = `${parseInt(yearStr, 10) - 1}-${monthStr}`;
      const found = co2Data.find((p) => p.timestamp === targetTimestamp);
      if (found) return found;
      if (co2Data.length >= 13) return co2Data[co2Data.length - 13];
    } else {
      const targetYear = `${parseInt(latestCo2.timestamp, 10) - 1}`;
      const found = co2Data.find((p) => p.timestamp === targetYear);
      if (found) return found;
      return co2Data[co2Data.length - 2];
    }
    return undefined;
  }, [co2Data, latestCo2]);

  const co2DeltaYear = latestCo2 && prevCo2 ? latestCo2.value - prevCo2.value : null;

  const latestTemp = temp.dataset?.data && temp.dataset.data.length > 0 ? temp.dataset.data[temp.dataset.data.length - 1] : undefined;
  const preindustrialAnomaly = latestTemp?.value != null ? Number((latestTemp.value + 0.28).toFixed(2)) : null;

  const latestZonal = zonal.dataset?.data && zonal.dataset.data.length > 0 ? zonal.dataset.data[zonal.dataset.data.length - 1] : undefined;
  const latestIce = ice.dataset?.data && ice.dataset.data.length > 0 ? ice.dataset.data[ice.dataset.data.length - 1] : undefined;

  // Sea ice trend regression calculated dynamically from loaded observations
  const iceTrend = React.useMemo(() => {
    if (!ice.dataset?.data || ice.dataset.data.length < 3) return null;
    const pts = ice.dataset.data
      .filter((d) => typeof d.value === 'number' && !isNaN(d.value))
      .map((d) => ({ year: parseInt(d.timestamp, 10), value: d.value }));
    return calculateSeaIceTrend(pts, 6.41);
  }, [ice.dataset?.data]);

  // Ocean heat annual accumulation rate from loaded observations
  const oceanData = ocean.dataset?.data;
  const latestOcean = oceanData && oceanData.length > 0 ? oceanData[oceanData.length - 1] : undefined;
  const prevOcean = oceanData && oceanData.length > 1 ? oceanData[oceanData.length - 2] : undefined;
  const oceanDeltaYear = latestOcean && prevOcean ? Number((latestOcean.value - prevOcean.value).toFixed(1)) : null;

  const latestCeres = ceres.dataset?.data && ceres.dataset.data.length > 0 ? ceres.dataset.data[ceres.dataset.data.length - 1] : undefined;
  const olrData = ceresOlr.dataset?.data;
  const latestOlr = olrData && olrData.length > 0 ? olrData[olrData.length - 1] : undefined;
  const albedoData = ceresAlbedo.dataset?.data;
  const latestAlbedo = albedoData && albedoData.length > 0 ? albedoData[albedoData.length - 1] : undefined;

  const latestVolcano = volcano.dataset?.data && volcano.dataset.data.length > 0 ? volcano.dataset.data[volcano.dataset.data.length - 1] : undefined;
  const latestAerosols = aerosols.dataset?.data && aerosols.dataset.data.length > 0 ? aerosols.dataset.data[aerosols.dataset.data.length - 1] : undefined;
  const latestPower = power.dataset?.data && power.dataset.data.length > 0 ? power.dataset.data[power.dataset.data.length - 1] : undefined;

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
          <span className="text-xs font-mono text-slate-400">10 modules d'observation certifiés</span>
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
                  {latestTsi?.value != null ? formatScientificValue(latestTsi.value, 'W/m²', 2) : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestTsi?.timestamp ? `NASA TSIS-1 / TIM (${latestTsi.timestamp})` : 'Donnée indisponible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Activité taches (WDC-SILSO) :</span>
                <span className="text-sm font-semibold text-amber-300 font-mono mt-1 block">
                  {latestSpots?.value != null ? `${latestSpots.value} taches (SSN)` : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestSpots?.timestamp
                    ? `Cycle 25 (${latestSpots.timestamp}) · Amp. ~0,1%`
                    : 'Donnée indisponible'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 transition font-medium">
              <span>Voir les séries TSI & Taches solaires</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: 🧪 Gaz à Effet de Serre (CO₂, CH₄, N₂O) */}
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
                    Gaz à Effet de Serre (CO₂, CH₄, N₂O)
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">NOAA Global Monitoring Laboratory</p>
                </div>
              </div>
              <StatusBadge status={co2.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">CO₂ (Mauna Loa) :</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {latestCo2?.value != null ? formatScientificValue(latestCo2.value, 'ppm', 2) : 'Donnée indisponible'}
                </span>
                {co2DeltaYear !== null ? (
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    +{formatScientificValue(co2DeltaYear, 'ppm/an', 2)} ({latestCo2?.timestamp})
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Donnée indisponible
                  </span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">CH₄ (Méthane global) :</span>
                <span className="text-lg font-bold text-amber-300 font-mono">
                  {latestCh4?.value != null ? formatScientificValue(latestCh4.value, 'ppb', 1) : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestCh4?.value != null
                    ? `+${Math.round(((latestCh4.value - 722) / 722) * 100)}% vs 1750 (${latestCh4.timestamp})`
                    : 'Donnée indisponible'}
                </span>
                <span className="text-[9px] text-slate-500 block font-mono">
                  Réf. 722 ppb (GIEC AR6)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-300 transition font-medium">
              <span>Explorer CO₂, CH₄, N₂O & l'indice AGGI</span>
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
                  {latestTemp?.value != null ? formatAnomaly(latestTemp.value) : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestTemp?.timestamp ? `Ref. 1951-1980 (${latestTemp.timestamp})` : 'Donnée indisponible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Comparaison préindustrielle :</span>
                {preindustrialAnomaly !== null ? (
                  <span className="text-sm font-semibold text-rose-300 font-mono mt-1 block">
                    ~+{preindustrialAnomaly.toFixed(2)} °C
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-500 font-mono mt-1 block">
                    Donnée indisponible
                  </span>
                )}
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
                  {latestOcean?.value != null ? `+${formatScientificValue(latestOcean.value, 'ZJ', 1)}` : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestOcean?.timestamp ? `Ref. 1981-2010 (${latestOcean.timestamp})` : 'Donnée indisponible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Accumulation thermique :</span>
                <span className="text-sm font-semibold text-blue-300 font-mono mt-1 block">
                  {oceanDeltaYear !== null ? `+${oceanDeltaYear} ZJ/an (${latestOcean?.timestamp})` : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">~91% du déséquilibre global (GIEC AR6)</span>
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
                  {latestCeres?.value != null ? `+${formatScientificValue(latestCeres.value, 'W/m²', 2)}` : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestCeres?.timestamp ? `Année ${latestCeres.timestamp}` : 'Donnée indisponible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Flux sortants TOA mesurés :</span>
                <span className="text-sm font-semibold text-slate-200 font-mono mt-1 block">
                  {latestOlr?.value != null && latestAlbedo?.value != null
                    ? `OLR ${latestOlr.value.toFixed(1)} · SW ${latestAlbedo.value.toFixed(1)} W/m²`
                    : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestOlr?.timestamp ? `NASA CERES EBAF (${latestOlr.timestamp})` : 'Donnée indisponible'}
                </span>
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
                  {latestVolcano?.value != null ? formatScientificValue(latestVolcano.value, 'SAOD', 3) : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestVolcano?.timestamp ? `Bruit de fond (${latestVolcano.timestamp})` : 'Donnée indisponible'}
                </span>
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
                  {latestPower?.value != null ? formatScientificValue(latestPower.value, 'kWh/m²/j', 2) : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">{latestPower?.timestamp ?? 'Donnée indisponible'}</span>
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

          {/* Card 8: 🧊 Cryosphère & Banquise (NSIDC) */}
          <div
            onClick={() => onNavigate('ice')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-700/40 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition">
                    Cryosphère & Banquise — NSIDC / NASA
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Micro-ondes satellites / Rétroaction d'albédo</p>
                </div>
              </div>
              <StatusBadge status={ice.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Minimum Arctique (Sept.) :</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  {latestIce?.value != null ? `${latestIce.value} M km²` : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-rose-400 block font-mono">
                  {latestIce?.timestamp && iceTrend
                    ? `Année ${latestIce.timestamp} · ${iceTrend.decadalRatePercent > 0 ? '+' : ''}${iceTrend.decadalRatePercent}%/déc.`
                    : latestIce?.timestamp
                    ? `Année ${latestIce.timestamp}`
                    : 'Donnée indisponible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Albédo glace vs océan :</span>
                <span className="text-sm font-semibold text-slate-200 font-mono mt-1 block">
                  α 0,70 vs 0,06 (GIEC / NSIDC)
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Absorption : 30% glace vs 94% eau</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-300 transition font-medium">
              <span>Voir les séries Arctique / Antarctique & simulateur d'albédo</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 9: 🌎 Réanalyses ERA5 & Amplification Polaire */}
          <div
            onClick={() => onNavigate('zonal')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400 group-hover:scale-105 transition">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition">
                    Amplification Polaire — Copernicus ERA5
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Gradient latitudinal & réanalyses ECMWF</p>
                </div>
              </div>
              <StatusBadge status={zonal.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Arctique (90°N–64°N) :</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {latestZonal?.value != null ? `+${latestZonal.value} °C` : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestZonal?.timestamp ? `Ref. 1951-1980 (${latestZonal.timestamp})` : 'Donnée indisponible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Facteur d'amplification :</span>
                <span className="text-sm font-semibold text-violet-300 font-mono mt-1 block">
                  {latestZonal?.value != null && latestTemp?.value != null && latestTemp.value > 0
                    ? `~${(latestZonal.value / latestTemp.value).toFixed(1)}×`
                    : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">plus rapide que le globe</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-violet-300 transition font-medium">
              <span>Explorer les 5 bandes latitudinales & mécanismes physiques</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 10: ☁️ Aérosols Troposphériques (CAMS / AERONET) */}
          <div
            onClick={() => onNavigate('aerosols')}
            className="group bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-700/40 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition">
                    Aérosols Troposphériques — CAMS / AERONET
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Spéciation AOD & Paradoxe de la dépollution</p>
                </div>
              </div>
              <StatusBadge status={aerosols.status} compact />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">AOD Troposphérique :</span>
                <span className="text-lg font-bold text-sky-300 font-mono">
                  {latestAerosols?.value != null ? latestAerosols.value : 'Donnée indisponible'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {latestAerosols?.timestamp ? `à 550 nm (${latestAerosols.timestamp})` : 'Donnée indisponible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">Forçage net masquant :</span>
                <span className="text-sm font-semibold text-cyan-300 font-mono mt-1 block">
                  ~ -1,1 W/m² (GIEC AR6)
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Effet parasol direct & nuages (Twomey)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-300 transition font-medium">
              <span>Voir la spéciation chimique & simulateur de démasquage</span>
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
