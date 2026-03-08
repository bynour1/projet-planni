const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const code = Math.floor(100000 + Math.random() * 900000);
const recipientEmail = 'bynour70@gmail.com';

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; background: #f9f9f9; }
    .code-box { 
      border: 2px dashed #667eea; 
      padding: 20px; 
      text-align: center; 
      font-size: 32px; 
      font-weight: bold; 
      color: #667eea;
      letter-spacing: 5px;
      margin: 20px 0;
    }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Code de Confirmation</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Vous avez été invité(e) à rejoindre la plateforme <strong>Planning Medical</strong>.</p>
      <p>Voici votre code de confirmation à 6 chiffres :</p>
      <div class="code-box">${code}</div>
      <p>Ce code est valide pendant 15 minutes.</p>
      <p>Ne partagez ce code avec personne.</p>
    </div>
    <div class="footer">
      <p>Planning Medical © 2024</p>
    </div>
  </div>
</body>
</html>
`;

async function testEmail() {
  try {
    console.log('📧 Test d\'envoi d\'email...');
    console.log('À:', recipientEmail);
    console.log('Code:', code);
    console.log('');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: '🔐 Code de confirmation - Planning Médical',
      html: htmlTemplate,
    });

    console.log('✅ Email envoyé avec succès!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
    console.error('Details:', error);
  }

  process.exit(0);
}

testEmail();
