// Mettre à jour les mots de passe avec "nour123" pour les 2 comptes créés
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    const password = 'nour123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🔐 MISE À JOUR DES MOTS DE PASSE...\n');

    // Mettre à jour le Médecin
    await connection.query(
      'UPDATE users SET password = ? WHERE id = 41',
      [hashedPassword]
    );
    console.log('✅ [Médecin] bynour70@gmail.com - Password: nour123');

    // Mettre à jour le Technicien
    await connection.query(
      'UPDATE users SET password = ? WHERE id = 42',
      [hashedPassword]
    );
    console.log('✅ [Technicien] jalila.benyoussef@esprit.tn - Password: nour123');

    console.log('\n📋 COMPTES DISPONIBLES POUR LA CONNEXION:\n');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│           IDENTIFIANTS DE CONNEXION FINALISÉS              │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    console.log('│ 👑 ADMINISTRATEUR                                            │');
    console.log('│ Email: admin@hopital.com                                     │');
    console.log('│ Password: Admin123!                                          │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    console.log('│ 👨‍⚕️ MÉDECIN                                                   │');
    console.log('│ Email: bynour70@gmail.com                                    │');
    console.log('│ Password: nour123                                            │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    console.log('│ 🔧 TECHNICIEN                                                │');
    console.log('│ Email: jalila.benyoussef@esprit.tn                           │');
    console.log('│ Password: nour123                                            │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    console.log('\n✅ Mots de passe mis à jour avec succès!');
    console.log('🔗 Connectez-vous à: http://localhost:8083/login');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

updatePasswords();
