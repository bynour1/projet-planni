#!/usr/bin/env node
// Usage: node scripts/set-password.js email@example.com "NewPassword"
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

async function main() {
  const [,, email, pass] = process.argv;
  if (!email || !pass) {
    console.error('Usage: node scripts/set-password.js <email> <password>');
    process.exit(1);
  }

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(pass, saltRounds);
    console.log('Hash computed, updating DB...');
    await db.updateUserPassword(email, hash);
    console.log(`✅ Mot de passe mis à jour pour ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du mot de passe:', err.message || err);
    process.exit(2);
  }
}

main();
