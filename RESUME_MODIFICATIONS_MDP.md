# ✅ Résumé des Modifications - Mot de Passe Provisoire

## 🎯 Objectif
Permettre à l'administrateur de créer un mot de passe provisoire après la confirmation par email, que le participant devra changer lors de sa première connexion.

---

## 📋 Workflow Implémenté

```
Admin invite → Participant reçoit code → Admin confirme + crée mdp provisoire 
→ Participant se connecte → Redirection forcée → Participant change mdp → Accès complet
```

---

## 🔧 Fichiers Modifiés

### 1. Base de données
- ✅ **`scripts/add-must-change-password-column.sql`** (NOUVEAU)
  - Ajoute la colonne `mustChangePassword` à la table `users`

### 2. Backend (Node.js/Express)
- ✅ **`db/database.js`**
  - Ajout de `mustChangePassword` dans les requêtes SELECT
  - Nouvelle fonction `setProvisionalPassword(contact, hashedPassword)`
  - Nouvelle fonction `updateUserPassword(contact, hashedPassword)`

- ✅ **`server.js`**
  - **Endpoint `/verify-code`** : Accepte maintenant `provisionalPassword`, le hache et le sauvegarde avec `mustChangePassword=1`
  - **Endpoint `/change-password`** (NOUVEAU) : Permet au participant de changer son mot de passe
  - **Endpoint `/login`** : Retourne `mustChangePassword` dans l'objet utilisateur

### 3. Frontend (React Native)
- ✅ **`screens/UserManagementScreen.js`**
  - Ajout du champ `provisionalPassword` dans le formulaire de confirmation
  - Modification de `handleAdminConfirmCode` pour envoyer le mot de passe provisoire
  - Alert affiche le mot de passe créé pour que l'admin le communique

- ✅ **`screens/LoginScreen.js`**
  - Vérification de `user.mustChangePassword` après login
  - Redirection automatique vers ChangePasswordScreen si nécessaire

- ✅ **`screens/ChangePasswordScreen.js`** (NOUVEAU)
  - Écran dédié au changement de mot de passe
  - Validation complète (longueur, correspondance, différence)
  - Redirection après succès selon le rôle

- ✅ **`navigation/AppNavigator.js`**
  - Ajout de la route `ChangePassword`

### 4. Documentation
- ✅ **`GUIDE_MOT_DE_PASSE_PROVISOIRE.md`** (NOUVEAU)
  - Guide complet avec workflow, tests, sécurité, dépannage

---

## 🧪 Tests à effectuer

### Test 1 : Création complète d'un participant
```
1. Admin invite participant → Code envoyé
2. Admin confirme code + crée "Temp123!"
3. Participant se connecte avec "Temp123!"
4. Redirection automatique vers changement mdp
5. Participant crée nouveau mdp
6. Accès accordé selon son rôle
```

### Test 2 : Vérifications de sécurité
```
- Mdp trop court (< 6 caractères) → Erreur
- Mdp ne correspondent pas → Erreur
- Ancien mdp incorrect → Erreur
- Même mdp qu'avant → Erreur
```

---

## 📊 Base de données - Requête de vérification

```sql
-- Exécuter d'abord la migration
SOURCE scripts/add-must-change-password-column.sql;

-- Vérifier la structure
DESCRIBE users;

-- Voir tous les utilisateurs avec leur statut
SELECT 
  email, 
  nom, 
  prenom, 
  role, 
  isConfirmed, 
  mustChangePassword,
  CASE 
    WHEN isConfirmed = 0 THEN '⏳ En attente'
    WHEN mustChangePassword = 1 THEN '🔐 Doit changer mdp'
    ELSE '✅ Actif'
  END AS status
FROM users;
```

---

## 🚀 Démarrage

### Étape 1 : Migration base de données
```powershell
# Ouvrir phpMyAdmin (XAMPP)
# Sélectionner la base 'planning'
# Onglet SQL
# Copier-coller le contenu de scripts/add-must-change-password-column.sql
# Exécuter
```

### Étape 2 : Redémarrer le serveur
```powershell
cd c:\Users\MSI\Desktop\STAGE\projet-planning
npm start
```

### Étape 3 : Tester le workflow
```powershell
# 1. Se connecter en tant qu'admin
# 2. Aller dans "Gestion des utilisateurs"
# 3. Inviter un nouveau participant
# 4. Confirmer le code + créer mot de passe provisoire
# 5. Se déconnecter
# 6. Se connecter avec le compte participant
# 7. Vérifier la redirection vers changement mdp
```

---

## 🔒 Sécurité

### Recommandations
- ✅ Mot de passe provisoire minimum 8 caractères
- ✅ Communiquer le mdp par téléphone ou en personne
- ✅ Ne PAS envoyer par email non chiffré
- ✅ Forcer le changement dès la première connexion

### Implémenté
- ✅ Bcrypt avec 10 rounds de salt
- ✅ JWT avec expiration 24h
- ✅ Endpoint protégé par `authenticateToken`
- ✅ Validation côté serveur ET client

---

## 📞 Dépannage rapide

### "Code invalide"
```sql
SELECT contact, code FROM codes WHERE contact = 'email@test.com';
```

### "Ancien mot de passe incorrect"
→ Vérifier avec l'admin le mot de passe provisoire exact

### Flag mustChangePassword bloqué à 1
```sql
UPDATE users SET mustChangePassword = 0 WHERE email = 'email@test.com';
```

### Utilisateur ne peut pas changer son mdp
```sql
-- Vérifier le token JWT (expire après 24h)
-- Reconnecter l'utilisateur
```

---

## 📁 Fichiers créés

```
projet-planning/
├── scripts/
│   └── add-must-change-password-column.sql (NOUVEAU)
├── screens/
│   └── ChangePasswordScreen.js (NOUVEAU)
├── GUIDE_MOT_DE_PASSE_PROVISOIRE.md (NOUVEAU)
└── RESUME_MODIFICATIONS_MDP.md (CE FICHIER)
```

---

## ✅ Checklist finale

- [x] Migration SQL créée
- [x] Backend modifié (3 endpoints)
- [x] Database.js mis à jour (2 nouvelles fonctions)
- [x] UserManagementScreen modifié (champ mdp provisoire)
- [x] LoginScreen modifié (redirection si mustChangePassword)
- [x] ChangePasswordScreen créé
- [x] AppNavigator mis à jour
- [x] Documentation complète créée
- [ ] Migration SQL exécutée dans phpMyAdmin
- [ ] Serveur redémarré
- [ ] Tests effectués

---

## 🎓 Pour l'admin

### Nouveau workflow (à mémoriser)
1. Inviter participant → Code envoyé
2. Recevoir le code du participant
3. **NOUVEAU** : Créer mot de passe provisoire (ex: Temp2025!)
4. Communiquer le mdp provisoire **de manière sécurisée**
5. Le participant changera son mdp à la première connexion

---

**Date de création** : Janvier 2025  
**Statut** : ✅ Implémentation terminée  
**Prochaine étape** : Exécuter la migration SQL et tester
