# 🤖 Configuration Telegram Bot - 100% GRATUIT

## ✨ Pourquoi Telegram Bot ?

- ✅ **100% GRATUIT** - Aucun frais, illimité
- ✅ **Rapide** - Configuration en 2 minutes
- ✅ **Fiable** - Messages instantanés garantis
- ✅ **Pas de vérification** - Fonctionne immédiatement
- ✅ **Multi-utilisateurs** - Envoyez à plusieurs personnes

## 📱 Configuration en 3 étapes (2 minutes)

### Étape 1 : Créer votre Bot Telegram

1. **Ouvrez Telegram** sur votre téléphone ou PC
2. **Cherchez** : `@BotFather`
3. **Démarrez une conversation** avec BotFather
4. **Envoyez** : `/newbot`
5. **Donnez un nom** : `Planning Medical Bot`
6. **Donnez un username** : `planning_medical_bot` (doit finir par `_bot`)
7. **Copiez le TOKEN** que BotFather vous donne (exemple : `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Étape 2 : Obtenir votre Chat ID

**Méthode Facile :**

1. Cherchez `@userinfobot` sur Telegram
2. Démarrez une conversation
3. Il vous donnera votre **Chat ID** (exemple : `123456789`)

**Ou méthode alternative :**

1. Cherchez votre nouveau bot (par son username)
2. Cliquez sur **Start** ou envoyez `/start`
3. Allez sur : `https://api.telegram.org/bot<VOTRE_TOKEN>/getUpdates`
4. Cherchez `"chat":{"id":123456789` dans la réponse
5. Notez ce numéro

### Étape 3 : Configurer le fichier .env

Ouvrez `.env` et ajoutez :

```env
# Telegram Bot (GRATUIT)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

**Remplacez** :
- `123456789:ABCdefGHIjklMNOpqrsTUVwxyz` par votre token BotFather
- `123456789` par votre Chat ID

## 🚀 Redémarrer et Tester

### 1. Redémarrer le serveur

Fermez le terminal du serveur (Ctrl+C) et relancez :
```bash
node server.js
```

### 2. Tester l'envoi

1. Ouvrez l'application : http://localhost:8081
2. Connectez-vous comme admin
3. Créez un nouveau participant :
   - Nom : Test
   - Prénom : Telegram
   - **Téléphone** : `50513138` (n'importe quel numéro)
   - **NE PAS** entrer de mot de passe provisoire
   - Choisir : **📱 SMS / Téléphone**
4. Cliquez sur "Créer et envoyer le code"

**Vous recevrez le code sur Telegram ! 🎉**

## 📋 Exemple de message Telegram

```
🏥 Planning Médical

👤 Sarra Chakroun
📱 50513138

🔐 Code de confirmation :
123456

Communiquez ce code à l'administrateur pour activer votre compte.
```

## 🎯 Avantages de Telegram

| Caractéristique | Telegram Bot | SMS Twilio |
|----------------|--------------|------------|
| **Prix** | ✅ Gratuit | ❌ Payant (~0.04$/SMS) |
| **Limite** | ✅ Illimité | ❌ Crédit limité |
| **Vérification** | ✅ Aucune | ❌ Numéros à vérifier |
| **Rapidité** | ✅ Instantané | ✅ Instantané |
| **Fiabilité** | ✅ 99.9% | ✅ 99% |
| **Multimédia** | ✅ Oui | ❌ Non |

## 👥 Envoyer à plusieurs personnes

Pour envoyer les codes à plusieurs admins, créez un **groupe Telegram** :

1. Créez un groupe Telegram
2. Ajoutez votre bot au groupe
3. Donnez-lui les droits d'admin
4. Obtenez le **Group Chat ID** :
   - Envoyez un message dans le groupe
   - Allez sur : `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Cherchez le `"chat":{"id":-123456789` (négatif pour les groupes)
5. Utilisez ce Chat ID négatif dans `.env`

## 🔧 Dépannage

### "Bot was blocked by the user"
→ Assurez-vous d'avoir démarré une conversation avec le bot (/start)

### "Chat not found"
→ Vérifiez que le Chat ID est correct (avec @userinfobot)

### "Unauthorized"
→ Vérifiez que le BOT_TOKEN est correct

### Le message n'arrive pas
→ Vérifiez le terminal du serveur, le code y est toujours affiché

## 🎨 Personnalisation

Vous pouvez modifier le message dans `server.js` :

```javascript
const message = `🏥 *Planning Médical*\n\n` +
               `👤 ${userInfo.prenom} ${userInfo.nom}\n` +
               `📱 ${to}\n\n` +
               `🔐 *Code :* \`${code}\`\n\n` +
               `Votre message personnalisé ici.`;
```

## 📱 Application Telegram

Téléchargez Telegram :
- **Android** : Google Play Store
- **iOS** : App Store
- **Desktop** : https://desktop.telegram.org/
- **Web** : https://web.telegram.org/

---

## ✨ Résumé Ultra-Rapide

1. Telegram → Cherchez `@BotFather` → `/newbot`
2. Copiez le TOKEN
3. Telegram → Cherchez `@userinfobot` → Copiez votre ID
4. Fichier `.env` :
   ```
   TELEGRAM_BOT_TOKEN=votre_token
   TELEGRAM_CHAT_ID=votre_id
   ```
5. Redémarrez le serveur
6. Testez ! 🎉

**Temps total : 2 minutes | Coût : 0€ | Messages : Illimités**
