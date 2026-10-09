import React from 'react';
import { ExternalLink, Database, ShieldAlert, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-900 bg-slate-950/70 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-200 font-semibold font-sans">
              <span>🌍 ClimatOSCOPE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                Observatoire V0.1
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-3">
              Application scientifique progressive (PWA) dédiée à la visualisation, à l'analyse comparative et à la traçabilité des séries temporelles du climat issues d'organismes de recherche internationaux.
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Principe : observer → comparer → analyser → comprendre.
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Sources Institutionnelles Intégrées
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a
                  href="https://gml.noaa.gov/ccgg/trends/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  NOAA Global Monitoring Laboratory (CO₂ Mauna Loa) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://data.giss.nasa.gov/gistemp/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  NASA GISTEMP v4 (Goddard Institute for Space Studies) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://lasp.colorado.edu/lisird/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  NASA / LASP LISIRD & WDC-SILSO (Irradiance solaire & Taches) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://power.larc.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1"
                >
                  NASA POWER API (Langley Research Center) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Garantie d'Intégrité Scientifique
            </h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Aucune donnée synthétique ni extrapolée n'est injectée. Chaque graphique affiche l'organisme d'origine, l'unité de mesure physique, la période de référence et le protocole de métadonnées.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architecture Offline-First (IndexedDB + PWA Workbox)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} ClimatOSCOPE — Logiciel libre d'exploration scientifique open data.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Zéro backend requis (Exécutable 100% côté client)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
