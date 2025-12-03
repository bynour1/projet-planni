# 🔐 Guide du Mot de Passe Provisoire

## 📋 Vue d'ensemble

Ce guide explique le nouveau système de mot de passe provisoire créé par l'administrateur lors de la création de comptes utilisateurs.

### Workflow complet

```
1. Admin invite un participant (email/téléphone)
   ↓
2. Participant reçoit un code de confirmation par email/SMS
   ↓
3. Participant communique le code à l'admin
   ↓
4. Admin confirme le code + crée un mot de passe provisoire
   ↓
5. Admin communique le mot de passe provisoire au participant (de manière sécurisée)
   ↓
6. Participant se connecte avec le mot de passe provisoire
   ↓
7. Redirection automatique vers l'écran de changement de mot de passe
   ↓
8. Participant crée son propre mot de passe
   ↓
9. Accès complet à l'application
```

---

## 🗄️ Modifications de la base de données

### 1. Migration SQL

**Fichier**: `scripts/add-must-change-password-column.sql`

Exécutez ce script dans phpMyAdmin (XAMPP) ou MySQL CLI :

```sql
USE `planning`;

ALTER TABLE `users` 
ADD COLUMN `mustChangePassword` TINYINT(1) DEFAULT 0 AFTER `isConfirmed`;

UPDATE `users` SET `mustChangePassword` = 0;
```

**Comment exécuter** :
1. Ouvrez XAMPP Control Panel
2. Cliquez sur "Admin" pour MySQL (phpMyAdmin)
3. Sélectionnez la base de données `planning`
4. Allez dans l'onglet "SQL"
5. Copiez-collez le script ci-dessus
6. Cliquez sur "Exécuter"

### 2. Structure de la table `users` mise à jour

```
users
├── id (INT, AUTO_INCREMENT, PRIMARY KEY)
├── email (VARCHAR(255), UNIQUE)
├── phone (VARCHAR(20), NULLABLE)
├── password (VARCHAR(255))
├── nom (VARCHAR(255))
├── prenom (VARCHAR(255))
├── role (VARCHAR(50)) - 'admin', 'medecin', 'technicien'
├── isConfirmed (TINYINT(1)) - 0 = en attente, 1 = confirmé
└── mustChangePassword (TINYINT(1)) - 0 = non, 1 = oui (NOUVEAU)
```

---

## 🔧 Modifications Backend (server.js)

### 1. Endpoint `/verify-code` modifié

**Avant** :
```javascript
app.post('/verify-code', async (req, res) => {
  const { contact, code } = req.body;
  // Vérifie le code
  // Marque isConfirmed = 1
});
```

**Après** :
```javascript
app.post('/verify-code', async (req, res) => {
  const { contact, code, provisionalPassword } = req.body;
  
  if (provisionalPassword) {
    // Hacher le mot de passe provisoire
    const hashedPassword = await bcrypt.hash(provisionalPassword, 10);
    // Sauvegarder avec mustChangePassword = 1
    await db.setProvisionalPassword(contact, hashedPassword);
  } else {
    // Ancienne méthode (sans mot de passe)
    await db.confirmUser(contact);
  }
});
```

### 2. Nouvel endpoint `/change-password`

```javascript
app.post('/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userEmail = req.user.email;
  
  // 1. Vérifier l'ancien mot de passe
  const user = await db.findUserByContact(userEmail);
  const validPassword = await bcrypt.compare(oldPassword, user.password);
  
  if (!validPassword) {
    return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
  }
  
  // 2. Hacher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // 3. Mettre à jour et réinitialiser mustChangePassword = 0
  await db.updateUserPassword(userEmail, hashedPassword);
  
  return res.json({ success: true });
});
```

### 3. Endpoint `/login` modifié

Le champ `mustChangePassword` est maintenant inclus dans la réponse :

```javascript
return res.json({
  success: true,
  token,
  user: {
    id: user.id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    mustChangePassword: user.mustChangePassword || false  // NOUVEAU
  }
});
```

---

## 💾 Modifications Database (db/database.js)

### Nouvelles fonctions ajoutées

```javascript
// 1. Définir un mot de passe provisoire (admin)
async setProvisionalPassword(contact, hashedPassword) {
  await query(
    'UPDATE users SET password = ?, mustChangePassword = 1, isConfirmed = 1 WHERE email = ? OR phone = ?',
    [hashedPassword, contact, contact]
  );
}

// 2. Mettre à jour le mot de passe (participant)
async updateUserPassword(contact, hashedPassword) {
  await query(
    'UPDATE users SET password = ?, mustChangePassword = 0 WHERE email = ? OR phone = ?',
    [hashedPassword, contact, contact]
  );
}
```

### Fonctions modifiées

Toutes les fonctions retournent maintenant `mustChangePassword` :
- `getUsers()`
- `findUserByContact(contact)`
- `findUserByEmail(email)`

---

## 📱 Modifications Frontend

### 1. UserManagementScreen.js

**Nouveau state** :
```javascript
const [provisionalPassword, setProvisionalPassword] = useState("");
```

**Formulaire de confirmation mis à jour** :
```jsx
{showAdminConfirm && (
  <View style={styles.confirmSection}>
    <Text style={styles.confirmTitle}>🔐 Confirmer le participant</Text>
    
    {/* Code de confirmation */}
    <TextInput 
      placeholder="Entrez le code de confirmation" 
      value={adminConfirmCode} 
      onChangeText={setAdminConfirmCode} 
      keyboardType="number-pad" 
    />
    
    {/* NOUVEAU : Mot de passe provisoire */}
    <Text style={styles.infoText}>Créer un mot de passe provisoire</Text>
    <TextInput 
      placeholder="Mot de passe provisoire (min. 6 caractères)" 
      value={provisionalPassword} 
      onChangeText={setProvisionalPassword} 
      autoCapitalize="none"
    />
    
    <TouchableOpacity 
      onPress={handleAdminConfirmCode} 
      disabled={!adminConfirmCode || !provisionalPassword}
    >
      <Text>✅ Confirmer</Text>
    </TouchableOpacity>
  </View>
)}
```

**Fonction de confirmation mise à jour** :
```javascript
const handleAdminConfirmCode = async () => {
  if (!provisionalPassword || provisionalPassword.length < 6) {
    return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
  }
  
  const response = await fetch("http://localhost:5000/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contact: adminConfirmContact, 
      code: adminConfirmCode,
      provisionalPassword: provisionalPassword  // NOUVEAU
    }),
  });
  
  if (data.success) {
    Alert.alert(
      "Succès", 
      `Mot de passe provisoire : ${provisionalPassword}\n\n` +
      `Communiquez ce mot de passe au participant de manière sécurisée.`
    );
  }
};
```

### 2. LoginScreen.js

**Détection du mot de passe provisoire** :
```javascript
if (j && j.success && j.token) {
  const userObj = j.user;
  
  // Sauvegarder token et utilisateur
  await AsyncStorage.setItem('userToken', j.token);
  await AsyncStorage.setItem('userInfo', JSON.stringify(userObj));
  setUser(userObj, j.token);
  
  // NOUVEAU : Vérifier mustChangePassword
  if (userObj.mustChangePassword) {
    Alert.alert(
      'Changement de mot de passe requis',
      'Vous devez changer votre mot de passe provisoire avant de continuer.',
      [{ 
        text: 'OK', 
        onPress: () => router.replace({
          pathname: '/change-password',
          params: { user: JSON.stringify(userObj) }
        })
      }]
    );
    return;
  }
  
  // Redirection normale selon le rôle
  switch (userObj.role) {
    case 'admin': router.replace('/admin'); break;
    case 'medecin': router.replace('/medecin'); break;
    case 'technicien': router.replace('/technicien'); break;
  }
}
```

### 3. ChangePasswordScreen.js (NOUVEAU)

**Fichier** : `screens/ChangePasswordScreen.js`

Écran dédié au changement de mot de passe avec :
- ✅ Champ pour ancien mot de passe (provisoire)
- ✅ Champ pour nouveau mot de passe
- ✅ Champ de confirmation
- ✅ Validation (min 6 caractères)
- ✅ Boutons show/hide pour les mots de passe
- ✅ Redirection automatique après succès

**Fonctionnalités clés** :
```javascript
const handleChangePassword = async () => {
  // Validations
  if (newPassword.length < 6) {
    return Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
  }
  
  if (newPassword !== confirmPassword) {
    return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
  }
  
  // Appel API
  const response = await fetch('http://localhost:5000/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  
  // Redirection selon le rôle
  if (data.success) {
    switch (user.role) {
      case 'admin': navigation.replace('Admin'); break;
      case 'medecin': navigation.replace('Medecin'); break;
      case 'technicien': navigation.replace('Technicien'); break;
    }
  }
};
```

### 4. AppNavigator.js

```javascript
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

<Stack.Navigator>
  {/* ... autres écrans ... */}
  <Stack.Screen 
    name="ChangePassword" 
    component={ChangePasswordScreen} 
    options={{ title: 'Changer le mot de passe' }} 
  />
</Stack.Navigator>
```

---

## 🧪 Tests complets

### Scénario 1 : Création d'un nouveau participant

1. **Admin invite le participant**
   ```
   Écran : UserManagementScreen
   - Entrer nom : "Dupont"
   - Entrer prénom : "Jean"
   - Entrer email : "jean.dupont@test.com"
   - Entrer téléphone : "0612345678"
   - Sélectionner rôle : "medecin"
   - Cliquer sur "Créer et envoyer le code"
   ```
   
   **Résultat attendu** :
   - Message : "✅ Code envoyé avec succès à jean.dupont@test.com"
   - Email reçu avec code à 6 chiffres (ex: 123456)

2. **Participant communique le code**
   ```
   Le participant reçoit le code et le communique à l'admin
   par téléphone, SMS ou autre moyen sécurisé
   ```

3. **Admin confirme le code et crée le mot de passe**
   ```
   Écran : UserManagementScreen > Section "Confirmer le participant"
   - Entrer code : "123456"
   - Entrer mot de passe provisoire : "Temp123!"
   - Cliquer sur "✅ Confirmer"
   ```
   
   **Résultat attendu** :
   - Alert : "Participant confirmé avec succès ! Mot de passe provisoire : Temp123!"
   - L'utilisateur apparaît maintenant dans "Utilisateurs actifs"

4. **Admin communique le mot de passe**
   ```
   Admin informe le participant par un moyen sécurisé :
   - Téléphone
   - SMS chiffré
   - Rencontre en personne
   
   ⚠️ NE PAS envoyer par email non sécurisé
   ```

5. **Participant se connecte**
   ```
   Écran : LoginScreen
   - Email : "jean.dupont@test.com"
   - Mot de passe : "Temp123!" (provisoire)
   - Cliquer sur "Se connecter"
   ```
   
   **Résultat attendu** :
   - Alert : "Changement de mot de passe requis"
   - Redirection automatique vers ChangePasswordScreen

6. **Participant change son mot de passe**
   ```
   Écran : ChangePasswordScreen
   - Ancien mot de passe : "Temp123!"
   - Nouveau mot de passe : "MonNouveauMdp123!"
   - Confirmer mot de passe : "MonNouveauMdp123!"
   - Cliquer sur "✅ Changer le mot de passe"
   ```
   
   **Résultat attendu** :
   - Alert : "Mot de passe changé avec succès !"
   - Redirection vers l'écran correspondant au rôle (MedecinScreen)
   - mustChangePassword = 0 en base de données

7. **Vérification base de données**
   ```sql
   SELECT email, isConfirmed, mustChangePassword 
   FROM users 
   WHERE email = 'jean.dupont@test.com';
   
   -- Résultat attendu :
   -- email: jean.dupont@test.com
   -- isConfirmed: 1
   -- mustChangePassword: 0
   ```

### Scénario 2 : Tentative de connexion sans changer le mot de passe

1. Créer un utilisateur avec mot de passe provisoire (étapes 1-4 ci-dessus)
2. Participant se connecte avec le mot de passe provisoire
3. **Résultat** : Redirection forcée vers ChangePasswordScreen
4. Participant essaie de revenir en arrière → Bloqué, doit changer le mot de passe

### Scénario 3 : Vérifications de sécurité

**Test 1 : Mot de passe trop court**
```
Nouveau mot de passe : "123"
→ Erreur : "Le mot de passe doit contenir au moins 6 caractères"
```

**Test 2 : Mots de passe ne correspondent pas**
```
Nouveau mot de passe : "MonMdp123!"
Confirmer : "MonMdp456!"
→ Erreur : "Les mots de passe ne correspondent pas"
```

**Test 3 : Même mot de passe qu'avant**
```
Ancien mot de passe : "Temp123!"
Nouveau mot de passe : "Temp123!"
→ Erreur : "Le nouveau mot de passe doit être différent de l'ancien"
```

**Test 4 : Ancien mot de passe incorrect**
```
Ancien mot de passe : "MauvaisMdp"
→ Erreur : "Ancien mot de passe incorrect"
```

---

## 🔒 Sécurité

### ⚠️ Bonnes pratiques

1. **Transmission du mot de passe provisoire**
   - ✅ Téléphone (appel vocal)
   - ✅ SMS sécurisé/chiffré
   - ✅ En personne
   - ❌ Email non chiffré
   - ❌ Chat non sécurisé

2. **Création du mot de passe provisoire**
   - Minimum 6 caractères (mais recommandé 8+)
   - Mélange de lettres majuscules/minuscules
   - Inclure des chiffres
   - Inclure des caractères spéciaux
   - Exemple : `Temp#2024!`

3. **Mot de passe final du participant**
   - Minimum 6 caractères (recommandé 12+)
   - Unique, pas réutilisé
   - Facile à retenir mais difficile à deviner

### 🛡️ Sécurité backend

- ✅ Mots de passe hachés avec bcrypt (10 rounds de salt)
- ✅ Token JWT avec expiration 24h
- ✅ Endpoint `/change-password` protégé par `authenticateToken`
- ✅ Flag `mustChangePassword` en base de données
- ✅ Validation côté serveur ET côté client

---

## 🐛 Dépannage

### Problème 1 : "Code invalide"
**Cause** : Le code saisi ne correspond pas au code envoyé
**Solution** :
1. Vérifier que le participant a bien communiqué le bon code
2. Vérifier dans la base de données :
   ```sql
   SELECT contact, code FROM codes WHERE contact = 'jean.dupont@test.com';
   ```
3. Renvoyer le code si nécessaire

### Problème 2 : "Ancien mot de passe incorrect"
**Cause** : Le participant a saisi un mauvais mot de passe provisoire
**Solution** :
1. Vérifier que l'admin a bien communiqué le bon mot de passe
2. Recréer un nouveau mot de passe provisoire si nécessaire

### Problème 3 : Écran de changement de mot de passe ne s'affiche pas
**Cause** : `mustChangePassword` n'est pas à 1 en base
**Solution** :
```sql
UPDATE users 
SET mustChangePassword = 1 
WHERE email = 'jean.dupont@test.com';
```

### Problème 4 : Boucle infinie après changement de mot de passe
**Cause** : `mustChangePassword` n'a pas été réinitialisé à 0
**Solution** :
```sql
UPDATE users 
SET mustChangePassword = 0 
WHERE email = 'jean.dupont@test.com';
```

### Problème 5 : Token expiré
**Cause** : Le token JWT a expiré (>24h)
**Solution** : Reconnecter le participant

---

## 📊 Requêtes SQL utiles

### Voir tous les utilisateurs avec leur statut
```sql
SELECT 
  id, 
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
FROM users
ORDER BY id DESC;
```

### Utilisateurs qui doivent changer leur mot de passe
```sql
SELECT email, nom, prenom, role 
FROM users 
WHERE mustChangePassword = 1;
```

### Utilisateurs actifs (confirmés et mdp changé)
```sql
SELECT email, nom, prenom, role 
FROM users 
WHERE isConfirmed = 1 AND mustChangePassword = 0;
```

### Réinitialiser le flag mustChangePassword pour un utilisateur
```sql
UPDATE users 
SET mustChangePassword = 0 
WHERE email = 'jean.dupont@test.com';
```

### Forcer un utilisateur à changer son mot de passe
```sql
UPDATE users 
SET mustChangePassword = 1 
WHERE email = 'jean.dupont@test.com';
```

---

## 📝 Checklist de déploiement

Avant de mettre en production :

- [ ] Script SQL `add-must-change-password-column.sql` exécuté
- [ ] Colonne `mustChangePassword` ajoutée à la table `users`
- [ ] Backend déployé avec les nouveaux endpoints
- [ ] Frontend déployé avec ChangePasswordScreen
- [ ] Navigation mise à jour avec la route `/change-password`
- [ ] Tests effectués sur tous les scénarios
- [ ] Documentation partagée avec les administrateurs
- [ ] Politique de sécurité pour la transmission des mots de passe définie
- [ ] Formation des administrateurs sur le nouveau workflow

---

## 🚀 Avantages de ce système

✅ **Contrôle total** : L'admin contrôle la création des comptes
✅ **Sécurité** : Les participants doivent changer le mot de passe provisoire
✅ **Traçabilité** : Flag `mustChangePassword` en base de données
✅ **Flexibilité** : Compatible avec l'ancien système (si provisionalPassword non fourni)
✅ **UX** : Redirection automatique, pas de confusion possible

---

## 📞 Support

En cas de problème, vérifier :
1. Base de données : Colonne `mustChangePassword` existe
2. Backend : Endpoint `/change-password` répond
3. Frontend : ChangePasswordScreen accessible
4. Logs serveur : `console.log` dans `/verify-code` et `/change-password`

---

**Dernière mise à jour** : Janvier 2025
**Version** : 1.0.0
