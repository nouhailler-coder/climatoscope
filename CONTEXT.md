# 🌍 CONTEXT — Projet ClimatOSCOPE

> **Document de référence architectural, scientifique et fonctionnel**  
> *Dernière mise à jour : 20 octobre 2026 (Version v0.7.0)*

---

## 1. Vision & Objectifs du Projet

**ClimatOSCOPE** est une application web progressive (PWA) conçue comme un **observatoire scientifique ouvert**. Son objectif est de permettre à tout citoyen, étudiant, enseignant ou chercheur d'accéder aux données climatiques brutes et officielles sans distorsion, sans intermédiaire et sans modèles spéculatifs.

### Principes Directeurs
1. **Zéro Donnée Fictive :** Toutes les séries affichées proviennent exclusivement des dépôts officiels des organismes de recherche (NASA GISS, NOAA NCEI, NOAA GML, Berkeley Earth, LASP, SILSO, NSIDC, ECMWF).
2. **Épistémologie Rigoureuse :** Corrélation n'est pas causalité. Toute superposition statistique est accompagnée de ses mécanismes biophysiques (spectroscopie d'absorption, bilans radiatifs, dynamique des fluides).
3. **Autonomie & Résilience (Offline-First) :** L'application fonctionne sans serveur applicatif lourd et persiste toutes les données consultées en local dans **IndexedDB** avec Service Worker Workbox.
4. **Déploiement Universel Statique :** Prêt pour un déploiement direct et économique sur **Cloudflare Pages**.

---

## 2. Historique des Défis Résolus & Arbitrages Clés

### P0 — Période de Téléchargement NOAA GlobalTemp Dynamique
- **Problème initial :** L'URL NOAA dans `src/api/adapters/gistemp.ts` était figée sur `1880-2025.json`, empêchant la récupération automatique des données après 2025.
- **Résolution :** Implémentation d'un constructeur de période dynamique basé sur l'année calendaire courante, avec cascade de repli sur l'année précédente si le traitement NOAA est en cours de publication. Enregistrement direct de la dernière date d'observation effective renvoyée par le JSON dans les métadonnées.

### P0 — Transparence des Séries Historiques Embarquées
- **Problème initial :** Les séries relatives aux taches solaires, contenu thermique océanique à 700 m, composantes CERES, températures zonales et émissions de SO₂ utilisent des archives embarquées.
- **Résolution :** Conservation de ces séries pour la résilience hors-ligne, mais identification stricte avec le statut `embedded_historical`. Affichage de leur date de fin (`endDate`), date de publication (`publicationDate`) et date de récupération (`retrievedAt` standardisé à `2026-01-15T00:00:00Z`). L'interface ne les présente jamais comme des flux temps réel.

### P0 — Prévention des Collisions Mois / Année dans le Parseur Banquise NSIDC
- **Problème initial :** `parseNsidcMonthlyCsv` lisait des données mensuelles mais utilisait uniquement l'année comme clé d'horodatage, créant des écrasements lors des fusions.
- **Résolution :** Conservation de la clé temporelle au format complet `YYYY-MM` pour les séries mensuelles, ou agrégation arithmétique explicite (moyenne des 12 mois) si une série annuelle consolidée est demandée. Vérification rigoureuse des colonnes d'étendue (`extent`) et de surface (`area`).

### P1 — Traçabilité et Provenance de Bout en Bout
- **Problème initial :** Incohérences ponctuelles entre les métadonnées affichées et la provenance effective (flux en direct, cache ancien ou données dérivées).
- **Résolution :** Méthode `enrichMetadata` enrichissant systématiquement les points avec la dernière date d'observation, l'horodatage du fetch, le statut `live` vs `embedded_historical`, et les formules mathématiques pour les séries dérivées.

### Élimination de `bun.lock` pour Cloudflare Pages
- **Problème :** La présence conjointe de fichiers de verrouillage alternatifs (`bun.lock`) provoquait des conflits de détecteur de paquet sur les runners de build Cloudflare Pages.
- **Résolution :** Suppression définitive du fichier `bun.lock`. Standardisation sur `npm` (`package-lock.json`), avec configuration `.npmrc` et fichiers statiques `public/_redirects` et `public/_headers` pour optimiser le cache et le routage SPA.

---

## 3. Nouvelles Fonctionnalités Majeures (v0.7.0)

### 🍔 Menu Hamburger Catégorisé
- Panneau latéral coulissant regroupant les 14 modules applicatifs en 6 catégories logiques :
  1. **Vue d'ensemble :** Observatoire Général.
  2. **Climat & Températures :** Température Globale, Réanalyses ERA5 & Amplification Polaire.
  3. **Gaz à Effet de Serre & Atmosphère :** CO₂ Mauna Loa, CH₄ & N₂O, Aérosols Troposphériques CAMS.
  4. **Cycles Naturels & Forçages :** Activité Solaire (TSI & Taches), Volcanisme & SAOD.
  5. **Océans & Glaces :** Contenu Thermique OHC (Argo), Banquise NSIDC, Bilan Radiatif CERES TOA.
  6. **Outils & Méthodologie :** NASA POWER, Comparateur Multi-Séries, Registre des Sources, Guide Épistémologique.

### ⚙️ Centre de Paramètres Système & Mises à Jour Automatiques
- **Indicateurs d'état :** Version applicative (`v0.7.0`), date de sortie officielle (`20 octobre 2026`), horodatage précis de la dernière vérification.
- **Contrôles utilisateur :**
  - Bouton **« Vérifier les mises à jour »** : Déclenche une synchronisation immédiate avec le Service Worker et les headers du serveur.
  - Bouton **« Forcer la mise à jour »** : Purge intégrale de tous les caches locaux et rafraîchissement immédiat de la page.
- **Système d'auto-actualisation en arrière-plan :**
  - Vérification automatique périodique toutes les 30 minutes sans gêner l'utilisateur ;
  - Contrôle lors de la réactivation de l'onglet (`visibilitychange`) et lors de la reconnexion internet (`online`) ;
  - Installation transparente des nouveaux Service Workers via `autoUpdate` Workbox.

### 🌓 Thème Sombre & Ergonomie Visuelle
- Thème sombre « Observatoire » par défaut, complété par un thème clair haute visibilité.
- Mémorisation dans le `localStorage` et synchronisation de la balise HTML `meta name="theme-color"`.

### 🛡️ Onboarding Légal & Clause de Non-Responsabilité
- Modale d'accueil obligatoire à la première visite (ou accessible via les paramètres).
- Mention expresse : l'éditeur décline toute responsabilité quant aux données scientifiques et aux conséquences de leur interprétation.
- Liens et références transparents vers les agences émettrices originales.

### 🧭 Guides Contextuels & Infobulles sur Chaque Écran
- Intégration sur **la totalité des 14 écrans** d'un bandeau déroulant `ContextualBanner` :
  - Ce que mesure l'écran ;
  - Source officielle et méthode d'acquisition ;
  - Clé d'interprétation physique.
- Déploiement d'infobulles interactives `HelpTooltip` sur l'ensemble des boutons de contrôle, sélecteurs de couche et curseurs de simulation.

### 📲 Bouton d'Installation PWA Universel
- Bouton accessible dans l'en-tête et le menu Hamburger.
- Déclenchement de l'invite native sur Chrome/Edge/Android.
- Affichage d'un guide pas-à-pas illustré pour iOS Safari et navigateurs sans API `beforeinstallprompt`.

---

## 4. Architecture Logicielle & Dépendances

```
┌────────────────────────────────────────────────────────┐
│                   ClimatOSCOPE SPA                     │
│  React 19 · Vite 8 · TypeScript 5.8 · Tailwind CSS 4   │
├──────────────────────────┬─────────────────────────────┤
│ Couche Présentation      │ Pages (14), Common, Charts  │
│ Moteur Graphique         │ Recharts, Lucide Icons      │
│ Services Métier          │ DatasetService, UpdateServ  │
│ Couche Persistance       │ IndexedDB (idb), LocalStor  │
│ Offline & PWA            │ vite-plugin-pwa (Workbox)   │
│ Cible Déploiement        │ Cloudflare Pages Static     │
└──────────────────────────┴─────────────────────────────┘
```

---

<div align="center">
  <sub>Document d'architecture ClimatOSCOPE · Conforme aux exigences du cahier des charges · Octobre 2026</sub>
</div>
