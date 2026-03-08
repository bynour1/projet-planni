require('dotenv').config();
const db = require('./db/database');

(async () => {
  try {
    console.log('\n📋 === DATABASE STATE CHECK ===\n');
    
    // Get current users
    const users = await db.getUsers();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      const confirmed = u.isConfirmed ? '✅ CONFIRMED' : '❌ UNCONFIRMED';
      console.log(`  - ${u.nom} ${u.prenom} (${u.email}) [${confirmed}]`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
