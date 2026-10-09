# 📐 Méthodologie Mathématique & Statistique — ClimatOSCOPE

## 1. Normalisation Multi-Séries

Pour comparer sur un même repère graphique des grandeurs aux dimensions incompatibles ($W/m^2$, $ppm$, $°C$, $kWh/m^2/j$), ClimatOSCOPE propose 4 modes mathématiques :

### 1.1 Valeurs Brutes (`raw`)
Les valeurs réelles non transformées sont conservées dans leurs unités physiques respectives.

### 1.2 Indice 100 (`index100`)
$$I(t) = \frac{X(t)}{X(t_0)} \times 100$$
Où $t_0$ est la première date valide de la plage sélectionnée. Permet d'observer l'évolution relative proportionnelle d'une série.

### 1.3 Anomalie (`anomaly`)
$$A(t) = X(t) - \bar{X}_{ref}$$
Où $\bar{X}_{ref}$ est la moyenne arithmétique de la série sur la période de référence sélectionnée (ex: 1951-1980).

### 1.4 Z-Score (Centré-Réduit) (`zscore`)
$$Z(t) = \frac{X(t) - \mu}{\sigma}$$
Où $\mu$ est la moyenne empirique et $\sigma$ l'écart-type sur l'échantillon temporel.  
Le Z-score mesure l'écart à la moyenne en nombre d'écarts-types, éliminant totalement les disparités d'échelle et d'unité.

---

## 2. Moyennes Mobiles (Lissage)

Pour une fenêtre $w \in \{12, 60, 120\}$ :
$$MM(t) = \frac{1}{w} \sum_{k=0}^{w-1} X(t - k)$$
Une condition de complétude impose qu'au moins 80% des points soient non nuls dans la fenêtre, sous peine de renvoyer une valeur nulle pour préserver la vérité du signal.

---

## 3. Régression Linéaire (Tendance)

Calculée par la méthode des moindres carrés ordinaires :
$$y = ax + b$$
$$a = \frac{n \sum xy - \sum x \sum y}{n \sum x^2 - (\sum x)^2}, \quad b = \frac{\sum y - a \sum x}{n}$$
Le coefficient de détermination $R^2$ mesure la part de variance expliquée par la droite de tendance.

---

## 4. Corrélation de Pearson & Déclaration d'Indépendance Causale

Pour deux séries chronologiques synchronisées sur les mêmes pas temporels :
$$r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$$

### Clause Épistémologique Impérative
Un coefficient $|r| \approx 1$ indique une corrélation mathématique mais **ne constitue jamais une preuve de causalité physique**.  
Une corrélation doit impérativement être étayée par les bilans de transfert radiatif et les principes de conservation de l'énergie.
