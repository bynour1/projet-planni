// Script pour supprimer tous les utilisateurs sauf l'admin
require('dotenv').config();
const mysql = require('mysql2/promise');

async function deleteAll() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Afficher avant suppression
    console.log('📋 UTILISATEURS AVANT SUPPRESSION:\n');
    const [beforeDelete] = await connection.query('SELECT id, nom, prenom, email, role FROM users ORDER BY id');
    console.table(beforeDelete);

    // Supprimer tous les utilisateurs sauf ceux avec le rôle 'admin'
    console.log('\n🗑️  SUPPRESSION EN COURS (tous sauf les admins)...\n');
    const [result] = await connection.query('DELETE FROM users WHERE role != "admin"');
    console.log(`✅ ${result.affectedRows} utilisateur(s) supprimé(s)`);

    // Afficher après suppression
    console.log('\n📋 UTILISATEURS APRÈS SUPPRESSION:\n');
    const [afterDelete] = await connection.query('SELECT id, nom, prenom, email, role FROM users ORDER BY id');
    console.table(afterDelete);

    console.log(`\n✅ Suppression terminée!`);
    console.log(`📊 Admins restants: ${afterDelete.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

deleteAll();
