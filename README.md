# 🌍 ClimatOSCOPE (v0.1)

> **Comprendre le climat à partir des mesures.**  
> *Observer → Comparer → Analyser → Comprendre*

---

## 1. Présentation Générale

**ClimatOSCOPE** est une application web progressive (PWA) conçue comme un **observatoire scientifique open data**.  
L'application met à disposition du grand public, des étudiants, des chercheurs et des curieux les séries temporelles de mesures physiques issues directement des grands organismes de recherche internationaux (NASA, NOAA, LASP, SILSO).

### Principes Non-Négociables
1. **Zéro donnée fictive :** Toutes les séries affichées reposent sur des observations ou reconstructions publiées et vérifiables.
2. **Distinction Corrélation vs Causalité :** Aucune corrélation statistique ne peut être présentée comme une preuve de causalité sans mécanisme physique explicité.
3. **Architecture Offline-First :** Toutes les données consultées sont conservées en local dans **IndexedDB** et via le Service Worker PWA (Workbox), permettant une consultation intégrale sans connexion internet.
4. **Zéro backend requis :** Déploiement statique autonome (compatible Netlify, Cloudflare Pages, GitHub Pages, Vercel).

---

## 2. Modules Intégrés au MVP (v0.1)

1. ☀️ **Activité & Rayonnement Solaire**
   * Irradiance Solaire Totale (TSI en W/m²) — NASA/LASP LISIRD (Kopp et al., SORCE, TSIS-1 TIM).
   * Nombre international de taches solaires (SSN) — WDC-SILSO Observatoire Royal de Belgique.
2. 🧪 **CO₂ Atmosphérique**
   * Série continue mensuelle de Mauna Loa (fraction molaire ppm) — NOAA Global Monitoring Laboratory (GML) & Scripps Institution of Oceanography.
3. 🌡️ **Température Globale de Surface**
   * Anomalie de température globale terre-océan (°C relative à 1951-1980) — NASA Goddard Institute for Space Studies (GISTEMP v4).
   * Datasets comparatifs alternatifs : NOAA GlobalTemp v5 (NCEI) et Berkeley Earth.
4. ☀️ **NASA POWER (Rayonnement au Sol & Climatologie Locale)**
   * Flux solaire incident au sol (`ALLSKY_SFC_SW_DWN` en kWh/m²/jour).
   * Sélecteur de localisation mondial (Paris, Mauna Loa, Dakar, Tokyo, Sydney, Tromsø, São Paulo, Le Caire et coordonnées GPS libres).
5. ⚖️ **Comparateur Multi-Séries & Corrélation**
   * Superposition synchronisée multi-variables.
   * Modes de normalisation : *Valeurs brutes*, *Indice 100*, *Anomalie*, *Z-Score (centré-réduit)*.
   * Moyennes mobiles lissantes (12m, 5 ans, 10 ans), tendances linéaires par régression des moindres carrés, coefficient de corrélation linéaire de Pearson (r) et R² avec notice d'avertissement épistémologique systématique.

---

## 3. Installation et Développement

### Prérequis
* Node.js (version 20 ou supérieure recommandée)
* npm

### Installation
```bash
npm install
```

### Lancement du serveur de développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000`.

### Exécution des tests unitaires
```bash
npm test
```

### Vérification du typage TypeScript
```bash
npm run lint
```

### Construction pour production (Build)
```bash
npm run build
```

---

## 4. Documentation Technique

Consultez les dossiers `docs/` pour la documentation exhaustive :
* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) : Diagrammes d'architecture logicielle, flux de données et cache IndexedDB.
* [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) : Inventaire complet des APIs et dépôts institutionnels (URLs, formats, fréquences, CORS, licences).
* [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) : Protocoles de calcul mathématique (normalisation, anomalies, moyennes mobiles, Pearson).
* [`docs/SCIENTIFIC_NOTES.md`](docs/SCIENTIFIC_NOTES.md) : Forçages radiatifs (W/m²), spectroscopie du CO₂, découplage solaire/thermique moderne.

---

## 5. Licence
Code source sous licence open source MIT. Les données scientifiques restent soumises aux politiques d'accès ouvert des agences émettrices (NASA Open Data, NOAA Public Domain, SILSO CC-BY-NC 4.0).
