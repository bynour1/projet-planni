// Quick test script - Run with: node scripts/quick-test.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

async function testDB() {
  console.log('\n🔍 Testing database connection...\n');

  try {
    // Wait for DB init
    await db.waitForInit();
    console.log('✅ Database connected successfully!\n');

    // Get all users
    const users = await db.getUsers();
    console.log('📋 Current users in database:');
    console.log('─'.repeat(50));
    if (users.length === 0) {
      console.log('   (No users found)');
    } else {
      users.forEach(u => {
        console.log(`   ID: ${u.id} | ${u.prenom} ${u.nom} | ${u.email} | Role: ${u.role}`);
      });
    }
    console.log('─'.repeat(50));

    // Create admin if not exists
    const adminEmail = 'admin@gmt.com';
    const adminExists = users.find(u => u.email === adminEmail);
    
    if (!adminExists) {
      console.log('\n👤 Creating admin user...');
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.createOrUpdateUser({
        email: adminEmail,
        phone: '0612345678',
        password: hashedPassword,
        nom: 'Admin',
        prenom: 'Super',
        role: 'admin'
      });
      console.log('✅ Admin user created!');
    } else {
      console.log('\n👤 Admin user already exists');
    }

    // Verify admin login
    console.log('\n🔐 Testing admin login...');
    const admin = await db.findUserByEmail(adminEmail);
    if (admin) {
      const passwordMatch = await bcrypt.compare('admin123', admin.password);
      console.log('   Password match:', passwordMatch ? '✅ YES' : '❌ NO');
    }

    console.log('\n✅ Test complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@gmt.com');
    console.log('   Password: admin123');
    console.log('   URL: http://localhost:8082/login\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  process.exit(0);
}

testDB();

