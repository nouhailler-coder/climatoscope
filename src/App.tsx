/**
 * ClimatOSCOPE — Application Root
 * Observatoire scientifique des mesures climatiques ouvertes
 */

import React, { useState } from 'react';
import { Header, NavTab } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineIndicator } from './components/common/OfflineIndicator';

import { DashboardPage } from './pages/DashboardPage';
import { SolarPage } from './pages/SolarPage';
import { Co2Page } from './pages/Co2Page';
import { TemperaturePage } from './pages/TemperaturePage';
import { ZonalPage } from './pages/ZonalPage';
import { SeaIcePage } from './pages/SeaIcePage';
import { ArgoPage } from './pages/ArgoPage';
import { CeresPage } from './pages/CeresPage';
import { VolcanoPage } from './pages/VolcanoPage';
import { AerosolsPage } from './pages/AerosolsPage';
import { NasaPowerPage } from './pages/NasaPowerPage';
import { ComparatorPage } from './pages/ComparatorPage';
import { SourcesPage } from './pages/SourcesPage';
import { HowToReadPage } from './pages/HowToReadPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header with Navigation & PWA Controls */}
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
        {currentTab === 'solar' && <SolarPage />}
        {currentTab === 'co2' && <Co2Page />}
        {currentTab === 'temperature' && <TemperaturePage />}
        {currentTab === 'zonal' && <ZonalPage />}
        {currentTab === 'ice' && <SeaIcePage />}
        {currentTab === 'ocean' && <ArgoPage />}
        {currentTab === 'ceres' && <CeresPage />}
        {currentTab === 'volcano' && <VolcanoPage />}
        {currentTab === 'aerosols' && <AerosolsPage />}
        {currentTab === 'power' && <NasaPowerPage />}
        {currentTab === 'comparator' && <ComparatorPage />}
        {currentTab === 'sources' && <SourcesPage />}
        {currentTab === 'guide' && <HowToReadPage />}
      </main>

      {/* Floating Offline Status Toast */}
      <OfflineIndicator />

      {/* Institutional Provenance Footer */}
      <Footer />
    </div>
  );
}
