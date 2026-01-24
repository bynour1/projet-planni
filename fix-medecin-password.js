// Vérifier et définir un mot de passe pour le compte médecin
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkAndFix() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Vérifier le compte médecin
    console.log('📋 ÉTAT DU COMPTE MÉDECIN:\n');
    const [medecin] = await connection.query('SELECT id, nom, prenom, email, role, isConfirmed, password FROM users WHERE id = 44');
    
    if (medecin.length === 0) {
      console.log('❌ Compte médecin non trouvé (ID 44)');
      return;
    }

    const user = medecin[0];
    console.log(`ID: ${user.id}`);
    console.log(`Nom: ${user.nom} ${user.prenom}`);
    console.log(`Email: ${user.email}`);
    console.log(`Rôle: ${user.role}`);
    console.log(`Confirmé: ${user.isConfirmed ? 'OUI' : 'NON'}`);
    console.log(`Mot de passe: ${user.password ? 'DÉFINI' : 'ABSENT ❌'}\n`);

    if (!user.password) {
      console.log('⚠️  LE MOT DE PASSE N\'EST PAS DÉFINI!\n');
      console.log('🔧 DÉFINITION D\'UN MOT DE PASSE...\n');
      
      const password = 'medecin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.query('UPDATE users SET password = ? WHERE id = 44', [hashedPassword]);
      console.log('✅ Mot de passe défini: medecin123\n');
    }

    console.log('🔐 IDENTIFIANTS DE CONNEXION:\n');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Email: bynour70@gmail.com               │');
    console.log('│ Password: medecin123                     │');
    console.log('└─────────────────────────────────────────┘\n');
    
    console.log('🧪 Essayez de vous connecter maintenant!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

checkAndFix();
