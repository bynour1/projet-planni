# TODO - Amélioration du Calendrier

## Objectif
Améliorer le calendrier pour qu'il ressemble à Google Calendar avec:
- Accès complet pour l'admin (ajouter, modifier, supprimer)
- Accès lecture seule pour les autres utilisateurs
- Système de commentaires pour tous les utilisateurs

## Tâches

### 1. CalendarScreen.js - Refonte complète ✅
- [x] 1.1 Intégrer `useUser()` pour vérifier le rôle utilisateur
- [x] 1.2 Créer constante `isAdmin` basée sur `user?.role === 'admin'`
- [x] 1.3 Masquer le formulaire d'ajout pour les non-admin
- [x] 1.4 Masquer les boutons de suppression pour les non-admin
- [x] 1.5 Améliorer le design (style Google Calendar)
- [x] 1.6 Ajouter des indicateurs visuels d'événements plus visibles
- [x] 1.7 Afficher "Mode lecture" pour les non-admin

### 2. Système de Commentaires ✅
- [x] 2.1 Ajouter champ `commentaire` dans la structure des événements
- [x] 2.2 Créer fonction `addComment(jour, index, commentaire)` dans PlanningContext
- [x] 2.3 Interface d'ajout de commentaires dans la modale de détails
- [x] 2.4 Afficher les commentaires existants
- [x] 2.5 Bouton pour ajouter un commentaire visible par tous

### 3. Modales Améliorées ✅
- [x] 3.1 Modale de détails avec section commentaires
- [x] 3.2 Formulaire d'ajout caché pour les non-admin
- [x] 3.3 Indicateur visuel du rôle de l'utilisateur actuel
- [x] 3.4 Animations fluides pour les modales

### 4. PlanningContext.js ✅
- [x] 4.1 Ajouter fonction `addComment(jour, index, commentaire)`
- [x] 4.2 Appel API pour persister les commentaires

### 5. Serveur (server.js) ✅
- [x] 5.1 Ajouter endpoint POST `/planning/comment` accessible à tous les utilisateurs authentifiés

### 6. Tests et Validation ⏳
- [ ] 6.1 Tester avec un compte admin (ajouter, modifier, supprimer, commenter)
- [ ] 6.2 Tester avec un compte non-admin (lecture seule + commentaires)
- [ ] 6.3 Vérifier l'affichage sur mobile

## Fichiers Modifiés
1. `screens/CalendarScreen.js` - Principal (refonte complète)
2. `contexts/PlanningContext.js` - Support commentaires
3. `server.js` - Nouvel endpoint pour les commentaires

## Nouvelles Fonctionnalités

### Rôle Admin:
- ✅ Badge "Admin" dans l'en-tête
- ✅ Accès complet: ajouter, modifier, supprimer des événements
- ✅ Peut ajouter des commentaires

### Rôle Utilisateur (Non-Admin):
- ✅ Badge "Lecture seule" dans l'en-tête
- ✅ Peut consulter les événements
- ✅ Peut ajouter des commentaires
- ✅ Formulaire d'ajout masqué
- ✅ Bouton de suppression masqué

### Design:
- ✅ Style moderne style Google Calendar
- ✅ Indicateurs d'événements verts
- ✅ Icônes Ionicons
- ✅ Couleurs cohérentes
- ✅ Animations fluides
- ✅ Mode sombre/clair selon le contexte

## Pour Tester

### Tester en tant qu'Admin:
1. Se connecter avec un compte admin
2. Cliquer sur un jour pour ajouter un événement
3. Cliquer sur un événement existant pour voir les détails
4. Ajouter un commentaire
5. Supprimer un événement

### Tester en tant qu'Utilisateur:
1. Se connecter avec un compte non-admin (médecin/technicien)
2. Constater le badge "Lecture seule" dans l'en-tête
3. Cliquer sur un jour - pas de formulaire d'ajout
4. Cliquer sur un événement existant
5. Ajouter un commentaire

