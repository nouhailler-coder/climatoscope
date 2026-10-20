/**
 * ClimatOSCOPE — Application Root
 * Observatoire scientifique des mesures climatiques ouvertes
 */

import React, { useState } from 'react';
import { Header, NavTab } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { HamburgerMenuDrawer } from './components/common/HamburgerMenuDrawer';
import { SystemSettingsModal } from './components/common/SystemSettingsModal';
import { LegalOnboardingModal } from './components/common/LegalOnboardingModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { ThemeProvider } from './context/ThemeContext';

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

export function ClimatOSCOPEApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200">
      {/* Header with Navigation & Controls */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenHamburger={() => setIsHamburgerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

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

      {/* Categorized Hamburger Navigation Drawer */}
      <HamburgerMenuDrawer
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLegal={() => setIsLegalOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* System Settings & Background Update Modal */}
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenLegal={() => setIsLegalOpen(true)}
        onOpenInstallModal={() => setIsInstallOpen(true)}
      />

      {/* Legal Mentions & Onboarding Disclaimer Modal */}
      <LegalOnboardingModal
        forceOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
      />

      {/* PWA In-App Install Step-by-Step Modal */}
      <PWAInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ClimatOSCOPEApp />
    </ThemeProvider>
  );
}
