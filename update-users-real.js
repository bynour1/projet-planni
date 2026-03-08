// Script pour mettre à jour la base de données avec les vrais utilisateurs
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Les nouveaux utilisateurs réels
    const users = [
      {
        email: 'Chakroun.sarra72@gmtariana.tn',
        password: 'Sarra123.',
        nom: 'Chakroun',
        prenom: 'Sarra',
        phone: '50513138',
        role: 'admin',
        isConfirmed: true
      }
    ];

    console.log('🗑️  Suppression des utilisateurs de test...\n');
    await connection.query('DELETE FROM users');
    console.log('✅ Utilisateurs supprimés\n');

    console.log('➕ Création du nouvel administrateur...\n');
    for (const user of users) {
      // Hash du password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insertion
      const [result] = await connection.query(
        `INSERT INTO users (email, password, nom, prenom, phone, role, isConfirmed, mustChangePassword) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.email, hashedPassword, user.nom, user.prenom, user.phone, user.role, user.isConfirmed, false]
      );

      console.log(`✅ [${user.role.toUpperCase()}] ${user.prenom} ${user.nom}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Téléphone: ${user.phone}`);
      console.log(`   ID: ${result.insertId}`);
      console.log(`   Mot de passe hashé et sécurisé ✅\n`);
    }

    // Afficher les utilisateurs créés
    console.log('📋 ADMINISTRATEUR CRÉÉ:\n');
    const [allUsers] = await connection.query(
      'SELECT id, nom, prenom, email, phone, role, isConfirmed FROM users ORDER BY id'
    );
    console.table(allUsers);

    console.log(`\n✅ Mise à jour terminée! 1 administrateur créé`);
    console.log('🔐 Base de données sécurisée avec le nouvel admin\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

updateUsers();
