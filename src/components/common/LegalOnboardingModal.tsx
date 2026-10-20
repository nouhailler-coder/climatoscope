import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, ExternalLink, Scale, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import { ClimatoscopeLogo } from './ClimatoscopeLogo';

interface LegalOnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY_ONBOARDING = 'climatoscope_legal_accepted';

export const LegalOnboardingModal: React.FC<LegalOnboardingModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const hasAccepted = localStorage.getItem(STORAGE_KEY_ONBOARDING);
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40">
          <div className="flex items-center justify-between">
            <ClimatoscopeLogo size="md" />
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              Bienvenue sur ClimatOSCOPE
            </span>
          </div>
          <h2 id="onboarding-title" className="text-xl font-bold text-white mt-3 flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            Mentions Légales & Avertissement de Non-Responsabilité
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            À lire attentivement avant toute consultation des mesures climatiques ouvertes.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          {/* Important Disclaimer Notice Box */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              Clause expresse de non-responsabilité de l'éditeur
            </div>
            <p>
              L’auteur et éditeur de cette application <strong>décline formellement toute responsabilité</strong> quant à l’exactitude, la complétude, la pérennité, la mise à jour ou l’exhaustivité des données scientifiques présentées.
            </p>
            <p className="text-[11px] text-amber-300/90">
              L'éditeur ne saurait en aucun cas être tenu responsable de tout dommage direct ou indirect, perte, omission ou décision prise sur la base des séries temporelles, visualisations ou corrélations statistiques fournies par cette interface.
            </p>
          </div>

          {/* Section 1: Provenance des Données */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              1. Provenance des données open data et organismes tiers
            </h3>
            <p>
              ClimatOSCOPE est un <strong>visualisateur scientifique et éducatif indépendant</strong>. Toutes les observations, reconstructions et réanalyses affichées proviennent directement des dépôts institutionnels publics des grands organismes de recherche mondiaux :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
              <li><strong>NASA GISS</strong> (Goddard Institute for Space Studies) — Séries GISTEMP v4 & SAOD</li>
              <li><strong>NOAA GML & NCEI</strong> — CO₂ Mauna Loa, CH₄, N₂O, AGGI, Océans Argo & NOAAGlobalTemp</li>
              <li><strong>Berkeley Earth</strong> — Reconstructions terrestres et marines mondiales</li>
              <li><strong>NASA / LASP LISIRD</strong> — Irradiance Solaire Totale (TSI, SORCE, TSIS-1)</li>
              <li><strong>WDC-SILSO</strong> (Observatoire Royal de Belgique) — Taches solaires historiques (SSN)</li>
              <li><strong>NSIDC</strong> (National Snow and Ice Data Center) — Banquise arctique et antarctique</li>
              <li><strong>Copernicus ECMWF (ERA5 / CAMS)</strong> — Températures zonales et épaisseur optique des aérosols</li>
            </ul>
            <p className="text-[11px] text-slate-400 italic">
              L’application ne modifie, n'extrapole ni n'altère les valeurs numériques brutes communiquées par ces institutions.
            </p>
          </div>

          {/* Section 2: Distinction Épistémologique */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              2. Distinction stricte : Corrélation ≠ Causalité
            </h3>
            <p>
              Les outils d’analyse intégrés (comparateur multi-séries, coefficient de Pearson <em>r</em>, régression linéaire par moindres carrés <em>R²</em>) sont de purs outils d'exploration mathématique. 
              <strong> Une corrélation statistique forte entre deux grandeurs ne démontre en aucun cas un lien de causalité physique.</strong> Tout mécanisme causal doit être étayé par les lois de la thermodynamique, du transfert radiatif et de la physique de l'atmosphère.
            </p>
          </div>

          {/* Section 3: Fonctionnement hors-ligne et cache PWA */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              3. Confidentialité & Stockage local
            </h3>
            <p>
              ClimatOSCOPE fonctionne entièrement côté client sans aucun tracking, cookie publicitaire ni collecte de données personnelles. Vos préférences, signets et caches de données sont conservés localement sur votre appareil (IndexedDB et CacheStorage du navigateur).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
            En poursuivant, vous reconnaissez avoir pris connaissance de ces mentions.
          </div>
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/20 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>J'ai compris et j'accepte</span>
          </button>
        </div>
      </div>
    </div>
  );
};
