require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'planning'
  });

  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insérer/mettre à jour l'utilisateur
    await connection.execute(
      `INSERT INTO users (email, phone, password, nom, prenom, role, isConfirmed, mustChangePassword)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), isConfirmed = 1`,
      ['admin@hopital.com', null, hashedPassword, 'Admin', 'Hospital', 'admin', 1, 0]
    );

    console.log('✅ Utilisateur admin@hopital.com créé/mis à jour');
    console.log('📧 Email: admin@hopital.com');
    console.log('🔐 Mot de passe: admin123');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

createAdminUser();
