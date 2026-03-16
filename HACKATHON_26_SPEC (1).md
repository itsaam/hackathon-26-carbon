# Hackathon #26 — Calculer l'empreinte carbone d'un site physique

> **Client :** Capgemini  
> **Dates :** 16 & 17 mars 2026  
> **École :** Sup de Vinci  
> **Livrables :** Code source + Vidéo de démonstration (10 min)

---

## 1. Contexte & Vision

### Mission

Développer une **application fullstack** permettant de calculer l'empreinte carbone d'un site physique (bâtiments, matériaux, parking, consommation énergétique, exploitation), à partir de données réelles saisies par l'utilisateur.

La solution doit :

- Fournir des **indicateurs précis** (KPIs)
- Proposer des **visualisations** (graphiques dynamiques)
- Permettre une **historisation** pour suivre l'évolution des émissions dans le temps

### Objectifs métier

1. **Mesurer** l'impact environnemental de leurs sites
2. **Identifier** les sources majeures d'émissions
3. **Comparer** plusieurs sites entre eux
4. **Faciliter** la prise de décision pour la réduction des émissions

### Concept "Day 2"

L'application doit être pensée pour la **production**, pas juste le prototypage. L'observabilité doit être un socle natif et décisionnel, intégré dès le déploiement.

---

## 2. Stack Technique Imposée

| Couche | Technologie |
|---|---|
| **Frontend Web** | Angular |
| **Mobile** | React Native |
| **Backend** | Java Spring Boot |
| **API** | REST |
| **Base de données** | PostgreSQL |
| **Authentification** | JWT |
| **Déploiement** | Local ou Docker |

---

## 3. Données du site de référence (Capgemini Rennes)

| Donnée | Valeur |
|---|---|
| Surface totale | **11 771 m²** |
| Parking sous-dalle | 41 places |
| Parking sous-sol | 184 places |
| Parking aériens | 83 places |
| **Total parking** | **308 places** |
| Consommation énergétique | **1 840 MWh/an** (2025) |
| Employés (approximation) | **~1 800** |
| Postes de travail | **1 037** |
| Matériaux de construction | À rechercher en open-source |

---

## 4. Paliers de réalisation

### Palier 1 — Base fonctionnelle (OBLIGATOIRE)

- [ ] Backend Spring Boot opérationnel avec API REST
- [ ] Base PostgreSQL fonctionnelle avec schéma initial
- [ ] Front Angular avec formulaire de saisie simple
- [ ] Mobile React Native avec écrans de base
- [ ] Saisir un site avec caractéristiques minimales
- [ ] Calculer un premier résultat CO₂
- [ ] Afficher le résultat dans Angular

**Preuve de succès :** Un site saisi → empreinte calculée → résultat visible dans Angular → historique en base.

### Palier 2 — Dashboard & Mobile

- [ ] Dashboard Angular complet (KPIs, graphiques, répartition construction/exploitation)
- [ ] App mobile avec auth JWT, saisie rapide, consultation indicateurs

**Preuve de succès :** Dashboard navigable avec graphiques dynamiques + mobile peut créer/consulter un site.

### Palier 3 — Fonctions avancées

- [ ] Comparaison multi-sites
- [ ] Historisation avancée (courbes d'évolution)
- [ ] Export PDF
- [ ] (Bonus) API ADEME, heatmap

**Preuve de succès :** Comparaison 2 sites visible + rapport PDF généré.

---

## 5. Formules de calcul carbone

### Empreinte construction

```
CO₂_construction = Σ (quantité_matériau_tonnes × facteur_émission_kgCO₂e/tonne)
```

### Empreinte exploitation (annuelle)

```
CO₂_exploitation = consommation_énergie_kWh × facteur_émission_kgCO₂e/kWh
```

Exemple site Rennes : 1 840 000 kWh × 0.056 = **103 040 kgCO₂e** ≈ **103 tCO₂e/an**

### KPIs

```
CO₂_total = CO₂_construction + CO₂_exploitation
CO₂/m² = CO₂_total / surface_m²
CO₂/employé = CO₂_total / nb_employés
```

### Facteurs d'émission (ADEME Base Carbone)

| Matériau | kgCO₂e/tonne |
|---|---|
| Béton armé | ~230 |
| Acier primaire | ~1 850 |
| Acier recyclé | ~500 |
| Verre plat | ~1 200 |
| Bois résineux | ~30 |
| Aluminium primaire | ~8 000 |

| Énergie | kgCO₂e/kWh |
|---|---|
| Électricité France | ~0.056 |
| Gaz naturel | ~0.227 |
| Fioul domestique | ~0.324 |

> ⚠️ Valeurs à vérifier sur [Base Carbone ADEME](https://base-empreinte.ademe.fr/). Stocker en base, pas en dur dans le code.

---

## 6. Schéma de base de données

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    surface_m2 DECIMAL NOT NULL,
    parking_underground INTEGER DEFAULT 0,
    parking_basement INTEGER DEFAULT 0,
    parking_outdoor INTEGER DEFAULT 0,
    energy_consumption_kwh DECIMAL NOT NULL,
    employee_count INTEGER NOT NULL,
    workstation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    emission_factor DECIMAL NOT NULL,
    unit VARCHAR(50) DEFAULT 'tonne',
    source VARCHAR(255) DEFAULT 'ADEME'
);

CREATE TABLE site_materials (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES materials(id),
    quantity DECIMAL NOT NULL,
    UNIQUE(site_id, material_id)
);

CREATE TABLE carbon_results (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    construction_co2_kg DECIMAL NOT NULL,
    exploitation_co2_kg DECIMAL NOT NULL,
    total_co2_kg DECIMAL NOT NULL,
    co2_per_m2 DECIMAL NOT NULL,
    co2_per_employee DECIMAL NOT NULL,
    calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE energy_factors (
    id SERIAL PRIMARY KEY,
    energy_type VARCHAR(100) NOT NULL,
    emission_factor DECIMAL NOT NULL,
    source VARCHAR(255) DEFAULT 'ADEME',
    year INTEGER DEFAULT 2024
);
```

---

## 7. Endpoints API

### Auth (public)

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion → JWT |

### Sites (protégé JWT)

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/sites` | Créer un site |
| GET | `/api/sites` | Lister mes sites |
| GET | `/api/sites/{id}` | Détail d'un site |
| PUT | `/api/sites/{id}` | Modifier un site |
| DELETE | `/api/sites/{id}` | Supprimer un site |

### Calcul & Résultats (protégé JWT)

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/sites/{id}/calculate` | Lancer le calcul CO₂ |
| GET | `/api/sites/{id}/results` | Historique résultats |
| GET | `/api/sites/{id}/results/latest` | Dernier résultat |
| GET | `/api/sites/{id}/breakdown` | Répartition par catégorie |

### Dashboard & Comparaison (protégé JWT)

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | KPIs agrégés |
| GET | `/api/sites/compare?ids=1,2,3` | Comparaison multi-sites |
| GET | `/api/sites/{id}/history` | Courbes d'évolution |

### Export & Matériaux (protégé JWT)

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/sites/{id}/report/pdf` | Rapport PDF |
| GET | `/api/materials` | Liste matériaux référence |

---

## 8. RÉPARTITION DES 6 DÉVELOPPEURS

---

### 🔵 PARTIE 1 — Samy — BACKEND CORE (Spring Boot + PostgreSQL)

**Rôle : Architecte backend, setup du projet, entités, CRUD, config.**

#### Palier 1 (OBLIGATOIRE)

- Initialiser le projet **Spring Boot** (Maven, Java 17+)
- Configurer `application.yml` : connexion PostgreSQL, port serveur, profils dev/prod
- Configurer **CORS** pour accepter les requêtes du front Angular et du mobile
- Créer **toutes les entités JPA** :
  - `User` (id, email, passwordHash, fullName, createdAt)
  - `Site` (id, userId, name, surfaceM2, parkingUnderground, parkingBasement, parkingOutdoor, energyConsumptionKwh, employeeCount, workstationCount, createdAt, updatedAt)
  - `Material` (id, name, emissionFactor, unit, source)
  - `SiteMaterial` (id, siteId, materialId, quantity)
  - `CarbonResult` (id, siteId, constructionCo2Kg, exploitationCo2Kg, totalCo2Kg, co2PerM2, co2PerEmployee, calculatedAt)
  - `EnergyFactor` (id, energyType, emissionFactor, source, year)
- Créer **tous les Repository** (JpaRepository)
- Implémenter les **endpoints CRUD Site** :
  - `POST /api/sites` — créer
  - `GET /api/sites` — lister
  - `GET /api/sites/{id}` — détail
  - `PUT /api/sites/{id}` — modifier
  - `DELETE /api/sites/{id}` — supprimer
- Créer le `GET /api/materials` pour lister les matériaux de référence
- Écrire le fichier **`data.sql`** (seed) avec les matériaux + facteurs d'émission :
  - Béton armé : 230 kgCO₂e/t
  - Acier primaire : 1850 kgCO₂e/t
  - Acier recyclé : 500 kgCO₂e/t
  - Verre plat : 1200 kgCO₂e/t
  - Bois résineux : 30 kgCO₂e/t
  - Aluminium : 8000 kgCO₂e/t
  - Électricité France : 0.056 kgCO₂e/kWh
  - Gaz naturel : 0.227 kgCO₂e/kWh
- Mettre en place la **validation** (javax.validation : @NotNull, @Min, @Email, etc.)
- Gérer les **erreurs** : GlobalExceptionHandler retournant du JSON `{ "error": "...", "message": "..." }`

#### Palier 2

- Endpoints dashboard :
  - `GET /api/dashboard/summary` — KPIs agrégés tous sites de l'utilisateur
  - `GET /api/sites/{id}/breakdown` — répartition par catégorie
- Aider Adam sur l'intégration JWT dans les controllers

#### Palier 3

- `GET /api/sites/compare?ids=1,2,3` — données de chaque site côte à côte
- `GET /api/sites/{id}/history` — toutes les entrées carbon_results triées par date

#### Fichiers

```
backend/src/main/java/.../entity/          → TOUTES les entités
backend/src/main/java/.../repository/      → TOUS les repos
backend/src/main/java/.../controller/SiteController.java
backend/src/main/java/.../controller/MaterialController.java
backend/src/main/java/.../controller/DashboardController.java
backend/src/main/java/.../config/CorsConfig.java
backend/src/main/java/.../dto/
backend/src/main/resources/application.yml
backend/src/main/resources/data.sql
backend/pom.xml
```

---

### 🟢 PARTIE 2 — Adam — BACKEND LOGIQUE (Calcul carbone + Auth JWT + Docker)

**Rôle : Moteur de calcul, sécurité JWT, Dockerisation.**

#### Palier 1 (OBLIGATOIRE)

- Implémenter le **CarbonCalculationService** :
  ```java
  constructionCo2 = Σ (siteMaterial.quantity * material.emissionFactor)
  exploitationCo2 = site.energyConsumptionKwh * energyFactor.emissionFactor
  totalCo2 = constructionCo2 + exploitationCo2
  co2PerM2 = totalCo2 / site.surfaceM2
  co2PerEmployee = totalCo2 / site.employeeCount
  ```
- Créer l'endpoint `POST /api/sites/{id}/calculate` :
  - Récupérer site + matériaux + facteur énergie
  - Appeler CarbonCalculationService
  - Sauvegarder le résultat dans `carbon_results` (historisation)
  - Retourner le CarbonResultDTO
- Créer les endpoints résultats :
  - `GET /api/sites/{id}/results` — tous les résultats historisés
  - `GET /api/sites/{id}/results/latest` — le plus récent
- Écrire des **tests unitaires** sur CarbonCalculationService
- Valider avec données Rennes : 1 840 000 kWh × 0.056 ≈ 103 040 kgCO₂e

#### Palier 2

- Implémenter **JWT complet** (Spring Security) :
  - `JwtTokenProvider` : génération + validation du token
  - `JwtAuthenticationFilter` : intercepte requêtes, extrait/valide token
  - `SecurityConfig` : routes publiques `/api/auth/**`, le reste protégé
  - `CustomUserDetailsService`
- `AuthController` :
  - `POST /api/auth/register` — BCrypt + création user
  - `POST /api/auth/login` — retourne `{ "token": "...", "expiresIn": ... }`

#### Palier 3

- `GET /api/sites/{id}/report/pdf` — génération PDF (iText ou JasperReports)
- (Bonus) Intégration API ADEME Base Carbone

#### Docker

- `Dockerfile` backend (multi-stage Maven → JRE)
- `docker-compose.yml` racine : postgres + backend + frontend

#### Fichiers

```
backend/src/main/java/.../service/CarbonCalculationService.java
backend/src/main/java/.../service/AuthService.java
backend/src/main/java/.../controller/AuthController.java
backend/src/main/java/.../security/JwtTokenProvider.java
backend/src/main/java/.../security/JwtAuthenticationFilter.java
backend/src/main/java/.../security/CustomUserDetailsService.java
backend/src/main/java/.../config/SecurityConfig.java
backend/Dockerfile
docker-compose.yml
```

---

### 🟡 PARTIE 3 — Lucas — FRONTEND ANGULAR : Formulaires & Pages

**Rôle : Setup Angular, routing, formulaires de saisie, pages liste/détail, services API.**

#### Palier 1 (OBLIGATOIRE)

- Initialiser **Angular** (`ng new carbon-frontend --routing --style=scss`)
- Configurer le **routing** :
  - `/login`, `/register`, `/sites`, `/sites/new`, `/sites/:id`, `/dashboard`, `/compare`
- Créer le **SiteService** (HttpClient) :
  - `createSite(data)`, `getSites()`, `getSite(id)`, `updateSite(id, data)`, `deleteSite(id)`
  - `calculateCarbon(id)`, `getResults(id)`, `getLatestResult(id)`, `getMaterials()`
- Créer le **formulaire de saisie** (Reactive Forms) :
  - Nom du site (text, requis)
  - Surface m² (number, requis, min > 0)
  - Parking sous-dalle / sous-sol / aériens (number, default 0)
  - Consommation énergie en MWh (number, requis) — **convertir en kWh avant envoi** (× 1000)
  - Nombre d'employés (number, requis, min > 0)
  - Postes de travail (number, optionnel)
  - **Section matériaux dynamique** : bouton "Ajouter un matériau" → select matériau (depuis API) + quantité tonnes
  - Validation inline sur chaque champ
  - Bouton "Calculer l'empreinte"
- **Page liste sites** : tableau/cards avec nom, surface, dernier CO₂
- **Page détail** : infos site + résultat CO₂ + bouton "Recalculer"
- **Layout** : navbar (Sites, Dashboard, Comparer, Déconnexion)

#### Palier 2

- Pages **Login/Register**
- **AuthService** : login, register, localStorage token, isLoggedIn(), logout()
- **HTTP Interceptor** : ajoute `Authorization: Bearer <token>`
- **AuthGuard** : redirige vers `/login` si pas auth

#### Palier 3

- Page **comparaison** : multi-select sites, affichage côte à côte
- Bouton **Export PDF** (appel endpoint backend, téléchargement)

#### Fichiers

```
frontend/src/app/core/services/site.service.ts
frontend/src/app/core/services/auth.service.ts
frontend/src/app/core/interceptors/jwt.interceptor.ts
frontend/src/app/core/guards/auth.guard.ts
frontend/src/app/features/auth/login/
frontend/src/app/features/auth/register/
frontend/src/app/features/sites/site-list/
frontend/src/app/features/sites/site-form/
frontend/src/app/features/sites/site-detail/
frontend/src/app/features/compare/
frontend/src/app/shared/components/navbar/
frontend/src/app/app.routes.ts
```

---

### 🟠 PARTIE 4 — Mohamed — FRONTEND ANGULAR : Dashboard & Graphiques

**Rôle : Dashboard interactif, KPIs, tous les graphiques, data visualisation.**

#### Palier 1 (OBLIGATOIRE)

- Installer **ngx-charts** ou **Chart.js** (ng2-charts)
- Créer le **DashboardService** :
  - `getSummary()`, `getBreakdown(siteId)`, `getHistory(siteId)`, `compareSites(ids)`
- Sur la page détail (de Lucas) ajouter :
  - **Cards KPI** : CO₂ Total, CO₂/m², CO₂/employé
  - **Graphique donut** simple : construction vs exploitation

#### Palier 2

- **Dashboard complet** (`/dashboard`) :
  - Cards KPI haut de page : CO₂ total agrégé, nb sites, moyenne CO₂/m²
  - **Donut** : répartition construction vs exploitation
  - **Barres horizontales** : top émissions par matériau
  - **Barres groupées** : émissions par site
  - **Ligne** : évolution historique
- **Composants Angular réutilisables** :
  - `KpiCardComponent` (label, value, unit, icon)
  - `DonutChartComponent` (data[])
  - `BarChartComponent` (data[], labels[])
  - `LineChartComponent` (series[])
- Dashboard **responsive** et rafraîchi par sélection de site

#### Palier 3

- Graphiques de **comparaison** côte à côte (barres groupées, radar chart optionnel)
- **Historisation avancée** : line chart avec sélecteur de période
- **Heatmap** (bonus)

#### Style & UX

- Palette cohérente : vert/bleu éco, rouge forte émission
- Animations de transition
- Tooltips sur hover
- Critère noté : "Dashboard clair (graphiques lisibles)"

#### Fichiers

```
frontend/src/app/features/dashboard/dashboard.component.ts|html|scss
frontend/src/app/features/dashboard/dashboard.service.ts
frontend/src/app/shared/components/kpi-card/
frontend/src/app/shared/components/donut-chart/
frontend/src/app/shared/components/bar-chart/
frontend/src/app/shared/components/line-chart/
frontend/src/app/shared/styles/
```

---

### 🟣 PARTIE 5 — Stephane — MOBILE (React Native)

**Rôle : Application mobile complète, saisie terrain, consultation.**

#### Palier 1 (OBLIGATOIRE)

- Initialiser **React Native** (Expo recommandé) :
  ```bash
  npx create-expo-app carbon-mobile --template blank-typescript
  ```
- Installer : `@react-navigation/native`, `@react-navigation/stack`, `axios`, `expo-secure-store`
- **Service API** (`src/services/api.ts`) : base URL, intercepteur JWT, méthodes CRUD
- **Écrans de base** :
  - SplashScreen
  - SiteListScreen (FlatList des sites + dernier CO₂)
  - SiteDetailScreen (infos site + résultat CO₂)
- **Stack Navigator** : Splash → SiteList → SiteDetail

#### Palier 2

- **LoginScreen** : email + mdp → JWT → SecureStore
- **RegisterScreen** : nom, email, mdp, confirmation
- **Gestion session** : auto-login si token en SecureStore, bouton déconnexion
- **SiteFormScreen** (saisie rapide) :
  - Nom, surface, parking (3 champs), énergie MWh (→ kWh), employés
  - Section matériaux dynamique (picker + quantité)
  - Validation, loading, redirect vers résultat
- **Indicateurs** sur SiteDetailScreen : cards CO₂ total, /m², /employé avec couleur selon niveau

#### Palier 3

- CompareScreen : 2 sites côte à côte
- HistoryScreen : liste résultats passés
- (Bonus) Mini graphique `react-native-chart-kit`

#### UX Mobile

- Interface **simple, rapide** — outil terrain
- Gros boutons, champs larges
- Feedback : loading spinners, toasts success/error
- Pull-to-refresh

#### Fichiers

```
mobile/src/services/api.ts
mobile/src/services/auth.ts
mobile/src/navigation/AppNavigator.tsx
mobile/src/screens/SplashScreen.tsx
mobile/src/screens/LoginScreen.tsx
mobile/src/screens/RegisterScreen.tsx
mobile/src/screens/SiteListScreen.tsx
mobile/src/screens/SiteFormScreen.tsx
mobile/src/screens/SiteDetailScreen.tsx
mobile/src/screens/CompareScreen.tsx
mobile/src/components/KpiCard.tsx
mobile/src/components/MaterialInput.tsx
mobile/App.tsx
```

---

### 🔴 PARTIE 6 — Mehdi — INTÉGRATION + QUALITÉ + DÉMO

**Rôle : Intégration entre composants, tests, polish, préparation démo.**

#### Palier 1 (OBLIGATOIRE)

- **README.md** : instructions install (back, front, mobile, Docker), variables d'env
- Aider Adam sur la base PostgreSQL (script init, vérifier seed)
- **Tester l'intégration** front ↔ back ↔ mobile :
  - Formulaire Angular → API → résultat OK ?
  - Mobile → API → résultat OK ?
  - Debug CORS, formats JSON, erreurs
- Aider là où c'est le plus urgent

#### Palier 2

- **Tests** : JUnit backend (endpoints principaux) + tests Angular basiques
- **Valider le calcul carbone** avec données Rennes (chiffres cohérents ?)
- Créer un **jeu de données de test** réaliste
- **Polish UX** : cohérence visuelle, messages d'erreur, responsive

#### Palier 3

- Aider Adam sur l'export PDF si besoin
- **Données de démo** : 3-4 sites réalistes :
  - Site Rennes (données réelles)
  - Bureau léger (~2000 m²)
  - Entrepôt (~5000 m²)
  - Data center (~1000 m²)
- **Préparer la démo** :
  - Scénario de démonstration end-to-end
  - Dry-run complet
  - **STOP dev à 15h jour 2** — les 2 dernières heures = démo

#### Transversal

- Point de contact quand un front a besoin d'un endpoint
- Gérer les **merges Git** et conflits
- Surveillance qualité : pas de console.log, pas de TODO, code commenté

#### Fichiers

```
README.md
docker-compose.yml (avec Adam)
backend/src/test/
frontend/src/app/**/*.spec.ts
docs/
data/
```

---

## 9. Dépendances entre parties

```
ORDRE DE PRIORITÉ (Palier 1) :

  Samy (P1 - Backend Core)     Adam (P2 - Calcul + Auth)
       │                              │
       ├── Entités + CRUD prêt ──────►├── Calcul utilise les entités
       │                              │
       ▼                              ▼
  Lucas (P3 - Front Forms)     Mohamed (P4 - Dashboard)
       │                              │
       ├── Formulaire appelle ────────┤── Dashboard appelle les mêmes endpoints
       │   les endpoints              │
       ▼                              ▼
  Stephane (P5 - Mobile)       Mehdi (P6 - Intégration)
       │                              │
       ├── Mobile appelle ────────────┤── Teste tout, debug, polish
       │   les mêmes endpoints        │
       ▼                              ▼
                    DÉMO
```

### Timeline suggérée (2 jours)

**Jour 1 — Matin (9h-13h) :**

| Qui | Quoi | Objectif midi |
|---|---|---|
| Adam | Setup Spring Boot + entités + CRUD | **Endpoints sites dispo** |
| Samy | CarbonCalculationService + /calculate | **Calcul fonctionne** |
| Lucas | Setup Angular + routing + formulaire | Formulaire prêt (mock API) |
| Mohamed | Setup ngx-charts + composants graphiques | Composants prêts (données statiques) |
| Stephane | Setup React Native + navigation + écrans | Écrans de base prêts (mock) |
| Mehdi | README + Docker + aide Samy DB | Base PostgreSQL opé |

**Jour 1 — Après-midi (14h-19h) :**

| Qui | Quoi |
|---|---|
| Adam | Endpoints dashboard + breakdown |
| Samy | JWT auth complet |
| Lucas | Brancher front sur vraie API + liste + détail |
| Mohamed | Brancher dashboard sur API + KPIs + graphiques |
| Stephane | Brancher mobile sur API + login + formulaire |
| Mehdi | Tests intégration, debug CORS, données test |

**Jour 2 — Matin (9h-13h) :**

| Qui | Quoi |
|---|---|
| Tous | Finir Palier 2, attaquer Palier 3 |
| Mohamed | Graphiques avancés, comparaison |
| Adam | Export PDF |
| Mehdi | Données de démo (3-4 sites) |

**Jour 2 — Après-midi (14h-17h) :**

| Heure | Action |
|---|---|
| 14h-15h | Fix derniers bugs, polish |
| **15h** | **STOP DEV** |
| 15h-17h | Enregistrement vidéo de pitch |

---

## 10. Critères d'évaluation

### Vidéo de Pitch (160 pts — poids 80%)

| Critère | Pts |
|---|---|
| Structure/narration (intro, problème, solution, démo, conclusion) | 30 |
| Qualité visuelle et technique (slides, démo, montage) | 30 |
| Compréhension contexte Day 2 + objectifs | 30 |
| Démonstration MVP (choix tech, fluidité, qualité, adéquation) | 30 |
| Valeur et impact (pédagogie, besoin réel) | 30 |
| Originalité et ambition | 10 |

### Livrables Techniques (40 pts — poids 20%)

| Critère | Pts |
|---|---|
| Respect cahier des charges (formulaire + API + calculs + dashboard + auth) | 10 |
| Qualité calcul carbone (facteurs corrects, formules, KPIs fiables) | 7 |
| Qualité technique (archi, code propre, validation, stabilité) | 8 |
| UX/UI (formulaire ergonomique, dashboard lisible) | 3 |
| Bonus (comparaison multi-sites, export PDF) | 2 |
| Gestion de projets (vision produit, priorisations, scalabilité) | 10 |

---

## 11. Structure du projet

```
hackathon-26/
├── backend/                          # Samy + Adam
│   ├── src/main/java/com/hackathon/carbon/
│   │   ├── config/                   # CorsConfig (Adam), SecurityConfig (Samy)
│   │   ├── controller/               # SiteController (Adam), AuthController (Samy), DashboardController (Samy)
│   │   ├── dto/                      # Adam
│   │   ├── entity/                   # Adam
│   │   ├── repository/              # Adam
│   │   ├── security/                # Adam
│   │   ├── service/                 # CarbonCalculationService (Samy), AuthService (Samy)
│   │   └── CarbonApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml          # Adam
│   │   └── data.sql                 # Adam
│   ├── src/test/                    # Mehdi + Samy
│   ├── Dockerfile                   # Samy
│   └── pom.xml                      # Adam
├── frontend/                         # Lucas + Mohamed
│   ├── src/app/
│   │   ├── core/                    # Lucas (services, guards, interceptors)
│   │   ├── features/
│   │   │   ├── auth/                # Lucas
│   │   │   ├── sites/               # Lucas
│   │   │   ├── dashboard/           # Mohamed
│   │   │   └── compare/             # Lucas + Mohamed
│   │   ├── shared/                  # Mohamed (composants graphiques) + Lucas (navbar)
│   │   └── app.routes.ts            # Lucas
│   └── package.json
├── mobile/                           # Stephane
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── navigation/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml               # Samy + Mehdi
└── README.md                        # Mehdi
```

---

## 12. Instructions pour les agents IA

### Règles

1. **Palier 1 est OBLIGATOIRE** — tout le monde y contribue d'abord
2. Le **backend est le socle critique** — Samy et Adam sont prioritaires jour 1 matin
3. Les facteurs d'émission sont **stockés en base** (data.sql), pas hardcodés
4. L'API retourne des **erreurs JSON structurées**
5. JWT protège **toutes** les routes sauf `/api/auth/*`
6. Code **propre, structuré, commenté** (critère noté)
7. **Ne pas modifier les fichiers des autres parties** sans coordination
8. Si un endpoint manque → signaler, ne pas l'inventer côté front

### Quand un agent travaille sur une partie

- Lire la section de la partie assignée (section 8)
- Respecter les endpoints API définis (section 7)
- Respecter le schéma de base (section 6)
- Respecter les formules de calcul (section 5)
- Se coordonner via les dépendances (section 9)
