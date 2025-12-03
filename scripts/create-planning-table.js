/* eslint-env node */
// Script to create the planning table in MySQL database
require('dotenv').config();
const path = require('path');
const db = require(path.join(__dirname, '..', 'db', 'database'));

async function createPlanningTable() {
  try {
    await db.waitForInit();
    console.log('✅ Database connection ready');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS planning (
        id INT NOT NULL AUTO_INCREMENT,
        date VARCHAR(50) NOT NULL COMMENT 'Date key (e.g., "Lundi 13 Jan", "Mardi 14 Jan")',
        events TEXT NOT NULL COMMENT 'JSON array of events for this date',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores planning data with events grouped by date';
    `;
    
    // Execute the SQL using the db module's query function
    const mysql = require('mysql2/promise');
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning',
      waitForConnections: true,
      connectionLimit: 10
    });
    
    await pool.query(createTableSQL);
    console.log('✅ Table "planning" created successfully');
    
    // Test the table
    const [rows] = await pool.query('SHOW TABLES LIKE "planning"');
    if (rows.length > 0) {
      console.log('✅ Table verified: planning exists');
      
      // Show table structure
      const [structure] = await pool.query('DESCRIBE planning');
      console.log('\n📋 Table structure:');
      console.table(structure);
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  }
}

createPlanningTable();
