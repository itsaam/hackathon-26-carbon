# Pitch 10 minutes — Empreinte Carbone Site Physique

## 0–2 min — Introduction & vision (slides 1–4)

- « Bonjour, on est l’équipe **CarbonTrack**.  
  Notre objectif : donner aux organisations un outil simple pour **mesurer, comparer et piloter** l’empreinte carbone de leurs sites physiques. »
- Les grandes entreprises possèdent des dizaines de sites (bureaux, campus, parkings), mais très peu savent réellement **quelle est l’empreinte carbone de chaque site**.
- Les données sont dispersées entre factures énergétiques, fichiers Excel et audits ponctuels.  
  Résultat : les décisions immobilières (rénovation, déménagement, flex office) sont souvent prises **sans visibilité carbone fiable**.
- Notre solution : **une plateforme web + mobile** qui permet :
  - de mesurer l’empreinte carbone **construction + exploitation** d’un site,
  - de **visualiser** les émissions,
  - de **comparer** plusieurs sites,
  - et de **simuler** des scénarios de réduction carbone.

- Socle technique (en 30 secondes, aligné cahier des charges) :
  - **Backend** Java Spring Boot exposant des APIs REST.
  - **Base PostgreSQL** pour stocker sites, calculs et historique.
  - **Front web Angular** pour le dashboard multi‑sites.
  - **Application mobile React Native** pour la saisie terrain.
  - Authentification **JWT** et connexion déjà opérationnelle à l’API **Base Carbone ADEME** pour les facteurs d’émission.

Transition : « On va maintenant vous montrer comment ce socle se traduit côté web et côté mobile. »

---

## 2–6 min — Expérience desktop / web (slides 5, 7, 8)

### 2–3 min — Vue d’ensemble web : liste des sites

Phrase d’accroche : « Côté desktop, la vue web permet le **pilotage carbone multi‑sites**. »

1. Afficher la page de liste des sites :
   - Pour chaque site : surface, énergie, nombre d’employés, dernier calcul de CO₂.
   - On voit immédiatement quels sites sont les plus émetteurs.
2. Ouvrir un site :
   - Fiche avec les **KPI clés** : CO₂ total (tCO₂e), CO₂/m², CO₂/employé.
   - Répartition **construction vs exploitation**.

Message clé : « L’interface web donne une vue consolidée de tout le parc immobilier, avec les KPI carbone comparables d’un site à l’autre. »

### 3–4 min — Historique & comparaison

Phrase d’accroche : « Une fois le site créé, l’enjeu est de suivre l’impact des actions dans le temps et de comparer les sites entre eux. »

1. Depuis la fiche site, cliquer sur **Historique** :
   - Montrer la courbe d’évolution du CO₂ dans le temps.
   - Insister sur le badge **Dernier** pour le calcul le plus récent.
   - Commentaire métier : « Cela permet de suivre l’impact des actions de réduction dans le temps. »
2. Revenir au menu et ouvrir **Comparer** :
   - Sélectionner plusieurs sites, visualiser le tableau comparatif (total, /m², /employé).
   - Montrer le graphe barres pour comparer visuellement les sites.
   - Commentaire métier : « Les directions immobilières peuvent ainsi prioriser les sites les plus émetteurs. »

Message clé : « On peut prioriser les sites à traiter et suivre l’impact des actions dans le temps. »

### 4–5 min — Carte / heatmap des sites

Phrase d’accroche : « Pour un directeur immobilier, une carte est bien plus parlante qu’un tableau. »

1. Ouvrir l’entrée **Carte** dans la sidebar.
2. Montrer les markers :
   - Couleur / taille en fonction du total CO₂.
   - Tooltip avec nom du site + tCO₂e.

Message clé : « La heatmap permet d’identifier en un coup d’œil les sites les plus émetteurs. »

### 5–6 min — Scénarios what‑if & export

Phrase d’accroche : « Avant d’investir des millions dans des travaux, on a besoin de tester des scénarios. »

1. Retour sur un site, cliquer sur **Simuler un scénario** :
   - Jouer sur 2 curseurs : réduction de la consommation énergétique, augmentation de la production renouvelable.
   - Montrer la comparaison **situation actuelle vs scénario** (total, /m², /employé, delta).
   - Insister : « Cela permet de tester différents scénarios avant de lancer un investissement réel. »
   - Préciser que le scénario **n’est pas enregistré** et sert de support d’atelier décisionnel.
2. Montrer l’**export** :
   - Télécharger un rapport (HTML aujourd’hui, futur PDF).
   - Rappeler que ce rapport peut être partagé en comité immobilier / RSE.

Message clé : « On passe d’une vue statique à un véritable outil d’aide à la décision. »

---

## 6–8 min — Expérience mobile (slide 9)

### 6–7 min — Liste des sites & KPI sur mobile

Phrase d’accroche : « Le mobile transforme la plateforme en outil terrain, directement dans le bâtiment. »

1. Ouvrir l’app mobile (Expo / React Native) et se connecter.
2. Afficher la **liste des sites** : superficie, employés, dernier CO₂ si disponible.
3. Ouvrir un site :
   - KPI synthétiques : CO₂ total, CO₂/m², CO₂/employé, badge « Dernier calcul ».

Message clé : « Les KPI carbone de chaque site sont mis à jour en temps réel dans la poche des équipes. »

### 7–8 min — Saisie terrain & recalcul

1. Depuis le détail du site, ouvrir **Saisie exploitation** :
   - Mettre à jour les consommations en MWh/an d’électricité, de gaz, etc.
2. Ouvrir **Saisie matériaux** :
   - Saisir les tonnages de béton, acier, bois.
3. Expliquer le flux technique :
   - Les formulaires envoient les données via API Spring Boot.
   - Les données sont stockées en PostgreSQL.
   - Un **nouveau calcul** est lancé avec les facteurs ADEME.
   - L’historique est enrichi et les dashboards web sont automatiquement alignés.

Message clé : « Le mobile permet de capturer les données directement depuis le site, sans repasser par Excel, avec un recalcul immédiat cohérent avec le web. »

---

## 8–10 min — Roadmap & évolutions possibles (slide 10)

**Court terme (6–12 mois)**  
1. Renforcement méthodologique
   - Amélioration du calcul ACV construction vs exploitation.
   - Gestion multi‑annuelles (2024+, scénarios d’évolution du mix énergétique) avec la Base Carbone ADEME.

2. ACV et data enrichies
   - Détail par lots (structure, façade, CVC, second œuvre, mobilité pendulaire…).
   - Intégration SI : factures énergétiques, GMAO, IoT, GTB.
   - Mise en place d’un module d’**OCR** pour analyser automatiquement les **DPE** et rapports techniques et pré‑remplir les données.

**Moyen terme**  
3. Intégration data et automatisation
   - Connexion automatique aux factures énergétiques et systèmes GTB.
   - Détection d’anomalies de consommation et alertes pour les sites en dérive.

**Long terme**  
4. Pilotage multi‑campus & ouverture produit
   - Suivi de trajectoires carbone alignées **SBTi**.
   - Intégration avec les outils RSE et BI (Power BI, dashboards ESG).
   - API ouverte pour alimenter finance, achats, RH.

5. Industrialisation & déploiement
   - Stack standard (Spring Boot, Angular, React Native, PostgreSQL, Docker) pour un déploiement multi‑campus.
   - Squad cible : 1 PO, 2–3 dev fullstack, 1 data/ACV, 1 ops.
   - Pilote en 3–4 mois en réutilisant SSO, CI/CD, monitoring existants.

Conclusion : « En deux jours de hackathon, nous avons développé un prototype complet permettant de mesurer, comparer et simuler l’empreinte carbone de sites physiques. Ce socle technique — backend, web et mobile — constitue une base solide pour un déploiement réel dans les grandes organisations. La prochaine étape est d’industrialiser les connecteurs de données et d’enrichir la méthodologie carbone pour piloter la transition bas carbone des campus d’entreprise. »