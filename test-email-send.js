require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n=== TEST D\'ENVOI D\'EMAIL ===\n');
console.log('Configuration chargée:');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'NON DÉFINI');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Vérifier la connexion
console.log('\n📧 Vérification de la connexion...\n');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ ERREUR DE CONNEXION:', error.message);
    console.error('\nSolutions:');
    console.error('1. Gmail: Allez sur https://myaccount.google.com/apppasswords');
    console.error('2. Créez un mot de passe d\'application (16 caractères)');
    console.error('3. Remplacez EMAIL_PASS dans .env par ce mot de passe');
    console.error('4. Redémarrez le serveur\n');
    process.exit(1);
  } else {
    console.log('✅ Connexion OK!\n');
    sendTestEmail();
  }
});

async function sendTestEmail() {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: 'test.planningmedical@gmail.com',
    subject: '✅ TEST D\'EMAIL - Planning Medical',
    html: `
      <h2>Ceci est un EMAIL DE TEST</h2>
      <p>Si vous recevez cet email, c'est que l'envoi fonctionne! 🎉</p>
      <p>Code de test: 123456</p>
    `
  };

  try {
    console.log('📧 Envoi d\'un email de test...\n');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS!');
    console.log('Message ID:', result.messageId);
    console.log('\nVérifiez votre inbox: test.planningmedical@gmail.com\n');
  } catch (error) {
    console.error('❌ ERREUR D\'ENVOI:', error.message);
    if (error.message.includes('Invalid login')) {
      console.error('\n⚠️  Problème d\'authentification Gmail!');
      console.error('Solutions:');
      console.error('1. Le mot de passe d\'application est incorrect');
      console.error('2. Vérifiez que Gmail a "Validation en 2 étapes" activée');
      console.error('3. Régénérez le mot de passe d\'application');
    }
  }
  process.exit(0);
}
