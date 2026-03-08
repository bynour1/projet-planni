const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function resendCode() {
  const email = 'jalila.benyoussef@esprit.tn';
  
  // Connexion BD
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'planning'
  });

  // Générer un nouveau code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  console.log('📧 Code généré:', code);

  // Sauvegarder le code
  await connection.execute('DELETE FROM codes WHERE email = ?', [email]);
  await connection.execute('INSERT INTO codes (email, code) VALUES (?, ?)', [email, code]);
  console.log('✅ Code sauvegardé dans la BD');

  // Configurer nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // HTML template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; background: #f9f9f9; }
        .code-box { border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0; }
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
          <p>Vous avez été invité(e) à rejoindre la plateforme <strong>Planning Médical</strong>.</p>
          <p>Voici votre code de confirmation à 6 chiffres :</p>
          <div class="code-box">${code}</div>
          <p><strong>Ce code est valable pendant 15 minutes.</strong></p>
          <p>Ne partagez ce code avec personne.</p>
        </div>
        <div class="footer">
          <p>Planning Medical © 2024</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Envoyer l'email
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 Code de confirmation - Planning Médical',
      html: htmlTemplate
    });
    console.log('✅ Email envoyé avec succès!');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Erreur lors de l\'envoi:', err.message);
  }

  await connection.end();
}

resendCode().catch(console.error);
