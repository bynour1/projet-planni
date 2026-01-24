// Script pour créer des comptes de test avec mots de passe simples
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestAccounts() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Les comptes de test à créer
    const accounts = [
      {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'medecin@test.com',
        password: 'password123',
        role: 'medecin'
      },
      {
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'technicien@test.com',
        password: 'password123',
        role: 'technicien'
      },
      {
        nom: 'Admin',
        prenom: 'Test',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      }
    ];

    console.log('📋 UTILISATEURS EXISTANTS:\n');
    const [existing] = await connection.query('SELECT id, nom, prenom, email, role FROM users ORDER BY id');
    console.table(existing);

    console.log('\n➕ CRÉATION DES COMPTES DE TEST...\n');
    const createdAccounts = [];

    for (const account of accounts) {
      // Hash du password
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      // Insertion
      const [result] = await connection.query(
        `INSERT INTO users (email, password, nom, prenom, role, isConfirmed, mustChangePassword) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [account.email, hashedPassword, account.nom, account.prenom, account.role, true, false]
      );

      createdAccounts.push({
        id: result.insertId,
        email: account.email,
        password: account.password,
        role: account.role,
        nom: account.nom,
        prenom: account.prenom
      });

      console.log(`✅ [${account.role.toUpperCase()}] ${account.prenom} ${account.nom}`);
    }

    console.log('\n📋 TOUS LES UTILISATEURS:\n');
    const [allUsers] = await connection.query('SELECT id, nom, prenom, email, role FROM users ORDER BY id');
    console.table(allUsers);

    console.log('\n🔐 IDENTIFIANTS DE CONNEXION:\n');
    console.log('┌──────────────────────────────────────────────────────────────────┐');
    console.log('│                   COMPTES DE CONNEXION CRÉÉS                      │');
    console.log('├──────────────────────────────────────────────────────────────────┤');
    
    // Admin original
    console.log('│ ADMIN (EXISTANT)                                                 │');
    console.log('│ Email: admin@hopital.com                                          │');
    console.log('│ Password: Admin123!                                               │');
    console.log('├──────────────────────────────────────────────────────────────────┤');

    createdAccounts.forEach((account, index) => {
      const roleLabel = account.role === 'medecin' ? '👨‍⚕️ MÉDECIN' : 
                       account.role === 'technicien' ? '🔧 TECHNICIEN' : 
                       '👑 ADMIN TEST';
      
      console.log(`│ ${roleLabel.padEnd(60)} │`);
      console.log(`│ Email: ${account.email.padEnd(58)} │`);
      console.log(`│ Password: ${account.password.padEnd(53)} │`);
      if (index < createdAccounts.length - 1) {
        console.log('├──────────────────────────────────────────────────────────────────┤');
      }
    });
    
    console.log('└──────────────────────────────────────────────────────────────────┘');

    console.log(`\n✅ ${createdAccounts.length} compte(s) de test créé(s)!`);
    console.log(`📊 Total utilisateurs: ${allUsers.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

createTestAccounts();
