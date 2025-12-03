# 📊 Schéma du Workflow - Mot de Passe Provisoire

## 🔄 Vue d'ensemble du processus

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     WORKFLOW COMPLET DU SYSTÈME                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  1. INVITATION  │
│   par l'Admin   │
└────────┬────────┘
         │
         ├─→ Admin remplit formulaire :
         │   • Nom, Prénom
         │   • Email, Téléphone
         │   • Rôle (médecin/technicien/admin)
         │
         ├─→ POST /invite-user
         │   └─→ Génère code 6 chiffres
         │   └─→ Envoie email avec code
         │   └─→ Sauvegarde code en DB (table codes)
         │
         ▼
┌───────────────────────┐
│  2. RÉCEPTION CODE    │
│   par Participant     │
└──────────┬────────────┘
           │
           ├─→ Participant reçoit email :
           │   "Votre code : 123456"
           │
           ├─→ Participant communique code à Admin
           │   (téléphone, SMS, etc.)
           │
           ▼
┌────────────────────────────┐
│  3. CONFIRMATION + MDP     │
│   par l'Admin              │
└───────────┬────────────────┘
            │
            ├─→ Admin entre :
            │   • Code reçu (123456)
            │   • Mot de passe provisoire (Temp#2024!)
            │
            ├─→ POST /verify-code
            │   {
            │     contact: "email@test.com",
            │     code: "123456",
            │     provisionalPassword: "Temp#2024!"
            │   }
            │
            ├─→ Backend :
            │   └─→ Vérifie code valide
            │   └─→ Hache le mdp (bcrypt)
            │   └─→ UPDATE users SET 
            │       password = hashed,
            │       isConfirmed = 1,
            │       mustChangePassword = 1
            │   └─→ Supprime code de table codes
            │
            ▼
┌────────────────────────────┐
│  4. COMMUNICATION MDP      │
│   Admin → Participant      │
└───────────┬────────────────┘
            │
            ├─→ Admin communique de manière sécurisée :
            │   ✅ Appel téléphonique
            │   ✅ SMS sécurisé
            │   ✅ En personne
            │   ❌ PAS par email non chiffré
            │
            ▼
┌────────────────────────────┐
│  5. PREMIÈRE CONNEXION     │
│   par Participant          │
└───────────┬────────────────┘
            │
            ├─→ Participant se connecte :
            │   • Email : email@test.com
            │   • Password : Temp#2024!
            │
            ├─→ POST /login
            │   {
            │     email: "email@test.com",
            │     password: "Temp#2024!"
            │   }
            │
            ├─→ Backend :
            │   └─→ Vérifie email existe
            │   └─→ Vérifie isConfirmed = 1
            │   └─→ Vérifie password (bcrypt.compare)
            │   └─→ Génère JWT token
            │   └─→ Retourne :
            │       {
            │         success: true,
            │         token: "eyJhbGc...",
            │         user: {
            │           id, email, nom, prenom, role,
            │           mustChangePassword: true  ← IMPORTANT
            │         }
            │       }
            │
            ├─→ Frontend (LoginScreen) :
            │   └─→ Sauvegarde token + user (AsyncStorage)
            │   └─→ Vérifie user.mustChangePassword
            │   └─→ Si true : Alert + Redirection
            │
            ▼
┌────────────────────────────────┐
│  6. CHANGEMENT MDP OBLIGATOIRE │
│   par Participant              │
└───────────┬───────────────────┘
            │
            ├─→ Redirection automatique vers ChangePasswordScreen
            │
            ├─→ Participant entre :
            │   • Ancien mdp : Temp#2024!
            │   • Nouveau mdp : MonNouveauMdp123!
            │   • Confirmer : MonNouveauMdp123!
            │
            ├─→ Validations frontend :
            │   └─→ Nouveau ≠ Ancien
            │   └─→ Nouveau = Confirmer
            │   └─→ Nouveau ≥ 6 caractères
            │
            ├─→ POST /change-password
            │   Headers: { Authorization: "Bearer eyJhbGc..." }
            │   {
            │     oldPassword: "Temp#2024!",
            │     newPassword: "MonNouveauMdp123!"
            │   }
            │
            ├─→ Backend :
            │   └─→ Decode JWT → récupère email
            │   └─→ Vérifie oldPassword correct (bcrypt)
            │   └─→ Hache newPassword (bcrypt)
            │   └─→ UPDATE users SET 
            │       password = hashed_new,
            │       mustChangePassword = 0
            │   └─→ Retourne success: true
            │
            ├─→ Frontend :
            │   └─→ Alert "Succès !"
            │   └─→ Redirection selon rôle :
            │       • admin → /admin
            │       • medecin → /medecin
            │       • technicien → /technicien
            │
            ▼
┌────────────────────────────┐
│  7. ACCÈS COMPLET          │
│   Participant actif        │
└────────────────────────────┘
            │
            ├─→ Base de données :
            │   isConfirmed = 1
            │   mustChangePassword = 0
            │
            ├─→ Participant peut utiliser app normalement
            │
            └─→ Futures connexions :
                • Pas de redirection
                • Accès direct selon rôle
```

---

## 🗄️ État de la base de données à chaque étape

```
Étape 1 (Invitation) :
┌─────────────────────────────────────────────────────────┐
│ users                                                   │
├──────────┬───────┬──────────┬────────────┬─────────────┤
│ email    │ nom   │ password │ isConfirmed│ mustChange  │
├──────────┼───────┼──────────┼────────────┼─────────────┤
│ test@... │ Dupont│ (vide)   │     0      │      0      │
└──────────┴───────┴──────────┴────────────┴─────────────┘

┌─────────────────────────────────┐
│ codes                           │
├──────────┬──────────────────────┤
│ contact  │ code                 │
├──────────┼──────────────────────┤
│ test@... │ 123456               │
└──────────┴──────────────────────┘

Étape 3 (Confirmation + Mdp provisoire) :
┌─────────────────────────────────────────────────────────┐
│ users                                                   │
├──────────┬───────┬──────────┬────────────┬─────────────┤
│ email    │ nom   │ password │ isConfirmed│ mustChange  │
├──────────┼───────┼──────────┼────────────┼─────────────┤
│ test@... │ Dupont│ $2b$10...│     1      │      1      │ ← CHANGÉ
└──────────┴───────┴──────────┴────────────┴─────────────┘

┌─────────────────────────────────┐
│ codes                           │
├──────────┬──────────────────────┤
│ contact  │ code                 │
├──────────┼──────────────────────┤
│ (vide)   │ (supprimé)           │
└──────────┴──────────────────────┘

Étape 6 (Changement mdp) :
┌─────────────────────────────────────────────────────────┐
│ users                                                   │
├──────────┬───────┬──────────┬────────────┬─────────────┤
│ email    │ nom   │ password │ isConfirmed│ mustChange  │
├──────────┼───────┼──────────┼────────────┼─────────────┤
│ test@... │ Dupont│ $2b$10...│     1      │      0      │ ← CHANGÉ
└──────────┴───────┴──────────┴────────────┴─────────────┘
                     (nouveau hash)
```

---

## 🔐 Sécurité à chaque étape

```
┌────────────────────────────────────────────────────────────┐
│                    MESURES DE SÉCURITÉ                     │
└────────────────────────────────────────────────────────────┘

Étape 1 : Invitation
├─→ Code aléatoire 6 chiffres (100000-999999)
├─→ Stocké temporairement dans table codes
└─→ Email envoyé via Nodemailer (configuré avec app password)

Étape 3 : Confirmation
├─→ Vérification code exact (String comparison)
├─→ Hachage bcrypt du mdp provisoire (10 salt rounds)
├─→ Suppression du code après confirmation
└─→ Flag mustChangePassword = 1

Étape 5 : Première connexion
├─→ Vérification bcrypt du mdp provisoire
├─→ Génération JWT token (expire 24h)
├─→ Token stocké dans AsyncStorage (chiffré par OS)
└─→ Détection automatique mustChangePassword

Étape 6 : Changement mdp
├─→ Endpoint protégé par authenticateToken middleware
├─→ Vérification ancien mdp (bcrypt.compare)
├─→ Validation nouveau mdp (≥ 6 caractères, différent)
├─→ Hachage nouveau mdp (bcrypt)
└─→ Flag mustChangePassword = 0

Transmission admin → participant
├─→ ❌ JAMAIS par email non chiffré
├─→ ✅ Téléphone (appel vocal)
├─→ ✅ SMS sécurisé
└─→ ✅ En personne
```

---

## 🔄 Cas particuliers

### Cas 1 : Participant perd le mot de passe provisoire

```
Admin peut :
1. Forcer mustChangePassword = 1
2. Créer nouveau mdp provisoire
3. Communiquer au participant
```

SQL :
```sql
UPDATE users 
SET mustChangePassword = 1 
WHERE email = 'test@test.com';
```

### Cas 2 : Code expiré ou perdu

```
Admin peut :
1. Cliquer "Renvoyer le code"
2. Nouveau code généré
3. Nouvel email envoyé
```

### Cas 3 : Token JWT expiré (>24h)

```
Participant doit :
1. Se reconnecter
2. Sera redirigé vers changement mdp si mustChangePassword = 1
```

---

## 📊 Diagramme de séquence technique

```
Frontend          Backend           Database          Email
(Admin)           (Node.js)         (MySQL)          (SMTP)
   │                 │                 │                │
   │ POST /invite    │                 │                │
   ├────────────────→│                 │                │
   │                 │ INSERT user     │                │
   │                 ├────────────────→│                │
   │                 │                 │                │
   │                 │ INSERT code     │                │
   │                 ├────────────────→│                │
   │                 │                 │                │
   │                 │ Send email with code            │
   │                 ├─────────────────────────────────→│
   │                 │                 │                │
   │ ← success       │                 │                │
   │←────────────────┤                 │                │
   │                 │                 │                │

Frontend          Backend           Database
(Admin)           (Node.js)         (MySQL)
   │                 │                 │
   │ POST /verify    │                 │
   │ {code, mdp}     │                 │
   ├────────────────→│                 │
   │                 │ SELECT code     │
   │                 ├────────────────→│
   │                 │ ← code          │
   │                 │←────────────────┤
   │                 │ bcrypt.hash(mdp)│
   │                 │                 │
   │                 │ UPDATE user     │
   │                 │ SET password,   │
   │                 │ isConfirmed=1,  │
   │                 │ mustChange=1    │
   │                 ├────────────────→│
   │                 │                 │
   │                 │ DELETE code     │
   │                 ├────────────────→│
   │                 │                 │
   │ ← success       │                 │
   │←────────────────┤                 │
   │                 │                 │

Frontend          Backend           Database
(Participant)     (Node.js)         (MySQL)
   │                 │                 │
   │ POST /login     │                 │
   ├────────────────→│                 │
   │                 │ SELECT user     │
   │                 ├────────────────→│
   │                 │ ← user data     │
   │                 │←────────────────┤
   │                 │ bcrypt.compare  │
   │                 │ jwt.sign        │
   │                 │                 │
   │ ← token + user  │                 │
   │   mustChange=1  │                 │
   │←────────────────┤                 │
   │                 │                 │
   │ Check mustChange│                 │
   │ → Redirect to   │                 │
   │ ChangePassword  │                 │
   │                 │                 │
   │ POST /change-pwd│                 │
   │ + Bearer token  │                 │
   ├────────────────→│                 │
   │                 │ jwt.verify      │
   │                 │ SELECT user     │
   │                 ├────────────────→│
   │                 │ ← user          │
   │                 │←────────────────┤
   │                 │ bcrypt.compare  │
   │                 │ (old password)  │
   │                 │ bcrypt.hash     │
   │                 │ (new password)  │
   │                 │                 │
   │                 │ UPDATE user     │
   │                 │ SET password,   │
   │                 │ mustChange=0    │
   │                 ├────────────────→│
   │                 │                 │
   │ ← success       │                 │
   │←────────────────┤                 │
   │                 │                 │
   │ Redirect to role│                 │
   │ screen          │                 │
```

---

**Ce schéma est à imprimer et afficher pour référence rapide**
