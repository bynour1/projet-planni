require('dotenv').config();
const http = require('http');

const API_BASE = 'http://localhost:8083';

function postRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 8083,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    console.log('\n📧 === TEST ACCOUNT ACTIVATION ===\n');
    
    // 1. Create user via /invite-user
    console.log('1️⃣ Creating user...');
    const inviteData = await postRequest('/invite-user', {
      email: 'test.activation@example.com',
      nom: 'TestActivation',
      prenom: 'User',
      role: 'medecin'
    });
    
    console.log('Response:', JSON.stringify(inviteData, null, 2));
    
    if (!inviteData.success) {
      console.error('❌ Failed to create user');
      process.exit(1);
    }
    
    const { code } = inviteData;
    console.log(`\n2️⃣ Generated code: ${code}`);
    
    // 2. Check user is unconfirmed
    const db = require('./db/database');
    let user = await db.findUserByContact('test.activation@example.com');
    console.log(`3️⃣ After creation - isConfirmed=${user.isConfirmed} (should be 0) ${user.isConfirmed === 0 ? '✅' : '❌'}`);
    
    // 3. Verify code and set provisional password
    console.log(`\n4️⃣ Verifying code and setting password...`);
    const verifyData = await postRequest('/verify-code', {
      contact: 'test.activation@example.com',
      code: code,
      provisionalPassword: 'TestPass123'
    });
    
    console.log('Response:', JSON.stringify(verifyData, null, 2));
    
    // 4. Check user is now confirmed
    user = await db.findUserByContact('test.activation@example.com');
    console.log(`\n5️⃣ After confirmation:`);
    console.log(`   - isConfirmed=${user.isConfirmed} (should be 1) ${user.isConfirmed === 1 ? '✅' : '❌'}`);
    console.log(`   - hasPassword=${!!user.password} ${user.password ? '✅' : '❌'}`);
    console.log(`   - mustChangePassword=${user.mustChangePassword}`);
    
    if (user.isConfirmed === 1 && user.password) {
      console.log('\n✅✅✅ SUCCESS! Account activation working!\n');
      process.exit(0);
    } else {
      console.log('\n❌ FAIL! Account activation failed\n');
      process.exit(1);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
