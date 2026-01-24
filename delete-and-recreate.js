// Supprimer les 2 comptes existants et garder seulement l'admin
require('dotenv').config();
const mysql = require('mysql2/promise');

async function deleteAndRecreate() {
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

    // Supprimer les ID 41 et 42
    console.log('\n🗑️  SUPPRESSION EN COURS...\n');
    const [result] = await connection.query('DELETE FROM users WHERE id IN (41, 42)');
    console.log(`✅ ${result.affectedRows} utilisateur(s) supprimé(s)`);

    // Afficher après suppression
    console.log('\n📋 UTILISATEURS APRÈS SUPPRESSION:\n');
    const [afterDelete] = await connection.query('SELECT id, nom, prenom, email, role FROM users ORDER BY id');
    console.table(afterDelete);

    console.log(`\n✅ Suppression terminée!`);
    console.log(`\n📊 Seul l'admin reste: ${afterDelete.length} utilisateur`);
    console.log(`\n🚀 Vous pouvez maintenant créer de nouveaux comptes avec le nouveau système!`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

deleteAndRecreate();
