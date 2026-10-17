import React, { useState } from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDataset } from '../hooks/useDataset';
import { Thermometer, Info, Layers } from 'lucide-react';

type TempSource = 'temp-nasa-gistemp' | 'temp-noaa-globaltemp' | 'temp-berkeley-earth';

export const TemperaturePage: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<TempSource>('temp-nasa-gistemp');
  const temp = useDataset(selectedSource);

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-700/40 text-rose-400">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Module 3 — 🌡️ Température Globale
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Anomalies thermiques de surface de la Terre (Terre + Océan)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={temp.status} onRefresh={temp.refresh} />
          <QualityBadge report={temp.qualityReport} />
        </div>
      </div>

      {/* Dataset / Provider switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-rose-400" />
          Sélectionner le jeu de données institutionnel :
        </span>
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          {[
            { id: 'temp-nasa-gistemp' as TempSource, label: 'NASA GISTEMP v4', ref: 'Ref. 1951-1980' },
            { id: 'temp-noaa-globaltemp' as TempSource, label: 'NOAA GlobalTemp', ref: 'Ref. 1901-2000' },
            { id: 'temp-berkeley-earth' as TempSource, label: 'Berkeley Earth', ref: 'Ref. 1951-1980' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedSource(item.id)}
              className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
                selectedSource === item.id
                  ? 'bg-slate-800 text-rose-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] ml-1.5 opacity-70 font-mono">({item.ref})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanatory Context & Provenance Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Pourquoi raisonne-t-on en anomalie et non en température absolue ?</strong>
            <br />
            La température absolue moyenne de la Terre varie fortement d'une région à l'autre (-50°C aux pôles et +40°C aux tropiques).
            En revanche, les <em>anomalies</em> (écarts par rapport à la moyenne climatologique locale) sont cohérentes sur des rayons de plus de 1 200 km, offrant une mesure statistique très robuste.
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Statut de la série :</span>
            <StatusBadge status={temp.status} compact />
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Type de source :</span>
            <span className="text-cyan-300 font-semibold">
              {temp.dataset?.metadata.provenanceType === 'live_feed' ? 'Flux en direct' : 'Historique embarqué'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Dernière observation :</span>
            <span className="text-emerald-400 font-bold">
              {temp.dataset?.metadata.lastObservationDate || temp.dataset?.metadata.endDate || '...'}
            </span>
          </div>
        </div>
      </div>

      {/* Graphique principal : Anomalie °C */}
      {temp.dataset && (
        <TimeSeriesChart
          data={temp.dataset.data}
          metadata={temp.dataset.metadata}
          status={temp.status}
          color="#f43f5e"
          showMovingAverageDefault={true}
          baselineZero={true}
        />
      )}

      {/* Comparison table between institutions */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-3">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider">
          Cohérence des reconstructions indépendantes :
        </h4>
        <p>
          Bien que la NASA, la NOAA et Berkeley Earth utilisent des protocoles de spatialisation, de correction des îlots de chaleur urbains et d'intégration des données de bouées océaniques distincts, leurs résultats concordent à plus de <strong>98%</strong> sur l'évolution séculaire globale.
        </p>
      </div>
    </div>
  );
};
