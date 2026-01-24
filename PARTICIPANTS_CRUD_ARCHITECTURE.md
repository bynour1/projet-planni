# 🗺️ PARTICIPANTS CRUD - Architecture Visuelle

## 📊 Schéma Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD                        │
│  (User Management Screen)                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ [Gérer] Button
                     ↓
┌─────────────────────────────────────────────────────────────┐
│          PARTICIPANTS CRUD SCREEN                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ← Retour  │  Participants Actifs  │  ➕ Ajouter    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔍 Rechercher par nom, email, téléphone...         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────┬──────────┬────────────┬────────┐                │
│  │   5  │    2     │      1     │   2    │                │
│  │Total │ Médecins │ Techniciens│ Admins │                │
│  └──────┴──────────┴────────────┴────────┘                │
│                                                             │
│  Participants List (FlatList)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Jean Dupont              👑 Admin  [✏️] [🗑️]        │  │
│  │ ✉️ jean@hopital.com                                  │  │
│  │ 📱 +33 6 12 34 56                                    │  │
│  │ ID: #1                                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Marie Martin             🩺 Médecin [✏️] [🗑️]       │  │
│  │ ✉️ marie@hopital.com                                 │  │
│  │ ID: #2                                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flux CRUD

### CREATE FLOW
```
┌──────────────┐
│ ➕ Ajouter   │
└──────┬───────┘
       ↓
┌─────────────────────────────────┐
│  MODAL - Ajouter Participant    │
│  Prénom:     [____________]     │
│  Nom:        [____________]     │
│  Email:      [____________]     │
│  Téléphone:  [____________]     │
│  Rôle:   ◯ Médecin ◯ Tech ◯ Admin
│              [Créer] [Annuler]  │
└──────┬───────────────────────────┘
       │ POST /create-user-direct
       ↓
   ┌────────────┐
   │   Server   │
   │   MySQL    │
   └──────┬─────┘
          │ INSERT INTO users
          ↓
   ✅ Success Message
   📋 Liste mise à jour
```

### READ FLOW
```
┌──────────────────┐
│ Charger List     │
└────────┬─────────┘
         │ GET /users
         ↓
    ┌─────────────┐
    │   Server    │
    │    MySQL    │
    └──────┬──────┘
           │ SELECT * FROM users 
           │ WHERE isConfirmed = 1
           ↓
    [Array of Users]
         │
         ├─ Nom, Prenom
         ├─ Email, Phone
         ├─ Role, ID
         ↓
    🎨 Render FlatList
    📊 Actualiser Stats
```

### UPDATE FLOW
```
┌────────────────┐
│  ✏️ sur Carte  │
└────────┬───────┘
         ↓
┌─────────────────────────────────┐
│  MODAL - Modifier Participant   │
│  Prénom:     [Jean     ]        │
│  Nom:        [Dupont   ]        │
│  Email:      [jean@...] (RO)    │
│  Téléphone:  [+33 6... ]        │
│  Rôle:   ◯ Médecin ◯ Tech ◯ Admin
│      [Mettre à jour] [Annuler]  │
└──────┬───────────────────────────┘
       │ PUT /update-user/:id
       ↓
   ┌────────────┐
   │   Server   │
   │   MySQL    │
   └──────┬─────┘
          │ UPDATE users SET
          │   nom, prenom, phone, role
          ↓
   ✅ Success Message
   📋 Liste refresh
```

### DELETE FLOW
```
┌────────────────┐
│  🗑️ sur Carte │
└────────┬───────┘
         ↓
   ┌──────────────────────────────┐
   │ ⚠️  Confirmation Dialog       │
   │ Supprimer Jean Dupont ?      │
   │  [Annuler]  [Supprimer]      │
   └──────┬───────────────────────┘
          │ Confirmation
          ↓
       DELETE /delete-user/:id
          │
          ↓
    ┌────────────┐
    │   Server   │
    │   MySQL    │
    └──────┬─────┘
           │ DELETE FROM users 
           │ WHERE id = :id
           ↓
    ✅ Success
    📋 Liste refresh
    🚫 Participant disparu
```

## 🔐 Sécurité Flow

```
┌──────────────────┐
│  Requête API     │
└────────┬─────────┘
         │
         ├─ Header: Authorization: Bearer {token}
         │
         ↓
    ┌──────────────────────┐
    │ authenticateToken()  │
    │ Vérifier JWT         │
    │ Extraire userRole    │
    └──────┬───────────────┘
           │ Token valide?
           ├─ Non → 401 Unauthorized
           │
           ↓ Oui
    ┌──────────────────────┐
    │ adminOnly()          │
    │ Vérifier role=admin  │
    └──────┬───────────────┘
           │ Admin?
           ├─ Non → 403 Forbidden
           │
           ↓ Oui
    ✅ Accès accordé
    📥 Exécuter l'action
```

## 📱 Component Tree

```
ParticipantsCrudScreen
├── ScrollView
│  ├── Header
│  │  ├── TouchableOpacity (← Back)
│  │  ├── Text (Title)
│  │  └── TouchableOpacity (+ Add)
│  │
│  ├── SearchContainer
│  │  └── TextInput (Search)
│  │
│  ├── StatsContainer
│  │  ├── StatBox (Total)
│  │  ├── StatBox (Médecins)
│  │  ├── StatBox (Techniciens)
│  │  └── StatBox (Admins)
│  │
│  └── ListContainer
│     └── FlatList
│        └── ParticipantCard (×N)
│           ├── ParticipantInfo
│           │  ├── ParticipantHeader
│           │  ├── ParticipantEmail
│           │  ├── ParticipantPhone
│           │  └── ParticipantId
│           └── ActionButtons
│              ├── EditButton (✏️)
│              └── DeleteButton (🗑️)
│
└── Modal (Add/Edit)
   ├── TextInput (Prénom)
   ├── TextInput (Nom)
   ├── TextInput (Email)
   ├── TextInput (Téléphone)
   ├── RoleSelector
   │  ├── RoleOption (Médecin)
   │  ├── RoleOption (Technicien)
   │  └── RoleOption (Admin)
   └── Buttons
      ├── CancelButton
      └── SaveButton
```

## 🌐 API Integration

```
Frontend (ParticipantsCrudScreen)
         │
         ├─ GET /users
         │  └─ useEffect [load on mount]
         │     └─ setState(participants)
         │
         ├─ POST /create-user-direct
         │  └─ handleSaveParticipant()
         │     ├─ Validation
         │     ├─ API Call
         │     └─ Reload List
         │
         ├─ PUT /update-user/:id
         │  └─ handleSaveParticipant()
         │     ├─ Validation
         │     ├─ API Call
         │     └─ Reload List
         │
         └─ DELETE /delete-user/:id
            └─ handleDeleteParticipant()
               ├─ Confirmation
               ├─ API Call
               └─ Reload List

Backend (server.js)
         │
         ├─ POST /create-user-direct [adminOnly]
         │  └─ db.createOrUpdateUser()
         │     └─ INSERT INTO users
         │
         ├─ PUT /update-user/:id [adminOnly]
         │  └─ db.updateUser()
         │     └─ UPDATE users
         │
         └─ DELETE /delete-user/:id [adminOnly]
            └─ db.deleteUser()
               └─ DELETE FROM users

Database (MySQL)
         │
         └─ users table
            ├─ id
            ├─ email (UNIQUE)
            ├─ phone
            ├─ password
            ├─ nom
            ├─ prenom
            ├─ role
            ├─ isConfirmed
            └─ mustChangePassword
```

## 🎯 State Management

```
ParticipantsCrudScreen Component State:

├─ participants: Array<User>
│  ├─ { id, email, phone, nom, prenom, role, isConfirmed }
│  └─ Filtré: isConfirmed = true uniquement
│
├─ loading: boolean
│  └─ true pendant fetch /users
│
├─ modalVisible: boolean
│  └─ true quand modal open (Create/Edit)
│
├─ editingParticipant: User | null
│  └─ null = Create mode
│  └─ User object = Edit mode
│
├─ formData: Object
│  ├─ nom: string
│  ├─ prenom: string
│  ├─ email: string
│  ├─ phone: string
│  └─ role: 'medecin'|'technicien'|'admin'
│
└─ searchText: string
   └─ Utilisé pour filtrer participants en temps réel
```

## 📈 Data Flow Diagram

```
USER INTERACTION
       │
       ├─ Click [Gérer]
       │  └─ Navigation to /participants-crud
       │     └─ ParticipantsCrudScreen mounts
       │        └─ useEffect → loadParticipants()
       │
       ├─ Rechercher
       │  └─ setSearchText()
       │     └─ filteredParticipants calcul
       │        └─ Re-render FlatList
       │
       ├─ Click [+ Ajouter]
       │  └─ openAddModal()
       │     └─ Reset formData
       │        └─ Modal visible
       │
       ├─ Click [✏️]
       │  └─ openEditModal(participant)
       │     └─ Populate formData
       │        └─ Modal visible
       │
       ├─ Click [🗑️]
       │  └─ handleDeleteParticipant()
       │     └─ Alert confirmation
       │        ├─ Non → Cancel
       │        └─ Oui → DELETE API
       │           └─ loadParticipants()
       │
       └─ Modal [Créer/Mettre à jour]
          └─ handleSaveParticipant()
             ├─ Validation
             ├─ API Call (POST/PUT)
             ├─ setModalVisible(false)
             └─ loadParticipants()
                └─ setState(participants)
                   └─ Re-render
```

## ✨ Key Features Map

```
ParticipantsCrudScreen Features:

DISPLAY
├─ En-tête avec navigation (Back/Title/Add)
├─ Barre de recherche (filtrage temps réel)
├─ Statistiques (4 compteurs)
└─ Liste participants avec actions

SEARCH & FILTER
├─ Texte libre
├─ Sur: nom, prenom, email, phone
├─ En temps réel (aucun délai)
└─ Case-insensitive

MODAL DIALOG
├─ Titre contexte (Ajouter/Modifier)
├─ Formulaire avec validation
├─ Sélecteur rôle (radio buttons)
└─ Boutons Annuler/Créer-Mettre à jour

PARTICIPANT CARD
├─ Infos: Nom, Email, Téléphone, ID
├─ Badge rôle avec couleur
└─ Actions: Modifier, Supprimer

CONFIRMATION
├─ Alert before delete
├─ Affiche nom participant
└─ 2 choix: Annuler/Supprimer

ASYNC OPERATIONS
├─ Loading state
├─ Token from AsyncStorage
├─ API error handling
└─ User alerts
```

---

**Cette architecture garantit**:
- ✅ Navigation fluide
- ✅ Sécurité (Admin only)
- ✅ État synchronisé
- ✅ UX intuitive
- ✅ Gestion d'erreurs robuste
- ✅ Performance optimale
