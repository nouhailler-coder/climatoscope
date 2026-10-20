# 📜 CHANGELOG — ClimatOSCOPE

Toutes les modifications notables apportées au projet **ClimatOSCOPE** sont consignées dans ce document.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/), et ce projet adhère à la numérotation [Semantic Versioning](https://semver.org/lang/fr/).

---

## [0.7.0] - 2026-10-20

### 🚀 Ajouts Majeurs & Ergonomie

- **🍔 Menu Hamburger Catégorisé :**
  - Tiroir de navigation latéral structuré en 6 catégories thématiques claires (*Vue d'ensemble*, *Climat & Températures*, *Gaz à Effet de Serre & Atmosphère*, *Cycles Naturels & Forçages*, *Océans & Glaces*, *Outils & Méthodologie*).
  - Accès direct aux 14 modules applicatifs, aux paramètres système, aux mentions légales et à l'installateur PWA.
  - Support complet de la navigation clavier (<kbd>Échap</kbd>) et des animations fluides.

- **⚙️ Paramètres Système & Mises à Jour Automatiques :**
  - Ajout du panneau modal de gestion système affichant :
    - La date de sortie officielle (`20 octobre 2026`) ;
    - La date et l'heure précises de la dernière vérification ;
    - Le bouton interactif **« Vérifier les mises à jour »** ;
    - Le bouton de purge et rechargement **« Forcer la mise à jour »**.
  - **Service Worker & Auto-Actualisation en arrière-plan :**
    - Système d'écoute autonome vérifiant automatiquement les nouvelles versions toutes les 30 minutes ;
    - Déclenchement automatique de vérification lors du retour sur l'onglet (`visibilitychange`) et lors de la reconnexion réseau (`online`) ;
    - Installation transparente des nouveaux Service Workers sans blocage.

- **🌓 Thème Sombre & Thème Clair :**
  - Intégration d'un `ThemeContext` complet avec mode Sombre (palette spatiale *Slate 950*) par défaut et mode Clair.
  - Mémorisation des préférences utilisateur dans le `localStorage`.
  - Mise à jour dynamique de la balise HTML `<meta name="theme-color">`.

- **🛡️ Onboarding Légal & Clause de Non-Responsabilité :**
  - Modale d'accueil obligatoire à la première utilisation de l'application (avec option de réouverture à tout moment).
  - Clause expresse de non-responsabilité : *« L’auteur et éditeur de cette application décline formellement toute responsabilité quant à l’exactitude, la complétude, la pérennité, la mise à jour ou l’exhaustivité des données scientifiques présentées »*.
  - Présentation transparente des 7 organismes de recherche internationaux émetteurs (NASA, NOAA, Berkeley Earth, LASP, SILSO, NSIDC, ECMWF).

- **🧭 Guides Contextuels & Infobulles sur Chaque Écran :**
  - Intégration du composant `ContextualBanner` sur **la totalité des 14 écrans** de l'application, détaillant ce que mesure l'écran, la méthode officielle et la clé d'interprétation physique.
  - Déploiement d'infobulles interactives `HelpTooltip` sur l'ensemble des champs de contrôle, sélecteurs et indicateurs.

- **📲 Bouton Universel « Installer l'application » :**
  - Bouton présent dans l'en-tête et le menu Hamburger pour installer facilement ClimatOSCOPE sur mobile ou desktop.
  - Guide pas-à-pas illustré `PWAInstallModal` pour accompagner les utilisateurs sur iOS Safari et les navigateurs non-Chromium.

- **☁️ Compatibilité Déploiement Cloudflare Pages :**
  - Suppression définitive du fichier `bun.lock` susceptible de provoquer des conflits d'installation sur les workers Cloudflare Pages.
  - Configuration des règles de redirection SPA `public/_redirects` et des en-têtes HTTP de sécurité/mise en cache `public/_headers`.

- **🎨 Identité Visuelle & Documentation Enrichie :**
  - Logo vectoriel officiel de l'application (globe optique avec vecteur d'anomalie thermique).
  - Capture d'écran haute résolution du tableau de bord intégrée dans le `README.md`.
  - Création des documents de référence `CONTEXT.md` et `CHANGELOG.md`.

---

## [0.6.0] - 2026-10-19

### 🔧 Correctifs Scientifiques & Fiabilisation des Données

- **P0 — NOAA GlobalTemp Dynamique :**
  - Remplacement de l'URL NOAA statique `1880-2025.json` par un générateur dynamique d'intervalles annuels s'adaptant à l'année courante avec repli progressif sur les années disponibles.
  - Enregistrement immédiat de la date de la dernière observation dans les métadonnées.
- **P0 — Traçabilité des Séries Historiques Embarquées :**
  - Clarification du statut `embedded_historical` pour les séries de repli (taches solaires, OHC 700m, composantes CERES, SO₂).
  - Harmonisation des dates de récupération (`retrievedAt` à `2026-01-15T00:00:00Z`) et des dates de publication.
- **P0 — Parseur Banquise NSIDC :**
  - Correction de la confusion mois/année dans `parseNsidcMonthlyCsv` évitant l'écrasement de données mensuelles et ajout d'une agrégation annuelle explicite.
- **P1 — Traçabilité de Bout en Bout :**
  - Synchronisation stricte du statut des métadonnées lors des étapes de cache, de repli et de dérivation.

---

## [0.5.0] - 2026-10-15

### 📊 Nouveaux Modules & Comparateur Avancé

- Intégration du module **CERES** (NASA Langley) pour le bilan radiatif au sommet de l'atmosphère (Net, OLR, Albédo).
- Intégration du module **Océans Argo** (NOAA NCEI) pour le contenu thermique océanique (0-2000m et 0-700m).
- Intégration du module **Réanalyses Copernicus ERA5** avec décomposition latitudinale et amplification polaire arctique.
- Module **Aérosols Troposphériques CAMS & AERONET** avec simulateur du paradoxe de la dépollution (OMI 2020).
- Module **Volcanisme & Forçage Stratosphérique SAOD** avec simulateur d'éruption basé sur les modèles Sato et Hansen.

---

## [0.1.0] - 2026-09-30

### 🚀 Lancement Initial (MVP)

- Observatoire général multi-indicateurs avec métriques clés en temps réel.
- Module Solaire (Irradiance Totale TSI LASP & Taches solaires SILSO).
- Module CO₂ Mauna Loa (NOAA GML & Scripps Keeling Curve).
- Module Température Globale (NASA GISTEMP v4, NOAA GlobalTemp, Berkeley Earth).
- Module Climatologie Locale Solaire NASA POWER avec carte interactive mondiale.
- Comparateur multi-séries avec normalisation (Indice 100, Anomalie, Z-score) et corrélation de Pearson.
- Persistance locale hors-ligne via IndexedDB et Service Worker PWA.
