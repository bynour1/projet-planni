require('dotenv').config();

(async()=>{
  try {
    const db = require('../db/database');
    await db.waitForInit();
    console.log('DB ready, fetching users...');
    const users = await db.getUsers();
    console.log('Users count:', users.length);
    console.log(users.slice(0,10));
    process.exit(0);
  } catch (err) {
    console.error('DB-check error:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
