# 🎉 Planning Management v2.0 - Guide Complet

## 🚀 Vue d'Ensemble

Application complète de gestion de planning avec support multiplateforme (iOS/Android) et mode sombre/clair inspirée du projet POWR.

---

## ✨ Fonctionnalités Principales

### 📊 Dashboard
- Statistiques en temps réel
- Graphiques de distribution
- Top médecins/techniciens
- Actions rapides

### 📅 Calendrier
- Vue mensuelle interactive
- Navigation intuitive
- Indicateurs d'événements
- Gestion complète des événements

### 📋 Planning Hebdomadaire
- Vue semaine par semaine
- Navigation temporelle
- Formulaires intégrés
- Badge "Aujourd'hui"

### ⏰ Routines (NOUVEAU)
- Création de routines récurrentes
- Plages horaires personnalisées
- 6 catégories avec codes couleur
- Dates de début/fin

### 📆 Horaires (NOUVEAU)
- Événements quotidiens
- Sélecteur de date natif
- Durée configurable
- Indication du lieu

### 🎨 Mode Sombre/Clair (NOUVEAU)
- Thème clair ☀️
- Thème sombre 🌙
- Mode automatique 🔄
- Sauvegarde des préférences

### ⚙️ Paramètres (NOUVEAU)
- Gestion du thème
- Informations système
- Configuration de l'app

---

## 📱 Écrans Disponibles

| Écran | Route | Description |
|-------|-------|-------------|
| **Accueil** | `Welcome` | Menu principal |
| **Dashboard** | `Dashboard` | Statistiques |
| **Calendrier** | `Calendar` | Vue mensuelle |
| **Planning** | `Planning` | Vue hebdomadaire |
| **Routines** | `Routine` | Gestion routines |
| **Horaires** | `Schedule` | Événements quotidiens |
| **Paramètres** | `Settings` | Configuration |
| **Chat** | `Chat` | Messagerie |
| **Admin** | `Admin` | Administration |
| **Médecin** | `Medecin` | Espace médecin |
| **Technicien** | `Technicien` | Espace technicien |

---

## 🛠️ Installation

### Prérequis
- Node.js (v16+)
- npm ou yarn
- Expo CLI
- iOS Simulator / Android Emulator ou Expo Go

### Étapes

1. **Cloner le projet**
```bash
git clone https://github.com/bynour1/projet-planni.git
cd projet-planning
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer le serveur**
```bash
npm start
```

4. **Lancer sur appareil**
- **iOS :** Appuyez sur `i`
- **Android :** Appuyez sur `a`
- **Mobile :** Scannez le QR code avec Expo Go

---

## 📦 Dépendances Principales

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-community/datetimepicker": "^8.2.0",
  "@react-navigation/native": "^7.1.17",
  "date-fns": "^4.1.0",
  "expo": "~53.0.24",
  "react": "19.0.0",
  "react-native": "0.79.6",
  "react-native-calendars": "^1.1313.0"
}
```

---

## 🎨 Thèmes

### Mode Clair
```javascript
{
  primary: "#007bff",
  background: "#ffffff",
  text: "#333333",
  isDark: false
}
```

### Mode Sombre
```javascript
{
  primary: "#4dabf7",
  background: "#1a1a1a",
  text: "#ffffff",
  isDark: true
}
```

---

## 📖 Guide d'Utilisation

### 1. Changer le Thème
```
Accueil → Paramètres → Apparence → Choisir le mode
```

### 2. Créer une Routine
```
Accueil → Routines → + Nouvelle Routine
→ Remplir le formulaire → Créer
```

### 3. Créer un Horaire
```
Accueil → Horaires → + Nouvel Horaire
→ Sélectionner date/heure → Créer
```

### 4. Voir le Dashboard
```
Accueil → Dashboard
→ Voir les statistiques et graphiques
```

### 5. Utiliser le Calendrier
```
Accueil → Calendrier
→ Cliquer sur un jour → Ajouter événement
```

---

## 🔧 Architecture

### Contextes
- `ThemeContext` - Gestion du thème
- `RoutineContext` - Routines et horaires
- `PlanningContext` - Planning général
- `UserContext` - Utilisateurs
- `ChatContext` - Messagerie

### Navigation
```
App.js
  └─ ThemeProvider
      └─ UserProvider
          └─ PlanningProvider
              └─ RoutineProvider
                  └─ ChatProvider
                      └─ NavigationContainer
                          └─ Stack Navigator
```

---

## 📂 Structure des Fichiers

```
projet-planning/
├── screens/
│   ├── WelcomeScreen.js        # Accueil
│   ├── DashboardScreen.js      # Dashboard
│   ├── CalendarScreen.js       # Calendrier
│   ├── PlanningScreen.js       # Planning
│   ├── RoutineScreen.js        # Routines ⭐
│   ├── ScheduleScreen.js       # Horaires ⭐
│   ├── SettingsScreen.js       # Paramètres ⭐
│   ├── ChatScreen.js           # Chat
│   ├── AdminScreen.js          # Admin
│   ├── MedecinScreen.js        # Médecin
│   └── TechnicienScreen.js     # Technicien
├── contexts/
│   ├── ThemeContext.js         # Thème ⭐
│   ├── RoutineContext.js       # Routines ⭐
│   ├── PlanningContext.js      # Planning
│   ├── UserContext.js          # Utilisateurs
│   └── ChatContext.js          # Chat
├── components/
│   ├── QuickNav.js             # Navigation rapide
│   └── StatsCard.js            # Carte statistique
├── App.js                      # Point d'entrée
└── package.json                # Dépendances
```

⭐ = Nouveaux fichiers

---

## 🎯 Cas d'Usage

### Médecin
1. Voir le planning hebdomadaire
2. Créer des routines pour consultations
3. Planifier des rendez-vous
4. Communiquer via chat

### Technicien
1. Consulter les interventions
2. Créer des horaires de maintenance
3. Voir le calendrier mensuel
4. Coordonner avec l'équipe

### Administrateur
1. Voir le dashboard complet
2. Gérer les utilisateurs
3. Superviser tous les plannings
4. Configurer l'application

---

## 🚀 Fonctionnalités Avancées

### Sauvegarde Locale
- AsyncStorage pour persistance
- Thèmes sauvegardés
- Routines et horaires persistants

### Sélecteur de Date Natif
- Interface native iOS/Android
- Format 24h
- Localisation française

### Design Responsive
- Adaptation mobile
- Cartes optimisées
- Icônes expressives

### Performance
- Chargement rapide
- Transitions fluides
- Optimisation mémoire

---

## 📊 Statistiques du Dashboard

Le dashboard calcule automatiquement :
- Total d'événements
- Nombre de médecins actifs
- Nombre de techniciens actifs
- Distribution par jour
- Top 5 des utilisateurs

---

## 🎨 Personnalisation

### Ajouter une Catégorie
Dans `RoutineScreen.js` ou `ScheduleScreen.js` :
```javascript
const categories = [
  { id: "custom", label: "Ma Catégorie", icon: "🎯", color: "#ff00ff" },
  // ... autres catégories
];
```

### Modifier les Couleurs du Thème
Dans `ThemeContext.js` :
```javascript
export const customTheme = {
  primary: "#votre-couleur",
  // ... autres propriétés
};
```

---

## 🐛 Résolution de Problèmes

### Erreur "Metro Bundler"
```bash
npm start --reset-cache
```

### Erreur "Module not found"
```bash
npm install
rm -rf node_modules
npm install
```

### DatePicker ne s'affiche pas
```bash
npx expo install @react-native-community/datetimepicker
```

### Thème ne change pas
1. Redémarrer l'app
2. Vérifier AsyncStorage
3. Clear data de l'app

---

## 📝 Scripts Disponibles

```bash
npm start           # Démarrer Expo
npm run android     # Lancer sur Android
npm run ios         # Lancer sur iOS
npm run web         # Lancer sur web
npm run lint        # Vérifier le code
```

---

## 🔒 Sécurité

- Authentification JWT
- Hashage bcrypt pour mots de passe
- Communication Socket.IO sécurisée
- Validation côté serveur

---

## 🌐 Internationalisation

- Français par défaut
- date-fns avec locale fr
- Format de date français
- Textes en français

---

## 📈 Évolutions Futures

- [ ] Notifications push
- [ ] Synchronisation cloud
- [ ] Export PDF
- [ ] Partage de calendrier
- [ ] Widget home screen
- [ ] Intégration calendrier système
- [ ] Mode hors ligne
- [ ] Backup automatique

---

## 👥 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

ISC License - Voir fichier LICENSE

---

## 📞 Support

- **Issues :** https://github.com/bynour1/projet-planni/issues
- **Documentation :** Voir fichiers `.md` dans le projet
- **Email :** Contactez l'équipe de développement

---

## 🎉 Remerciements

- Inspiré par le projet **POWR** (DocNR/POWR)
- Communauté React Native
- Équipe Expo
- Contributeurs du projet

---

## 📸 Aperçu

### Mode Clair
- Interface lumineuse et moderne
- Icônes colorées
- Cartes avec ombres légères

### Mode Sombre
- Interface élégante
- Économie d'énergie
- Réduit la fatigue oculaire

### Écrans Principaux
1. **Accueil** - Menu avec cartes
2. **Dashboard** - Statistiques visuelles
3. **Calendrier** - Vue mensuelle
4. **Routines** - Liste avec catégories
5. **Horaires** - Événements triés

---

## 🏆 Résumé des Améliorations

### Version 2.0
- ✅ Mode sombre/clair complet
- ✅ Système de routines
- ✅ Horaires quotidiens
- ✅ DatePicker natif
- ✅ Écran paramètres
- ✅ Dashboard amélioré
- ✅ Calendrier interactif
- ✅ Support multiplateforme optimisé

### Avant v2.0
- Planning basique
- Interface limitée
- Pas de thème

### Maintenant v2.0
- Application professionnelle complète
- Interface moderne et intuitive
- Fonctionnalités avancées
- Expérience utilisateur optimale

---

**Planning Management v2.0** - Une application complète pour gérer votre temps efficacement ! 🚀

Pour plus d'informations, consultez :
- `NOUVELLES_FONCTIONNALITES.md` - Détails des nouvelles fonctionnalités
- `AMELIORATIONS_CALENDAR.md` - Guide du calendrier
- `SYNTHESE_AMELIORATIONS.md` - Vue d'ensemble technique
