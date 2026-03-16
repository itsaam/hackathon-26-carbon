# Frontend (React + Vite)

## Prérequis

- Node.js + npm
- Backend démarré sur `http://localhost:8080`

## Configuration

Le proxy `/api/*` → `http://localhost:8080` est configuré dans `vite.config.ts`.  
Pour la démo, les calculs carbone utilisent l’année **2024**, cohérente avec les facteurs d’énergie chargés par le backend.

## Lancer en local

```sh
npm install
npm run dev
```

Le frontend tourne par défaut sur `http://localhost:5173`.

## Parcours de test typique

1. Se connecter avec un compte existant (créé via l’API ou scripts d’init).  
2. Aller sur l’onglet **Sites** :
   - Créer un nouveau site avec surface, employés, énergie et éventuellement composition matériaux.  
   - Sauvegarder puis lancer un calcul.
3. Depuis la fiche site :
   - Consulter les **KPI** et la répartition construction / exploitation.  
   - Ouvrir l’**Historique** du site.  
   - Cliquer sur **Simuler un scénario** et tester plusieurs réglages (énergie / renouvelable).  
   - Exporter le **rapport HTML**.
4. Aller sur **Comparer** pour comparer plusieurs sites, puis sur **Historique** global.  
5. Aller sur **Carte** pour visualiser les sites géolocalisés (couleur/size en fonction du total CO₂).

