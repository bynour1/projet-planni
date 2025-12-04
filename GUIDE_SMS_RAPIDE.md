# 📱 Configuration SMS - Guide Rapide

## Étape 1 : Créer un compte Twilio (GRATUIT)

1. **Allez sur** : https://www.twilio.com/try-twilio
2. **Inscrivez-vous** avec votre email
3. **Vérifiez votre email** et **votre numéro de téléphone tunisien** (+216...)

## Étape 2 : Obtenir vos identifiants

Une fois connecté au dashboard Twilio :

1. **Account SID** : Visible sur le dashboard (commence par `AC...`)
2. **Auth Token** : Cliquez sur "Show" pour le voir
3. **Numéro Twilio** : 
   - Si gratuit : utilisez le numéro d'essai qui apparaît
   - Ou achetez un numéro : Phone Numbers → Buy a number

## Étape 3 : Vérifier votre numéro tunisien (Compte gratuit)

⚠️ **IMPORTANT** : Avec un compte gratuit Twilio, vous devez vérifier votre numéro avant de recevoir des SMS.

1. Dans le dashboard Twilio, allez dans **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Cliquez sur **"Add a new Caller ID"**
3. Entrez votre numéro tunisien au format : `+21650513138`
4. Twilio vous envoie un code de vérification par SMS
5. Entrez le code reçu pour vérifier votre numéro

## Étape 4 : Configurer le fichier .env

Ouvrez le fichier `.env` et modifiez ces lignes :

```env
# SMS CONFIGURATION (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre_auth_token_ici
TWILIO_PHONE_NUMBER=+15017122661
```

**Exemple avec de vraies valeurs** :
```env
TWILIO_ACCOUNT_SID=ACa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
TWILIO_PHONE_NUMBER=+15017122661
```

## Étape 5 : Redémarrer le serveur

Le serveur doit être redémarré pour charger les nouvelles variables :

1. Fermez le terminal PowerShell du serveur (Ctrl+C)
2. Relancez : `node server.js`

## ✅ Test d'envoi SMS

1. Ouvrez l'application : http://localhost:8081
2. Connectez-vous comme admin
3. Créez un nouveau participant :
   - Nom : Test
   - Prénom : SMS
   - Email : test@exemple.com
   - **Téléphone : +21650513138** (votre numéro vérifié)
   - **NE PAS entrer de mot de passe provisoire**
   - Choisir : **📱 SMS / Téléphone**
4. Cliquez sur "Créer et envoyer le code"

Vous devriez recevoir le SMS sur votre téléphone ! 📱

## 💰 Coût Twilio

- **Compte gratuit** : 15$ de crédit offert
- **SMS vers Tunisie** : ~0.04$ par SMS
- **Crédit gratuit = ~375 SMS**

## 🔧 Problèmes courants

### "Numéro non vérifié"
→ Vérifiez votre numéro dans "Verified Caller IDs"

### "Invalid phone number"
→ Utilisez le format international : `+216XXXXXXXX`

### Le SMS n'arrive pas
→ Vérifiez le terminal du serveur, le code y est toujours affiché en backup

## 📞 Formats de numéros

- Tunisie : `+21650513138`
- France : `+33612345678`
- Algérie : `+213550123456`

---

**Besoin d'aide ?** Consultez : https://www.twilio.com/docs/sms/quickstart
