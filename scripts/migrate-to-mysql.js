const path = require('path');
const fs = require('fs').promises;
const db = require('../db/database');

async function migrate() {
  try {
    console.log('Starting migration from data/ to MySQL (if enabled)...');

    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const codesPath = path.join(process.cwd(), 'data', 'codes.json');

    let users = [];
    try {
      const c = await fs.readFile(usersPath, 'utf8');
      users = JSON.parse(c || '[]');
    } catch (err) {
      console.warn('No users.json found or invalid JSON, skipping users migration');
    }

    let codes = {};
    try {
      const c = await fs.readFile(codesPath, 'utf8');
      codes = JSON.parse(c || '{}');
    } catch (err) {
      console.warn('No codes.json found or invalid JSON, skipping codes migration');
    }

    // Migrate users
    for (const u of users) {
      try {
        const email = u.email;
        if (!email) continue;
        // If password exists and is hashed, use createOrUpdateUser to set isConfirmed
        if (u.password) {
          await db.createOrUpdateUser({ email, password: u.password, nom: u.nom || '', prenom: u.prenom || '', role: u.role || 'medecin' });
          console.log('Migrated user (createOrUpdate):', email);
        } else {
          // add as invited (isConfirmed false)
          const added = await db.addUser({ email, nom: u.nom || '', prenom: u.prenom || '', role: u.role || 'medecin' });
          console.log('Migrated user (addUser):', email, '->', added);
        }
      } catch (err) {
        console.error('Error migrating user', u && u.email, err && err.message);
      }
    }

    // Migrate codes
    for (const [email, code] of Object.entries(codes || {})) {
      try {
        await db.saveCode(email, String(code));
        console.log('Migrated code for', email);
      } catch (err) {
        console.error('Error migrating code for', email, err && err.message);
      }
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

migrate();
