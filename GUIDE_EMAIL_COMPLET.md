# 📧 Guide Complet - Configuration Email

## 🎯 Vue d'ensemble

Ce guide vous explique comment configurer l'envoi d'emails pour votre application Planning Médical. **3 options GRATUITES** sont disponibles.

---

## ✅ OPTION 1: Gmail (Recommandé - Simple et Gratuit)

### Pourquoi Gmail ?
- ✅ **100% Gratuit**
- ✅ Fiable et rapide
- ✅ Vous avez déjà un compte
- ✅ Configuration en 5 minutes

### 📝 Étapes détaillées

#### 1. Activer la validation en 2 étapes

1. Allez sur https://myaccount.google.com/security
2. Cherchez **"Validation en 2 étapes"**
3. Cliquez sur **"Activer"**
4. Suivez les instructions (SMS ou application)

#### 2. Créer un mot de passe d'application

1. Retournez sur https://myaccount.google.com/security
2. Cherchez **"Mots de passe des applications"**
   - Ou allez directement sur https://myaccount.google.com/apppasswords
3. Sélectionnez **"Autre (nom personnalisé)"**
4. Entrez **"Planning Medical"**
5. Cliquez sur **"Générer"**
6. **IMPORTANT:** Copiez le mot de passe à 16 caractères
   - Format: `xxxx xxxx xxxx xxxx`
   - **Gardez-le précieusement !**

#### 3. Configuration dans .env

Ouvrez le fichier `.env` et modifiez:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=Planning Medical <votre.email@gmail.com>
```

**Remplacez:**
- `votre.email@gmail.com` par votre vrai email Gmail
- `xxxx xxxx xxxx xxxx` par le mot de passe d'application copié

#### 4. Redémarrer le serveur

```powershell
# Arrêter
Get-Process node | Stop-Process -Force

# Démarrer
cd 'c:\Users\MSI\Desktop\STAGE\projet-planning'
node server.js
```

#### 5. Vérifier

Au démarrage, vous devriez voir:
```
✅ Configuration email OK - Prêt à envoyer des messages
```

---

## ✅ OPTION 2: Mailtrap (Pour Tests - Gratuit)

### Pourquoi Mailtrap ?
- ✅ **100% Gratuit** (500 emails/mois)
- ✅ **Aucun vrai email envoyé** (parfait pour tests)
- ✅ Interface web pour voir les emails
- ✅ Aucun risque de spam

### 📝 Étapes

#### 1. Créer un compte

1. Allez sur https://mailtrap.io
2. Cliquez sur **"Sign Up"**
3. Utilisez votre email Gmail ou GitHub
4. Confirmez votre email

#### 2. Obtenir les identifiants SMTP

1. Une fois connecté, cliquez sur **"My Inbox"**
2. Cliquez sur **"SMTP Settings"**
3. Sélectionnez **"Nodemailer"** dans le menu déroulant
4. Copiez les informations affichées

#### 3. Configuration dans .env

Commentez la configuration Gmail et ajoutez:

```env
# Commentez Gmail
# EMAIL_SERVICE=gmail
# EMAIL_USER=...
# EMAIL_PASS=...

# Ajoutez Mailtrap
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_username_mailtrap
SMTP_PASS=votre_password_mailtrap
EMAIL_FROM=noreply@planning.com
```

#### 4. Tester

Les emails apparaîtront dans votre inbox Mailtrap, pas dans une vraie boîte mail.

---

## ✅ OPTION 3: Outlook/Hotmail (Gratuit)

### 📝 Configuration

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@outlook.com
SMTP_PASS=votre_mot_de_passe_outlook
EMAIL_FROM=Planning Medical <votre_email@outlook.com>
```

⚠️ **Note:** Outlook peut bloquer l'accès SMTP par défaut. Si ça ne marche pas, utilisez Gmail.

---

## 🔧 Dépannage

### Erreur: "Invalid login"

**Gmail:**
1. Vérifiez que vous utilisez un **mot de passe d'application**, pas votre mot de passe normal
2. Vérifiez que la validation en 2 étapes est activée
3. Essayez de régénérer un nouveau mot de passe d'application

**Outlook:**
1. Vérifiez que l'accès SMTP est autorisé dans vos paramètres
2. Désactivez temporairement l'antivirus

### Erreur: "Connection timeout"

1. Vérifiez votre connexion Internet
2. Vérifiez que le port n'est pas bloqué par votre pare-feu
3. Pour Gmail: essayez port 465 avec `SMTP_SECURE=true`

### Les emails ne sont pas reçus

1. **Vérifiez les SPAMS** de votre boîte mail
2. Attendez 1-2 minutes (délai normal)
3. Regardez les logs du serveur pour les erreurs
4. Utilisez Mailtrap pour tester (aucun délai)

### Message: "Aucune configuration email détectée"

1. Vérifiez que le fichier `.env` est bien dans le dossier racine
2. Vérifiez qu'il n'y a pas d'espaces dans les noms de variables
3. Redémarrez le serveur après modification

---

## 📊 Comparaison des options

| Critère | Gmail | Mailtrap | Outlook |
|---------|-------|----------|---------|
| **Prix** | Gratuit | Gratuit | Gratuit |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Fiabilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Vrais emails** | ✅ Oui | ❌ Non (test) | ✅ Oui |
| **Limite/jour** | 500 | Illimité | 300 |
| **Recommandé pour** | Production | Tests | Alternative |

---

## 🎯 Configuration recommandée

### Pour le développement:
**Utilisez Mailtrap** - Tous les emails sont capturés, aucun risque d'envoyer des emails de test à de vrais utilisateurs.

### Pour la production:
**Utilisez Gmail** - Simple, gratuit, fiable. Limite de 500 emails/jour largement suffisante pour un planning médical.

---

## 💡 Conseil de sécurité

**Ne partagez JAMAIS votre mot de passe d'application !**

Le fichier `.env` contient des informations sensibles:
- Ajoutez `.env` dans `.gitignore`
- Ne le commitez JAMAIS sur GitHub
- Créez un `.env.example` sans les vrais mots de passe

---

## 📞 Support

En cas de problème:

1. **Vérifiez les logs du serveur** - Les erreurs y sont affichées
2. **Testez avec Mailtrap** - Élimine les problèmes de configuration email
3. **Consultez ce guide** - La solution est probablement dans la section dépannage

---

## ✅ Checklist finale

Avant de dire "ça ne marche pas":

- [ ] J'ai bien créé un mot de passe d'application (pas mon mot de passe Gmail)
- [ ] J'ai activé la validation en 2 étapes sur Google
- [ ] J'ai bien modifié le fichier `.env` avec mes vrais identifiants
- [ ] J'ai redémarré le serveur après modification
- [ ] J'ai vérifié les spams de ma boîte mail
- [ ] J'ai attendu au moins 1-2 minutes
- [ ] Le serveur affiche "✅ Configuration email OK"

Si toutes les cases sont cochées et ça ne marche toujours pas, utilisez **Mailtrap** pour isoler le problème.
