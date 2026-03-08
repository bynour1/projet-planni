// Script pour ajouter des utilisateurs créés par l'admin
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function addUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Les utilisateurs créés par l'admin Sarra
    const users = [
      {
        email: 'dr.fatima@hopital.tn',
        phone: '50123456',
        password: 'Fatima123.',
        nom: 'Ben Hamida',
        prenom: 'Fatima',
        role: 'medecin'
      },
      {
        email: 'dr.ahmed@hopital.tn',
        phone: '50234567',
        password: 'Ahmed123.',
        nom: 'Bouaziz',
        prenom: 'Ahmed',
        role: 'medecin'
      },
      {
        email: 'tech.marie@hopital.tn',
        phone: '50345678',
        password: 'Marie123.',
        nom: 'Durand',
        prenom: 'Marie',
        role: 'technicien'
      },
      {
        email: 'tech.pierre@hopital.tn',
        phone: '50456789',
        password: 'Pierre123.',
        nom: 'Martin',
        prenom: 'Pierre',
        role: 'technicien'
      }
    ];

    console.log('➕ Création des utilisateurs...\n');
    for (const user of users) {
      // Hash du password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insertion
      const [result] = await connection.query(
        `INSERT INTO users (email, phone, password, nom, prenom, role, isConfirmed, mustChangePassword) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.email, user.phone, hashedPassword, user.nom, user.prenom, user.role, 1, 0]
      );

      console.log(`✅ [${user.role.toUpperCase()}] ${user.prenom} ${user.nom}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Téléphone: ${user.phone}`);
      console.log(`   Mot de passe: ${user.password}`);
      console.log(`   ID: ${result.insertId}\n`);
    }

    // Afficher tous les utilisateurs
    console.log('📋 TOUS LES UTILISATEURS:\n');
    const [allUsers] = await connection.query(
      'SELECT id, nom, prenom, email, phone, role, isConfirmed FROM users ORDER BY role DESC, nom'
    );
    console.table(allUsers);

    console.log(`\n✅ ${users.length} utilisateurs ajoutés avec succès!`);
    console.log('\n💡 COMPTES DISPONIBLES POUR CONNEXION:');
    console.log('─'.repeat(60));
    const [usersForLogin] = await connection.query(
      'SELECT email, role FROM users WHERE isConfirmed = 1 ORDER BY role DESC'
    );
    usersForLogin.forEach(u => {
      console.log(`📧 ${u.email} (${u.role})`);
    });
    console.log('─'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

addUsers();
