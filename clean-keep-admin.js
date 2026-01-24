// Vérifier les comptes créés et supprimer les non-admin
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAndClean() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    console.log('📋 UTILISATEURS ACTUELS:\n');
    const [users] = await connection.query('SELECT id, nom, prenom, email, role, isConfirmed FROM users ORDER BY id');
    console.table(users);

    // Supprimer tous sauf l'admin (ID 36)
    console.log('\n🗑️  SUPPRESSION DES COMPTES NON-ADMIN...\n');
    const [result] = await connection.query('DELETE FROM users WHERE role != "admin"');
    console.log(`✅ ${result.affectedRows} compte(s) supprimé(s)`);

    console.log('\n📋 UTILISATEURS RESTANTS:\n');
    const [remaining] = await connection.query('SELECT id, nom, prenom, email, role, isConfirmed FROM users ORDER BY id');
    console.table(remaining);

    console.log(`\n✅ Nettoyage terminé!`);
    console.log(`📊 Seul l'admin reste`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

checkAndClean();
