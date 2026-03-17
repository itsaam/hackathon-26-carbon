# Déploiement sur VPS (Plesk + PuTTY) — `frontend/` + `backend/` (API en ligne)

Ce guide décrit une mise en prod simple, robuste et “Plesk-friendly” pour ce repo :

- **Backend** : Java 17 / Spring Boot + **PostgreSQL** (déjà prévu via `docker-compose.yml`)
- **Frontend** : React + Vite (build **statique** servi par Nginx/Apache)
- **Accès** : domaine(s) gérés par Plesk, reverse proxy **Nginx** possible

L’objectif : avoir une URL publique pour le web (ex. `https://app.domaine.tld`) et une API (ex. `https://api.domaine.tld` ou `https://app.domaine.tld/api`).

---

## Pré-requis sur le VPS

- Accès SSH (PuTTY) avec un utilisateur sudo.
- Plesk installé (Apache+Nginx habituels).
- **Docker** + **Docker Compose** installés (recommandé pour le backend + DB).
- Un ou deux domaines (ou sous-domaines) créés dans Plesk :
  - Option 1 : `app.domaine.tld` (frontend) + `api.domaine.tld` (backend)
  - Option 2 : `app.domaine.tld` (frontend) + backend derrière `/api`

---

## Stratégie recommandée (simple & propre)

### Choix A (recommandé) : 2 sous-domaines

- `https://app.domaine.tld` → sert le **frontend** (fichiers statiques)
- `https://api.domaine.tld` → reverse-proxy vers le **backend** (container) sur le VPS

Avantages :
- séparation claire
- CORS facile à contrôler
- pas de rewrite “SPA + /api” sur un même vhost

### Choix B : 1 seul domaine avec `/api`

- `https://app.domaine.tld` → frontend statique
- `https://app.domaine.tld/api/...` → reverse-proxy vers backend

Avantages :
- même origin, CORS quasi inutile
Inconvénient :
- config Nginx un peu plus spécifique

---

## 1) Déployer le backend + PostgreSQL avec Docker Compose

Le repo inclut déjà un `docker-compose.yml` qui démarre :
- `postgres:15-alpine`
- `backend` buildé depuis `./backend` (Dockerfile)

### 1.1 Préparer un dossier d’exécution côté VPS

Sur le VPS, placez le projet dans un dossier “service”, par exemple :

- `/opt/hackathon-26-carbon/`
  - `docker-compose.yml`
  - `backend/` (sources + Dockerfile)

Déploiement via Git (recommandé) :

```bash
sudo mkdir -p /opt/hackathon-26-carbon
sudo chown -R $USER:$USER /opt/hackathon-26-carbon
cd /opt/hackathon-26-carbon
git clone <votre-repo> .
```

> Alternative : upload SFTP depuis votre machine, puis `cd` dans le dossier.

### 1.2 Définir un secret JWT **prod**

Dans `docker-compose.yml`, `APP_JWT_SECRET` a un fallback `dev-jwt-secret-change-in-production`.
En prod, vous devez fournir une valeur forte.

Créez un fichier `.env` **à côté** du `docker-compose.yml` sur le VPS :

```bash
cd /opt/hackathon-26-carbon
umask 077
cat > .env <<'EOF'
APP_JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
EOF
```

Bonnes pratiques :
- secret long (32+ caractères), non partagé, non committé
- permissions restrictives (d’où `umask 077`)

### 1.3 Build + démarrage

```bash
cd /opt/hackathon-26-carbon
docker compose pull || true
docker compose up -d --build
docker compose ps
```

Vérifications :
- Backend exposé en local VPS sur `http://127.0.0.1:8080` (ou `http://<IP>:8080` si vous avez ouvert le port)
- Postgres sur `5432` (idéalement **non exposé** publiquement)

> Sécurité : vous pouvez garder `8080` fermé côté internet et n’exposer l’API que via Nginx (reverse-proxy).

### 1.4 Logs utiles

```bash
docker compose logs -f backend
docker compose logs -f postgres
```

---

## 2) Mettre le backend “prod-ready”

### 2.1 Persistance PostgreSQL

Le `docker-compose.yml` utilise déjà un volume nommé `postgres_data`.
Ça rend la DB persistante (sur le VPS) même si vous recréez les containers.

### 2.2 Backups (indispensable)

Approche simple : `pg_dump` via le container postgres.

Exemple :

```bash
mkdir -p /opt/backups/carbon
docker compose exec -T postgres pg_dump -U carbon -d carbon > /opt/backups/carbon/carbon_$(date +%F).sql
```

Ensuite, planifier via cron (quotidien) + rotation (7/30 jours).

---

## 3) Déployer le frontend (React/Vite) sur Plesk

Le frontend est prévu pour tourner en statique après build.

### 3.1 Configurer l’URL d’API en prod

En dev, Vite proxy `/api/*` vers `http://localhost:8080` (cf. `frontend/README.md`).
En prod, vous avez deux options :

- **Option A (2 sous-domaines)** : le frontend appelle `https://api.domaine.tld`
- **Option B (même domaine)** : le frontend appelle des URLs relatives `/api/...`

Selon votre code, la configuration peut se faire via variables d’environnement Vite (préfixe `VITE_`).
Le nom exact dépend de votre implémentation (à vérifier dans `frontend/`).

Recommandation :
- en prod, utiliser un **base URL** configurable (ex. `VITE_API_BASE_URL`)
- garder `/api` si vous choisissez l’option “un seul domaine”

### 3.2 Builder le frontend

Sur votre machine (CI/CD recommandé) :

```bash
cd frontend
npm ci
npm run build
```

Vous obtenez typiquement un dossier `dist/`.

### 3.3 Déployer les fichiers `dist/` dans Plesk

Dans Plesk, pour le domaine `app.domaine.tld` :
- Document Root : `httpdocs/`
- Uploader le contenu de `dist/` **dans** `httpdocs/`

Résultat :
- `https://app.domaine.tld` sert le frontend

### 3.4 Activer le routing SPA (React Router)

Si votre app utilise un router côté client, les URLs du type `/sites/123` doivent retomber sur `index.html`.

Deux possibilités :

**A) Apache (.htaccess)** si Apache sert le site :
- créer/activer une règle de rewrite vers `index.html`

**B) Nginx** (recommandé sous Plesk) :
- ajouter une directive “try_files … /index.html”

> Dans Plesk : Domaines → votre domaine → **Paramètres Apache & nginx** → “Directives nginx supplémentaires”.

Exemple (frontend statique + SPA) :

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 4) Exposer l’API via Nginx (Plesk reverse-proxy)

### 4.1 Cas A : `api.domaine.tld` → backend container

Créer un sous-domaine `api.domaine.tld` dans Plesk.
Puis, dans **Directives nginx supplémentaires** du sous-domaine :

```nginx
location / {
  proxy_pass http://127.0.0.1:8080;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 4.2 Cas B : `app.domaine.tld/api` → backend container

Sur le domaine du frontend, ajouter :

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:8080/api/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

> Note : le `proxy_pass` avec `/api/` final évite les surprises de réécriture d’URL.

---

## 5) HTTPS (Let’s Encrypt) & headers

Dans Plesk :
- Installer/activer **Let’s Encrypt** pour `app.domaine.tld` (et `api.domaine.tld` si séparé)
- Forcer la redirection HTTP → HTTPS

Optionnel :
- activer HSTS une fois validé (attention aux sous-domaines).

---

## 6) CORS (si sous-domaine API séparé)

Si `app.` et `api.` sont séparés, le backend doit autoriser l’origine du front.

À régler côté Spring (selon votre implémentation sécurité) :
- autoriser `https://app.domaine.tld`
- autoriser les méthodes/headers nécessaires
- autoriser `Authorization` (JWT)

Si vous utilisez **le même domaine** avec `/api`, vous pouvez souvent éviter CORS.

---

## 7) Démarrage automatique (recommandé)

Deux approches :

### A) Docker restart policies (simple)

Compose peut redémarrer les containers selon policy (si configurée).
Si ce n’est pas le cas, privilégier :

### B) Service systemd (plus propre)

Créer un service `systemd` qui exécute `docker compose up -d` au boot.
(À faire si vous voulez une prod “qui survit” aux reboots sans intervention.)

---

## 8) Sécurité minimale

- **Ne pas exposer Postgres** sur internet (port 5432) : firewall/iptables/SG.
- N’exposer `8080` que localement (`127.0.0.1`) si possible, et passer par Nginx.
- Mettre un `APP_JWT_SECRET` fort (obligatoire).
- Sauvegardes DB + test de restauration.

---

## 9) Vérifications de bout en bout

- `https://app.domaine.tld` charge le frontend
- Login fonctionne et récupère un JWT
- Les appels API répondent (liste sites, compare, dashboard)
- En cas de refresh sur une route interne (SPA), vous restez sur la page (rewrite ok)

---

## 10) Déploiement “propre” (conseil pratique)

### Backend

```bash
cd /opt/hackathon-26-carbon
git pull
docker compose up -d --build
docker image prune -f
```

### Frontend

- Build via CI → upload `dist/` vers `httpdocs/`
- Purger cache si nécessaire (selon headers/CDN)

---

## Annexes

### Ports (rappel)

- Backend : 8080 (à laisser interne si reverse-proxy)
- Postgres : 5432 (interne uniquement)

### À personnaliser pour votre contexte

- Nom(s) de domaine(s) exact(s)
- Variables d’env côté frontend (nom du `VITE_*` utilisé dans le code)
- Configuration CORS côté Spring Security (si sous-domaines séparés)

