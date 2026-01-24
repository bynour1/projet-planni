const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'planning'
});

(async () => {
  try {
    const conn = await pool.getConnection();
    
    // Supprimer tous les comptes non confirmés
    const [result] = await conn.execute('DELETE FROM users WHERE isConfirmed = 0');
    console.log('Comptes non confirmés supprimés:', result.affectedRows);
    
    // Supprimer le compte médecin en test (ID 44)
    const [result2] = await conn.execute('DELETE FROM users WHERE id = 44');
    console.log('Compte ID 44 supprimé:', result2.affectedRows);
    
    // Afficher les comptes restants
    const [users] = await conn.execute('SELECT id, nom, prenom, email, role, isConfirmed, password FROM users ORDER BY id');
    console.log('\nComptes actifs:');
    users.forEach(u => {
      console.log(`ID ${u.id}: ${u.nom} ${u.prenom} (${u.email}) - ${u.role} - Confirmed: ${u.isConfirmed} - Password: ${u.password ? 'SET' : 'NULL'}`);
    });
    
    await conn.end();
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
})();
