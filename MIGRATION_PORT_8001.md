# ✅ Migration vers le port 8001

## 🔄 Modifications effectuées

Votre projet fonctionne maintenant sur **http://localhost:8082** au lieu de http://localhost:5000

### Fichiers modifiés

1. **`.env`** - Ajout de `PORT=8082`
2. **`server.js`** - Port par défaut changé de 5000 à 8082
3. **`screens/LoginScreen.js`** - URL mise à jour
4. **`screens/ChangePasswordScreen.js`** - URL mise à jour
5. **`screens/UserManagementScreen.js`** - Toutes les URLs mises à jour

---

## 🚀 Serveur démarré

✅ Le serveur backend est en cours d'exécution sur **http://localhost:8082**
✅ MySQL connecté à la base de données `planning`
✅ Socket.io actif pour les mises à jour en temps réel

---

## 🧪 Test rapide

Vous pouvez tester le serveur avec :

```powershell
# Tester l'endpoint users
Invoke-RestMethod -Uri "http://localhost:8082/users" -Method GET
```

---

## 📱 Utilisation de l'application

Lors du démarrage de votre application React Native :

```powershell
npm start
# ou
npx expo start
```

Toutes les requêtes API seront automatiquement dirigées vers **http://localhost:8082**

---

## 🔍 Vérification

Pour vérifier que le serveur fonctionne :
- Ouvrez votre navigateur : http://localhost:8082
- Le serveur devrait répondre (ou retourner une erreur 404 si aucune route / n'est définie)

Pour voir les processus Node.js en cours :
```powershell
Get-Process -Name node | Format-Table Id, ProcessName, StartTime
```

---

**Date de migration** : 3 décembre 2025  
**Nouveau port** : 8082  
**Statut** : ✅ Opérationnel
