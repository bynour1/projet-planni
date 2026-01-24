// Script pour créer un compte admin avec numéro de téléphone
// Utilisation: node scripts/create-admin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔐 Création d\'un compte administrateur\n');
  console.log('=' .repeat(50));

  try {
    // Attendre l'initialisation de la base de données
    await db.waitForInit();
    console.log('✅ Connexion à la base de données réussie\n');

    // Demander les informations
    const nom = await question('Nom de l\'administrateur : ');
    const prenom = await question('Prénom de l\'administrateur : ');
    const email = await question('Email (ex: admin@hopital.com) : ');
    const phone = await question('Numéro de téléphone (ex: 0612345678) : ');
    const password = await question('Mot de passe (min. 8 caractères) : ');
    const confirmPassword = await question('Confirmer le mot de passe : ');

    console.log('\n' + '='.repeat(50));

    // Validations
    if (!nom || !prenom || !email || !phone || !password) {
      console.error('❌ Tous les champs sont obligatoires');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Les mots de passe ne correspondent pas');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
      process.exit(1);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà');
      const update = await question('Voulez-vous le mettre à jour ? (oui/non) : ');
      if (update.toLowerCase() !== 'oui') {
        console.log('❌ Opération annulée');
        process.exit(0);
      }
    }

    // Hash du mot de passe
    console.log('\n🔒 Hachage du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer/mettre à jour l'utilisateur
    console.log('💾 Enregistrement dans la base de données...');
    await db.createOrUpdateUser({
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      nom: nom.trim(),
      prenom: prenom.trim(),
      role: 'admin'
    });

    console.log('\n✅ Compte administrateur créé avec succès !');
    console.log('\n📋 Informations du compte :');
    console.log('─'.repeat(50));
    console.log(`   Nom complet : ${prenom} ${nom}`);
    console.log(`   Email       : ${email}`);
    console.log(`   Téléphone   : ${phone}`);
    console.log(`   Rôle        : Administrateur`);
    console.log(`   Statut      : Confirmé ✓`);
    console.log('─'.repeat(50));
    console.log('\n🔐 Connexion :');
    console.log(`   Email    : ${email}`);
    console.log(`   Mot de passe : [celui que vous avez saisi]`);
    console.log('\n🌐 URL de connexion : http://localhost:8082/login\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de la création du compte :', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Exécuter le script
createAdmin();
