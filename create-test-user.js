const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'planning',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function createTestUser() {
  try {
    const conn = await pool.getConnection();
    
    const hashedPassword = await bcrypt.hash('test123', 10);
    const [result] = await conn.query(
      'INSERT INTO users (email, password, nom, prenom, role, isConfirmed, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['test@example.com', hashedPassword, 'Test', 'User', 'medecin', 1, 0]
    );
    
    console.log('✅ Utilisateur créé!');
    console.log('ID:', result.insertId);
    console.log('Email: test@example.com');
    console.log('Role: medecin');
    
    await conn.release();
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  process.exit(0);
}

createTestUser();
