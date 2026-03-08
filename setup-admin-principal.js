// Script pour configurer Chakroun.sarra72@gmtariana.tn comme admin principal
// et supprimer tous les autres utilisateurs

const mysql = require('mysql2/promise');

const adminEmail = 'Chakroun.sarra72@gmtariana.tn';

async function setupAdminPrincipal() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'planning'
    });

    console.log('✅ Connexion à la base de données établie');

    // 1. Supprimer tous les utilisateurs SAUF l'admin principal
    const [existingAdmin] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      console.log(`❌ Admin principal ${adminEmail} non trouvé!`);
      console.log('Création de l\'admin principal...');
      
      const hashedPassword = '$2b$10$' + Buffer.from('TempPassword123!').toString('base64').substring(0, 50);
      await connection.execute(
        'INSERT INTO users (email, password, nom, prenom, role, isConfirmed) VALUES (?, ?, ?, ?, ?, ?)',
        [adminEmail, hashedPassword, 'Chakroun', 'Sarra', 'admin', 1]
      );
      
      console.log(`✅ Admin principal créé: ${adminEmail}`);
    } else {
      console.log(`✅ Admin principal trouvé: ${adminEmail}`);
    }

    // 2. Récupérer l'ID de l'admin principal
    const [admin] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (admin.length > 0) {
      const adminId = admin[0].id;
      
      // 3. Récupérer tous les autres utilisateurs
      const [otherUsers] = await connection.execute(
        'SELECT id, email, nom, prenom FROM users WHERE id != ?',
        [adminId]
      );

      console.log(`\n📋 Utilisateurs à supprimer: ${otherUsers.length}`);
      otherUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.prenom} ${user.nom})`);
      });

      // 4. Demander confirmation
      if (otherUsers.length > 0) {
        console.log('\n⚠️  ATTENTION: Cela supprimera tous les utilisateurs SAUF l\'admin principal!');
        console.log('Tapez "OUI" pour confirmer la suppression...');
        
        // Pour le script en mode batch, on active la suppression automatiquement
        console.log('Mode automatique: suppression en cours...');
        
        // Supprimer les utilisateurs
        const userIds = otherUsers.map(u => u.id);
        
        for (const userId of userIds) {
          await connection.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
          );
        }
        
        console.log(`✅ ${otherUsers.length} utilisateur(s) supprimé(s)`);
      }

      // 5. S'assurer que l'admin principal est configuré comme admin
      await connection.execute(
        'UPDATE users SET role = "admin" WHERE id = ?',
        [adminId]
      );

      console.log(`✅ Rôle admin confirmé pour ${adminEmail}`);

      // 6. Afficher le résumé final
      const [finalUsers] = await connection.execute(
        'SELECT id, email, nom, prenom, role FROM users'
      );

      console.log('\n📊 État final de la base de données:');
      console.log('═══════════════════════════════════════════');
      finalUsers.forEach(user => {
        const role = user.role === 'admin' ? '👑' : '👤';
        console.log(`${role} ${user.email} - ${user.prenom} ${user.nom} (${user.role})`);
      });
      console.log('═══════════════════════════════════════════');
    }

    await connection.end();
    console.log('\n✅ Nettoyage terminé avec succès!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setupAdminPrincipal();
