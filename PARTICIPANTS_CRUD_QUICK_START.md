# ⚡ PARTICIPANTS CRUD - Quick Start

## 🚀 Accès Rapide

1. **Connexion Admin** → User Management → **[Gérer]**

## 📊 Opérations

### ➕ AJOUTER
```
[+ Ajouter]
├─ Prénom* (requis)
├─ Nom* (requis)
├─ Email* (requis, unique)
├─ Téléphone (optionnel)
└─ Rôle: [👑 Admin] [🩺 Médecin] [🔧 Technicien]
    └─ [Créer]
```

### 📖 LISTER
```
Affichage automatique des participants confirmés
├─ Nom + Prénom
├─ Email (✉️)
├─ Téléphone (📱, si présent)
├─ Rôle (👑/🩺/🔧 avec couleur)
└─ ID interne (#n)
```

### 🔍 RECHERCHER
```
Barre: "Rechercher par nom, email, téléphone..."
→ Filtrage en temps réel (nom/prénom/email/tél)
```

### ✏️ MODIFIER
```
[✏️] sur la carte
→ Modal pré-remplie
├─ Prénom (modifiable)
├─ Nom (modifiable)
├─ Email (lecture seule)
├─ Téléphone (modifiable)
└─ Rôle (modifiable)
    └─ [Mettre à jour]
```

### 🗑️ SUPPRIMER
```
[🗑️] sur la carte
→ Confirmation: "Êtes-vous sûr de vouloir supprimer 
   [Prénom Nom] ?"
    └─ [Supprimer] (destructif)
```

### 📈 STATISTIQUES
```
┌──────┬──────────┬────────────┬────────┐
│ 5    │    2     │     1      │   2    │
│Total │ Médecins │ Techniciens│ Admins │
└──────┴──────────┴────────────┴────────┘
```

## 🔐 Sécurité

✅ Admin only  
✅ JWT token required  
✅ Validation données  

## 📁 Fichiers

| Fichier | Rôle |
|---------|------|
| `ParticipantsCrudScreen.js` | Interface CRUD |
| `participants-crud.jsx` | Route |
| `UserManagementScreen.js` | Entrée (bouton Gérer) |
| `database.js` | updateUser, deleteUser |
| `server.js` | PUT/DELETE endpoints |

## 🎨 Couleurs Rôles

| Rôle | Couleur |
|------|---------|
| 👑 Admin | 🔴 Rouge |
| 🩺 Médecin | 🔵 Bleu |
| 🔧 Technicien | 🟢 Vert |

## 💻 API Endpoints

```
GET    /users                    (Lister)
POST   /create-user-direct       (Créer)
PUT    /update-user/:id          (Modifier)
DELETE /delete-user/:id          (Supprimer)
```

## 🧪 Test Rapide

```bash
# Récupérer liste
curl -H "Auth: Bearer {token}" localhost:8082/users

# Modifier user 5
curl -X PUT localhost:8082/update-user/5 \
  -H "Auth: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Nouveau"}'

# Supprimer user 5
curl -X DELETE localhost:8082/delete-user/5 \
  -H "Auth: Bearer {token}"
```

## 📋 Checklist

- [ ] Serveur backend démarré (port 8082)
- [ ] Expo web lancé (port 8083)
- [ ] Connecté en tant qu'admin
- [ ] Naviguer à User Management
- [ ] Cliquer "Gérer"
- [ ] Tester: Ajouter → Modifier → Supprimer

## ⚠️ Notes

- Email est **unique** et **non modifiable**
- Participants avec `isConfirmed = false` ne s'affichent pas
- Suppression est **permanente** (pas de corbeille)
- Recherche est **en temps réel** (aucun bouton)

## 📞 Problèmes Courants

| Problème | Solution |
|----------|----------|
| "Impossible de charger" | Vérifier serveur + token |
| "Accès refusé" | Vérifier role = admin |
| "Email déjà utilisé" | Email unique requis |
| "Utilisateur non trouvé" | Actualiser la liste |

## 📚 Documentation Complète

→ Voir `PARTICIPANTS_CRUD_GUIDE.md`

---

**Version**: 1.0 | **Status**: ✅ Production Ready
