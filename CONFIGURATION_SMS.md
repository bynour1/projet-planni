# Configuration SMS avec Twilio

## 🚀 Guide de configuration rapide

### Option 1 : Mode TEST (Affiche le code dans la console)

**Par défaut, le système affiche le code SMS dans la console du serveur.**

Aucune configuration nécessaire ! Quand vous demandez un code par SMS :
- Le code apparaît dans le terminal du serveur
- Format : `📱 SMS à +21650513138: Votre code est 123456`

### Option 2 : Envoi RÉEL de SMS (Twilio)

#### Étape 1 : Créer un compte Twilio

1. Allez sur https://www.twilio.com/try-twilio
2. Créez un compte gratuit (crédit de $15 offert)
3. Vérifiez votre email et votre numéro de téléphone

#### Étape 2 : Obtenir les identifiants

1. Sur le dashboard Twilio : https://console.twilio.com/
2. Notez :
   - **Account SID** (commence par AC...)
   - **Auth Token** (cliquez sur "Show" pour le voir)
3. Obtenez un numéro Twilio :
   - Allez dans "Phone Numbers" → "Manage" → "Buy a number"
   - Ou utilisez votre numéro d'essai gratuit

#### Étape 3 : Configurer le fichier .env

Modifiez le fichier `.env` :

```env
# SMS CONFIGURATION (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre_auth_token_ici
TWILIO_PHONE_NUMBER=+1234567890
```

**Important** :
- Le numéro Twilio doit être au format international : `+1234567890`
- Avec un compte gratuit, vous ne pouvez envoyer des SMS qu'aux numéros vérifiés

#### Étape 4 : Installer le package Twilio

Dans le terminal :
```bash
npm install twilio
```

#### Étape 5 : Redémarrer le serveur

```bash
node server.js
```

### 📱 Numéros vérifiés (Compte gratuit)

Avec un compte Twilio gratuit, vous devez vérifier les numéros avant d'envoyer des SMS :

1. Allez dans "Phone Numbers" → "Manage" → "Verified Caller IDs"
2. Cliquez "Add a new Caller ID"
3. Entrez le numéro au format international (ex: +216XXXXXXXX pour la Tunisie)
4. Vous recevrez un code de vérification par SMS
5. Entrez le code pour vérifier le numéro

## 🧪 Test de l'envoi SMS

Une fois configuré, testez l'envoi :

1. Ouvrez l'application
2. Connectez-vous comme admin
3. Créez un nouveau participant
4. **NE PAS** entrer de mot de passe provisoire
5. Sélectionnez "📱 SMS / Téléphone"
6. Entrez un numéro vérifié
7. Cliquez sur "Créer et envoyer le code"

Si tout est configuré :
- ✅ Le SMS sera envoyé au numéro
- ✅ Le participant recevra le code par SMS
- ❌ Si erreur : le code sera affiché dans la console du serveur

## 💰 Tarifs Twilio

- **Compte gratuit** : 15$ de crédit offert
- **SMS sortant** : environ 0.0075$ par SMS
- **Crédit gratuit** : ~2000 SMS
- **Numéro Twilio** : 1$ par mois

## 🌍 Numéros internationaux

Format des numéros selon le pays :
- 🇹🇳 Tunisie : `+21650123456`
- 🇫🇷 France : `+33612345678`
- 🇩🇿 Algérie : `+213550123456`
- 🇲🇦 Maroc : `+212612345678`

## 🔧 Dépannage

### Le SMS n'arrive pas

1. **Vérifiez la console du serveur** - le code y est affiché en mode développement
2. **Vérifiez le numéro** - doit être au format international avec +
3. **Compte gratuit** - vérifiez que le numéro est dans les "Verified Caller IDs"
4. **Crédit épuisé** - vérifiez votre solde Twilio

### Code d'erreur Twilio

- **21211** : Numéro invalide
- **21608** : Numéro non vérifié (compte gratuit)
- **21610** : Message bloqué (blacklist)

## 📝 Alternative : Affichage console

Si vous ne voulez pas configurer Twilio, le système affichera toujours le code dans la console du serveur. L'admin peut :

1. Regarder le terminal du serveur
2. Noter le code affiché
3. Le communiquer au participant manuellement

**Ou utilisez la création directe avec mot de passe provisoire (pas besoin de SMS) !**
