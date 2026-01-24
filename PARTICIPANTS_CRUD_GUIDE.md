# 📋 Participants CRUD - Documentation Complète

## 🎯 Overview

Un système complet de gestion des participants actifs (CRUD - Create, Read, Update, Delete) réservé aux administrateurs.

## 📁 Fichiers Créés/Modifiés

### Frontend
- **`screens/ParticipantsCrudScreen.js`** - Interface de gestion complète des participants
- **`app/participants-crud.jsx`** - Route Expo pour accéder à l'écran CRUD
- **`screens/UserManagementScreen.js`** - Bouton "Gérer" ajouté pour accéder à l'interface CRUD

### Backend
- **`db/database.js`** - Fonctions d'update et delete utilisateurs
- **`server.js`** - 2 nouveaux endpoints API

## 🚀 Fonctionnalités

### 1. **Lire (READ)** ✅
- Affiche la liste complète des participants actifs (confirmés)
- Filtre en temps réel par nom, prénom, email, téléphone
- Statistiques: Total, Médecins, Techniciens, Admins
- Vue détaillée pour chaque participant

### 2. **Créer (CREATE)** ➕
- Formulaire modal pour ajouter un nouveau participant
- Champs requis: Prénom, Nom, Email
- Champs optionnels: Téléphone, Rôle
- Utilise l'endpoint `/create-user-direct` existant

### 3. **Mettre à jour (UPDATE)** ✏️
- Modifier les infos d'un participant existant
- Champs modifiables: Prénom, Nom, Téléphone, Rôle
- Email non modifiable (clé unique)
- Endpoint: `PUT /update-user/:id`

### 4. **Supprimer (DELETE)** 🗑️
- Suppression avec confirmation
- Affiche nom et prénom du participant
- Endpoint: `DELETE /delete-user/:id`

## 🔐 Sécurité

- **Admin Only**: Tous les endpoints CRUD sont protégés par `adminOnly` middleware
- **Token JWT**: Nécessaire pour chaque requête
- **Authentification**: Vérification du rôle "admin" sur le backend

## 📊 API Endpoints

### Lecture
```
GET /users
Headers: Authorization: Bearer {token}
Response: Array<User>
```

### Créer
```
POST /create-user-direct
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
Body: {
  nom: string,
  prenom: string,
  email: string,
  phone?: string,
  role: 'medecin' | 'technicien' | 'admin'
}
```

### Mettre à jour
```
PUT /update-user/:id
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body: {
  nom?: string,
  prenom?: string,
  phone?: string,
  role?: 'medecin' | 'technicien' | 'admin'
}
```

### Supprimer
```
DELETE /delete-user/:id
Headers: Authorization: Bearer {token}
Response: { success: true, message: "..." }
```

## 🎨 Interface Utilisateur

### Écran Principal
- **En-tête**: Titre, bouton Retour, bouton Ajouter
- **Barre de recherche**: Recherche en temps réel
- **Statistiques**: 4 boîtes avec compteurs
- **Liste des participants**: Cartes avec infos détaillées
- **Actions**: Boutons Modifier (✏️) et Supprimer (🗑️)

### Modal Ajouter/Modifier
- Champs texte pour informations de base
- Sélecteur de rôle (boutons radio)
- Boutons Annuler / Créer ou Mettre à jour

## 🌐 Architecture

```
UserManagementScreen (Page Admin)
    ↓
    └─> Bouton "Gérer"
         ↓
         └─> ParticipantsCrudScreen
              ├─ Requête GET /users
              ├─ Formulaire Modal (Create/Update)
              │   ├─ POST /create-user-direct
              │   └─ PUT /update-user/:id
              └─ DELETE /delete-user/:id
```

## 💾 Base de Données

### Tableau `users`
```sql
id              INT PRIMARY KEY AUTO_INCREMENT
email           VARCHAR(255) UNIQUE
phone           VARCHAR(20) NULLABLE
password        VARCHAR(255)
nom             VARCHAR(100)
prenom          VARCHAR(100)
role            ENUM('admin', 'medecin', 'technicien')
isConfirmed     BOOLEAN (filtrée)
mustChangePassword BOOLEAN
```

## 🎯 Utilisation

### Accès à l'Interface
1. Se connecter en tant qu'admin
2. Aller à "User Management" → "Gérer" (bouton bleu)
3. Interface CRUD s'ouvre

### Ajouter un Participant
1. Cliquer sur "➕ Ajouter"
2. Remplir les champs
3. Sélectionner le rôle
4. Cliquer "Créer"

### Modifier un Participant
1. Cliquer sur "✏️" sur la carte du participant
2. Modifier les champs
3. Cliquer "Mettre à jour"

### Supprimer un Participant
1. Cliquer sur "🗑️" sur la carte
2. Confirmer la suppression
3. Participant supprimé

### Rechercher
- Tapez dans la barre de recherche
- Filtrage en temps réel

## 🎨 Codes Couleur Rôles

| Rôle | Couleur | Badge |
|------|---------|-------|
| Admin | 🔴 #dc3545 | 👑 Admin |
| Médecin | 🔵 #007bff | 🩺 Médecin |
| Technicien | 🟢 #28a745 | 🔧 Technicien |

## ⚙️ Configuration

### Variables d'Environnement
```
API_BASE = http://localhost:8082  (ou déterminé dynamiquement)
JWT_SECRET = (utilisé sur le serveur)
```

### Port Backend
- Port: **8082**
- Middleware: Token JWT + Admin verification

## 📱 Responsive Design

- ✅ Web (react-native-web)
- ✅ Mobile (Expo iOS/Android)
- ✅ Tablette
- Flexbox layout pour adaptation automatique

## 🔍 Debugging

### Logs Console
- `[ParticipantsCrud] Load error: ...`
- `[ParticipantsCrud] Save error: ...`
- `[ParticipantsCrud] Delete error: ...`

### Erreurs Communes

**"Impossible de charger les participants"**
- Vérifier la connexion au serveur
- Vérifier le token JWT
- Vérifier les permissions admin

**"Email ou mot de passe incorrect"**
- Token expiré → Se reconnecter

**"HTTP 404"**
- L'utilisateur a été supprimé
- Actualiser la liste

## 📈 Améliorations Futures

- [ ] Pagination pour listes longues
- [ ] Export CSV/Excel
- [ ] Import CSV en masse
- [ ] Filtre par rôle
- [ ] Historique des modifications
- [ ] Avatar/Photo des participants
- [ ] Géolocalisation
- [ ] Notifications lors de modifications

## 🧪 Tests

### Test Manuel
```bash
# 1. Se connecter comme admin
# 2. Aller à User Management
# 3. Cliquer "Gérer"
# 4. Tester chaque opération CRUD
# 5. Actualiser pour voir les changements
```

### Curl Examples
```bash
# Lister les utilisateurs
curl -H "Authorization: Bearer {token}" \
  http://localhost:8082/users

# Créer un participant
curl -X POST http://localhost:8082/create-user-direct \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont","prenom":"Jean","email":"jean@test.com","role":"medecin"}'

# Mettre à jour
curl -X PUT http://localhost:8082/update-user/5 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont","prenom":"Jean-Pierre"}'

# Supprimer
curl -X DELETE http://localhost:8082/delete-user/5 \
  -H "Authorization: Bearer {token}"
```

## 📝 Notes

- Les participants doivent avoir `isConfirmed = true` pour apparaître
- Email unique dans le système
- Rôle par défaut: "medecin"
- Suppression physique dans la base (pas de soft delete)

## ✅ Checklist d'Implémentation

- ✅ Frontend CRUD Screen créé
- ✅ Fonctions DB (update/delete) ajoutées
- ✅ Endpoints API (PUT/DELETE) implémentés
- ✅ Route Expo créée
- ✅ Bouton "Gérer" ajouté à UserManagement
- ✅ Authentification/Autorisation
- ✅ Gestion d'erreurs
- ✅ Recherche/Filtrage
- ✅ Statistiques
- ✅ Design responsive

---

**Version**: 1.0  
**Date**: Jan 24, 2025  
**Auteur**: Assistant IA  
**Status**: ✅ Prêt pour production
