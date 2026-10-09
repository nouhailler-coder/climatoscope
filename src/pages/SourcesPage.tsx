import React, { useEffect, useState } from 'react';
import { datasetService } from '../services/dataset-service';
import { dbService } from '../services/db';
import { DatasetMetadata } from '../types/dataset';
import { BookOpen, ExternalLink, RefreshCw, Trash2, Database, ShieldCheck } from 'lucide-react';

export const SourcesPage: React.FC = () => {
  const [catalog, setCatalog] = useState<DatasetMetadata[]>([]);
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [clearing, setClearing] = useState<boolean>(false);

  const loadData = async () => {
    const list = await datasetService.getAllCatalogMetadata();
    setCatalog(list);
    const cached = await dbService.getAllDatasets();
    setCacheCount(cached.length);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearCache = async () => {
    if (confirm('Voulez-vous vider le cache local IndexedDB ? Les données seront re-téléchargées.')) {
      setClearing(true);
      await dbService.clearCache();
      await loadData();
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Registre des Sources & Métadonnées Scientifiques
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Inventaire officiel des dépôts institutionnels et traçabilité open data
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cache IndexedDB : {cacheCount} jeux stockés</span>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition cursor-pointer"
            title="Purger le cache local"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vider le cache</span>
          </button>
        </div>
      </div>

      {/* Datasets Catalog Cards */}
      <div className="grid grid-cols-1 gap-6">
        {catalog.map((meta) => {
          return (
            <div
              key={meta.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                      {meta.name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {meta.variableSymbol}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
                    {meta.organization} · {meta.source}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    Fréquence : {meta.frequency}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    Plage : {meta.startDate} → {meta.endDate}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {meta.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Variable mesurée :</span>
                  <span className="text-slate-200 font-medium">{meta.variable}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Unité physique :</span>
                  <span className="text-slate-200 font-medium">{meta.unit}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Licence d'utilisation :</span>
                  <span className="text-emerald-400 font-medium">{meta.license || 'Open Access'}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Période de référence :</span>
                  <span className="text-cyan-400 font-medium">{meta.baselinePeriod || 'Valeurs directes'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <a
                  href={meta.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Consulter le dépôt officiel de données</span>
                </a>
                {meta.methodologyUrl && (
                  <a
                    href={meta.methodologyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Documentation méthodologique & publications</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
