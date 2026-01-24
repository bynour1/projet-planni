// Script de suppression des utilisateurs de test
require('dotenv').config();
const mysql = require('mysql2/promise');

const idsToDelete = [4, 5, 17, 24, 25, 26, 27, 29, 30];

async function cleanup() {
  let connection;
  try {
    // Connexion à la BD
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Afficher avant suppression
    console.log('📋 UTILISATEURS AVANT SUPPRESSION:\n');
    const [beforeDelete] = await connection.query('SELECT id, nom, prenom, email FROM users ORDER BY id');
    console.table(beforeDelete);

    // Supprimer les utilisateurs
    console.log('\n🗑️  SUPPRESSION EN COURS...\n');
    for (const id of idsToDelete) {
      const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows > 0) {
        console.log(`✅ [ID ${id}] Supprimé (${result.affectedRows} ligne)`);
      } else {
        console.log(`⚠️  [ID ${id}] Non trouvé`);
      }
    }

    // Afficher après suppression
    console.log('\n📋 UTILISATEURS APRÈS SUPPRESSION:\n');
    const [afterDelete] = await connection.query('SELECT id, nom, prenom, email FROM users ORDER BY id');
    console.table(afterDelete);

    console.log(`\n✅ Nettoyage terminé! ${idsToDelete.length} utilisateurs supprimés`);
    console.log(`📊 Total restant: ${afterDelete.length} utilisateurs`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

cleanup();
