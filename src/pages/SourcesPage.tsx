import React, { useEffect, useState } from 'react';
import { datasetService } from '../services/dataset-service';
import { dbService } from '../services/db';
import { DatasetMetadata } from '../types/dataset';
import { StatusBadge } from '../components/common/StatusBadge';
import { ContextualBanner } from '../components/common/ContextualBanner';
import { HelpTooltip } from '../components/common/HelpTooltip';
import {
  BookOpen,
  ExternalLink,
  Trash2,
  Database,
  Radio,
  Clock,
  Calculator,
  Search,
  CheckCircle2,
  Layers,
} from 'lucide-react';

type FilterCategory = 'all' | 'live' | 'historical' | 'derived';

export const SourcesPage: React.FC = () => {
  const [catalog, setCatalog] = useState<DatasetMetadata[]>([]);
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [clearing, setClearing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const filteredCatalog = catalog.filter((meta) => {
    // Filter by type
    if (activeFilter === 'live' && meta.provenanceType !== 'live_feed') return false;
    if (activeFilter === 'historical' && meta.provenanceType !== 'embedded_historical') return false;
    if (activeFilter === 'derived' && !meta.isDerived) return false;

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = meta.name.toLowerCase().includes(q);
      const matchSource = meta.source.toLowerCase().includes(q);
      const matchOrg = meta.organization.toLowerCase().includes(q);
      const matchVar = meta.variable.toLowerCase().includes(q);
      return matchName || matchSource || matchOrg || matchVar;
    }
    return true;
  });

  const countLive = catalog.filter((m) => m.provenanceType === 'live_feed').length;
  const countHist = catalog.filter((m) => m.provenanceType === 'embedded_historical').length;
  const countDerived = catalog.filter((m) => m.isDerived).length;

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Registre des Sources & Traçabilité Scientifique</span>
                <HelpTooltip
                  title="Traçabilité de bout en bout"
                  content="Chaque série dispose d'une fiche d'identité complète : organisme émetteur, protocole d'acquisition, licence open-data, statut de provenance (flux en direct, historique embarqué ou dérivé)."
                />
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Inventaire officiel des séries, protocoles d'actualisation et méthodes de dérivation
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

      {/* Contextual Onboarding Banner */}
      <ContextualBanner
        screenId="sources_catalog"
        title="Architecture de provenance, Open Data & Intégrité scientifique"
        summary="ClimatOSCOPE garantit l'origine et l'intégrité de chaque observation. Toutes les métadonnées sont traçables jusqu'aux fichiers sources des agences de recherche mondiales."
        sourceOrg="NASA, NOAA, Berkeley Earth, LASP, SILSO, NSIDC, ECMWF"
        methodologyNote="Distinction claire entre les séries à flux direct (live_feed), les séries historiques vérifiées embarquées hors-ligne (embedded_historical) et les séries dérivées analytiquement (isDerived). Stockage local haute fidélité via IndexedDB."
        keyTakeaway="Toutes les données sont issues du domaine public ou de licences Creative Commons. L'application ne modifie jamais les valeurs brutes émanant des organismes officiels."
        defaultOpen={true}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition font-medium cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toutes les séries ({catalog.length})
          </button>
          <button
            onClick={() => setActiveFilter('live')}
            className={`px-3 py-1.5 rounded-xl transition font-medium flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'live'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>En direct ({countLive})</span>
          </button>
          <button
            onClick={() => setActiveFilter('historical')}
            className={`px-3 py-1.5 rounded-xl transition font-medium flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'historical'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Historiques embarqués ({countHist})</span>
          </button>
          <button
            onClick={() => setActiveFilter('derived')}
            className={`px-3 py-1.5 rounded-xl transition font-medium flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'derived'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>Séries dérivées ({countDerived})</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer par nom, source ou variable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Datasets Catalog Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCatalog.map((meta) => {
          const status = meta.provenanceType === 'embedded_historical' ? 'embedded_historical' : 'live';
          const lastObs = meta.lastObservationDate || meta.endDate;

          return (
            <div
              key={meta.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 transition"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                      {meta.name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {meta.variableSymbol}
                    </span>
                    {meta.isDerived && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                        Série dérivée
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-400/90 font-mono mt-1 flex items-center gap-2">
                    <span>{meta.organization}</span>
                    <span className="text-slate-600">·</span>
                    <span>{meta.source}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={status}
                    lastObservationDate={lastObs}
                    retrievedAt={meta.retrievedAt}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {meta.description}
              </p>

              {/* 4 Provenance Scientific Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Dernière observation :</span>
                  <span className="text-emerald-400 font-bold text-sm">{lastObs}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Plage : {meta.startDate} → {lastObs}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Date de récupération :</span>
                  <span className="text-slate-200 font-semibold">{meta.retrievedAt}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Fréquence : {meta.frequency}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Mode de mise à jour :</span>
                  <span className="text-cyan-400 font-medium">
                    {meta.provenanceType === 'live_feed'
                      ? 'Flux réseau en direct'
                      : meta.provenanceType === 'embedded_historical'
                      ? 'Historique embarqué'
                      : 'Calcul dérivé synchrone'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {meta.license || 'Licence institutionnelle ouverte'}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Période de référence :</span>
                  <span className="text-amber-300 font-medium">{meta.baselinePeriod || 'Valeurs directes'}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Unité : {meta.unit}</span>
                </div>
              </div>

              {/* Calculation method if derived */}
              {(meta.isDerived || meta.calculationMethod) && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-sans font-semibold">
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    <span>Méthode de calcul & formulation scientifique :</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {meta.calculationMethod || 'Série obtenue par dérivation mathématique et pondération spatio-temporelle.'}
                  </p>
                </div>
              )}

              {/* Direct URLs and Documentation */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <a
                  href={meta.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Dépôt officiel des données ({meta.source})</span>
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
