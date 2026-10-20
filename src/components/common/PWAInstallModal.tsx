import React from 'react';
import { X, Smartphone, Monitor, Download, Share, PlusSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { ClimatoscopeLogo } from './ClimatoscopeLogo';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="install-title" className="text-base font-bold text-white flex items-center gap-2">
                Installer ClimatOSCOPE
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Application autonome, accès direct et mode hors-ligne
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 custom-scrollbar">
          {/* Logo & Value Proposition */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-4">
            <ClimatoscopeLogo size="md" showText={false} />
            <div>
              <div className="font-semibold text-white text-sm">
                Une véritable application sur votre écran
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Sans passer par un magasin d'applications : lancement instantané, affichage plein écran, aucune barre d'adresse et consultation 100% hors-ligne.
              </p>
            </div>
          </div>

          {/* If Native One-Click Install is ready (Chrome / Edge / Android) */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-600/40 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Installation en un clic disponible pour votre navigateur !
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Votre navigateur prend en charge l'installation directe. Cliquez ci-dessous pour ajouter ClimatOSCOPE à vos applications.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/50 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Installer maintenant sur cet appareil</span>
              </button>
            </div>
          )}

          {/* Guide for iOS Safari */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2 text-xs">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Sur iPhone et iPad (Safari iOS)
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-[11.5px] text-slate-300 leading-relaxed font-sans">
              <li>
                Appuyez sur l'icône de partage <span className="text-cyan-400 font-bold inline-flex items-center gap-1 font-mono"><Share className="w-3 h-3 inline" /> Partager</span> dans la barre d'action Safari.
              </li>
              <li>
                Faites défiler vers le bas et sélectionnez <strong className="text-white">Sur l'écran d'accueil</strong>.
              </li>
              <li>
                Confirmez en touchant <strong className="text-white">Ajouter</strong> en haut à droite.
              </li>
            </ol>
          </div>

          {/* Guide for Android */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2 text-xs">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Sur Android (Chrome, Firefox, Brave)
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-[11.5px] text-slate-300 leading-relaxed font-sans">
              <li>
                Ouvrez le menu du navigateur <strong className="text-white">(icône 3 points ⋮)</strong> en haut à droite.
              </li>
              <li>
                Appuyez sur <strong className="text-white">Installer l'application</strong> ou <strong>Ajouter à l'écran d'accueil</strong>.
              </li>
              <li>
                Validez le pop-up pour créer l'icône sur votre page d'accueil.
              </li>
            </ol>
          </div>

          {/* Guide for Desktop (Chrome, Edge, Brave, Mac/Windows/Linux) */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2 text-xs">
              <Monitor className="w-4 h-4 text-indigo-400" />
              Sur Ordinateur (Chrome, Edge, Arc)
            </div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              Cliquez sur l'icône <strong className="text-white">Installer ClimatOSCOPE</strong> (petit écran avec flèche) située tout à droite dans la <strong>barre d'adresse URL</strong> de votre navigateur, ou dans le menu principal <em>Paramètres &gt; Applications &gt; Installer ClimatOSCOPE</em>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            PWA autonome · Sans téléchargement lourd
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
