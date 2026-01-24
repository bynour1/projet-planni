const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'planning'
  });

  const [rows] = await conn.execute('SELECT id, email, nom, prenom, role, isConfirmed, password FROM users ORDER BY id');
  
  console.log('\n📋 UTILISATEURS ACTUELS:');
  console.log('═══════════════════════════════════════════════════════════════');
  
  rows.forEach(u => {
    const status = u.isConfirmed ? '✅ Confirmé' : '⏳ En attente';
    const hasPassword = u.password && u.password.length > 0 ? '✅ OUI' : '❌ NON';
    console.log(`\n${u.id}. ${u.email}`);
    console.log(`   Nom: ${u.prenom} ${u.nom}`);
    console.log(`   Rôle: ${u.role}`);
    console.log(`   Statut: ${status}`);
    console.log(`   Mot de passe: ${hasPassword}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
  
  await conn.end();
})();
