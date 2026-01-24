// Vérifier la structure de la BD et recréer la table si nécessaire
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAndRepair() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Vérifier les tables
    console.log('📋 TABLES EXISTANTES:\n');
    const [tables] = await connection.query("SHOW TABLES");
    console.table(tables);

    // Vérifier la structure de users
    console.log('\n🔍 STRUCTURE TABLE "users":\n');
    const [structure] = await connection.query("DESCRIBE users");
    console.table(structure);

    // Compter les enregistrements
    console.log('\n📊 NOMBRE D\'ENREGISTREMENTS:\n');
    const [counts] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM users WHERE isConfirmed = 1) as confirmed_count
    `);
    console.table(counts);

    // Afficher les utilisateurs confirmés
    if (counts[0].users_count > 0) {
      console.log('\n👥 UTILISATEURS CONFIRMÉS:\n');
      const [users] = await connection.query(
        'SELECT id, nom, prenom, email, role FROM users WHERE isConfirmed = 1 ORDER BY id'
      );
      console.table(users);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

checkAndRepair();
