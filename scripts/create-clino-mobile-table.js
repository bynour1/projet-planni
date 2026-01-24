 // Script Node.js pour créer la table clino_mobile dans la base de données MySQL
const mysql = require('mysql2/promise');

async function createClinoMobileTable() {
  let connection;
  try {
    // Connexion à MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning',
      multipleStatements: true
    });

    console.log('✅ Connexion MySQL établie');

    // Création de la table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS clino_mobile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        heure TIME NOT NULL,
        adresse VARCHAR(255) NOT NULL,
        medecin VARCHAR(100) NOT NULL,
        commentaire TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Table clino_mobile créée avec succès');

    // Création des index
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_clino_mobile_date ON clino_mobile(date);
      CREATE INDEX IF NOT EXISTS idx_clino_mobile_medecin ON clino_mobile(medecin);
    `;

    try {
      await connection.execute(createIndexesSQL);
      console.log('✅ Index créés avec succès');
    } catch (indexError) {
      // Les index peuvent déjà exister, c'est ok
      console.log('⚠️  Index ignorés (peut-être déjà existants)');
    }

    console.log('\n🎉 Table clino_mobile prête à être utilisée !');
    console.log('   Champs: id, date, heure, adresse, medecin, commentaire');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createClinoMobileTable();
}

module.exports = { createClinoMobileTable };

