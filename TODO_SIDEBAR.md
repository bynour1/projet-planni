# TODO - Supprimer Accueil et Routines de la Sidebar

## Objectif
- Admin: garde "Accueil" et "Routines"
- Medecin/Technicien: pas de "Accueil" et "Routines"

## Étapes

### 1. Modifier Sidebar.js
- [x] Comprendre la structure actuelle des menus
- [x] Créer le plan de modification
- [x] Obtenir confirmation de l'utilisateur
- [x] Implémenter les modifications:
  - [x] Garder adminMenu inchangé (avec Accueil et Routines)
  - [x] Créer medecinTechnicienMenu sans Accueil/Routines
  - [x] Mettre à jour la logique menuItems

### 2. Modifier les écrans pour permissions (lecture seule pour medecin/technicien)
- [x] PlanningScreen.js - Masquer ajouter/modifier/supprimer pour medecin/technicien
- [x] EvenementsScreen.js - Masquer ajouter pour medecin/technicien
- [x] MonPlanningScreen.js - Section ajout événements médicaux déjà limitée à admin

### 3. Tests
- [ ] Vérifier que admin voit Accueil et Routines
- [ ] Vérifier que medecin ne voit pas Accueil et Routines
- [ ] Vérifier que technicien ne voit pas Accueil et Routines
- [ ] Vérifier que medecin/technicien ont accès lecture seule

## Notes
- Rôles existants: admin, medecin, technicien
- medecin et technicien ont accès en lecture seule

