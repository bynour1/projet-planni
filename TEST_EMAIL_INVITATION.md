# 🧪 Guide de Test - Emails de Confirmation

## 📋 Prérequis

✅ MySQL/XAMPP démarré  
✅ Serveur Node.js en cours (`node server.js`)  
✅ Application Expo lancée (`npx expo start`)  
✅ Email configuré dans `.env` (voir CONFIGURATION_RAPIDE_EMAIL.md)

---

## 🎯 Test Complet du Flux d'Invitation

### Étape 1 : Configuration Email (Gmail)

1. **Ouvrez le fichier `.env`** à la racine du projet

2. **Décommentez et configurez** ces lignes :
```env
EMAIL_SERVICE=gmail
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=votre.email@gmail.com
```

3. **Redémarrez le serveur** :
```powershell
# Arrêtez le serveur actuel (Ctrl+C dans le terminal)
# Puis relancez :
node server.js
```

Vous devriez voir :
```
✅ MySQL connecté: planning
🚀 Serveur en cours d'exécution sur http://localhost:8082
```

---

### Étape 2 : Connexion Admin

1. **Ouvrez l'application** (web ou mobile)
2. **Connectez-vous en tant qu'admin** :
   - Email : `admin@hopital.com`
   - Mot de passe : `Admin123!`
   - Ou cliquez sur le bouton "Admin" en connexion rapide

---

### Étape 3 : Créer un Nouveau Participant

1. **Naviguez vers** "Gestion des utilisateurs" (dans le menu ou sidebar)

2. **Remplissez le formulaire** "Créer un nouveau participant" :
   - **Nom** : Dupont
   - **Prénom** : Jean
   - **Email** : **VOTRE_EMAIL_RÉEL@gmail.com** ⚠️ Important !
   - **Téléphone** : +33 6 12 34 56 78 (optionnel)
   - **Envoyer par** : Email ✉️
   - **Situation (Rôle)** : Médecin

3. **Cliquez sur** "✉️ Créer et envoyer le code"

4. **Vérifiez la réponse** :
   ```
   ✅ Participant créé (id: 4). Un code de confirmation a été envoyé par email
   ```

---

### Étape 4 : Vérifier la Réception de l'Email

1. **Ouvrez votre boîte email** (Gmail, Outlook, etc.)

2. **Cherchez l'email** :
   - Expéditeur : Votre adresse configurée
   - Sujet : `🔐 Code de confirmation - Planning Médical`
   - **⚠️ Vérifiez aussi les spams/courrier indésirable**

3. **L'email devrait contenir** :
   - Design professionnel avec gradient bleu/violet
   - Votre nom (Jean Dupont)
   - Un **code à 6 chiffres** bien visible
   - Instructions pour l'utilisation

**Exemple de code :** `123456`

---

### Étape 5 : Confirmer le Participant (Admin)

1. **Copiez le code** reçu par email (ex: `123456`)

2. **Dans l'interface admin**, un formulaire de confirmation apparaît automatiquement :
   ```
   🔐 Confirmer le participant
   Le code a été envoyé à : votre.email@gmail.com
   ```

3. **Entrez le code** dans le champ

4. **Cliquez sur** "✅ Confirmer"

5. **Vérifiez la confirmation** :
   ```
   Succès : Participant confirmé avec succès ! 
   Il peut maintenant créer son mot de passe.
   ```

6. **Le participant apparaît maintenant** dans la section "✅ Participants actifs"

---

### Étape 6 : Créer le Mot de Passe (Participant)

Maintenant que le participant est confirmé, il peut créer son mot de passe :

1. **Déconnectez-vous** de l'admin (ou utilisez un autre navigateur)

2. **Sur l'écran "Gestion des utilisateurs"**, trouvez la section :
   ```
   🔐 Créer votre mot de passe
   Si l'admin a confirmé votre compte, vous pouvez créer votre mot de passe
   ```

3. **Remplissez** :
   - **Votre email ou téléphone** : votre.email@gmail.com
   - **Nouveau mot de passe** : MedecinSecure123!
   - **Confirmer le mot de passe** : MedecinSecure123!

4. **Cliquez sur** "✅ Créer mon mot de passe"

5. **Confirmation** :
   ```
   Succès : Mot de passe créé ! Vous pouvez maintenant vous connecter.
   ```

---

### Étape 7 : Connexion du Participant

1. **Allez sur l'écran de connexion**

2. **Connectez-vous** avec les nouveaux identifiants :
   - Email : votre.email@gmail.com
   - Mot de passe : MedecinSecure123!

3. **Vous devriez être redirigé** vers l'espace Médecin

4. **Vérifiez l'accès** :
   - ✅ Planning visible
   - ✅ Événements créés par l'admin visibles
   - ✅ Sidebar fonctionnel avec toutes les pages

---

## 🧪 Tests Supplémentaires

### Test 1 : Renvoyer le Code

Si le code n'arrive pas :

1. **Dans "Gestion des utilisateurs"**
2. **Entrez le même email** : votre.email@gmail.com
3. **Le système détecte** : "🔄 Cet email est en attente. Le code sera renvoyé."
4. **Cliquez sur** "🔄 Renvoyer le code"
5. **Un nouveau code est envoyé** par email

### Test 2 : Invitation par Téléphone (avec Twilio)

Si vous avez configuré Twilio :

1. **Sélectionnez** "Envoyer par : 📱 SMS / Téléphone"
2. **Entrez un numéro** : +33 6 12 34 56 78
3. **Le code sera envoyé par SMS** au lieu d'email

### Test 3 : Activation Manuelle

L'admin peut activer un participant sans le code :

1. **Dans "Comptes en attente"**
2. **Cliquez sur** "Activer" à côté du participant
3. **Le participant est activé** immédiatement

---

## 🔍 Vérifications dans la Base de Données

### Ouvrir phpMyAdmin
```
http://localhost/phpmyadmin
```

### Vérifier la table `users`
```sql
SELECT id, email, nom, prenom, role, isConfirmed FROM users;
```

**Avant confirmation :**
| id | email | nom | prenom | role | isConfirmed |
|----|-------|-----|--------|------|-------------|
| 4 | votre@gmail.com | Dupont | Jean | medecin | **0** |

**Après confirmation :**
| id | email | nom | prenom | role | isConfirmed |
|----|-------|-----|--------|------|-------------|
| 4 | votre@gmail.com | Dupont | Jean | medecin | **1** |

### Vérifier la table `codes`
```sql
SELECT contact, code FROM codes;
```

Le code temporaire est stocké ici jusqu'à la confirmation.

---

## 📊 Logs du Serveur

**Lors de l'invitation :**
```
POST /invite-user 200 - - ms
```

**Si l'email est envoyé :**
```
(Pas de log d'erreur = succès)
```

**Si mode dev (pas de config email) :**
```
Send invite failed or not configured (dev-mode): ...
```

**Lors de la confirmation :**
```
POST /verify-code 200 - - ms
```

---

## ❌ Résolution de Problèmes

### L'email n'arrive pas

**1. Vérifiez les logs du serveur**
```powershell
# Dans le terminal où tourne server.js
# Cherchez des erreurs
```

**2. Vérifiez la configuration .env**
```env
# Les lignes doivent être décommentées (pas de #)
EMAIL_SERVICE=gmail
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**3. Redémarrez le serveur**
```powershell
# Ctrl+C puis
node server.js
```

**4. Testez en mode dev**
Commentez toutes les lignes EMAIL dans `.env` :
```env
# EMAIL_SERVICE=gmail
# EMAIL_USER=...
```
Le code sera retourné dans la réponse API (visible dans l'interface)

### Erreur "Invalid login"

➡️ Vous n'utilisez pas un mot de passe d'application Gmail  
➡️ Solution : Créez un mot de passe d'application (voir CONFIGURATION_RAPIDE_EMAIL.md)

### Code incorrect

➡️ Le code a peut-être expiré  
➡️ Solution : Renvoyez un nouveau code

### Le participant ne peut pas créer son mot de passe

➡️ Le compte n'est pas confirmé (isConfirmed = 0)  
➡️ Solution : L'admin doit d'abord confirmer le code

---

## ✅ Checklist de Validation

- [ ] Email de confirmation reçu avec design HTML
- [ ] Code à 6 chiffres visible dans l'email
- [ ] Admin peut confirmer le code
- [ ] Participant passe de "En attente" à "Actifs"
- [ ] Participant peut créer son mot de passe
- [ ] Participant peut se connecter
- [ ] Planning visible pour le participant
- [ ] Événements créés par l'admin sont visibles

---

## 🎉 Test Réussi !

Si toutes les étapes fonctionnent, votre système d'invitation est opérationnel avec de vrais emails !

**Prochaines étapes possibles :**
- Ajouter des notifications push
- Personnaliser le template d'email
- Ajouter l'envoi SMS avec Twilio
- Créer un système de rappel automatique

---

**Dernière mise à jour :** 3 décembre 2025
