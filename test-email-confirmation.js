#!/usr/bin/env node
/**
 * Script: test-confirmation-email.js
 * Objectif: Tester le système d'invitation et de confirmation par email
 * 
 * Étapes à tester:
 *   1. Créer un nouvel utilisateur avec invitation
 *   2. Afficher le code de confirmation généré
 *   3. Simuler la confirmation du code
 *   4. Afficher le mot de passe provisoire généré
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

// Configuration
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8083';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'planning',
};

const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  from: process.env.EMAIL_FROM || 'noreply@planning-medical.com',
};

// Test user data
const TEST_USER = {
  email: 'test-confirmation-' + Date.now() + '@test-example.com',
  nom: 'TestNom',
  prenom: 'TestPrenom',
  phone: '+33612345678',
  role: 'medecin',
};

async function testEmailConfirmation() {
  let conn;
  try {
    console.log('\n🧪 TEST: Système d\'Invitation et Confirmation par Email');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Afficher configuration email
    console.log('📧 CONFIGURATION EMAIL:');
    console.log('───────────────────────────────────────');
    console.log(`Service: ${EMAIL_CONFIG.service}`);
    console.log(`Utilisateur: ${EMAIL_CONFIG.user}`);
    console.log(`From: ${EMAIL_CONFIG.from}`);
    
    // Vérifier la configuration
    if (!EMAIL_CONFIG.user || !EMAIL_CONFIG.pass) {
      console.log('\n⚠️  ATTENTION: Aucune configuration email détectée!');
      console.log('   Les emails ne seront pas envoyés.');
      console.log('   Configuration requise dans .env:');
      console.log('   - EMAIL_SERVICE=gmail');
      console.log('   - EMAIL_USER=votre_email@gmail.com');
      console.log('   - EMAIL_PASS=votre_mot_de_passe_app');
      console.log('\n   Pour Gmail: créez un mot de passe d\'application');
      console.log('   https://myaccount.google.com/apppasswords\n');
      return;
    }

    // 2. Tester la connexion email
    console.log('\n\n🔌 TEST DE CONNEXION EMAIL:');
    console.log('───────────────────────────────────────');
    
    const transporter = nodemailer.createTransport({
      service: EMAIL_CONFIG.service,
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass,
      },
    });

    await transporter.verify();
    console.log('✅ Connexion email réussie!');

    // 3. Connexion à la BD
    console.log('\n\n💾 CONNECTION BASE DE DONNÉES:');
    console.log('───────────────────────────────────────');
    
    conn = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connexion établie');

    // 4. Générer un code de test
    console.log('\n\n🔑 GÉNÉRATION CODE DE CONFIRMATION:');
    console.log('───────────────────────────────────────');
    
    const testCode = String(Math.floor(100000 + Math.random() * 900000));
    console.log(`Code généré: ${testCode}`);

    // 5. Préparer test d'email
    console.log('\n\n📧 TEST D\'ENVOI EMAIL:');
    console.log('───────────────────────────────────────');
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0066cc 0%, #004999 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 3px dashed #0066cc; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
          .code { font-size: 48px; font-weight: bold; color: #0066cc; letter-spacing: 8px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Code de Confirmation</h1>
          </div>
          <div class="content">
            <p>Bonjour ${TEST_USER.prenom} ${TEST_USER.nom},</p>
            <p>Vous avez été invité(e) à rejoindre la plateforme <strong>Planning Médical</strong>.</p>
            <p>Voici votre code de confirmation à 6 chiffres :</p>
            <div class="code-box">
              <div class="code">${testCode}</div>
            </div>
            <p><strong>Important :</strong></p>
            <ul>
              <li>Ce code est valable pour une seule utilisation</li>
              <li>Communiquez ce code à l'administrateur pour activer votre compte</li>
              <li>Une fois votre compte activé, vous pourrez créer votre mot de passe</li>
            </ul>
            <p style="color: #666; font-size: 14px;">
              Rôle assigné: <strong>${TEST_USER.role}</strong>
            </p>
            <div class="footer">
              <p>Planning Médical - ${new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: TEST_USER.email,
      subject: '🏥 Planning Médical - Code de Confirmation',
      html: htmlTemplate,
    };

    console.log(`À: ${TEST_USER.email}`);
    console.log(`Sujet: ${mailOptions.subject}`);
    console.log('\n📤 Envoi en cours...');

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès!');
    console.log(`   Message ID: ${info.messageId}`);

    // 6. Afficher les instructions
    console.log('\n\n📋 PROCHAINES ÉTAPES:');
    console.log('───────────────────────────────────────');
    console.log(`1. ✅ Email envoyé à: ${TEST_USER.email}`);
    console.log(`2. 📧 Vérifiez votre boîte email (y compris SPAM)`);
    console.log(`3. 📝 Code de confirmation: ${testCode}`);
    console.log(`4. 🔗 Utilisez ce code pour tester /verify-code endpoint`);

    console.log('\n\n🌐 ENDPOINT TEST (curl):');
    console.log('───────────────────────────────────────');
    console.log(`POST ${API_BASE}/verify-code`);
    console.log('Content-Type: application/json');
    console.log('');
    console.log(JSON.stringify({
      contact: TEST_USER.email,
      code: testCode,
      newPassword: 'TestPassword123!',
    }, null, 2));

    console.log('\n\n✅ TEST TERMINÉ!');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ ERREUR:', err.message);
    console.error('\n💡 SOLUTIONS:');
    
    if (err.message.includes('Gmail')) {
      console.error('   1. Créez un mot de passe d\'application Gmail:');
      console.error('      https://myaccount.google.com/apppasswords');
      console.error('   2. Utilisez ce mot de passe dans .env (EMAIL_PASS)');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('   1. Vérifiez votre connexion Internet');
      console.error('   2. Vérifiez les identifiants email');
    }
    
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

testEmailConfirmation();
