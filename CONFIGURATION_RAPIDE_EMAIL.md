# ⚡ Configuration Rapide - Recevoir des vrais emails

## 🎯 Configuration Gmail en 3 minutes

### Étape 1 : Activer la validation en 2 étapes
1. Ouvrez : https://myaccount.google.com/security
2. Cliquez sur **"Validation en deux étapes"**
3. Suivez les instructions pour l'activer (SMS recommandé)

### Étape 2 : Créer un mot de passe d'application
1. Une fois la validation activée, allez sur : https://myaccount.google.com/apppasswords
2. Vous pouvez aussi chercher "Mots de passe des applications" dans les paramètres Google
3. Sélectionnez **"Autre (nom personnalisé)"**
4. Tapez : `Planning Medical`
5. Cliquez sur **Générer**
6. **Copiez le mot de passe** (format : xxxx xxxx xxxx xxxx)

### Étape 3 : Configurer le fichier .env

Ouvrez le fichier `.env` à la racine du projet et modifiez ces lignes :

```env
# Décommentez et remplacez par vos informations
EMAIL_SERVICE=gmail
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=votre.email@gmail.com
```

**⚠️ Important :** 
- Utilisez le **mot de passe d'application** (16 caractères), pas votre mot de passe Gmail
- Gardez les espaces dans le mot de passe : `abcd efgh ijkl mnop`

### Étape 4 : Redémarrer le serveur

```powershell
# Arrêtez le serveur actuel (Ctrl+C)
# Puis relancez :
node server.js
```

### Étape 5 : Tester

1. Connectez-vous en tant qu'admin (`admin@hopital.com` / `Admin123!`)
2. Allez dans **"Gestion des utilisateurs"**
3. Créez un nouveau participant avec **VOTRE email Gmail**
4. Vérifiez votre boîte de réception (et spam)

---

## 📧 Exemple d'email que vous recevrez

```
De: votre.email@gmail.com
À: votre.email@gmail.com
Sujet: 🔐 Code de confirmation - Planning Médical

[Design HTML coloré avec gradient]

Bonjour Prénom Nom,

Vous avez été invité(e) à rejoindre la plateforme Planning Médical.

Voici votre code de confirmation à 6 chiffres :

┌──────────────┐
│   123456     │
└──────────────┘

Important :
• Ce code est valable pour une seule utilisation
• Communiquez ce code à l'administrateur pour activer votre compte
• Une fois votre compte activé, vous pourrez créer votre mot de passe
```

---

## 🚀 Configuration alternative : Mailtrap (pour tester sans envoyer)

Si vous voulez tester sans envoyer de vrais emails :

### 1. Créez un compte gratuit
👉 https://mailtrap.io

### 2. Copiez les informations SMTP
Dans votre inbox Mailtrap, cliquez sur "Show Credentials"

### 3. Configurez .env
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_username
SMTP_PASS=votre_password
SMTP_SECURE=false
EMAIL_FROM=no-reply@planning-medical.com
```

### 4. Consultez les emails
Tous les emails apparaîtront dans l'interface web Mailtrap (aucun email réel envoyé)

---

## ❓ Problèmes courants

### "Invalid login" avec Gmail
➡️ **Solution :** Vous devez utiliser un mot de passe d'application, pas votre mot de passe Gmail normal

### "Connection timeout"
➡️ **Solution :** Vérifiez votre connexion Internet et que le port 587 n'est pas bloqué

### L'email arrive dans les spams
➡️ **Normal** : En développement, ajoutez l'expéditeur à vos contacts

### Le code n'arrive pas
➡️ **Vérifiez :**
1. Que le serveur est bien redémarré après modification du `.env`
2. Les logs du serveur pour voir les erreurs
3. Votre dossier spam/courrier indésirable

---

## 📱 Pour les SMS (optionnel)

Si vous voulez envoyer des SMS via Twilio :

1. Créez un compte sur https://www.twilio.com
2. Obtenez un numéro de téléphone Twilio
3. Ajoutez dans `.env` :
```env
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_FROM=+15551234567
```

**Note :** Gratuit en mode test, mais limité à des numéros vérifiés

---

**Besoin d'aide ?** Consultez `CONFIGURATION_EMAIL.md` pour le guide complet !
