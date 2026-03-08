const mysql = require('mysql2/promise');
require('dotenv').config();

async function keepOnlyAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'planning'
  });

  try {
    console.log('🧹 Nettoyage de la base de données...');
    console.log('');

    // 1. Supprimer tous les utilisateurs sauf l'admin
    const adminEmail = 'Chakroun.sarra72@gmtariana.tn';
    const result1 = await connection.execute(
      'DELETE FROM users WHERE email != ?',
      [adminEmail]
    );
    console.log(`✅ Utilisateurs autres supprimés: ${result1[0].affectedRows} lignes`);

    // 2. Supprimer tous les codes
    const result2 = await connection.execute('DELETE FROM codes');
    console.log(`✅ Tous les codes supprimés: ${result2[0].affectedRows} lignes`);

    console.log('');
    console.log('📊 État final de la BD:');
    
    // Vérifier les utilisateurs
    const [users] = await connection.execute('SELECT id, email, role, isConfirmed FROM users');
    console.log(`✅ Utilisateurs restants: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) ${u.isConfirmed ? '✅ Confirmé' : '❌ Non confirmé'}`);
    });

    // Vérifier les codes
    const [codes] = await connection.execute('SELECT COUNT(*) as count FROM codes');
    console.log(`✅ Codes: ${codes[0].count}`);

    console.log('');
    console.log('✅ Base de données nettoyée avec succès!');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await connection.end();
  }
}

keepOnlyAdmin();
