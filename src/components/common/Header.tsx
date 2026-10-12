import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Activity, Sun, Flame, Thermometer, Radio, Waves, Globe, Mountain, Scale, BookOpen, HelpCircle, Compass, Cloud } from 'lucide-react';

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
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const isOnline = useOnlineStatus();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Observatoire', icon: <Activity className="w-4 h-4" /> },
    { id: 'solar', label: 'Soleil', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'co2', label: 'CO₂ & GES', icon: <Flame className="w-4 h-4 text-emerald-400" /> },
    { id: 'temperature', label: 'Température', icon: <Thermometer className="w-4 h-4 text-rose-400" /> },
    { id: 'zonal', label: 'Zonal ERA5', icon: <Globe className="w-4 h-4 text-violet-400" /> },
    { id: 'ice', label: 'Banquise', icon: <Compass className="w-4 h-4 text-cyan-300" /> },
    { id: 'ocean', label: 'Océans', icon: <Waves className="w-4 h-4 text-blue-400" /> },
    { id: 'ceres', label: 'CERES', icon: <Globe className="w-4 h-4 text-amber-300" /> },
    { id: 'volcano', label: 'Volcans', icon: <Mountain className="w-4 h-4 text-orange-400" /> },
    { id: 'aerosols', label: 'Aérosols', icon: <Cloud className="w-4 h-4 text-sky-400" /> },
    { id: 'power', label: 'NASA POWER', icon: <Radio className="w-4 h-4 text-cyan-400" /> },
    { id: 'comparator', label: 'Comparateur', icon: <Scale className="w-4 h-4 text-indigo-400" /> },
    { id: 'sources', label: 'Sources', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'guide', label: 'Comprendre', icon: <HelpCircle className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800 p-0.5 shadow-lg shadow-cyan-950/40">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-lg">🌍</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                    Climat<span className="text-cyan-400">OSCOPE</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">v0.6</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                  Comprendre le climat à partir des mesures.
                </p>
              </div>
            </button>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}
                title={isOnline ? 'En ligne' : 'Hors-ligne'}
              />
              <PWAInstallButton />
            </div>
          </div>

          {/* Desktop Nav and Tools */}
          <div className="flex items-center justify-between md:justify-end gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <nav className="flex items-center gap-1" role="tablist">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    role="tab"
                    aria-selected={isActive}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-800">
              <div
                className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800/80"
                title={isOnline ? 'Connectivité active aux serveurs NASA/NOAA' : 'Mode hors-ligne'}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{isOnline ? 'Live Open-Data' : 'Local Offline'}</span>
              </div>
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
