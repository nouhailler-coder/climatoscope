import React from 'react';
import { PRESET_LOCATIONS } from '../../data/baseline/nasa-power-sample';
import { GeoLocation } from '../../types/api';
import { MapPin } from 'lucide-react';

interface WorldMapPickerProps {
  currentLocation: GeoLocation;
  onSelectLocation: (loc: GeoLocation) => void;
  onSelectCoordinates: (lat: number, lon: number) => void;
}

export const WorldMapPicker: React.FC<WorldMapPickerProps> = ({
  currentLocation,
  onSelectLocation,
  onSelectCoordinates,
}) => {
  // Convert lat [-90, 90] and lon [-180, 180] to SVG viewBox (0 to 720, 0 to 360)
  const lonToX = (lon: number) => ((lon + 180) / 360) * 720;
  const latToY = (lat: number) => ((90 - lat) / 180) * 360;

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - svgRect.left;
    const clickY = e.clientY - svgRect.top;

    const scaleX = 720 / svgRect.width;
    const scaleY = 360 / svgRect.height;

    const svgX = clickX * scaleX;
    const svgY = clickY * scaleY;

    const lon = Number(((svgX / 720) * 360 - 180).toFixed(2));
    const lat = Number((90 - (svgY / 360) * 180).toFixed(2));

    onSelectCoordinates(lat, lon);
  };

  const currX = lonToX(currentLocation.longitude);
  const currY = latToY(currentLocation.latitude);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Carte Mondiale Interactive (Cliquez sur n'importe quel point du globe) :
        </span>
        <span className="text-xs font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Lat: {currentLocation.latitude.toFixed(2)}° · Lon: {currentLocation.longitude.toFixed(2)}°
        </span>
      </div>

      <div className="relative border border-slate-800/80 rounded-lg overflow-hidden bg-[#070d19]">
        <svg
          viewBox="0 0 720 360"
          className="w-full h-auto cursor-crosshair select-none block"
          onClick={handleMapClick}
        >
          {/* Graticule Grid Lines */}
          <line x1="0" y1="180" x2="720" y2="180" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="360" y1="0" x2="360" y2="360" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="720" y2="90" stroke="#1e293b" strokeWidth="0.75" />
          <line x1="0" y1="270" x2="720" y2="270" stroke="#1e293b" strokeWidth="0.75" />
          <line x1="180" y1="0" x2="180" y2="360" stroke="#1e293b" strokeWidth="0.75" />
          <line x1="540" y1="0" x2="540" y2="360" stroke="#1e293b" strokeWidth="0.75" />

          {/* Stylized Continents Outlines */}
          {/* Eurasia & Africa */}
          <path
            d="M 330 60 Q 400 40 480 60 Q 560 90 540 160 Q 480 180 430 190 Q 400 230 390 280 Q 360 300 340 250 Q 310 180 320 120 Z"
            fill="#1e293b"
            opacity="0.6"
            stroke="#475569"
            strokeWidth="0.8"
          />
          {/* Americas */}
          <path
            d="M 120 50 Q 180 60 170 120 Q 150 160 170 180 Q 210 220 190 290 Q 160 320 140 260 Q 130 190 100 130 Z"
            fill="#1e293b"
            opacity="0.6"
            stroke="#475569"
            strokeWidth="0.8"
          />
          {/* Australia */}
          <path
            d="M 580 230 Q 640 220 630 270 Q 580 290 560 250 Z"
            fill="#1e293b"
            opacity="0.6"
            stroke="#475569"
            strokeWidth="0.8"
          />
          {/* Antarctica */}
          <path
            d="M 50 330 Q 360 310 670 330 L 720 360 L 0 360 Z"
            fill="#1e293b"
            opacity="0.4"
            stroke="#475569"
            strokeWidth="0.8"
          />

          {/* Equator & Prime Meridian Labels */}
          <text x="5" y="176" fill="#64748b" fontSize="8" fontFamily="monospace">Équateur (0°)</text>
          <text x="365" y="12" fill="#64748b" fontSize="8" fontFamily="monospace">Méridien 0°</text>

          {/* Preset Location Pins */}
          {PRESET_LOCATIONS.map((loc) => {
            const x = lonToX(loc.longitude);
            const y = latToY(loc.latitude);
            const isSelected = loc.id === currentLocation.id;

            return (
              <g
                key={loc.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLocation(loc);
                }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#38bdf8' : '#94a3b8'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                <text
                  x={x + 7}
                  y={y + 3}
                  fill={isSelected ? '#38bdf8' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {loc.name}
                </text>
              </g>
            );
          })}

          {/* Active Target Reticle */}
          <circle
            cx={currX}
            cy={currY}
            r="12"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="animate-spin"
          />
          <circle cx={currX} cy={currY} r="3" fill="#38bdf8" />
        </svg>
      </div>
      <div className="mt-2 text-[11px] text-slate-400 font-mono text-center">
        Projection équirectangulaire standard WGS84 · Compatible API NASA POWER
      </div>
    </div>
  );
};
