# Application de Planning Professionnel

## 📋 Description

Application mobile interne de gestion de planning professionnel similaire à Google Calendar pour une société médicale.

### Rôles et Permissions

#### 👤 Administrateur
- ✅ Créer des comptes utilisateurs (médecins/techniciens)
- ✅ Créer, modifier et supprimer des événements/interventions
- ✅ Assigner des tâches aux médecins et techniciens
- ✅ Gérer le planning complet
- ✅ Accès au chat

#### 🩺 Médecin
- ✅ Consulter son planning personnel
- ✅ Voir les interventions assignées
- ✅ Accès au chat
- ❌ Pas de modification du planning

#### 🔧 Technicien
- ✅ Consulter son planning personnel
- ✅ Voir les interventions assignées
- ✅ Accès au chat
- ❌ Pas de modification du planning

---

## 🚀 Démarrage Rapide

### 1. Prérequis

- Node.js (v14+)
- XAMPP avec MySQL
- Expo CLI (`npm install -g expo-cli`)
- Compte Mailtrap (pour les emails de test)

### 2. Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

### 3. Configuration Base de Données

```bash
# Démarrer XAMPP MySQL
# Ouvrir phpMyAdmin ou mysql CLI

# Créer la base de données
mysql -u root < scripts/schema.sql
mysql -u root < scripts/schema_calendar.sql

# Migrer les données (si nécessaire)
node scripts/migrate-to-mysql.js

# Créer les utilisateurs de test
node scripts/create-test-users.js
```

### 4. Démarrer le Backend

```bash
node server.js
# Serveur disponible sur http://localhost:5000
```

### 5. Démarrer le Frontend

```bash
npx expo start
# Scanner le QR code avec Expo Go
```

---

## 🔐 Authentification

L'application utilise **JWT (JSON Web Token)** pour l'authentification.

### Connexion

**Endpoint:** `POST /login`

```json
{
  "email": "admin@hopital.com",
  "password": "Admin123!"
}
```

**Réponse:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@hopital.com",
    "nom": "Admin",
    "prenom": "Système",
    "role": "admin"
  }
}
```

### Utilisation du Token

Toutes les requêtes authentifiées doivent inclure le header:

```
Authorization: Bearer <votre_token>
```

---

## 📡 API Endpoints

### Authentification

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| POST | `/login` | Non | - | Connexion utilisateur |

### Utilisateurs

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| GET | `/users` | Oui | Tous | Liste des utilisateurs |
| POST | `/invite-user` | Oui | Admin | Inviter un utilisateur |
| POST | `/create-user` | Oui | Admin | Créer/modifier un utilisateur |
| POST | `/admin/activate` | Oui | Admin | Activer immédiatement un compte |

### Planning

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| GET | `/planning` | Oui | Tous | Consulter le planning |
| POST | `/planning/replace` | Oui | Admin | Remplacer le planning |
| POST | `/planning/event` | Oui | Admin | Ajouter un événement |
| PUT | `/planning/event` | Oui | Admin | Modifier un événement |
| DELETE | `/planning/event` | Oui | Admin | Supprimer un événement |

### Calendrier/Événements

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| GET | `/calendars/:id/events` | Oui | Tous | Événements d'un calendrier |
| POST | `/calendars/:id/events` | Oui | Admin | Créer un événement |
| POST | `/events/:id/rsvp` | Oui | Tous | Confirmer présence |
| POST | `/events/:id/grant-edit` | Oui | Admin | Donner permission d'édition |

### Vérification

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| POST | `/send-code` | Non | - | Envoyer code de confirmation |
| POST | `/verify-code` | Non | - | Vérifier le code |
| POST | `/check-contact` | Non | - | Valider email/téléphone |

---

## 👥 Utilisateurs de Test

Après avoir exécuté `node scripts/create-test-users.js`:

### Admin
- **Email:** `admin@hopital.com`
- **Mot de passe:** `Admin123!`
- **Rôle:** admin

### Médecin
- **Email:** `medecin@hopital.com`
- **Mot de passe:** `Medecin123!`
- **Rôle:** medecin

### Technicien
- **Email:** `technicien@hopital.com`
- **Mot de passe:** `Technicien123!`
- **Rôle:** technicien

---

## 🔧 Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# Port du serveur
PORT=5000

# Secret JWT (CHANGEZ EN PRODUCTION!)
JWT_SECRET=votre_secret_super_securise_changez_moi

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=planning

# Email (Mailtrap pour dev)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_user_mailtrap
SMTP_PASS=votre_pass_mailtrap
SMTP_SECURE=false
EMAIL_FROM=noreply@hopital.com

# SMS (optionnel - Twilio)
# TWILIO_ACCOUNT_SID=votre_sid
# TWILIO_AUTH_TOKEN=votre_token
# TWILIO_FROM=+33123456789
```

---

## 🔒 Sécurité

### Production

⚠️ **IMPORTANT** avant le déploiement en production:

1. **Changer le JWT_SECRET** dans `.env`
2. **Utiliser HTTPS** pour toutes les communications
3. **Configurer un vrai serveur SMTP** (pas Mailtrap)
4. **Activer les rate limits** sur les endpoints sensibles
5. **Revoir les permissions** et ajouter des logs d'audit

### Bonnes Pratiques

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les tokens JWT expirent après 24h
- Les emails sont validés (format + MX records)
- Les rôles sont vérifiés côté serveur pour chaque action

---

## 🛠️ Architecture Technique

### Backend
- **Node.js + Express** - API REST
- **Socket.io** - Mises à jour temps réel
- **MySQL** - Base de données (via XAMPP)
- **JWT** - Authentification
- **Nodemailer** - Envoi d'emails

### Frontend
- **React Native + Expo** - Application mobile
- **AsyncStorage** - Stockage local du token
- **Axios** - Requêtes HTTP
- **React Navigation** - Navigation entre écrans

### Structure des Dossiers

```
projet-planning/
├── server.js              # API backend
├── db/
│   └── database.js        # Gestion BDD (MySQL + fichiers)
├── screens/               # Écrans React Native
│   ├── LoginScreen.js     # Connexion
│   ├── AdminScreen.js     # Dashboard admin
│   ├── MedecinScreen.js   # Dashboard médecin
│   ├── TechnicienScreen.js # Dashboard technicien
│   └── ...
├── contexts/              # Contexts React
│   ├── AuthContext.js
│   ├── PlanningContext.js
│   └── ...
├── scripts/               # Scripts utilitaires
│   ├── schema.sql
│   ├── schema_calendar.sql
│   ├── migrate-to-mysql.js
│   └── create-test-users.js
└── data/                  # Données JSON (fallback)
```

---

## 📱 Captures d'Écran

*(À ajouter: captures des différents écrans)*

---

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que le port 5000 est libre
netstat -ano | findstr :5000

# Vérifier les logs
node server.js
```

### Erreur de connexion MySQL
```bash
# Vérifier que XAMPP MySQL est démarré
# Vérifier les credentials dans .env
# Tester la connexion:
mysql -u root -p planning
```

### Emails non reçus
- Vérifier les credentials Mailtrap dans `.env`
- En mode dev, le code est retourné dans la réponse API
- Consulter les logs du serveur

---

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

## 📄 Licence

Propriétaire - Usage interne uniquement
