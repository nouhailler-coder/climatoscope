import React, { useState } from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { exportDatasetToCSV, exportDatasetToJSON } from '../utils/export';
import { Globe, ArrowDown, ArrowUp, Info, Download, ShieldCheck, Layers, Sun } from 'lucide-react';

export const CeresPage: React.FC = () => {
  const [selectedFlux, setSelectedFlux] = useState<'net' | 'olr' | 'albedo'>('net');

  const datasetId =
    selectedFlux === 'net'
      ? 'energy-ceres-net-toa'
      : selectedFlux === 'olr'
      ? 'energy-ceres-olr-toa'
      : 'energy-ceres-albedo-toa';

  const ceres = useDataset(datasetId);

  const handleExport = (format: 'csv' | 'json') => {
    if (!ceres.dataset) return;
    if (format === 'csv') {
      exportDatasetToCSV(ceres.dataset.metadata, ceres.dataset.data);
    } else {
      exportDatasetToJSON(ceres.dataset.metadata, ceres.dataset.data);
    }
  };

  const latestVal = ceres.dataset?.data[ceres.dataset.data.length - 1];

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-700/40 text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 🌍 CERES — Bilan Énergétique au Sommet de l’Atmosphère
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Clouds and the Earth’s Radiant Energy System — NASA Langley Research Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={ceres.status} onRefresh={ceres.refresh} />
          <QualityBadge report={ceres.qualityReport} />
          {ceres.dataset && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExport('csv')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter la série en CSV"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter la série en JSON"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOA Energy Flow Diagram Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Décomposition des Flux Radiatifs au Sommet de l'Atmosphère (TOA) :
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="font-semibold">Solaire Entrant (SW_in)</span>
              <ArrowDown className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">~340,4 W/m²</div>
            <div className="text-[10px] text-slate-400 mt-0.5">TSI / 4 (Flux géométrique moyen)</div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <span className="font-semibold">Solaire Réfléchi (SW_out)</span>
              <ArrowUp className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-cyan-300 font-mono mt-1">~98,5 W/m²</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Albédo planétaire (~29%)</div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="font-semibold">Infrarouge Sortant (OLR)</span>
              <ArrowUp className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-rose-300 font-mono mt-1">~240,8 W/m²</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Émission thermique globale</div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-emerald-500/40">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="font-semibold">Déséquilibre Net (EEI)</span>
              <span className="text-[11px] font-bold">Δ = IN - OUT</span>
            </div>
            <div className="text-xl font-bold text-emerald-300 font-mono mt-1">
              +{latestVal ? latestVal.value.toFixed(2) : '1.42'} W/m²
            </div>
            <div className="text-[10px] text-emerald-400/90 mt-0.5">Chaleur piégée en continu</div>
          </div>
        </div>
      </div>

      {/* Flux Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-400" />
          Sélectionner la composante radiative à tracer :
        </span>
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          {[
            { id: 'net' as const, label: 'Déséquilibre Net (EEI)', desc: 'Flux net piégé dans le système' },
            { id: 'olr' as const, label: 'Rayonnement Infrarouge (OLR)', desc: 'Émission thermique vers l’espace' },
            { id: 'albedo' as const, label: 'Solaire Réfléchi (SW_out)', desc: 'Albédo des nuages et glaces' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFlux(item.id)}
              className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
                selectedFlux === item.id
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanatory Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Qu'est-ce que le bilan radiatif au sommet de l'atmosphère (TOA) ?</strong>
          <br />
          À l'état stationnaire parfait sans forçage additionnel, la Terre réémettrait exactement autant d'énergie vers l'espace qu'elle en absorbe du Soleil (Net = 0 W/m²).
          Les radiomètres spatiaux CERES montrent un déséquilibre positif continu depuis l'an 2000, oscillant entre <strong>+0,5 et +1,5 W/m²</strong>. Ce flux net excédentaire ne pouvant pas disparaître, il est piégé et réchauffe l'océan, fait fondre la cryosphère et réchauffe la surface.
        </div>
      </div>

      {/* Main CERES Chart */}
      {ceres.dataset && (
        <TimeSeriesChart
          data={ceres.dataset.data}
          metadata={ceres.dataset.metadata}
          color={selectedFlux === 'net' ? '#10b981' : selectedFlux === 'olr' ? '#f43f5e' : '#38bdf8'}
          showMovingAverageDefault={false}
          baselineZero={selectedFlux === 'net'}
        />
      )}

      {/* Cross-Validation Box (CERES vs Argo) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-3">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Validation croisée indépendante : Satellites CERES ↔ Balises océaniques Argo
        </h4>
        <p className="leading-relaxed">
          Un résultat scientifique remarquable des 20 dernières années réside dans la concordance absolue entre deux méthodes de mesure physiquement disjointes :
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <strong className="text-cyan-300 block mb-1">1. Depuis l'espace (NASA CERES)</strong>
            Des radiomètres en orbite à 700 km d'altitude mesurent directement les photons solaires et infrarouges traversant le sommet de l'atmosphère :
            <div className="text-emerald-400 font-mono font-bold mt-1">EEI ≈ +0,8 à +1,2 W/m²</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <strong className="text-blue-300 block mb-1">2. Dans les abysses (Réseau Argo)</strong>
            Des milliers de robots autonomes sous-marins mesurent l'élévation thermique de l'eau entre 0 et 2 000 m de profondeur :
            <div className="text-blue-400 font-mono font-bold mt-1">Taux OHC ≈ +0,8 à +0,9 W/m²</div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Cette convergence entre la physique spatiale et l'océanographie in situ constitue l'une des preuves observationnelles les plus rigoureuses de la thermodynamique climatique contemporaine.
        </p>
      </div>
    </div>
  );
};
