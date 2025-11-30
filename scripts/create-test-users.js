// Script pour créer des utilisateurs de test pour l'application
// Crée 1 admin, 1 médecin et 1 technicien avec des mots de passe hashés

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

const testUsers = [
  {
    email: 'admin@hopital.com',
    password: 'Admin123!',
    nom: 'Admin',
    prenom: 'Système',
    role: 'admin'
  },
  {
    email: 'medecin@hopital.com',
    password: 'Medecin123!',
    nom: 'Dupont',
    prenom: 'Jean',
    role: 'medecin'
  },
  {
    email: 'technicien@hopital.com',
    password: 'Technicien123!',
    nom: 'Martin',
    prenom: 'Sophie',
    role: 'technicien'
  }
];

async function createTestUsers() {
  console.log('🚀 Création des utilisateurs de test...\n');

  try {
    // Attendre un peu pour que MySQL s'initialise (déjà initialisé au chargement du module)
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (const user of testUsers) {
      console.log(`Création de: ${user.email} (${user.role})`);
      
      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Créer/mettre à jour l'utilisateur
      await db.createOrUpdateUser({
        email: user.email,
        password: hashedPassword,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      });
      
      console.log(`✅ ${user.email} créé avec succès`);
      console.log(`   Mot de passe: ${user.password}\n`);
    }

    console.log('\n✨ Tous les utilisateurs de test ont été créés!\n');
    console.log('📋 Récapitulatif des comptes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach(u => {
      console.log(`👤 ${u.role.toUpperCase()}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Mot de passe: ${u.password}`);
      console.log(`   Nom: ${u.prenom} ${u.nom}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Exécuter le script
createTestUsers();
