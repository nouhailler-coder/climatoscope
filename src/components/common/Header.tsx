import React from 'react';
import { Menu, Settings, Sun, Moon, Download, Activity, Thermometer, Flame, Scale, Globe } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useTheme } from '../../context/ThemeContext';
import { ClimatoscopeLogo } from './ClimatoscopeLogo';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export type NavTab =
  | 'dashboard'
  | 'solar'
  | 'co2'
  | 'temperature'
  | 'zonal'
  | 'ice'
  | 'ocean'
  | 'ceres'
  | 'volcano'
  | 'aerosols'
  | 'power'
  | 'comparator'
  | 'sources'
  | 'guide';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenHamburger: () => void;
  onOpenSettings: () => void;
  onOpenInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenHamburger,
  onOpenSettings,
  onOpenInstall,
}) => {
  const isOnline = useOnlineStatus();
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, isInstallable } = usePWAInstall();

  // Primary top-level shortcuts visible on desktop
  const quickTabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Observatoire', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'temperature', label: 'Températures', icon: <Thermometer className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'co2', label: 'CO₂ & GES', icon: <Flame className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'comparator', label: 'Comparateur', icon: <Scale className="w-3.5 h-3.5 text-indigo-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Hamburger Button & Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={onOpenHamburger}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-xs group"
              aria-label="Ouvrir le menu des fonctionnalités"
              title="Menu des catégories & fonctionnalités"
            >
              <Menu className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-semibold hidden sm:inline text-white">Menu</span>
            </button>

            {/* Logo */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center cursor-pointer focus:outline-none"
              aria-label="Aller à l'observatoire"
            >
              <ClimatoscopeLogo size="sm" />
            </button>
          </div>

          {/* Center / Desktop quick tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {quickTabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 shadow-xs border border-slate-700/80 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={onOpenHamburger}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300 transition cursor-pointer font-mono"
            >
              <span>+ Tous les modules</span>
            </button>
          </div>

          {/* Right: Actions, Theme, Settings & PWA Install */}
          <div className="flex items-center gap-2">
            {/* Online / Offline indicator badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/80"
              title={isOnline ? 'Flux direct actif' : 'Mode hors-ligne'}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className="hidden md:inline">{isOnline ? 'Open-Data' : 'Hors-ligne'}</span>
            </div>

            {/* PWA Install Button */}
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white shadow-xs border border-cyan-400/30 transition cursor-pointer"
              title="Installer ClimatOSCOPE sur votre mobile ou ordinateur"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isInstalled ? 'App installée' : 'Installer l\'app'}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
              title={theme === 'dark' ? 'Basculer vers le thème clair' : 'Basculer vers le thème sombre'}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* System Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer relative"
              title="Paramètres système & Mises à jour"
              aria-label="Paramètres système"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
