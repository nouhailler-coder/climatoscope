import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Compass, BookOpen, Lightbulb } from 'lucide-react';

interface ContextualBannerProps {
  screenId: string;
  title: string;
  summary: string;
  sourceOrg: string;
  methodologyNote: string;
  keyTakeaway?: string;
  defaultOpen?: boolean;
}

export const ContextualBanner: React.FC<ContextualBannerProps> = ({
  screenId,
  title,
  summary,
  sourceOrg,
  methodologyNote,
  keyTakeaway,
  defaultOpen = false,
}) => {
  const storageKey = `climatoscope_banner_${screenId}`;
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) return saved === 'true';
    }
    return defaultOpen;
  });

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden mb-6 transition-all duration-200">
      <button
        onClick={toggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-850/50 transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Guide d'analyse contextuel :</span>
              <span className="text-cyan-300 font-normal">{title}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-[11px] hidden md:inline">{isOpen ? 'Masquer le guide' : 'Comprendre cet écran'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in bg-slate-950/40">
          <div className="space-y-1">
            <span className="font-semibold text-cyan-300 flex items-center gap-1 text-[11px] uppercase tracking-wider font-mono">
              <Info className="w-3.5 h-3.5" />
              Ce que mesure cet écran
            </span>
            <p className="leading-relaxed text-[11.5px] text-slate-300">
              {summary}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              Source officielle & Méthode
            </span>
            <p className="leading-relaxed text-[11.5px] text-slate-300 font-mono text-[11px]">
              <strong className="text-white font-sans">{sourceOrg}</strong> — {methodologyNote}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-amber-300 flex items-center gap-1 text-[11px] uppercase tracking-wider font-mono">
              <Lightbulb className="w-3.5 h-3.5" />
              Clé d'interprétation physique
            </span>
            <p className="leading-relaxed text-[11.5px] text-slate-300">
              {keyTakeaway || 'Observez la tendance pluridécennale lissée pour distinguer les cycles naturels des forçages anthropiques à long terme.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
