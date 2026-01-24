// Script pour repeupler la base de données avec les utilisateurs de base
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function repopulate() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Les utilisateurs de base à créer
    const users = [
      {
        email: 'admin@hopital.com',
        password: 'Admin123!',
        nom: 'Administrateur',
        prenom: 'Admin',
        role: 'admin',
        isConfirmed: true
      },
      {
        email: 'medecin@hopital.com',
        password: 'Medecin123!',
        nom: 'Dupont',
        prenom: 'Jean',
        role: 'medecin',
        isConfirmed: true
      },
      {
        email: 'technicien@hopital.com',
        password: 'Technicien123!',
        nom: 'Martin',
        prenom: 'Sophie',
        role: 'technicien',
        isConfirmed: true
      },
      {
        email: 'admin@gmt.com',
        password: 'Admin123!',
        nom: 'Admin',
        prenom: 'Super',
        role: 'admin',
        isConfirmed: true
      }
    ];

    console.log('🗑️  Suppression des utilisateurs existants...\n');
    await connection.query('DELETE FROM users');

    console.log('➕ Création des utilisateurs de base...\n');
    for (const user of users) {
      // Hash du password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insertion
      const [result] = await connection.query(
        `INSERT INTO users (email, password, nom, prenom, role, isConfirmed, mustChangePassword) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.email, hashedPassword, user.nom, user.prenom, user.role, user.isConfirmed, false]
      );

      console.log(`✅ [${user.role.toUpperCase()}] ${user.prenom} ${user.nom} (${user.email})`);
      console.log(`   ID: ${result.insertId}`);
    }

    // Afficher les utilisateurs créés
    console.log('\n📋 UTILISATEURS CRÉÉS:\n');
    const [allUsers] = await connection.query(
      'SELECT id, nom, prenom, email, role, isConfirmed FROM users ORDER BY id'
    );
    console.table(allUsers);

    console.log(`\n✅ Repeuploment terminé! ${users.length} utilisateurs créés`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

repopulate();
