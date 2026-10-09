# 🔬 Notes Scientifiques & Physiques — ClimatOSCOPE

## 1. Forçage Radiatif et Bilan Énergétique

Le système Terre-Atmosphère reçoit de l'énergie sous forme de rayonnement électromagnétique de courtes longueurs d'onde (UV, visible, proche IR émis par le Soleil à ~5770 K) et réémet de l'énergie vers l'espace sous forme de rayonnement thermique infrarouge lointain (~255 K).

À l'équilibre :
$$F_{in} = F_{out}$$
$$\frac{TSI \times (1 - \alpha)}{4} = \sigma T_e^4$$

Avec :
* $TSI \approx 1361 \, W/m^2$ (Irradiance Solaire Totale au sommet de l'atmosphère).
* $\alpha \approx 0.30$ (albédo planétaire moyen).
* Facteur $1/4$ : rapport entre la surface de projection d'un disque plan ($\pi R^2$) et la surface totale de la sphère terrestre ($4 \pi R^2$).
* $\sigma = 5.67 \times 10^{-8} \, W/(m^2 \cdot K^4)$ (constante de Stefan-Boltzmann).
* $T_e \approx 255 \, K$ (-18 °C, température d'émission sans atmosphère).

La température moyenne observée à la surface est de $+14$ à $+15$ °C grâce à l'effet de serre naturel atmosphérique (vapeur d'eau $H_2O$, $CO_2$, $CH_4$, $N_2O$, ozone).

---

## 2. Spectroscopie et Forçage du $CO_2$

La molécule de $CO_2$ possède un mode fondamental de vibration de flexion à une longueur d'onde de **15 µm** ($667 \, cm^{-1}$), située en plein cœur du pic d'émission infrarouge thermique de la surface terrestre.

L'absorption dans les bandes spectrales centrales étant saturée au niveau du sol, l'effet d'une hausse de concentration s'opère sur les ailes des raies spectrales et en altitude (hausse de l'altitude moyenne d'émission vers l'espace dans une troposphère plus froide).
Le forçage radiatif net instantané s'exprime par la relation logarithmique :
$$\Delta F = 5.35 \times \ln\left(\frac{C}{C_0}\right) \, W/m^2$$

Pour un doublement de la concentration ($2 \times C_0$), $\Delta F \approx 3.7 \, W/m^2$.

---

## 3. Le "Grand Découplage" Solaire-Thermique Moderne

L'analyse comparative des séries historiques de ClimatOSCOPE montre :
* **1880–1950 :** Une corrélation positive modérée entre activité solaire (TSI & taches) et températures terrestres.
* **1960–2025 :** L'activité solaire mesurée par satellites présente des cycles d'amplitude constante ou décroissante (le cycle 24 ayant été particulièrement bas), tandis que les températures mondiales poursuivent une hausse continue de plus de $+1,0$ °C.

Cette divergence est un élément empirique central réfutant l'hypothèse selon laquelle l'activité solaire serait le moteur principal du réchauffement contemporain.

---

## 4. Thermodynamique Océanique et Déséquilibre Énergétique de la Terre (EEI)

L'océan mondial constitue le principal réservoir thermique du système Terre :
* Masse de l'océan : $M_{oc} \approx 1.4 \times 10^{21} \, kg$.
* Capacité thermique massique de l'eau de mer : $c_p \approx 3990 \, J/(kg \cdot K)$.
* Capacité thermique globale de l'océan : $\approx 5.6 \times 10^{24} \, J/K$, soit plus de 1 000 fois celle de toute l'atmosphère terrestre ($M_{atm} \approx 5.1 \times 10^{18} \, kg, c_p \approx 1005 \, J/(kg \cdot K)$).

Par conséquent :
1. **L'atmosphère ne stocke que ~1% de l'énergie thermique excédentaire.**
2. **L'océan en absorbe ~90% (dont ~62% dans la tranche 0-700 m et ~28% dans la tranche 700-2000 m).**
3. Le taux d'accumulation thermique océanique mesuré par le réseau Argo ($\approx 320 \, ZJ$ accumulés depuis 1980) permet de quantifier directement le **déséquilibre énergétique planétaire net (EEI)** :
$$EEI = \frac{d(OHC)/dt}{S_{terre}} \approx \frac{13 \times 10^{21} \, J/an}{5.1 \times 10^{14} \, m^2 \times 3.15 \times 10^7 \, s/an} \approx +0.81 \, W/m^2$$
La Terre absorbe actuellement de manière continue $\approx 0.8$ à $1.0 \, W/m^2$ de plus qu'elle n'en réémet vers l'espace.

