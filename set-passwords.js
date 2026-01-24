// Définir des mots de passe pour les comptes créés via le formulaire
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setPasswords() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning'
    });

    console.log('✅ Connecté à la base de données\n');

    // Les mots de passe à définir pour chaque compte
    const passwordUpdates = [
      {
        id: 41,
        email: 'bynour70@gmail.com',
        password: 'medecin123',
        role: 'Médecin'
      },
      {
        id: 42,
        email: 'jalila.benyoussef@esprit.tn',
        password: 'technicien123',
        role: 'Technicien'
      }
    ];

    console.log('🔐 DÉFINITION DES MOTS DE PASSE...\n');

    for (const update of passwordUpdates) {
      const hashedPassword = await bcrypt.hash(update.password, 10);
      
      const [result] = await connection.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, update.id]
      );

      console.log(`✅ [${update.role}] ${update.email}`);
      console.log(`   Password défini: ${update.password}`);
    }

    console.log('\n📋 COMPTES DISPONIBLES POUR LA CONNEXION:\n');
    console.log('┌────────────────────────────────────────────────────────────────┐');
    console.log('│              IDENTIFIANTS DE CONNEXION DISPONIBLES             │');
    console.log('├────────────────────────────────────────────────────────────────┤');
    
    // Admin
    console.log('│ 👑 ADMINISTRATEUR                                              │');
    console.log('│ Email: admin@hopital.com                                        │');
    console.log('│ Password: Admin123!                                             │');
    console.log('├────────────────────────────────────────────────────────────────┤');
    
    // Médecin
    console.log('│ 👨‍⚕️ MÉDECIN                                                      │');
    console.log('│ Email: bynour70@gmail.com                                       │');
    console.log('│ Password: medecin123                                            │');
    console.log('├────────────────────────────────────────────────────────────────┤');
    
    // Technicien
    console.log('│ 🔧 TECHNICIEN                                                   │');
    console.log('│ Email: jalila.benyoussef@esprit.tn                              │');
    console.log('│ Password: technicien123                                         │');
    console.log('└────────────────────────────────────────────────────────────────┘');

    console.log('\n✅ Mots de passe définis avec succès!');
    console.log('🔗 Vous pouvez maintenant vous connecter à: http://localhost:8083/login');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

setPasswords();
