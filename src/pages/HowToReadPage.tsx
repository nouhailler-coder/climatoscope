import React from 'react';
import { HelpCircle, CloudRain, Thermometer, TrendingUp, AlertTriangle, Atom, Eye, ShieldCheck } from 'lucide-react';
import { ContextualBanner } from '../components/common/ContextualBanner';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const HowToReadPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-700/40 text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Comment lire les données climatiques ?</span>
              <HelpTooltip
                title="Épistémologie des Mesures"
                content="Guide méthodologique pour interpréter correctement les séries chronologiques scientifiques : distinction météorologie vs climat, rôle des anomalies thermiques, et garde-fous statistiques contre les fausses corrélations."
              />
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Guide pédagogique d'épistémologie et de physique pour une lecture éclairée
            </p>
          </div>
        </div>
      </div>

      {/* Contextual Onboarding Banner */}
      <ContextualBanner
        screenId="how_to_read"
        title="Repères épistémologiques & Principes physiques fondamentaux"
        summary="Une observation scientifique ne prend son sens que dans son cadre d'analyse : échelle de temps de 30 ans, anomalies par rapport à une climatologie stable et distinction entre corrélation et causalité."
        sourceOrg="Organisation Météorologique Mondiale (OMM) & GIEC (IPCC AR6 WG1)"
        methodologyNote="Application rigoureuse de la méthode scientifique : conservation de l'énergie (bilan radiatif au TOA), spectroscopie d'absorption infrarouge des gaz polyatomiques et débruitage par moyennes mobiles."
        keyTakeaway="Une corrélation mathématique (même avec r > 0.90) ne prouve aucun lien de cause à effet en l'absence d'un mécanisme physique démontré par les lois de la thermodynamique."
        defaultOpen={true}
      />

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

        {/* 8. CH4, N2O et Pouvoir de Réchauffement Global (PRG / GWP) */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <span className="text-emerald-400">🧪</span>
            8. Les Gaz à Effet de Serre au-delà du CO₂ : Méthane (CH₄), N₂O et notion de PRG
          </h3>
          <p className="leading-relaxed mb-3">
            Si le $CO_2$ représente environ les deux tiers du forçage anthropique direct, d'autres gaz jouent un rôle déterminant avec des dynamiques physiques distinctes :
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-emerald-300 font-mono block mb-1">Durée de vie vs Puissance radiative instantanée :</strong>
              Le <strong>méthane (CH₄)</strong> a une durée de vie atmosphérique courte d'environ <strong>11,8 ans</strong> (détruit par les radicaux hydroxyles •OH), mais son pouvoir réchauffant par molécule est très élevé. Le GIEC définit le Potentiel de Réchauffement Global (PRG) : <strong>84 fois supérieur au CO₂ sur 20 ans</strong> et <strong>28 fois sur 100 ans</strong>.
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-indigo-300 font-mono block mb-1">Le protoxyde d'azote (N₂O) :</strong>
              Avec une durée de vie d'environ <strong>114 ans</strong> et un PRG-100 de <strong>273</strong>, le N₂O (lié aux engrais azotés agricoles) cumule longue persistance et fort pouvoir réchauffant, en plus de participer à l'appauvrissement de la couche d'ozone.
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-amber-300 font-mono block mb-1">L'indice NOAA AGGI :</strong>
              L'indice officiel <em>Annual Greenhouse Gas Index</em> de la NOAA mesure l'accroissement du forçage direct cumulé depuis 1990 (base 1.000). Il a franchi <strong>1,63 en 2025</strong>, indiquant une augmentation de +63 % de l'excédent thermique direct piégé par l'atmosphère.
            </div>
          </div>
        </section>

        {/* 9. Cryosphère & Rétroaction Glace-Albédo */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <span className="text-cyan-400">🧊</span>
            9. Cryosphère, Banquise et rétroaction physique de l'albédo glace-océan
          </h3>
          <p className="leading-relaxed mb-3">
            La banquise joue le rôle de miroir thermique de la Terre grâce à son albédo élevé :
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-cyan-300 font-mono block mb-1">Rétroaction positive (Ice-Albedo Feedback) :</strong>
              Une banquise recouverte de neige renvoie 70 % à 85 % du rayonnement solaire vers l'espace (<span className="text-cyan-400 font-mono">α ≈ 0,70–0,85</span>).
              Lorsque la température s'élève et que la glace fond, l'océan liquide sombre absorbe 94 % de l'énergie solaire (<span className="text-rose-400 font-mono">α ≈ 0,06</span>).
              Cette absorption supplémentaire réchauffe l'océan, accélérant en retour la fonte de la glace restante.
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-cyan-300 font-mono block mb-1">Tendance décennale et point de bascule :</strong>
              Le minimum de septembre en Arctique décline au rythme de <strong>-12,2 % par décennie</strong> depuis le début des mesures satellites en 1979. Le record bas absolu a été atteint en septembre 2012 avec seulement 3,39 millions de km² résiduels.
            </div>
          </div>
        </section>

        {/* 10. Réanalyses ERA5 & Amplification Arctique */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <span className="text-violet-400">🌎</span>
            10. Réanalyses ERA5 & Mécanismes de l'Amplification Polaire
          </h3>
          <p className="leading-relaxed mb-3">
            La décomposition des températures par bande de latitude révèle que le réchauffement n'est pas homogène :
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-violet-300 font-mono block mb-1">Facteur 3× à 4× :</strong>
              Tandis que la moyenne mondiale a augmenté de +1,3 °C à +1,4 °C par rapport à l'ère préindustrielle, le bassin arctique (90°N–64°N) enregistre des anomalies annuelles supérieures à +3,5 °C. Ce rapport s'appelle l'<em>amplification arctique</em>.
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-violet-300 font-mono block mb-1">Rétroaction du gradient vertical (Lapse-Rate Feedback) :</strong>
              Dans les tropiques, la chaleur au sol s'élève facilement par convection jusqu'en haute altitude et rayonne vers l'espace. En Arctique, une forte inversion thermique stabilise l'atmosphère, emprisonnant la chaleur dans les premiers centaines de mètres au-dessus du sol.
            </div>
          </div>
        </section>

        {/* 11. Aérosols Troposphériques & Paradoxe de la Dépollution */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-sans">
            <span className="text-sky-400">☁️</span>
            11. Aérosols Troposphériques, Effet Twomey et Paradoxe de la Dépollution
          </h3>
          <p className="leading-relaxed mb-3">
            Les aérosols d'origine humaine exercent un forçage radiatif négatif puissant qui compense en partie l'effet de serre :
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-sky-300 font-mono block mb-1">Effet parasol direct et indirect (Twomey) :</strong>
              Les sulfates et poussières diffusent la lumière du soleil (effet direct ~ -0,3 W/m²). En servant de noyaux de condensation nuageuse, ils augmentent la concentration de gouttelettes, rendant les nuages plus blancs, plus réfléchissants et plus persistants (effet indirect ~ -0,8 W/m²).
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-amber-300 font-mono block mb-1">Le paradoxe du démasquage (IMO 2020) :</strong>
              La dépollution de l'air (réduction du soufre dans les carburants marins par l'OMI en 2020, fermetures de centrales à charbon) supprime rapidement ces aérosols dont la durée de vie n'est que de quelques jours, ce qui « démasque » instantanément une partie du réchauffement sous-jacent latent (+0,3 °C à +0,5 °C).
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
