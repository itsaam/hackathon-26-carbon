# Pitch 10 minutes — Empreinte Carbone Site Physique

## 0–2 min — Problème & vision

- Les grands campus tertiaires concentrent une part majeure de l’empreinte carbone des entreprises, mais :
  - Les données sont éparpillées (factures, GTC, fichiers Excel, audits ponctuels).
  - Les décisions (rénovation, déménagement, flex office) sont souvent prises sans simulation carbone fiable.
- Vision : une plateforme unifiée pour :
  - Consolider les données **construction + exploitation** par site.
  - Simuler simplement des scénarios (énergie, renouvelable, occupation).
  - Donner une vue cohérente web + mobile aux équipes immobilières et aux directions RSE.

Transition : « On va vous montrer comment, en 2 jours de hackathon, on a posé ce socle technique, côté backend, web et mobile. »

## 2–6 min — Démo web

### 2–3 min — Création et calcul d’un site

1. Connexion sur l’application web (login).  
2. Navigation vers **Sites → Nouveau site**.
3. Remplir le formulaire :
   - Informations générales : nom, surface, nombre d’employés, parkings.
   - Énergie : consommation totale + détail électricité / gaz / chauffage urbain.
   - Typologie : type de bâtiment, usage, année de construction.
   - Profil d’occupation : jours/semaine, heures/jour, taux d’occupation.
   - Composition ACV : tonnages de béton, acier, verre, bois.
4. Enregistrer et lancer le calcul (année **2024**, cohérente avec les facteurs ADEME en base).
5. Arriver sur la fiche site :
   - KPI : **CO₂ total (tCO₂e), CO₂/m², CO₂/employé**.
   - Répartition **construction vs exploitation**.
   - Informations de localisation et typologie.

Message clé : « En quelques champs clés, on obtient une photo carbone par site, homogène sur 2024. »

### 3–4 min — Historique & comparaison

1. Depuis la fiche site, cliquer sur **Historique** :
   - Montrer la courbe d’évolution du CO₂ dans le temps.
   - Insister sur le badge **Dernier** pour le calcul le plus récent.
2. Revenir au menu et ouvrir **Comparer** :
   - Sélectionner plusieurs sites, visualiser le tableau comparatif (total, /m², /employé).
   - Montrer le graphe barres pour comparer visuellement les sites.

Message clé : « On peut prioriser les sites à traiter et suivre l’impact des actions dans le temps. »

### 4–5 min — Carte / heatmap des sites

1. Ouvrir l’entrée **Carte** dans la sidebar.
2. Montrer les markers :
   - Couleur / taille en fonction du total CO₂.
   - Tooltip avec nom du site + tCO₂e.

Message clé : « Pour un directeur immobilier, visualiser l’empreinte site par site sur une carte est beaucoup plus parlant qu’un tableau. »

### 5–6 min — Scénarios what‑if & export de rapport

1. Retour sur un site, cliquer sur **Simuler un scénario** :
   - Jouer sur 2 curseurs : réduction de la consommation énergétique, augmentation de la production renouvelable.
   - Montrer la comparaison **situation actuelle vs scénario** (total, /m², /employé, delta).
   - Préciser que le scénario **n’est pas enregistré** et sert de support d’atelier décisionnel.
2. Cliquer sur **Exporter le rapport** :
   - Télécharger le rapport HTML.
   - Afficher rapidement le rendu : sections, tableaux, explications (base pour futur PDF institutionnel).

Message clé : « On passe d’une vue statique à un outil d’aide à la décision, avec un rapport partageable. »

## 6–8 min — Démo mobile

### 6–7 min — Vue site & recalcul rapide

1. Ouvrir l’app mobile (Expo) et se connecter.
2. Afficher la **liste des sites** : superficie, employés, dernier CO₂ si disponible.
3. Ouvrir un site :
   - KPI synthétiques (CO₂ total, /m², /employé).
   - Bouton **Recalculer** (année 2024).
4. Montrer le bouton **Historique** :
   - Liste simple des calculs (date + CO₂ total + badge Dernier).

Message clé : « Sur le terrain, un responsable de site a accès en quelques secondes à ses chiffres clés. »

### 7–8 min — Saisie rapide exploitation / matériaux

1. Depuis le détail du site, ouvrir **Saisie exploitation** :
   - Mettre à jour les consommations en MWh/an.
   - Sauvegarder → recalcul automatique, retour sur la fiche.
2. Ouvrir **Saisie matériaux** :
   - Saisir quelques tonnages de béton, acier, bois.
   - Sauvegarder → envoi au backend (`/composition`) pour alimenter la partie construction.

Message clé : « Le mobile permet de capturer des données directement depuis le site, sans repasser par Excel. »

## 8–10 min — Roadmap & innovation

1. **Renforcement méthodologique**
   - Connexion à la **Base Carbone ADEME** en temps réel et multi‑pays.
   - Gestion multi‑annuelles (2024+, scénarios d’évolution du mix énergétique).
2. **ACV et data enrichies**
   - Détail par lots (structure, façade, CVC, second œuvre, mobilité pendulaire…).
   - Intégration SI : factures, GMAO, IoT, GTB.
3. **Pilotage multi‑campus**
   - Agrégation par pays, région, typologie.
   - Objectifs alignés SBTi, trajectoires et alertes.
4. **Ouverture produit**
   - Intégration dans les outils existants Capgemini / clients (portails RSE, Power BI, etc.).
   - API ouverte pour exposer les indicateurs à d’autres briques (finance, achats, RH).

Conclusion : « En deux jours, on a posé un socle cohérent backend + web + mobile, déjà utilisable pour animer un atelier de décision sur un portefeuille de sites. La suite, c’est d’industrialiser les connecteurs de données et d’enrichir la méthodologie carbone. »

