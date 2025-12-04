const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testLogin() {
  try {
    // Connexion MySQL
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'planning'
    });
    
    console.log('✅ MySQL connecté');
    
    // Récupérer l'utilisateur
    const [rows] = await connection.execute(
      'SELECT id, email, phone, password, nom, prenom, role, isConfirmed, mustChangePassword FROM users WHERE email = ?',
      ['Chakroun.sarra72@gmtariana.tn']
    );
    
    if (rows.length === 0) {
      console.log('❌ Utilisateur non trouvé');
      await connection.end();
      return;
    }
    
    const user = rows[0];
    console.log('\n✅ Utilisateur trouvé:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nom: ${user.prenom} ${user.nom}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   isConfirmed: ${user.isConfirmed}`);
    console.log(`   mustChangePassword: ${user.mustChangePassword}`);
    
    // Tester le mot de passe
    const password = 'Sarra123.';
    console.log(`\n🔐 Test du mot de passe: "${password}"`);
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (passwordMatch) {
      console.log('✅ Mot de passe correct!');
    } else {
      console.log('❌ Mot de passe incorrect');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  }
}

testLogin();
