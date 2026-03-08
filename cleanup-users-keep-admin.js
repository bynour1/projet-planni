const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function cleanupAndKeepAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'planning'
  });

  try {
    console.log('🧹 Nettoyage de la base de données...');
    console.log('');

    // 1. Supprimer tous les utilisateurs
    const result1 = await connection.execute('DELETE FROM users');
    console.log(`✅ Tous les utilisateurs supprimés (${result1[0].affectedRows} lignes)`);

    // 2. Supprimer tous les codes
    const result2 = await connection.execute('DELETE FROM codes');
    console.log(`✅ Tous les codes supprimés (${result2[0].affectedRows} lignes)`);

    // 3. Créer l'admin
    const adminEmail = 'Chakroun.sarra72@gmtariana.tn';
    const adminPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result3 = await connection.execute(
      'INSERT INTO users (email, password, nom, prenom, role, isConfirmed, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [adminEmail, hashedPassword, 'Chakroun', 'Sarra', 'admin', 1, 0]
    );

    console.log(`✅ Admin créé: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
    console.log('');
    console.log('📊 État final de la BD:');
    
    // Vérifier les utilisateurs
    const [users] = await connection.execute('SELECT id, email, role, isConfirmed FROM users');
    console.log(`✅ Utilisateurs: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) ${u.isConfirmed ? '✅ Confirmé' : '❌ Non confirmé'}`);
    });

    // Vérifier les codes
    const [codes] = await connection.execute('SELECT COUNT(*) as count FROM codes');
    console.log(`✅ Codes: ${codes[0].count}`);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await connection.end();
  }
}

cleanupAndKeepAdmin();
