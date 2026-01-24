const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'planning'
  });

  // Supprimer les utilisateurs statiques de test
  const result = await conn.execute('DELETE FROM users WHERE id IN (8, 9, 20)');
  console.log('✅ Utilisateurs statiques supprimés:', result[0].affectedRows);

  // Afficher les utilisateurs restants
  const [remaining] = await conn.execute('SELECT id, email, nom, prenom, role, isConfirmed FROM users ORDER BY id');
  console.log('\n📋 UTILISATEURS RESTANTS:');
  remaining.forEach(u => {
    const status = u.isConfirmed ? '✅ Confirmé' : '⏳ Non confirmé';
    console.log(`  ${u.id}. ${u.email} - ${u.prenom} ${u.nom} (${u.role}) - ${status}`);
  });

  await conn.end();
})();
