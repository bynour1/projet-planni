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

async function createAdmin() {
  try {
    const conn = await pool.getConnection();
    
    // Check if admin already exists
    const [existing] = await conn.query('SELECT * FROM users WHERE email = ?', ['admin@hopital.com']);
    
    if (existing.length > 0) {
      console.log('✅ Admin already exists');
      console.log('Email:', existing[0].email);
      console.log('Role:', existing[0].role);
      console.log('ID:', existing[0].id);
      await conn.end();
      return;
    }
    
    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await conn.query(
      'INSERT INTO users (email, password, nom, prenom, role, isConfirmed, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['admin@hopital.com', hashedPassword, 'Admin', 'Test', 'admin', 1, 0]
    );
    
    console.log('✅ Admin créé avec succès!');
    console.log('Email: admin@hopital.com');
    console.log('Mot de passe: admin123');
    console.log('Role: admin');
    
    await conn.end();
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  process.exit(0);
}

createAdmin();
