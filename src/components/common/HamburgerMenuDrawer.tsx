import React, { useEffect } from 'react';
import {
  X,
  Activity,
  Sun,
  Flame,
  Thermometer,
  Radio,
  Waves,
  Globe,
  Mountain,
  Scale,
  BookOpen,
  HelpCircle,
  Compass,
  Cloud,
  Settings,
  Download,
  Moon,
  ShieldCheck,
  ExternalLink,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { NavTab } from './Header';
import { ClimatoscopeLogo } from './ClimatoscopeLogo';
import { useTheme } from '../../context/ThemeContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface NavCategory {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    id: NavTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
  }>;
}

interface HamburgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onOpenLegal: () => void;
  onOpenInstall: () => void;
}

export const HamburgerMenuDrawer: React.FC<HamburgerMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenLegal,
  onOpenInstall,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isInstalled } = usePWAInstall();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: NavCategory[] = [
    {
      title: "Vue d'ensemble",
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      items: [
        {
          id: 'dashboard',
          label: 'Observatoire Général',
          sublabel: 'Tableau de bord multi-indicateurs',
          icon: <Activity className="w-4 h-4" />,
          color: 'text-cyan-400',
        },
      ],
    },
    {
      title: 'Climat & Températures',
      icon: <Thermometer className="w-4 h-4 text-rose-400" />,
      items: [
        {
          id: 'temperature',
          label: 'Température Globale',
          sublabel: 'NASA GISS, NOAA NCEI, Berkeley Earth',
          icon: <Thermometer className="w-4 h-4" />,
          color: 'text-rose-400',
        },
        {
          id: 'zonal',
          label: 'Températures Zonales',
          sublabel: 'Copernicus ERA5 & Amplification Arctique',
          icon: <Globe className="w-4 h-4" />,
          color: 'text-violet-400',
        },
      ],
    },
    {
      title: 'Atmosphère & Gaz à Effet de Serre',
      icon: <Flame className="w-4 h-4 text-emerald-400" />,
      items: [
        {
          id: 'co2',
          label: 'CO₂ & Gaz à Effet de Serre',
          sublabel: 'Mauna Loa (CO₂), CH₄, N₂O & Indice AGGI',
          icon: <Flame className="w-4 h-4" />,
          color: 'text-emerald-400',
        },
        {
          id: 'aerosols',
          label: 'Aérosols & Émissions SO₂',
          sublabel: 'Copernicus CAMS & Inventaire CEDS',
          icon: <Cloud className="w-4 h-4" />,
          color: 'text-sky-400',
        },
      ],
    },
    {
      title: 'Soleil, Énergie & Rayonnement',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      items: [
        {
          id: 'solar',
          label: 'Activité & Cycles Solaires',
          sublabel: 'Irradiance TSI LISIRD & Taches SILSO',
          icon: <Sun className="w-4 h-4" />,
          color: 'text-amber-400',
        },
        {
          id: 'ceres',
          label: 'Bilan Énergétique CERES',
          sublabel: 'Déséquilibre TOA (EEI), OLR & Albédo',
          icon: <Globe className="w-4 h-4" />,
          color: 'text-amber-300',
        },
        {
          id: 'power',
          label: 'NASA POWER (Insolation au Sol)',
          sublabel: 'Rayonnement local & météo par coordonnées',
          icon: <Radio className="w-4 h-4" />,
          color: 'text-cyan-400',
        },
      ],
    },
    {
      title: 'Océans, Cryosphère & Événements',
      icon: <Waves className="w-4 h-4 text-blue-400" />,
      items: [
        {
          id: 'ice',
          label: 'Banquise Polaire (NSIDC)',
          sublabel: 'Extrêmes Arctique (Sep) & Antarctique (Fév)',
          icon: <Compass className="w-4 h-4" />,
          color: 'text-cyan-300',
        },
        {
          id: 'ocean',
          label: 'Contenu Thermique Océanique',
          sublabel: 'Flotteurs Argo 0-2000m & couche 0-700m',
          icon: <Waves className="w-4 h-4" />,
          color: 'text-blue-400',
        },
        {
          id: 'volcano',
          label: 'Éruptions Volcaniques (SAOD)',
          sublabel: 'Aérosols stratosphériques NASA GISS',
          icon: <Mountain className="w-4 h-4" />,
          color: 'text-orange-400',
        },
      ],
    },
    {
      title: "Outils d'Analyse & Corrélations",
      icon: <Scale className="w-4 h-4 text-indigo-400" />,
      items: [
        {
          id: 'comparator',
          label: 'Comparateur Multi-Séries',
          sublabel: 'Pearson r, R², normalisations & régressions',
          icon: <Scale className="w-4 h-4" />,
          color: 'text-indigo-400',
        },
      ],
    },
    {
      title: 'Références & Documentation',
      icon: <BookOpen className="w-4 h-4 text-slate-400" />,
      items: [
        {
          id: 'guide',
          label: 'Comment Lire les Graphiques ?',
          sublabel: 'Comprendre anomalies, moyennes et tendances',
          icon: <HelpCircle className="w-4 h-4" />,
          color: 'text-slate-300',
        },
        {
          id: 'sources',
          label: 'Catalogue des Sources & APIs',
          sublabel: 'URLs, formats, licences et méthodologies',
          icon: <BookOpen className="w-4 h-4" />,
          color: 'text-slate-300',
        },
      ],
    },
  ];

  const handleItemClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal des fonctionnalités"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm sm:max-w-md bg-slate-950 border-r border-slate-800 flex flex-col h-full shadow-2xl relative z-10">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <ClimatoscopeLogo size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categorized Navigation Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
            {categories.map((category) => (
              <div key={category.title} className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {category.icon}
                  <span>{category.title}</span>
                </div>

                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer group ${
                          isActive
                            ? 'bg-cyan-950/70 border border-cyan-800/80 text-white shadow-sm'
                            : 'hover:bg-slate-900/90 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isActive ? 'bg-cyan-900/80 text-cyan-300' : 'bg-slate-900 text-slate-400 group-hover:text-cyan-300'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className={`font-medium ${isActive ? 'text-cyan-300 font-semibold' : 'text-slate-200'}`}>
                              {item.label}
                            </div>
                            <div className="text-[10.5px] text-slate-400 font-mono">
                              {item.sublabel}
                            </div>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>Paramètres</span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-medium border border-cyan-800/80 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalled ? 'App installée' : 'Installer l\'app'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenLegal();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mentions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
