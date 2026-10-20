import React, { useState } from 'react';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { ContextualBanner } from '../components/common/ContextualBanner';
import { HelpTooltip } from '../components/common/HelpTooltip';
import { WorldMapPicker } from '../components/power/WorldMapPicker';
import { PRESET_LOCATIONS } from '../data/baseline/nasa-power-sample';
import { useDataset } from '../hooks/useDataset';
import { datasetService } from '../services/dataset-service';
import { GeoLocation } from '../types/api';
import { exportDatasetToCSV, exportDatasetToJSON } from '../utils/export';
import { Radio, MapPin, RefreshCw, Info, Download, ExternalLink } from 'lucide-react';

export const NasaPowerPage: React.FC = () => {
  const [currentLoc, setCurrentLoc] = useState<GeoLocation>(datasetService.getNasaPowerLocation());
  const [customLat, setCustomLat] = useState<string>(currentLoc.latitude.toString());
  const [customLon, setCustomLon] = useState<string>(currentLoc.longitude.toString());
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const power = useDataset(`nasa-power-radiation-${currentLoc.id}`);

  const handleSelectPreset = (loc: GeoLocation) => {
    setIsCustomMode(false);
    setCurrentLoc(loc);
    setCustomLat(loc.latitude.toString());
    setCustomLon(loc.longitude.toString());
    datasetService.setNasaPowerLocation(loc);
    power.refresh();
  };

  const handleSelectMapCoords = (lat: number, lon: number) => {
    const customLoc: GeoLocation = {
      id: `custom_${lat.toFixed(2)}_${lon.toFixed(2)}`,
      name: `Point [${lat.toFixed(2)}°, ${lon.toFixed(2)}°]`,
      country: 'Coordonnées carte',
      latitude: lat,
      longitude: lon,
    };
    setIsCustomMode(true);
    setCustomLat(lat.toString());
    setCustomLon(lon.toString());
    setCurrentLoc(customLoc);
    datasetService.setNasaPowerLocation(customLoc);
    power.refresh();
  };

  const handleApplyCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Veuillez entrer des coordonnées valides (-90° à +90° pour la latitude, -180° à +180° pour la longitude).');
      return;
    }
    handleSelectMapCoords(lat, lon);
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!power.dataset) return;
    if (format === 'csv') {
      exportDatasetToCSV(power.dataset.metadata, power.dataset.data);
    } else {
      exportDatasetToJSON(power.dataset.metadata, power.dataset.data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-700/40 text-cyan-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Module 4 — ☀️ NASA POWER (Rayonnement au Sol)</span>
                <HelpTooltip
                  title="Rayonnement Solaire au Sol"
                  content="Paramètre ALLSKY_SFC_SW_DWN : flux radiatif solaire incident descendant intégrant la nébulosité réelle mesuré par satellite, en kWh/m²/jour. Permet d'explorer l'énergie reçue au sol n'importe où sur le globe."
                />
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Prediction Of Worldwide Energy Resources — NASA Langley Research Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={power.status} onRefresh={power.refresh} />
          <QualityBadge report={power.qualityReport} />
          {power.dataset && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExport('csv')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter la série en CSV"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition cursor-pointer"
                title="Exporter la série en JSON"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Onboarding Banner */}
      <ContextualBanner
        screenId="nasa_power"
        title="Rayonnement solaire incident au sol & Climatologie locale"
        summary="Le programme NASA POWER fournit des données de rayonnement solaire descendant issues de réanalyses satellite mondiales à résolution 0.5° × 0.5°."
        sourceOrg="NASA Langley Research Center (POWER Project)"
        methodologyNote="Intégration journalière et mensuelle du flux à ciel variable (ALLSKY_SFC_SW_DWN) en kWh/m²/jour, combinant données satellitaires GEWEX/SRB, CERES et assimilation météorologique MERRA-2."
        keyTakeaway="Ce module illustre la différence fondamentale entre l'irradiance au sommet de l'atmosphère (TSI ~1361 W/m²) et le flux effectif absorbé au sol, modulé par l'épaisseur optique atmosphérique, les nuages et la latitude."
        defaultOpen={true}
      />

      {/* Interactive World Map Picker */}
      <WorldMapPicker
        currentLocation={currentLoc}
        onSelectLocation={handleSelectPreset}
        onSelectCoordinates={handleSelectMapCoords}
      />

      {/* Location Selector Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Observatoires et villes de référence :
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_LOCATIONS.map((loc) => {
              const isSelected = !isCustomMode && currentLoc.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectPreset(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{loc.name}</span>
                  <span className="text-[10px] ml-1.5 opacity-70 font-mono">({loc.country})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom coordinates form */}
        <form onSubmit={handleApplyCustomCoords} className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Ou coordonnées libres :</span>
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-slate-400">Lat :</label>
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-slate-400">Lon :</label>
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-600 transition cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Interroger l'API NASA POWER</span>
          </button>
        </form>
      </div>

      {/* Explanatory Context */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          La variable <code className="text-cyan-300 font-mono">ALLSKY_SFC_SW_DWN</code> (All Sky Surface Downward Shortwave Irradiance) mesure l'énergie solaire moyenne arrivant au sol, après absorption et diffusion par les nuages, la vapeur d'eau et les aérosols.
          Exprimée en <strong className="text-slate-100">kWh/m²/jour</strong>, elle met en évidence l'effet direct de la latitude, de la nébulosité locale et de la dynamique atmosphérique régionale.
        </div>
      </div>

      {/* Graphique principal : NASA POWER */}
      {power.dataset && (
        <TimeSeriesChart
          data={power.dataset.data}
          metadata={power.dataset.metadata}
          status={power.status}
          color="#06b6d4"
          showMovingAverageDefault={true}
        />
      )}

      {/* Metadata & API Details */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="text-slate-200 font-semibold font-mono uppercase tracking-wider">
          Caractéristiques de l'API NASA POWER :
        </h4>
        <p>
          Point de terminaison public : <code className="text-cyan-300 font-mono">https://power.larc.nasa.gov/api/temporal/monthly/point</code>
        </p>
        <p>
          Données issues des satellites météorologiques géostationnaires et polaires (FLASHFlux, CERES SYN1deg).
          Mise en cache IndexedDB automatique pour un usage offline transparent.
        </p>
      </div>
    </div>
  );
};
