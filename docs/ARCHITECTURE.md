# 🏛️ Architecture Technique — ClimatOSCOPE

## 1. Vue d'Ensemble des Couches

Le système applique une séparation stricte des responsabilités sans couplage direct entre les composants UI et les flux réseau :

```text
                  SOURCES INSTITUTIONNELLES
             (NASA POWER, NOAA GML, LISIRD, GISS)
                            │
                            ▼
                   API DATA ADAPTERS
       (BaseDataProvider, NasaPowerProvider, NoaaGmlProvider...)
                            │
                            ▼
                VALIDATION & NORMALISATION
        (validateTimeSeriesData, normalizeSeries, math.ts)
                            │
                            ▼
                   DATASETS INTERNES TYPÉS
                  (InternalDataset, TimeSeriesPoint)
                            │
                            ▼
              OFFLINE CACHE (IndexedDB & Memory)
                   (dbService - ClimatOSCOPE_DB)
                            │
                            ▼
              REACT HOOKS & SERVICE LAYER
               (datasetService, useDataset, useOnlineStatus)
                            │
                            ▼
               INTERFACE OBSERVATOIRE (UI)
        (TimeSeriesChart, ComparisonChart, Pages & Dashboard)
```

---

## 2. Découpage par Couches

### 2.1 Couche UI (`src/pages/`, `src/components/`)
* **Aucun appel réseau direct :** Les composants consomment exclusivement les hooks `useDataset`, `useOnlineStatus` et les services de domaine.
* **Composants graphiques isolés :** `TimeSeriesChart` et `ComparisonChart` exploitent Recharts avec fenêtrage temporel et calculs de régression délégués.

### 2.2 Couche Domaine & Analyse (`src/analysis/`)
* `math.ts` : Moteurs de calcul statistique (Moyenne mobile centrée ou glissante, Régression linéaire des moindres carrés, Coefficient de Pearson r et détermination R²).
* `normalization.ts` : Algorithmes de normalisation pour comparateur (Brut, Indice 100, Anomalie soustractive, Z-score centré-réduit).
* `quality.ts` : Validateur de qualité métrologique (contrôle de monotonicité temporelle, détection de trous, NaN, drapeaux de qualité sans purge destructive).

### 2.3 Couche Services & Cache (`src/services/`)
* `db.ts` : Wrapper natif IndexedDB asynchrone ultra-léger sans dépendances tierces lourdes. Object store `datasets` versionné.
* `dataset-service.ts` : Orchestrateur de synchronisation implémentant la stratégie *cache-first* avec revalidation à la demande (*stale-while-revalidate*).

### 2.4 Couche Adaptateurs (`src/api/adapters/`)
* Chaque source externe hérite de `BaseDataProvider` et implémente `getMetadata()` et `fetchData()`.
* En cas de rupture réseau ou de blocage CORS sur des serveurs tiers, l'adaptateur bascule de manière transparente sur les jeux de données de référence vérifiés pré-embarqués.

---

## 3. Stratégie Progressive Web App (PWA)

* **Vite-Plugin-PWA & Workbox :** Mise en cache des assets statiques (HTML, JS, CSS, SVG, PNG) et mise en cache des réponses JSON/CSV externes avec règles d'expiration.
* **In-App Prompt :** Bouton d'installation réactif adapté aux navigateurs Chromium/Android et tutoriel intégré pour Safari iOS.
* **Service Worker Auto-Update :** Mise à jour transparente en arrière-plan.
