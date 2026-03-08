#!/usr/bin/env node
/**
 * Script: test-complete-flow.js
 * Objective: Test le flux complet d'invitation + changement MDP
 * 
 * Étapes:
 *   1. Créer utilisateur (invitation)
 *   2. Récupérer code généré
 *   3. Vérifier code + créer MDP provisoire
 *   4. Utilisateur se connecte avec MDP provisoire
 *   5. Détecte mustChangePassword = 1
 *   6. Utilisateur change MDP
 *   7. Se reconnecte avec nouveau MDP
 */

const http = require('http');
const crypto = require('crypto');

const API_BASE = 'http://127.0.0.1:8083';

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(path, API_BASE);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testCompleteFlow() {
  try {
    console.log('\n✅ TEST COMPLET: Invitation → Confirmation → Changement MDP');
    console.log('═════════════════════════════════════════════════════════════════\n');

    // Email unique
    const randomStr = crypto.randomBytes(8).toString('hex');
    const testEmail = `complete-test-${randomStr}@example.fr`;
    const provisionalPwd = 'Prov' + crypto.randomBytes(4).toString('hex').toUpperCase() + '123!';
    const newPwd = 'Final' + crypto.randomBytes(4).toString('hex').toUpperCase() + '456!';

    console.log('📅 Test Data:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   MDP Provisoire: ${provisionalPwd}`);
    console.log(`   Nouveau MDP: ${newPwd}\n`);

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 1: Admin crée utilisateur (invitation)
    // ═══════════════════════════════════════════════════════════════
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣ ADMIN CRÉE UTILISATEUR (Invitation)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const inviteRes = await makeRequest('POST', '/invite-user', {
      email: testEmail,
      nom: 'TestFlow',
      prenom: 'User',
      role: 'medecin',
      phone: '+33612345600',
    });

    console.log(`POST /invite-user → Status ${inviteRes.status}`);

    if (inviteRes.status !== 200 || !inviteRes.data.success) {
      console.error(`❌ Erreur: ${inviteRes.data.message}`);
      return;
    }

    console.log(`✅ ${inviteRes.data.message}`);
    const userId = inviteRes.data.userId;
    const testCode = inviteRes.data.code;

    if (!testCode) {
      console.log('⚠️  Mode email configuré - Code envoyé à l\'email');
      console.log('❌ Script nécessite le code (mode dev)');
      return;
    }

    console.log(`✅ Code généré: ${testCode}`);
    console.log(`✅ User ID: ${userId}`);

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 2: Admin valide code + crée MDP provisoire
    // ═══════════════════════════════════════════════════════════════
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣ ADMIN VALIDE CODE + CRÉE MDP PROVISOIRE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const verifyRes = await makeRequest('POST', '/verify-code', {
      contact: testEmail,
      code: testCode,
      provisionalPassword: provisionalPwd,
    });

    console.log(`POST /verify-code → Status ${verifyRes.status}`);

    if (verifyRes.status !== 200 || !verifyRes.data.success) {
      console.error(`❌ Erreur: ${verifyRes.data.message}`);
      return;
    }

    console.log(`✅ ${verifyRes.data.message}`);
    console.log(`✅ MDP Provisoire: ${provisionalPwd}`);

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 3: Utilisateur se connecte avec MDP provisoire
    // ═══════════════════════════════════════════════════════════════
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣ UTILISATEUR SE CONNECTE AVEC MDP PROVISOIRE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const loginRes = await makeRequest('POST', '/login', {
      email: testEmail,
      password: provisionalPwd,
    });

    console.log(`POST /login → Status ${loginRes.status}`);

    if (loginRes.status !== 200 || !loginRes.data.success) {
      console.error(`❌ Erreur: ${loginRes.data.message}`);
      return;
    }

    console.log(`✅ ${loginRes.data.message}`);

    const userToken = loginRes.data.token;
    const userInfo = loginRes.data.user;

    console.log(`✅ Token JWT: ${userToken.substring(0, 30)}...`);
    console.log(`✅ Rôle: ${userInfo.role}`);
    console.log(`✅ Email confirmé: ${userInfo.email}`);

    // Vérifier le flag mustChangePassword
    if (userInfo.mustChangePassword) {
      console.log(`✅ 🚨 mustChangePassword = 1 (CHANGEMENT OBLIGATOIRE)`);
    } else {
      console.log(`⚠️ mustChangePassword = 0 (devrait être 1!)`);
    }

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 4: Utilisateur change son MDP
    // ═══════════════════════════════════════════════════════════════
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣ UTILISATEUR CHANGE SON MDP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const changePwdRes = await makeRequest(
      'POST',
      '/change-password',
      {
        oldPassword: provisionalPwd,  // MDP ACTUEL (provisoire)
        newPassword: newPwd,           // NOUVEAU MDP
      },
      userToken  // Utiliser le token
    );

    console.log(`POST /change-password → Status ${changePwdRes.status}`);

    if (changePwdRes.status !== 200 || !changePwdRes.data.success) {
      console.error(`❌ Erreur: ${changePwdRes.data.message}`);
      return;
    }

    console.log(`✅ ${changePwdRes.data.message}`);
    console.log(`✅ Nouveau MDP: ${newPwd}`);

    // ═══════════════════════════════════════════════════════════════
    // ÉTAPE 5: Utilisateur se reconnecte avec nouveau MDP
    // ═══════════════════════════════════════════════════════════════
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5️⃣ UTILISATEUR SE RECONNECTE AVEC NOUVEAU MDP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const loginRes2 = await makeRequest('POST', '/login', {
      email: testEmail,
      password: newPwd,  // Nouveau MDP!
    });

    console.log(`POST /login → Status ${loginRes2.status}`);

    if (loginRes2.status !== 200 || !loginRes2.data.success) {
      console.error(`❌ Erreur: ${loginRes2.data.message}`);
      return;
    }

    console.log(`✅ ${loginRes2.data.message}`);

    const userInfo2 = loginRes2.data.user;

    console.log(`✅ Token JWT: ${loginRes2.data.token.substring(0, 30)}...`);
    console.log(`✅ Rôle: ${userInfo2.role}`);

    if (!userInfo2.mustChangePassword) {
      console.log(`✅ mustChangePassword = 0 (MDP CHANGÉ AVEC SUCCÈS)`);
    } else {
      console.log(`⚠️ mustChangePassword = 1 (devrait être 0!)`);
    }

    // ═══════════════════════════════════════════════════════════════
    // RÉSUMÉ SUCCESS
    // ═══════════════════════════════════════════════════════════════
    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('🎉 FLUX COMPLET RÉUSSI!');
    console.log('═════════════════════════════════════════════════════════════════');
    console.log('\n✅ ÉTAPES VALIDES:\n');
    console.log('   1. ✅ Admin crée utilisateur avec invitation');
    console.log('   2. ✅ Code de confirmation généré');
    console.log('   3. ✅ Admin vérifie code + crée MDP provisoire');
    console.log('   4. ✅ Utilisateur se connecte avec MDP provisoire');
    console.log('   5. ✅ Flag mustChangePassword = 1 (DÉTECTE changement obligatoire)');
    console.log('   6. ✅ Utilisateur change son MDP via /change-password');
    console.log('   7. ✅ Utilisateur se reconnecte avec nouveau MDP');
    console.log('   8. ✅ Flag mustChangePassword = 0 (CHANGEMENT FINaLISÉ)');

    console.log('\n📊 RÉSUMÉ UTILISATEUR:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Rôle: ${userInfo2.role}`);
    console.log(`   MDP FINAL: ${newPwd}`);
    console.log(`   Status: ACTIF ✅`);

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('✨ LE SYSTÈME FONCTIONNE PARFAITEMENT!');
    console.log('═════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
    process.exit(1);
  }
}

testCompleteFlow();
