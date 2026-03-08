// Script rapide pour créer le compte admin Sarra
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdminSarra() {
  let connection;
  
  try {
    // Connexion à MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à MySQL');

    // Hash du mot de passe
    const password = 'Sarra123.';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer ou mettre à jour l'admin
    const sql = `
      INSERT INTO users (email, phone, password, nom, prenom, role, isConfirmed, mustChangePassword)
      VALUES (?, ?, ?, ?, ?, ?, 1, 0)
      ON DUPLICATE KEY UPDATE
        phone = VALUES(phone),
        password = VALUES(password),
        nom = VALUES(nom),
        prenom = VALUES(prenom),
        role = VALUES(role),
        isConfirmed = 1,
        mustChangePassword = 0
    `;

    await connection.execute(sql, [
      'Chakroun.sarra72@gmtariana.tn',
      '50513138',
      hashedPassword,
      'Chakroun',
      'Sarra',
      'admin'
    ]);

    console.log('\n✅ Compte admin créé avec succès !');
    console.log('\n📋 Informations du compte :');
    console.log('─'.repeat(50));
    console.log('   Nom complet : Sarra Chakroun');
    console.log('   Email       : Chakroun.sarra72@gmtariana.tn');
    console.log('   Téléphone   : 50513138');
    console.log('   Rôle        : Administrateur');
    console.log('   Mot de passe: Sarra123.');
    console.log('─'.repeat(50));
    console.log('\n🌐 Connexion : http://localhost:8081\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

createAdminSarra();
