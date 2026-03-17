# Mobile (Expo / React Native)

## Prérequis

- Node.js + npm
- Expo CLI (`npm install -g expo-cli` recommandé)
- Backend accessible depuis l’app (soit l’API en ligne, soit un backend local accessible sur le réseau)

Configurer l’URL du backend dans un fichier `.env` à la racine du dossier `mobile` :

```bash
EXPO_PUBLIC_API_URL=http://192.168.X.Y:8080
```

Notes importantes :

- Par défaut, si `EXPO_PUBLIC_API_URL` n’est pas défini, l’app utilise l’API en ligne : `https://api.carbontrack.nexsecure.fr`
- Si tu es en **partage de connexion** (hotspot), l’IP du PC change souvent (ex: `172.20.10.11`). Refaire `ipconfig` et mettre `EXPO_PUBLIC_API_URL=http://<IP_DU_PC>:8080`.
- Sur **iPhone / Expo Go**, vérifier que l’app **Expo Go** a l’autorisation **Réseau local** (Réglages → Expo Go → Réseau local), sinon les requêtes vers une IP locale peuvent échouer avec `Network request failed`.

## Lancer en local

```bash
cd mobile
npm install
npm run start
```

Puis scanner le QR code avec l’app **Expo Go** ou lancer un simulateur iOS/Android.

## Parcours de test typique

1. **Connexion**
   - Ouvrir l’app.
   - Se connecter avec le même compte que sur le web (JWT partagé).

2. **Liste des sites**
   - L’écran `Sites` affiche les sites avec leur surface, nombre d’employés et éventuellement le dernier total CO₂.
   - Taper sur un site pour ouvrir le détail.

3. **Détail d’un site**
   - Voir les KPI principaux : CO₂ total, CO₂/m², CO₂/employé, construction vs exploitation.  
   - Bouton **Recalculer** (année 2024) pour rafraîchir l’empreinte.  
   - Bouton **Historique** pour accéder à la liste des calculs du site.

4. **Saisie rapide**
   - **Saisie exploitation** (`quick-exploitation`) :
     - Met à jour rapidement les consommations (électricité, gaz, fioul, chauffage urbain, renouvelable) en MWh/an.
     - Sauvegarde côté backend et déclenche un recalcul automatique sur 2024.
   - **Saisie matériaux** (`quick-materials`) :
     - Permet de saisir les tonnages de béton, acier, verre, bois.  
     - Envoie ces valeurs au backend via `POST /api/sites/{id}/composition` (ACV simplifiée), puis revient sur le détail du site.

5. **Historique par site**
   - L’écran `history` affiche la liste des calculs pour un site :
     - Date du calcul.
     - CO₂ total (tCO₂e).
     - Badge **Dernier** sur le calcul le plus récent.

