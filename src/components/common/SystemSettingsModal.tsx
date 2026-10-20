import React, { useState } from 'react';
import {
  X,
  Settings,
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  Calendar,
  Clock,
  Sun,
  Moon,
  ShieldCheck,
  Smartphone,
  HardDrive,
  Info,
  Server,
  CloudCheck,
} from 'lucide-react';
import { useAutoUpdate } from '../../hooks/useAutoUpdate';
import { useTheme } from '../../context/ThemeContext';
import { APP_RELEASE_DATE, APP_VERSION } from '../../services/update-service';
import { ClimatoscopeLogo } from './ClimatoscopeLogo';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal: () => void;
  onOpenInstallModal: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLegal,
  onOpenInstallModal,
}) => {
  const { isChecking, lastCheckDate, hasUpdate, message, checkForUpdates, forceUpdate } = useAutoUpdate();
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, isInstallable } = usePWAInstall();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setFeedback('Recherche de mises à jour en cours...');
    const found = await checkForUpdates();
    if (found) {
      setFeedback('Nouvelle mise à jour détectée et téléchargée !');
    } else {
      setFeedback('Votre application est parfaitement à jour.');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleForceUpdate = () => {
    setFeedback('Purge des caches et rechargement immédiat...');
    forceUpdate();
  };

  const formattedLastCheck = lastCheckDate
    ? new Date(lastCheckDate).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : 'Première session en cours';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-title" className="text-base font-bold text-white flex items-center gap-2">
                Paramètres Système & Mises à Jour
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Statut applicatif, synchronisation en arrière-plan et préférences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fermer les paramètres"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 custom-scrollbar">
          {/* Card: Version & Mises à jour */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-sm">Gestion des versions & Mises à jour</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                {APP_VERSION}
              </span>
            </div>

            {/* Release Date & Last Check Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px] font-mono">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10.5px]">Date de sortie :</div>
                  <div className="text-slate-200 font-semibold">{APP_RELEASE_DATE}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10.5px]">Dernière vérification :</div>
                  <div className="text-emerald-300 font-semibold">{formattedLastCheck}</div>
                </div>
              </div>
            </div>

            {/* Background update status banner */}
            <div className="flex items-start gap-2 text-[11px] p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200 font-mono">
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Mises à jour automatiques en arrière-plan :</strong> Le service PWA vérifie régulièrement la disponibilité de nouvelles versions (toutes les 30 min ou au retour d'onglet) et les installe automatiquement.
              </span>
            </div>

            {/* Status Feedback if any */}
            {(feedback || message) && (
              <div className="text-[11.5px] p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>{feedback || message}</span>
              </div>
            )}

            {/* Action Buttons: Check & Force */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                onClick={handleManualCheck}
                disabled={isChecking}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Vérification...' : 'Vérifier les mises à jour'}</span>
              </button>

              <button
                onClick={handleForceUpdate}
                disabled={isChecking}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/70 hover:border-rose-700/50 hover:text-rose-200 text-slate-300 font-medium text-xs border border-slate-700 transition cursor-pointer"
                title="Vide tous les caches et force le rechargement depuis le serveur"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-rose-400" />
                <span>Forcer la mise à jour</span>
              </button>
            </div>
          </div>

          {/* Card: Thème Sombre / Clair */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white text-sm flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                Thème d'affichage
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Basculer entre le mode sombre (observatoire) et le mode clair
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer text-xs font-mono"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Passer en Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Passer en Sombre</span>
                </>
              )}
            </button>
          </div>

          {/* Card: Installation de l'application & Mentions légales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Install Shortcut */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Installation sur l'appareil
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isInstalled
                    ? 'L\'application est déjà installée sur cet appareil en mode autonome.'
                    : 'Ajoutez ClimatOSCOPE sur votre écran d\'accueil mobile ou bureau.'}
                </p>
              </div>

              <button
                onClick={onOpenInstallModal}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 text-xs font-medium transition cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isInstalled ? 'Instructions PWA' : 'Installer l\'application'}</span>
              </button>
            </div>

            {/* Legal terms & disclaimer shortcut */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mentions Légales & Avertissement
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Clause de non-responsabilité de l'éditeur et provenance open-data.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenLegal();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Revoir les mentions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Déployé sur Cloudflare Pages</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
