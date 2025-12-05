// Script de test pour la configuration email
// Usage: node test-email.js votre.email@gmail.com

const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = process.argv[2];

if (!testEmail) {
  console.error('\n❌ Usage: node test-email.js votre.email@test.com\n');
  process.exit(1);
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  📧 TEST DE CONFIGURATION EMAIL               ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Afficher la configuration actuelle
console.log('📋 Configuration détectée:');
if (process.env.EMAIL_SERVICE) {
  console.log(`   Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Pass: ${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NON CONFIGURÉ'}`);
} else if (process.env.SMTP_HOST) {
  console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`   SMTP User: ${process.env.SMTP_USER}`);
} else {
  console.log('   ❌ AUCUNE CONFIGURATION TROUVÉE\n');
  console.log('💡 Modifiez le fichier .env pour configurer l\'envoi d\'emails\n');
  process.exit(1);
}

// Créer le transporter
const opts = {};
if (process.env.EMAIL_SERVICE) {
  opts.service = process.env.EMAIL_SERVICE;
} else if (process.env.SMTP_HOST) {
  opts.host = process.env.SMTP_HOST;
  opts.port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  opts.secure = process.env.SMTP_SECURE === 'true';
}

if (process.env.EMAIL_USER || process.env.SMTP_USER) {
  opts.auth = {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
  };
}

const transporter = nodemailer.createTransport(opts);

// Test de connexion
console.log('\n🔍 Test de connexion SMTP...');
transporter.verify(function(error, success) {
  if (error) {
    console.error('\n❌ ERREUR DE CONNEXION:');
    console.error('   ', error.message);
    console.error('\n💡 SOLUTIONS POSSIBLES:');
    console.error('   1. Vérifiez vos identifiants dans .env');
    console.error('   2. Pour Gmail: utilisez un mot de passe d\'application');
    console.error('      https://myaccount.google.com/apppasswords');
    console.error('   3. Vérifiez que la validation en 2 étapes est activée (Gmail)');
    console.error('   4. Consultez GUIDE_EMAIL_COMPLET.md pour plus d\'aide\n');
    process.exit(1);
  } else {
    console.log('✅ Connexion SMTP réussie!\n');
    
    // Envoyer un email de test
    console.log(`📧 Envoi d'un email de test à ${testEmail}...`);
    
    const from = process.env.EMAIL_FROM || opts.auth.user;
    
    const mailOptions = {
      from: from,
      to: testEmail,
      subject: '✅ Test Email - Planning Médical',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Configuration Email Réussie!</h1>
            </div>
            <div class="content">
              <div class="success">
                <strong>🎉 Félicitations!</strong><br>
                Votre configuration email fonctionne parfaitement.
              </div>
              
              <p><strong>Informations du test:</strong></p>
              <ul>
                <li>Service: ${process.env.EMAIL_SERVICE || process.env.SMTP_HOST}</li>
                <li>Expéditeur: ${from}</li>
                <li>Date: ${new Date().toLocaleString('fr-FR')}</li>
              </ul>
              
              <div class="info">
                <strong>📝 Prochaines étapes:</strong><br>
                Votre application Planning Médical peut maintenant envoyer:
                <ul>
                  <li>✅ Codes de confirmation pour nouveaux utilisateurs</li>
                  <li>✅ Codes de réinitialisation de mot de passe</li>
                  <li>✅ Notifications importantes</li>
                </ul>
              </div>
              
              <p><small>Si vous recevez cet email, votre configuration est correcte. Vous pouvez ignorer ce message de test.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    transporter.sendMail(mailOptions, function(err, info) {
      if (err) {
        console.error('\n❌ ERREUR lors de l\'envoi:');
        console.error('   ', err.message);
        process.exit(1);
      } else {
        console.log('\n✅ EMAIL ENVOYÉ AVEC SUCCÈS!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Destinataire: ${testEmail}`);
        console.log('\n💡 Vérifiez votre boîte mail (et les spams)');
        console.log('   Si vous recevez l\'email, la configuration est parfaite!\n');
      }
    });
  }
});
