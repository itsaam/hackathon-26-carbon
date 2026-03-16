# Hackathon #26 — Empreinte Carbone Site Physique

> Capgemini x Sup de Vinci | 16-17 mars 2026

## Architecture globale

- **Backend** : Java 17, Spring Boot, PostgreSQL  
  - Expose une API REST sécurisée par **JWT** (`/api/auth/*`, `/api/sites`, `/api/results`, `/api/compare`, `/api/dashboard`, `/api/sites/{id}/composition`, `/api/sites/{id}/report`…).
  - Service de calcul carbone (construction + exploitation) basé sur des facteurs **ADEME 2024** (table `energy_factors` dans `backend/src/main/resources/data.sql`).
  - Gestion de la composition matériaux (table `site_materials`) pour une approche ACV simplifiée.
- **Frontend web** : React + Vite + Tailwind  
  - Dashboard, liste / détail / édition de sites, comparaison, historique, administration facteurs et matériaux.  
  - Functionalités différenciantes : **scénarios what‑if** par site, **carte / heatmap**, export de **rapport HTML/PDF** structuré.
- **Mobile** : Expo / React Native  
  - Vue synthétique par site (quelques KPI), saisie rapide exploitation + matériaux, **historique des calculs** par site.

## Alignement avec le cahier des charges

- **Socle technique (Palier base)**  
  - Backend Spring Boot + PostgreSQL + API REST opérationnel.  
  - Saisie d’un site, calcul CO₂ (construction + exploitation) et historisation via `CarbonResult`.  
  - Front web développé en **React** (et non Angular comme proposé dans le CDC), validé avec le client pour le hackathon.
- **Palier 1 — Dashboard & Mobile**  
  - Dashboard web complet : KPIs (CO₂ total, /m², /employé), graphiques, répartition construction / exploitation.  
  - Application mobile React Native (Expo) : authentification JWT, saisie rapide terrain (énergie + matériaux), consultation des indicateurs et de l’historique.
- **Palier 2 — Fonctions avancées & comparaison**  
  - Comparaison de plusieurs sites (tableau + bar chart).  
  - Historisation avancée (courbes d’évolution, page `History`).  
  - Export de rapports site (HTML + PDF) et de scénarios (PDF comparatif réel vs scénario).  
  - Visualisation géographique : page `Carte` avec markers colorés en fonction des tCO₂e par site (zones d’impact).  
  - Facteurs d’émission inspirés **ADEME Base Carbone 2024** stockés en base, prêts pour une future intégration API temps réel.

## Structure du repo

```text
hackathon-26-carbon/
├── backend/          # Spring Boot + JPA + sécurité JWT
├── frontend/         # React + Vite (UI web complète)
├── mobile/           # App mobile Expo
├── docker-compose.yml
└── README.md
```

## Lancer le backend

Prérequis :

- Java 17
- Maven
- PostgreSQL (local ou via Docker)

Variables principales (via variables d’environnement) :

- `SPRING_DATASOURCE_URL` (ex. `jdbc:postgresql://localhost:5432/carbon`)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`

### Démarrage rapide

```sh
cd backend
# profil dev local (charge data.sql)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

L’API est disponible sur `http://localhost:8080`.

Les **données de base** (matériaux, facteurs d’énergie 2024) sont chargées via `backend/src/main/resources/data.sql`.

## Lancer le frontend web

Voir `frontend/README.md` pour le détail. En résumé :

```sh
cd frontend
npm install
npm run dev
```

Le front tourne sur `http://localhost:5173` et proxy `/api/*` vers `http://localhost:8080`.

## Lancer le mobile

Voir `mobile/README.md` pour le détail. En résumé :

```sh
cd mobile
npm install
npm run start
```

Configurer l’URL de backend via `EXPO_PUBLIC_API_URL` (par ex. `http://192.168.X.Y:8080` pour un test sur device physique).

## Scénario de démo (10 minutes)

1. **Contexte & vision (2 min)**  
   - Problème : visibilité insuffisante de l’empreinte carbone des sites physiques, décisions d’investissement peu outillées.  
   - Vision : une plateforme unifiée web + mobile pour piloter l’empreinte par site, avec scénarios et ACV simplifiée.

2. **Démo web (4 min)**  
   - Connexion et accès au **dashboard**.  
   - **Création d’un site** via le formulaire complet (surface, employés, énergie détaillée, parkings, composition matériaux).  
   - Calcul de l’empreinte sur 2024, consultation de la fiche site (KPI, répartition construction/exploitation, typologie).  
   - Passage par l’onglet **Historique** et **Comparaison** de plusieurs sites.  
   - Affichage de la **carte des sites** (markers colorés selon tCO₂e).  
   - Ouverture du **modal what‑if** sur un site, ajustement des curseurs et comparaison réel vs scénario.  
   - Export du **rapport HTML** structuré.

3. **Démo mobile (2 min)**  
   - Connexion sur l’app Expo.  
   - Liste des sites + vue détail d’un site (KPI).  
   - Saisie rapide **exploitation** (énergie) puis **matériaux**, recalcul automatique.  
   - Consultation de l’**historique** des calculs du site.

4. **Roadmap & ouverture (2 min)**  
   - Intégration de facteurs officiels ADEME multi‑pays / multi‑années.  
   - ACV plus fine (lots techniques, fin de vie), intégration SI (GMAO, factureurs).  
   - Extension multi‑campus, alertes, objectifs alignés SBTi.

