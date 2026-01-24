liaison avec la database// Quick script to create admin user - Run with: node scripts/create-quick-admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

async function createQuickAdmin() {
  console.log('\n🔐 Creating admin user\n');

  try {
    await db.waitForInit();
    console.log('✅ Database connected\n');

    const email = 'admin@gmt.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.createOrUpdateUser({
      email: email,
      phone: '0612345678',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Super',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n🌐 URL: http://localhost:8082/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

createQuickAdmin();

