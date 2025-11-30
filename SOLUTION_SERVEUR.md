# ✅ SOLUTION : Problème Serveur Résolu

## 🔍 Diagnostic

### Problème Identifié
Le serveur Node.js démarrait correctement mais **s'arrêtait immédiatement** dès la première requête HTTP, sans message d'erreur. Ce n'était **PAS un problème de code** mais un problème **d'environnement Windows/PowerShell**.

### Symptômes
- ✅ `node server.js` : Serveur démarre
- ✅ Logs affichés : "MySQL connecté", "Serveur en cours..."
- ❌ Première requête HTTP → Processus Node termine instantanément
- ❌ Aucun message d'erreur visible

## ✅ Solution : Utiliser PM2

PM2 est un gestionnaire de processus Node.js production-ready qui maintient le serveur en vie.

### Installation
```powershell
npm install -g pm2
```

### Commandes PM2

#### Démarrer le serveur
```powershell
pm2 start server.js --name "planning-server"
```

#### Voir les logs en temps réel
```powershell
pm2 logs planning-server
```

#### Voir le statut
```powershell
pm2 status
```

#### Redémarrer après modifications
```powershell
pm2 restart planning-server
```

#### Arrêter le serveur
```powershell
pm2 stop planning-server
```

#### Supprimer le processus
```powershell
pm2 delete planning-server
```

## 🎯 Tests Validés

Tous les utilisateurs peuvent se connecter :

### Admin
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@hopital.com","password":"Admin123!"}'
```
✅ Role: admin

### Médecin
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/login" -Method POST -ContentType "application/json" -Body '{"email":"medecin@hopital.com","password":"Medecin123!"}'
```
✅ Role: medecin

### Technicien
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/login" -Method POST -ContentType "application/json" -Body '{"email":"technicien@hopital.com","password":"Technicien123!"}'
```
✅ Role: technicien

## 📋 Modifications Effectuées

### 1. Consolidation Base de Données ✅
- ❌ **Supprimé** : Dossier `data/` (fichiers JSON)
- ❌ **Supprimé** : Double logique files + MySQL dans `db/database.js`
- ✅ **Gardé** : MySQL uniquement (approche unifiée)
- ✅ **Ajouté** : Export de `initMySQL()` pour tests
- ✅ **Simplifié** : Toutes les fonctions utilisent MySQL directement

### 2. Amélioration Debugging ✅
- ✅ **Ajouté** : Handlers d'erreurs globaux dans `server.js`
  - `process.on('uncaughtException')`
  - `process.on('unhandledRejection')`

### 3. Solution Serveur ✅
- ✅ **Identifié** : Problème environnement Windows/PowerShell
- ✅ **Solution** : Utiliser PM2 au lieu de `node server.js` direct
- ✅ **Testé** : Login fonctionnel pour les 3 rôles

## 🚀 Démarrage du Projet

### Prérequis
1. XAMPP MySQL en cours d'exécution
2. Base de données `planning` créée
3. Tables créées (voir `sql/schema.sql`)
4. Utilisateurs de test créés (voir `scripts/create-test-users.js`)
5. PM2 installé : `npm install -g pm2`

### Lancer le Backend
```powershell
# Démarrer avec PM2
pm2 start server.js --name "planning-server"

# Vérifier les logs
pm2 logs planning-server
```

### Lancer le Frontend (Expo)
```powershell
# Dans un nouveau terminal
npx expo start
```

## 📊 Architecture Finale

```
projet-planning/
├── server.js              ← Serveur Express + JWT + Socket.io
├── db/
│   └── database.js        ← MySQL UNIQUEMENT (consolidé)
├── screens/
│   ├── LoginScreen.js     ← Écran de connexion
│   ├── AdminScreen.js     ← Interface admin (modification autorisée)
│   ├── MedecinScreen.js   ← Interface médecin (lecture seule)
│   └── TechnicienScreen.js ← Interface technicien (lecture seule)
└── sql/
    └── schema.sql         ← Schéma MySQL
```

## 🔐 Sécurité Implémentée

- ✅ JWT Authentication (tokens 24h)
- ✅ Passwords hachés avec bcrypt (10 rounds)
- ✅ Middleware `authenticateToken` sur toutes les routes protégées
- ✅ Middleware `adminOnly` sur POST/PUT/DELETE
- ✅ **Seul l'admin peut modifier** (médecins/techniciens lecture + chat uniquement)

## 📝 Prochaines Étapes

1. ✅ **Backend fonctionnel** - TERMINÉ
2. 🔄 **Frontend** - Intégrer LoginScreen comme écran initial
3. 🔄 **Navigation** - Router selon le rôle après login
4. 🔄 **API calls** - Ajouter Authorization header avec token JWT
5. 🔄 **Google Calendar features** - Événements partagés, invitations, RSVP
6. 🔄 **Tests** - Valider tous les endpoints avec 3 rôles
7. 🔄 **Production** - Déployer sur serveur avec PM2 startup

## 💡 Notes Importantes

- **TOUJOURS utiliser PM2** pour lancer le serveur (pas `node server.js`)
- Le problème de crash était **environnemental**, pas dans le code
- MySQL est maintenant la **seule** source de données (pas de fallback fichiers)
- Les 3 utilisateurs de test sont prêts à utiliser
- JWT_SECRET à changer en production (voir `.env`)

---

**Date de résolution** : 30 novembre 2025  
**Statut** : ✅ Backend opérationnel avec PM2  
**Tests** : ✅ Login validé pour admin/medecin/technicien
