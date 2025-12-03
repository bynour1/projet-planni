# 🚀 Guide de Démarrage Rapide - Mot de Passe Provisoire

## ⚡ Installation en 5 minutes

### Étape 1 : Migration base de données (2 min)
```
1. Ouvrir XAMPP Control Panel
2. Démarrer MySQL (si pas déjà démarré)
3. Cliquer sur "Admin" → phpMyAdmin s'ouvre
4. Sélectionner la base de données "planning" à gauche
5. Cliquer sur l'onglet "SQL" en haut
6. Copier-coller ce code :
```

```sql
USE `planning`;
ALTER TABLE `users` ADD COLUMN `mustChangePassword` TINYINT(1) DEFAULT 0 AFTER `isConfirmed`;
UPDATE `users` SET `mustChangePassword` = 0;
```

```
7. Cliquer sur "Exécuter" en bas à droite
8. Voir le message : "1 ligne affectée"
```

### Étape 2 : Redémarrer le serveur (1 min)
```powershell
# Dans PowerShell ou terminal VS Code
cd c:\Users\MSI\Desktop\STAGE\projet-planning

# Arrêter le serveur actuel (Ctrl+C)

# Redémarrer
npm start
```

### Étape 3 : Test rapide (2 min)
```
1. Ouvrir l'application
2. Se connecter en tant qu'admin
3. Aller dans "Gestion des utilisateurs"
4. Inviter un nouveau participant (ex: test@test.com)
5. Un code sera généré (ex: 123456)
6. Section "Confirmer le participant" apparaît
7. Entrer le code + créer mot de passe provisoire (ex: Test123!)
8. Alert affiche le mot de passe créé
9. ✅ C'est prêt !
```

---

## 🎯 Utilisation par l'Admin

### Créer un nouveau participant

**1. Inviter** (30 secondes)
```
Écran : Gestion des utilisateurs
- Remplir : Nom, Prénom, Email, Téléphone, Rôle
- Cliquer : "Créer et envoyer le code"
- Résultat : Code envoyé par email (ex: 123456)
```

**2. Confirmer + Créer mot de passe** (1 minute)
```
Section : Confirmer le participant
- Le participant vous communique le code reçu par email
- Entrer le code (ex: 123456)
- Créer un mot de passe provisoire fort (ex: Temp#2024!)
- Cliquer : "✅ Confirmer"
- Alert affiche le mot de passe créé
```

**3. Communiquer le mot de passe** (1 minute)
```
⚠️ IMPORTANT : Communiquer de manière sécurisée
✅ Appel téléphonique
✅ SMS
✅ En personne
❌ PAS par email non sécurisé
```

---

## 👤 Utilisation par le Participant

### Première connexion

**1. Connexion avec mot de passe provisoire**
```
Écran : Connexion
- Email : celui donné à l'admin
- Mot de passe : celui reçu de l'admin (ex: Temp#2024!)
- Cliquer : "Se connecter"
```

**2. Changement obligatoire**
```
→ Redirection automatique vers changement de mot de passe

Écran : Changer le mot de passe
- Ancien mot de passe : Temp#2024! (provisoire)
- Nouveau mot de passe : VotreNouveauMdp123!
- Confirmer : VotreNouveauMdp123!
- Cliquer : "✅ Changer le mot de passe"
```

**3. Accès accordé**
```
✅ Mot de passe changé
→ Redirection automatique selon votre rôle :
   - Admin → Écran Admin
   - Médecin → Écran Médecin
   - Technicien → Écran Technicien
```

---

## 🛡️ Règles de sécurité

### Mot de passe provisoire (Admin)
- ✅ Minimum 8 caractères
- ✅ Majuscules + minuscules + chiffres + symboles
- ✅ Exemple : `Temp#2024!`
- ❌ Ne PAS utiliser : `123456`, `password`, `temp`

### Mot de passe final (Participant)
- ✅ Minimum 6 caractères (recommandé 12+)
- ✅ Facile à retenir mais difficile à deviner
- ✅ Unique (pas utilisé ailleurs)
- ❌ Ne PAS réutiliser le provisoire

---

## 🐛 Problèmes courants

### ❌ "Code invalide"
**Solution** : Vérifier que le code est correct
```sql
-- Dans phpMyAdmin, onglet SQL :
SELECT contact, code FROM codes WHERE contact = 'email@test.com';
```

### ❌ "Le mot de passe doit contenir au moins 6 caractères"
**Solution** : Créer un mot de passe plus long (8+ recommandé)

### ❌ "Les mots de passe ne correspondent pas"
**Solution** : Retaper soigneusement dans les deux champs

### ❌ "Ancien mot de passe incorrect"
**Solution** : Vérifier avec l'admin le mot de passe provisoire exact

### ❌ Colonne mustChangePassword n'existe pas
**Solution** : Exécuter la migration SQL (Étape 1)

---

## 📊 Vérification

### Dans phpMyAdmin
```sql
-- Voir la structure de la table
DESCRIBE users;
-- Doit contenir : mustChangePassword TINYINT(1)

-- Voir tous les utilisateurs
SELECT email, nom, prenom, isConfirmed, mustChangePassword FROM users;

-- Voir qui doit changer son mdp
SELECT email, nom, prenom FROM users WHERE mustChangePassword = 1;
```

---

## ✅ Checklist

**Avant le premier test** :
- [ ] XAMPP MySQL démarré
- [ ] Migration SQL exécutée
- [ ] Serveur Node.js redémarré
- [ ] Application accessible

**Workflow admin** :
- [ ] Inviter participant
- [ ] Confirmer code
- [ ] Créer mdp provisoire
- [ ] Communiquer mdp de manière sécurisée

**Workflow participant** :
- [ ] Se connecter avec mdp provisoire
- [ ] Voir la redirection automatique
- [ ] Changer le mdp avec succès
- [ ] Accéder à l'application

---

## 📞 Aide

**Documentation complète** : `GUIDE_MOT_DE_PASSE_PROVISOIRE.md`
**Résumé technique** : `RESUME_MODIFICATIONS_MDP.md`

**En cas de problème** :
1. Vérifier les logs serveur (console Node.js)
2. Vérifier la base de données (phpMyAdmin)
3. Consulter la section "Dépannage" du guide complet

---

**Dernière mise à jour** : Janvier 2025  
**Temps d'installation** : ~5 minutes  
**Niveau** : Débutant
