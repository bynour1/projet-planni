# 📖 Guide d'Utilisation - Gestion des Utilisateurs

## ✅ Problèmes Résolus

### 1. Bouton Déconnexion 🚪
- **Problème** : Le bouton de déconnexion ne fonctionnait pas
- **Solution** : Corrigé dans Header.js et DashboardScreen.js
- **Localisation** : En haut à droite de toutes les pages

### 2. Connexion des Utilisateurs Créés par l'Admin
- **Problème** : Les utilisateurs invités ne pouvaient pas se connecter
- **Solution** : Deux modes de création disponibles

---

## 🔐 Modes de Création d'Utilisateurs

### MODE 1: Création Directe (Recommandé) ⭐

**Avantages :**
- ✅ L'utilisateur peut se connecter immédiatement
- ✅ Pas besoin d'email
- ✅ Plus simple et rapide

**Étapes :**

1. **L'admin crée le compte :**
   - Aller dans "User Management"
   - Section "🔐 Création directe avec mot de passe provisoire"
   - Remplir : Email, Téléphone (optionnel), Mot de passe provisoire, Nom, Prénom, Rôle
   - Cliquer sur "Créer l'utilisateur"

2. **L'utilisateur se connecte :**
   - Utiliser l'email et le mot de passe provisoire
   - À la première connexion, il sera redirigé pour changer son mot de passe
   - Créer un nouveau mot de passe (min 6 caractères)
   - Connexion réussie !

**Exemple :**
```
Email: medecin2@hopital.com
Mot de passe provisoire: Temp123!
Nom: Dupont
Prénom: Marie
Rôle: Médecin
```

---

### MODE 2: Invitation par Email/SMS

**Avantages :**
- ✅ Plus sécurisé (code de vérification)
- ✅ L'utilisateur choisit son propre mot de passe

**Inconvénients :**
- ❌ Nécessite un service email configuré
- ❌ Plus complexe (plusieurs étapes)

**Étapes :**

1. **L'admin invite l'utilisateur :**
   - Aller dans "User Management"
   - Section "📧 Invitation participant"
   - Remplir : Email, Téléphone (optionnel), Nom, Prénom, Rôle
   - Choisir : Envoyer le code par Email ou SMS
   - Cliquer sur "Inviter"
   - Un code à 6 chiffres est envoyé à l'utilisateur

2. **L'utilisateur crée son mot de passe :**
   - Aller dans "User Management"
   - Section "🔐 Créer votre mot de passe"
   - Entrer : Email ou téléphone
   - Entrer : Le code à 6 chiffres reçu
   - Entrer : Nouveau mot de passe (min 6 caractères)
   - Confirmer : Le même mot de passe
   - Cliquer sur "Créer mon mot de passe"
   - Le compte est confirmé automatiquement

3. **L'utilisateur se connecte :**
   - Utiliser l'email et le nouveau mot de passe
   - Connexion réussie !

**Exemple :**
```
Admin invite:
  Email: technicien2@hopital.com
  Code envoyé: 123456

Utilisateur confirme:
  Email: technicien2@hopital.com
  Code: 123456
  Nouveau mot de passe: MonMotDePasse123!
```

---

## 🔧 Résolution des Problèmes

### Utilisateurs existants ne peuvent pas se connecter

**Pour medecin1@hopital.com et technicien1@hopital.com :**

Ces comptes ont été créés en MODE 2 mais n'ont pas encore de mot de passe.

**Solutions :**

**Option A (Rapide) :** Supprimer et recréer en MODE 1
1. Supprimer les comptes existants dans la base de données
2. Recréer en MODE 1 avec un mot de passe provisoire

**Option B :** Compléter le processus MODE 2
1. L'admin renvoie le code (section "Renvoyer le code")
2. L'utilisateur utilise la section "Créer votre mot de passe"
3. Entre son email et le code reçu
4. Crée son mot de passe

**Option C (Base de données) :** 
```sql
-- Supprimer les utilisateurs non confirmés
DELETE FROM users WHERE email IN ('medecin1@hopital.com', 'technicien1@hopital.com');

-- L'admin peut maintenant les recréer en MODE 1
```

---

## 📱 Navigation

### Menu Burger ☰ (En haut à gauche)
- Disponible sur toutes les pages
- Permet d'accéder à :
  - 📊 Dashboard
  - 👥 Gestion des utilisateurs (admin)
  - 📅 Gestion des plannings (admin)
  - ⚙️ Paramètres (admin)
  - 📋 Mon Planning
  - 💬 Chat
  - 🚪 Déconnexion

### Bouton Déconnexion 🚪 (En haut à droite)
- Disponible sur toutes les pages
- Affiche une confirmation avant déconnexion
- Efface la session et redirige vers la page de connexion

---

## 🎯 Comptes de Test Disponibles

### Admin
```
Email: Chakroun.sarra72@gmtariana.tn
Mot de passe: Sarra123.
```

### Médecin
```
Email: medecin@hopital.com
Mot de passe: medecin123
```

### Technicien
```
Email: technicien@hopital.com
Mot de passe: tech123
```

---

## 💡 Recommandations

1. **Utilisez MODE 1** pour créer les utilisateurs (plus simple)
2. **Testez la déconnexion** sur mobile (Expo Go) plutôt que sur web
3. **Vérifiez la configuration email** si vous utilisez MODE 2
4. **Supprimez les comptes non confirmés** avant de recréer en MODE 1

---

## 📧 Configuration Email (Pour MODE 2)

Le serveur est configuré avec Gmail :
```
Email: bynour70@gmail.com
```

Si les emails ne sont pas envoyés, vérifier :
1. Le mot de passe d'application dans `.env`
2. Les paramètres de sécurité Gmail
3. Les logs du serveur backend

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs du backend (fenêtre Terminal)
2. Vérifier les logs du frontend (fenêtre Expo)
3. Consulter la console du navigateur (F12)
4. Redémarrer les serveurs si nécessaire
