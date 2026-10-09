# 📡 Répertoire des Sources de Données Scientifiques — ClimatOSCOPE

Ce document consigne l'ensemble des dépôts de données publiques exploités par ClimatOSCOPE.

---

## 1. NOAA Global Monitoring Laboratory (GML) — CO₂ Mauna Loa

* **Organisme :** National Oceanic and Atmospheric Administration (NOAA) / Scripps Institution of Oceanography.
* **Variable :** Fraction molaire du dioxyde de carbone en air sec ($CO_2$).
* **Unité :** Parties par million ($ppm$).
* **Fréquence :** Mensuelle & annuelle.
* **Période :** Mars 1958 à aujourd'hui.
* **Site officiel :** [https://gml.noaa.gov/ccgg/trends/](https://gml.noaa.gov/ccgg/trends/)
* **Dépôt brut :** `https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt`
* **Licence :** Domaine public gouvernemental américain (US Government Open Data).
* **CORS :** Restreint selon les en-têtes HTTP de la NOAA -> Géré par l'adaptateur avec fallback local garanti.
* **Méthodologie :** Analyseurs spectroscopiques infrarouges non dispersifs (NDIR) étalonnés sur l'échelle WMO $CO_2$ X2019.

---

## 2. NASA Goddard Institute for Space Studies — GISTEMP v4

* **Organisme :** NASA GISS (New York, USA).
* **Variable :** Anomalie de température moyenne globale terre-océan (LOTI).
* **Unité :** Degrés Celsius ($°C$).
* **Période de référence :** 1951–1980 (moyenne = 0,00 °C).
* **Fréquence :** Mensuelle & annuelle.
* **Période :** Janvier 1880 à aujourd'hui.
* **Site officiel :** [https://data.giss.nasa.gov/gistemp/](https://data.giss.nasa.gov/gistemp/)
* **Dépôt brut :** `https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv`
* **Licence :** NASA Open Data Policy (Domaine public).
* **Publications clés :** Hansen et al. (2010), Lenssen et al. (2019).
* **Alternatives intégrées :** NOAA GlobalTemp v5 (NCEI, réf. 1901-2000) et Berkeley Earth (CC-BY 4.0).

---

## 3. NASA / LASP LISIRD & WDC-SILSO — Activité Solaire

* **Organismes :** Laboratory for Atmospheric and Space Physics (Université du Colorado Boulder) / NASA & Observatoire Royal de Belgique.
* **Variables :** 
  * Total Solar Irradiance (TSI) en $W/m^2$.
  * International Sunspot Number (SSN v2.0, sans unité).
* **Fréquence :** Annuelle et composite spatiale.
* **Période :** 1880 à aujourd'hui.
* **Sites officiels :**
  * LISIRD : [https://lasp.colorado.edu/lisird/](https://lasp.colorado.edu/lisird/)
  * SILSO : [https://www.sidc.be/silso/](https://www.sidc.be/silso/)
* **Licence :** NASA Open Access / Creative Commons CC-BY-NC 4.0.
* **Méthodologie :** Radiométrie absolue de précision cryogénique et radiomètres spaciaux TIM (SORCE et TSIS-1) couplés aux reconstructions historiques de Kopp et Lean.

---

## 4. NASA POWER (Prediction Of Worldwide Energy Resources)

* **Organisme :** NASA Langley Research Center.
* **API REST Publique :** `https://power.larc.nasa.gov/api/temporal/monthly/point`
* **Paramètres utilisés :** `ALLSKY_SFC_SW_DWN` (All Sky Surface Downward Solar Irradiance).
* **Unité :** Kilowatt-heure par mètre carré par jour ($kWh/m^2/jour$).
* **Période :** 2015 à 2024+.
* **CORS :** Ouvert à tous les domaines (`Access-Control-Allow-Origin: *`).
* **Cache :** IndexedDB avec clé dynamique de coordonnées `nasa-power-radiation-{lat}_{lon}`.
* **Authentification :** Aucune clé API requise.

---

## 5. Programme International Argo & NOAA NCEI — Océans (OHC)

* **Organisme :** NOAA National Centers for Environmental Information / Consortium International Argo.
* **Variable :** Contenu thermique des océans (*Ocean Heat Content* - OHC) sur les couches bathymétriques 0–2 000 m et 0–700 m.
* **Unité :** Zettajoules ($1\text{ ZJ} = 10^{21}\text{ Joules}$).
* **Période de référence :** 1981–2010 (moyenne = 0 ZJ).
* **Fréquence :** Annuelle.
* **Période :** 1955 à aujourd'hui.
* **Site officiel :** [https://www.ncei.noaa.gov/access/global-ocean-heat-content/](https://www.ncei.noaa.gov/access/global-ocean-heat-content/)
* **Dépôt brut :** `https://www.ncei.noaa.gov/data/oceans/woa/DATA_ANALYSIS/3M_HEAT_CONTENT/DATA/basin/yearly/h22-w0-2000m.dat`
* **Licence :** US Government Public Domain / Open Data.
* **Méthodologie :** Réseau mondial de près de 4 000 balises profileuses robotisées autonomes plongeant jusqu'à 2 000 m tous les 10 jours, étalonné avec les bathythermographes historiques (XBT/CTD). Cheng et al. (2024), Levitus et al. (2012).

