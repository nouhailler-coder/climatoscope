import React from 'react';
import { HelpCircle, CloudRain, Thermometer, TrendingUp, AlertTriangle, Atom, Eye, ShieldCheck } from 'lucide-react';

export const HowToReadPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-700/40 text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Comment lire les données climatiques ?
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Guide pédagogique d'épistémologie et de physique pour une lecture éclairée
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Concept Cards */}
      <div className="space-y-6 text-sm text-slate-300">
        {/* 1. Météo vs Climat */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            1. Météorologie vs Climatologie : une question d'échelle temporelle
          </h3>
          <p className="leading-relaxed mb-3">
            La <strong>météorologie</strong> décrit l’état instantané de l’atmosphère en un lieu précis à un moment donné (la température de cet après-midi à Paris, une averse, un coup de vent).
            L’atmosphère étant un système fluide chaotique, la prévisibilité météorologique déterministe est limitée à environ 10 à 14 jours.
          </p>
          <p className="leading-relaxed text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            Le <strong>climat</strong>, selon la définition de l’Organisation Météorologique Mondiale (OMM), est la statistique (moyenne, écart-type, extrêmes) des variables météorologiques sur une période minimale de <strong>30 ans</strong>.
            Une vague de froid locale de quelques jours ne contredit pas un réchauffement global trentenaire, de même qu’un été caniculaire ponctuel ne suffit pas à lui seul à définir un climat.
          </p>
        </section>

        {/* 2. Notion d'Anomalie et Période de Référence */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <Thermometer className="w-5 h-5 text-rose-400" />
            2. Pourquoi des anomalies plutôt que des températures absolues ?
          </h3>
          <p className="leading-relaxed mb-3">
            Une <strong>anomalie</strong> est l’écart entre une valeur observée et une moyenne de référence calculée sur une période fixe (ex: 1951–1980 pour la NASA GISTEMP, 1901–2000 pour la NOAA).
          </p>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5 font-mono">
            <div>Exemple : Si la moyenne historique de juillet à la station X est de 22,0°C, et qu'il fait 23,2°C, l'anomalie est de <span className="text-rose-400 font-bold">+1,2°C</span>.</div>
            <div>
              Avantage : Les températures absolues varient fortement sur quelques kilomètres (altitude, relief), tandis que les anomalies restent corrélées sur plus de 1 200 km.
            </div>
          </div>
        </section>

        {/* 3. Moyenne mobile et Débruitage */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            3. Moyenne mobile : filtrer la variabilité naturelle court terme
          </h3>
          <p className="leading-relaxed mb-3">
            Le système climatique possède une variabilité interne naturelle (comme les oscillations océaniques <em>El Niño / La Niña</em>, les cycles solaires de 11 ans ou les éruptions volcaniques temporaires).
          </p>
          <p className="leading-relaxed text-slate-400">
            Une <strong>moyenne mobile</strong> (sur 12 mois, 5 ans ou 10 ans) permet d’atténuer ces fluctuations à court terme afin de faire émerger la tendance de fond sous-jacente sans altérer les données sous-jacentes.
          </p>
        </section>

        {/* 4. Corrélation vs Causalité (Règle d'or) */}
        <section className="bg-slate-900/70 border border-amber-900/40 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-amber-300 mb-2 flex items-center gap-2 font-sans">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            4. Règle fondamentale : Corrélation ≠ Causalité
          </h3>
          <p className="leading-relaxed mb-3">
            Ce n’est pas parce que deux courbes montent ou descendent en même temps que l’une provoque l’autre.
            Deux séries peuvent être corrélées par simple coïncidence statistique ou parce qu’elles dépendent d’un troisième facteur invisible (corrélation fallacieuse).
          </p>
          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40 text-amber-200 text-xs leading-relaxed">
            Pour affirmer un lien de causalité en physique, il faut obligatoirement :
            <ol className="list-decimal list-inside mt-1.5 space-y-1 font-mono text-[12px]">
              <li>Un mécanisme physique démontré en laboratoire (ex: propriétés spectroscopiques d'absorption infrarouge des gaz).</li>
              <li>Un bilan de conservation de l'énergie (bilan radiatif mesuré en W/m²).</li>
              <li>Une cohérence temporelle (la cause doit précéder ou accompagner les effets selon les constantes de temps thermiques).</li>
            </ol>
          </div>
        </section>

        {/* 5. Forçage radiatif */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <Atom className="w-5 h-5 text-cyan-400" />
            5. Le forçage radiatif : l'unité monétaire commune de l'énergie
          </h3>
          <p className="leading-relaxed mb-3">
            En physique du climat, le <strong>forçage radiatif</strong> (noté ΔF, mesuré en <strong>Watts par mètre carré, W/m²</strong>) quantifie la perturbation imposée au bilan énergétique de la Terre au sommet de la troposphère.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400 font-mono">
            <li>Un forçage positif (ex: gaz à effet de serre additionnels) piège davantage d'énergie dans le système Terre.</li>
            <li>Un forçage négatif (ex: aérosols sulfatés réfléchissants, grandes éruptions volcaniques) renvoie de l'énergie vers l'espace.</li>
            <li>L’irradiance solaire (TSI) varie d’environ 1 W/m² au cours d'un cycle, soit un forçage net au sol d’environ ±0,09 W/m².</li>
          </ul>
        </section>

        {/* 6. Mesure directe vs Reconstruction */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <Eye className="w-5 h-5 text-indigo-400" />
            6. Mesure directe instrumentale vs Reconstruction / Proxy
          </h3>
          <p className="leading-relaxed mb-3">
            Il est capital de distinguer la nature métrologique d'une donnée :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-1 font-mono">Mesure directe in situ & satellite :</strong>
              Instruments modernes étalonnés (analyseurs infrarouges de Keeling, thermomètres sous abri Stevenson, radiomètres spatiaux TIM). Incertitude instrumentale infime.
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-1 font-mono">Reconstructions & proxies :</strong>
              Indicateurs indirects pour les périodes anciennes (carottes de glace, cernes d’arbres, sédiments, comptages historiques de taches solaires). Comportent une barre d’incertitude plus large.
            </div>
          </div>
        </section>

        {/* 7. Volcanisme, VEI et Forçage Aérosol */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <span className="text-orange-400">🌋</span>
            7. Volcanisme, indice VEI et Aérosols stratosphériques (SAOD)
          </h3>
          <p className="leading-relaxed mb-3">
            L'effet climatique d'un volcan ne dépend pas principalement de ses coulées de lave ou du volume total de cendres (qui retombent en quelques jours au sol), mais de la quantité de <strong>dioxyde de soufre (SO₂) injectée dans la stratosphère</strong> (au-delà de 15 km d'altitude).
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-orange-300 font-mono block mb-1">Mécanisme physique du refroidissement :</strong>
              Dans la stratosphère sèche et calme, le SO₂ s'oxyde en gouttelettes submicroniques d'acide sulfurique (H₂SO₄). Celles-ci diffusent le rayonnement solaire incident vers l'espace (hausse de l'albédo mesurée par la SAOD), provoquant un forçage radiatif négatif (jusqu'à -3,3 W/m² pour le Pinatubo en 1991).
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-orange-300 font-mono block mb-1">Échelle temporelle de résorption :</strong>
              Contrairement au CO₂ dont l'effet cumulatif persiste des siècles, les aérosols stratosphériques sédimentent et sont éliminés par la circulation atmosphérique en <strong>1 à 3 ans</strong>. La baisse de température globale observée (environ -0,4°C post-Pinatubo) est donc transitoire.
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-orange-300 font-mono block mb-1">Le cas particulier de Hunga Tonga (2022) :</strong>
              Une éruption sous-marine explosive de fort indice (VEI 5) a injecté une quantité inédite de vapeur d'eau (~150 Mt de H₂O) mais très peu de soufre (0,4 Mt). La vapeur d'eau étant un puissant gaz à effet de serre, Hunga Tonga a généré un forçage radiatif légèrement positif inhabituel (+0,12 W/m²), illustrant que le VEI seul ne prédit pas le signe du forçage.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
