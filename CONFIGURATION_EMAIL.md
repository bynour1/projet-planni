# 📧 Configuration Email - Guide Complet

## Vue d'ensemble

Le système d'invitation utilise Nodemailer pour envoyer des emails de confirmation. Vous avez plusieurs options pour configurer l'envoi d'emails.

---

## Option 1 : Gmail (Recommandé pour tests)

### Étape 1 : Activer l'authentification à 2 facteurs
1. Allez sur votre compte Google : https://myaccount.google.com/security
2. Activez **"Validation en deux étapes"**

### Étape 2 : Créer un mot de passe d'application
1. Une fois la validation en 2 étapes activée, allez sur : https://myaccount.google.com/apppasswords
2. Sélectionnez **"Autre (nom personnalisé)"**
3. Entrez : `Planning Medical App`
4. Cliquez sur **Générer**
5. **Copiez le mot de passe à 16 caractères** (vous ne pourrez plus le voir après)

### Étape 3 : Configurer le fichier .env
```env
# Option 1: Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=votre.email@gmail.com
```

⚠️ **Important** : Utilisez le mot de passe d'application généré, PAS votre mot de passe Gmail normal !

---

## Option 2 : Mailtrap (Recommandé pour développement)

Mailtrap capture tous les emails sans les envoyer réellement. Parfait pour tester !

### Configuration
1. Créez un compte gratuit sur : https://mailtrap.io
2. Créez une boîte de réception (Inbox)
3. Copiez les informations SMTP
4. Configurez votre `.env` :

```env
# Option 2: Mailtrap
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_username_mailtrap
SMTP_PASS=votre_password_mailtrap
SMTP_SECURE=false
EMAIL_FROM=no-reply@planning-medical.com
```

✅ **Avantages** :
- Aucun email réel n'est envoyé
- Interface web pour consulter tous les emails
- Teste le HTML et le contenu
- Gratuit pour 500 emails/mois

---

## Option 3 : Outlook / Office 365

### Configuration
```env
# Option 3: Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre.email@outlook.com
SMTP_PASS=votre_mot_de_passe
SMTP_SECURE=false
EMAIL_FROM=votre.email@outlook.com
```

---

## Option 4 : SendGrid (Production)

Pour un usage en production avec volume important :

### Configuration
1. Créez un compte sur : https://sendgrid.com
2. Créez une clé API
3. Configurez :

```env
# Option 4: SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_cle_api_sendgrid
SMTP_SECURE=false
EMAIL_FROM=no-reply@votre-domaine.com
```

---

## Tester la configuration

### 1. Vérifier que le serveur démarre sans erreurs
```powershell
node server.js
```

Vous devriez voir :
```
✅ MySQL connecté: planning
🚀 Serveur en cours d'exécution sur http://localhost:5000
```

### 2. Tester l'envoi d'email via l'interface

#### A. Connectez-vous en tant qu'admin
- Email: `admin@hopital.com`
- Mot de passe: `Admin123!`

#### B. Allez dans "Gestion des utilisateurs"

#### C. Créez un nouveau participant
- Nom : **Test**
- Prénom : **Utilisateur**
- Email : **VOTRE_VRAI_EMAIL@gmail.com** (ou autre)
- Téléphone : *optionnel*
- Envoyer par : **Email**
- Rôle : **Médecin**

#### D. Vérifiez votre boîte email
- Avec Gmail/Outlook : Vérifiez votre boîte de réception (et spam)
- Avec Mailtrap : Consultez l'interface web Mailtrap

---

## 📩 Format de l'email envoyé

L'email contient :
- 🎨 **Design HTML professionnel** avec gradient
- 🔢 **Code à 6 chiffres** bien visible
- ℹ️ **Instructions claires** pour l'utilisateur
- ✉️ **Version texte** (fallback)

Exemple de code : `123456`

---

## Mode développement (sans configuration)

Si AUCUNE configuration email n'est définie, le système fonctionne en **mode développement** :

- ✅ Le code est **retourné dans la réponse API** (visible dans les logs)
- ✅ Aucun email n'est envoyé
- ✅ Parfait pour tester sans configuration email

**Exemple de réponse en mode dev :**
```json
{
  "success": true,
  "message": "Invité (dev) créé, code généré",
  "code": "123456",
  "userId": 5
}
```

---

## Dépannage

### ❌ Erreur : "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution pour Gmail :**
1. Vérifiez que la validation en 2 étapes est activée
2. Utilisez un **mot de passe d'application**, pas votre mot de passe Gmail
3. Vérifiez que l'email dans `.env` est correct

### ❌ Erreur : "Connection timeout"

**Solutions :**
1. Vérifiez votre connexion Internet
2. Vérifiez que le port n'est pas bloqué par un firewall
3. Pour Gmail, utilisez `SMTP_PORT=587` (pas 465)
4. Assurez-vous que `SMTP_SECURE=false` pour le port 587

### ❌ L'email arrive dans les spams

**Solutions :**
1. Ajoutez l'expéditeur à vos contacts
2. Vérifiez le SPF/DKIM de votre domaine (production uniquement)
3. Pour Gmail perso, c'est normal en développement

### ❌ Mode dev alors que j'ai configuré l'email

**Vérifiez :**
1. Le fichier `.env` est bien à la racine du projet
2. Les variables sont bien définies (pas de fautes de frappe)
3. Le serveur a été **redémarré** après modification du `.env`
4. Pas d'espaces avant/après les valeurs dans `.env`

---

## 🔐 Sécurité

### ⚠️ NE JAMAIS :
- ❌ Commit le fichier `.env` dans Git
- ❌ Partager vos mots de passe d'application
- ❌ Utiliser votre mot de passe principal Gmail

### ✅ TOUJOURS :
- ✅ Utiliser des mots de passe d'application
- ✅ Ajouter `.env` dans `.gitignore`
- ✅ Régénérer les clés si elles sont exposées

---

## Variables d'environnement - Référence complète

```env
# MySQL (obligatoire)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=planning

# Email - Option 1 : Service nommé (Gmail, etc.)
EMAIL_SERVICE=gmail
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=mot_de_passe_application

# Email - Option 2 : SMTP explicite (Mailtrap, SendGrid, etc.)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
SMTP_SECURE=false

# Email - Commun
EMAIL_FROM=no-reply@planning-medical.com

# JWT Secret (recommandé en production)
JWT_SECRET=changez_moi_en_production_avec_une_longue_chaine_aleatoire

# SMS - Twilio (optionnel)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM=+15551234567
```

---

## 🎯 Recommandations

| Environnement | Service recommandé | Pourquoi |
|---------------|-------------------|----------|
| **Développement local** | Mailtrap | Capture les emails sans les envoyer |
| **Tests personnels** | Gmail | Facile à configurer, gratuit |
| **Staging** | SendGrid / Mailgun | Fiable, statistiques détaillées |
| **Production** | SendGrid / AWS SES | Scalable, professionnel, monitoring |

---

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez les logs du serveur (`node server.js`)
2. Testez d'abord en mode dev (sans config email)
3. Consultez la section Dépannage ci-dessus
4. Vérifiez que MySQL fonctionne

---

**Dernière mise à jour :** 3 décembre 2025
