// server.js
require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcryptjs");
const dns = require('dns').promises;
const jwt = require('jsonwebtoken');

// Gestionnaires d'erreurs globaux pour debugging
process.on('uncaughtException', (err) => {
  console.error('❌ ERREUR NON CAPTURÉE:', err);
  console.error(err.stack);
  // process.exit(1); // Commenté pour debug
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESSE REJETÉE NON GÉRÉE:', reason);
  // process.exit(1); // Commenté pour debug
});

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8082; // Port du serveur (respecte .env ou start-server.js)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_changez_moi_en_production';

// Middlewares
app.use(cors());
app.use(express.json());

// Route de vérification simple pour le navigateur (GET)
app.get('/', (req, res) => {
  res.send('Planning server is running. Use POST /login to authenticate.');
});

// Fournir une réponse informative pour les requêtes GET /login (n'existe que pour debug)
app.get('/login', (req, res) => {
  res.status(200).send('Endpoint /login expects POST with { email, password }. Use the app or POST client.');
});

const db = require('./db/database');

// ===== MIDDLEWARE D'AUTHENTIFICATION =====
// Vérifie le token JWT et extrait les infos utilisateur
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant. Authentification requise.' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token invalide ou expiré.' });
    }
    req.user = user; // { id, email, role }
    next();
  });
}

// Middleware pour vérifier que l'utilisateur est admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
}

// Middleware combiné : authentification + admin
const adminOnly = [authenticateToken, requireAdmin];

// ╔════════════════════════════════════════════════════════════════╗
// ║  Configuration Nodemailer avec support multi-services         ║
// ╚════════════════════════════════════════════════════════════════╝
function createTransporter() {
  const opts = {};
  
  // Option 1: Service nommé (Gmail, Outlook, etc.)
  if (process.env.EMAIL_SERVICE) {
    opts.service = process.env.EMAIL_SERVICE;
    console.log(`📧 Configuration email: ${process.env.EMAIL_SERVICE}`);
  } 
  // Option 2: SMTP personnalisé (Mailtrap, SendGrid, etc.)
  else if (process.env.SMTP_HOST) {
    opts.host = process.env.SMTP_HOST;
    opts.port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    opts.secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';
    console.log(`📧 Configuration SMTP: ${opts.host}:${opts.port}`);
  } else {
    console.warn('⚠️  ATTENTION: Aucune configuration email détectée');
    console.warn('   Les emails ne seront pas envoyés.');
    console.warn('   Consultez le fichier .env pour configurer Gmail, Outlook ou Mailtrap');
  }

  // Authentification
  if (process.env.EMAIL_USER || process.env.SMTP_USER) {
    opts.auth = {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || ''
    };
    console.log(`   Utilisateur: ${opts.auth.user}`);
  }

  return nodemailer.createTransport(opts);
}

const transporter = createTransporter();

// Vérifier la connexion email au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.error('\n❌ ERREUR DE CONFIGURATION EMAIL:');
    console.error('   ', error.message);
    console.error('\n💡 SOLUTIONS:');
    console.error('   1. Vérifiez vos identifiants dans le fichier .env');
    console.error('   2. Pour Gmail: créez un mot de passe d\'application');
    console.error('      https://myaccount.google.com/apppasswords');
    console.error('   3. Ou utilisez Mailtrap pour les tests (gratuit)');
    console.error('      https://mailtrap.io\n');
  } else {
    console.log('✅ Configuration email OK - Prêt à envoyer des messages\n');
  }
});

// ===== ENDPOINT DE LOGIN =====
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email/téléphone et mot de passe requis.' });
  }
  
  try {
    // Récupérer l'utilisateur (par email OU téléphone)
    const user = await db.findUserByContact(email); // findUserByContact supporte email et téléphone
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiant ou mot de passe incorrect.' });
    }
    
    if (!user.isConfirmed) {
      return res.status(401).json({ success: false, message: 'Compte non confirmé. Veuillez vérifier votre email.' });
    }
    
    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }
    
    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        mustChangePassword: user.mustChangePassword || false
      }
    });
  } catch (error) {
    console.error('Erreur lors du login:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// Utility: send confirmation either by email or by SMS (Twilio)
async function sendConfirmationContact(to, code, userInfo = {}) {
  const from = process.env.EMAIL_FROM || (process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@planning.com');
  const isPasswordReset = userInfo.isPasswordReset || false;
  
  // if looks like email -> send email
  if (typeof to === 'string' && to.includes('@')) {
    const title = isPasswordReset ? '🔒 Réinitialisation de mot de passe' : '🏥 Code de Confirmation';
    const intro = isPasswordReset 
      ? 'Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Planning Médical</strong>.'
      : 'Vous avez été invité(e) à rejoindre la plateforme <strong>Planning Médical</strong>.';
    const instructions = isPasswordReset
      ? '<li>Ce code est valable pour une seule utilisation</li><li>Entrez ce code pour réinitialiser votre mot de passe</li><li>Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email</li>'
      : '<li>Ce code est valable pour une seule utilisation</li><li>Communiquez ce code à l\'administrateur pour activer votre compte</li><li>Une fois votre compte activé, vous pourrez créer votre mot de passe</li>';
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
          .code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>Bonjour${userInfo.nom ? ' ' + userInfo.prenom + ' ' + userInfo.nom : ''},</p>
            <p>${intro}</p>
            <p>Voici votre code ${isPasswordReset ? 'de réinitialisation' : 'de confirmation'} à 6 chiffres :</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p><strong>Important :</strong></p>
            <ul>
              ${instructions}
            </ul>
            <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Planning Médical - Système de gestion de planning</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textVersion = `Bonjour${userInfo.nom ? ' ' + userInfo.prenom + ' ' + userInfo.nom : ''},\n\nVotre code ${isPasswordReset ? 'de réinitialisation' : 'de confirmation'} est : ${code}\n\n${isPasswordReset ? 'Utilisez ce code pour réinitialiser votre mot de passe.' : 'Communiquez ce code à l\'administrateur pour activer votre compte.'}\n\n© 2025 Planning Médical`;
    
    return transporter.sendMail({ 
      from, 
      to, 
      subject: '🔐 Code de confirmation - Planning Médical', 
      text: textVersion,
      html: htmlTemplate
    });
  }

  // else assume phone number -> try Telegram Bot first, then Twilio
  
  // Toujours afficher le code dans la console pour le développement
  console.log('\n' + '='.repeat(60));
  console.log('📱 CODE SMS/TELEGRAM GÉNÉRÉ');
  console.log('='.repeat(60));
  console.log(`Destinataire : ${to}`);
  console.log(`Code        : ${code}`);
  console.log(`Nom         : ${userInfo.prenom || ''} ${userInfo.nom || ''}`);
  console.log('='.repeat(60) + '\n');
  
  // Essayer d'abord Telegram (GRATUIT)
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  
  if (telegramBotToken && telegramChatId) {
    try {
      const TelegramBot = require('node-telegram-bot-api');
      const bot = new TelegramBot(telegramBotToken);
      
      const isPasswordReset = userInfo.isPasswordReset || false;
      const title = isPasswordReset ? '🔒 *Réinitialisation de mot de passe*' : '🏥 *Planning Médical*';
      const instruction = isPasswordReset 
        ? 'Utilisez ce code pour réinitialiser votre mot de passe.'
        : 'Communiquez ce code à l\'administrateur pour activer votre compte.';
      
      const message = `${title}\n\n` +
                     `👤 ${userInfo.prenom || ''} ${userInfo.nom || ''}\n` +
                     `📱 ${to}\n\n` +
                     `🔐 *Code ${isPasswordReset ? 'de réinitialisation' : 'de confirmation'} :*\n` +
                     `\`${code}\`\n\n` +
                     `${instruction}`;
      
      await bot.sendMessage(telegramChatId, message, { parse_mode: 'Markdown' });
      console.log('✅ Message envoyé avec succès via Telegram Bot (GRATUIT)\n');
      return { success: true, method: 'telegram' };
    } catch (telegramErr) {
      console.error('❌ Erreur Telegram:', telegramErr.message);
      console.log('⏭️  Tentative avec Twilio...\n');
    }
  }
  
  // Sinon essayer Twilio (PAYANT)
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (sid && token && fromNumber) {
    try {
      const twilio = require('twilio')(sid, token);
      const result = await twilio.messages.create({ 
        body: `Planning Médical - Votre code de confirmation est : ${code}\n\nCommuniquez ce code à l'administrateur.`, 
        from: fromNumber, 
        to 
      });
      console.log('✅ SMS envoyé avec succès via Twilio\n');
      return result;
    } catch (twilioErr) {
      console.error('❌ Erreur Twilio:', twilioErr.message);
      console.log('💡 Le code est affiché ci-dessus pour utilisation manuelle\n');
      throw twilioErr;
    }
  }
  
  // Aucun service configuré
  console.log('⚠️  Aucun service SMS configuré - Le code est affiché ci-dessus');
  console.log('💡 Options GRATUITES :');
  console.log('   1. Telegram Bot (RECOMMANDÉ) - Consultez GUIDE_TELEGRAM.md');
  console.log('   2. WhatsApp Business API');
  console.log('📖 Consultez CONFIGURATION_SMS.md pour plus d\'informations\n');
  const err = new Error('No SMS service configured - Code shown in console');
  err.code = 'NO_SMS_SERVICE';
  throw err;
}

// GET users (pour charger la liste des utilisateurs)
// TODO: Ajouter authentification quand le frontend aura le token JWT
app.get('/users', async (req, res) => {
  const users = await db.getUsers();
  // Ne pas exposer les mots de passe
  const safeUsers = users.map(u => ({ id: u.id, email: u.email, phone: u.phone, nom: u.nom, prenom: u.prenom, role: u.role, isConfirmed: u.isConfirmed }));
  res.json({ success: true, users: safeUsers });
});

// Planning endpoints
// Consultation du planning : accessible à tous les utilisateurs authentifiés
app.get('/planning', authenticateToken, async (req, res) => {
  const planning = await db.getPlanning();
  res.json({ success: true, planning });
});

// Replace whole planning - ADMIN ONLY
app.post('/planning/replace', adminOnly, async (req, res) => {
  const { planning } = req.body;
  if (!planning || typeof planning !== 'object') return res.status(400).json({ success: false, message: 'Planning invalide' });
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, message: 'Planning remplacé' });
});

// Add event - ADMIN ONLY
app.post('/planning/event', adminOnly, async (req, res) => {
  const { jour, event } = req.body;
  if (!jour || !event) return res.status(400).json({ success: false, message: 'Données manquantes' });
  const planning = await db.getPlanning();
  planning[jour] = [...(planning[jour] || []), event];
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, planning });
});

// Update event - ADMIN ONLY
app.put('/planning/event', adminOnly, async (req, res) => {
  const { jour, index, event } = req.body;
  if (!jour || typeof index !== 'number' || !event) return res.status(400).json({ success: false, message: 'Données manquantes' });
  const planning = await db.getPlanning();
  if (!planning[jour] || !planning[jour][index]) return res.status(404).json({ success: false, message: 'Événement non trouvé' });
  planning[jour][index] = event;
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, planning });
});

// Delete event - ADMIN ONLY
app.delete('/planning/event', adminOnly, async (req, res) => {
  const { jour, index } = req.body;
  if (!jour || typeof index !== 'number') return res.status(400).json({ success: false, message: 'Données manquantes' });
  const planning = await db.getPlanning();
  if (!planning[jour] || !planning[jour][index]) return res.status(404).json({ success: false, message: 'Événement non trouvé' });
  planning[jour] = planning[jour].filter((_, i) => i !== index);
  if (planning[jour].length === 0) delete planning[jour];
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, planning });
});

// Add comment to event - Authenticated users (admin + others)
app.post('/planning/comment', authenticateToken, async (req, res) => {
  const { jour, index, commentaire } = req.body;
  if (!jour || typeof index !== 'number' || !commentaire) {
    return res.status(400).json({ success: false, message: 'Données manquantes' });
  }
  const planning = await db.getPlanning();
  if (!planning[jour] || !planning[jour][index]) {
    return res.status(404).json({ success: false, message: 'Événement non trouvé' });
  }
  // Add comment to the event
  planning[jour][index].commentaire = commentaire;
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, planning });
});

// Route pour envoyer le code
app.post('/send-code', async (req, res) => {
  // Accept either `contact` (email or phone) or `email` for compatibility
  const contact = req.body.contact || req.body.email || '';

  if (!contact) return res.status(400).json({ success: false, message: 'Contact manquant' });

  const isEmail = typeof contact === 'string' && contact.includes('@');

  // Validate existence of user by email or phone
  const existing = await db.findUserByContact(contact);
  if (!existing) return res.status(400).json({ success: false, message: 'Contact inconnu. Contactez l\'administrateur.' });

  // If email, check MX; if phone, do a basic format check
  if (isEmail) {
    try {
      const domain = contact.split('@')[1];
      if (!domain) return res.status(400).json({ success: false, message: 'Email invalide' });
      const mx = await dns.resolveMx(domain);
      if (!mx || mx.length === 0) return res.status(400).json({ success: false, message: 'Domaine de messagerie introuvable' });
    } catch (dnsErr) {
      console.warn('MX check failed for', contact, dnsErr && dnsErr.code);
      return res.status(400).json({ success: false, message: 'Domaine de messagerie invalide' });
    }
  } else {
    // basic E.164-ish check: allow + and digits, min 8 digits
    const phoneRaw = String(contact).replace(/\s+/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(phoneRaw)) return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide. Utilisez le format international, ex: +33612345678' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.saveCode(contact, code);

  try {
    // Try to send through configured transporters (email or Twilio). If neither configured, return dev code.
    try {
      await sendConfirmationContact(contact, code);
      return res.json({ success: true, message: 'Code envoyé' });
    } catch (sendErr) {
      // If Twilio not configured or mailer not configured, fall back to dev-mode return
      console.warn('Sending confirmation failed or not configured, falling back to dev-mode:', sendErr && sendErr.message);
      return res.json({ success: true, message: 'Code (dev) généré', code });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'envoi du code' });
  }
});

  // Health check endpoint to help debugging connectivity from frontend
  app.get('/health', (req, res) => {
    res.json({ success: true, status: 'ok', ts: Date.now() });
  });

// Admin: invite a user (create user entry without confirming) and send code
// TODO: Ajouter authentification admin quand le frontend aura le token JWT
app.post('/invite-user', async (req, res) => {
  // Accept email and phone separately + sendCodeBy choice
  const { email = '', phone = '', nom = '', prenom = '', role = 'medecin', sendCodeBy = 'email' } = req.body;
  
  if (!email || !email.includes('@')) return res.status(400).json({ success: false, message: 'Email invalide' });
  
  // Validate phone if provided or if sendCodeBy is phone
  if (sendCodeBy === 'phone' || phone) {
    if (!phone) return res.status(400).json({ success: false, message: 'Téléphone requis pour l\'envoi par SMS' });
    const phoneRaw = String(phone).replace(/\s+/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(phoneRaw)) return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide' });
  }

  const added = await db.addUser({ email, phone: phone || null, nom, prenom, role });
  if (!added) return res.status(400).json({ success: false, message: 'Utilisateur existe déjà' });

  // Choose contact based on sendCodeBy
  const contactToSend = sendCodeBy === 'phone' ? phone : email;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.saveCode(contactToSend, code);
  
  try {
    try {
      await sendConfirmationContact(contactToSend, code, { nom, prenom, role });
      const medium = sendCodeBy === 'phone' ? 'SMS' : 'email';
      return res.json({ success: true, message: `Invité créé et code envoyé par ${medium}`, userId: added });
    } catch (sendErr) {
      console.warn('Send invite failed or not configured (dev-mode):', sendErr && sendErr.message);
      return res.json({ success: true, message: 'Invité (dev) créé, code généré', code, userId: added });
    }
  } catch (err) {
    console.error('Erreur invite/send confirmation', err);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'invitation' });
  }
});

// Check email validity: format, existing user and MX records
// Check contact (email or phone) validity and existing user state
// Check email or phone validity and existence
async function checkContactHandler(req, res) {
  const contact = req.body.contact || req.body.email;
  if (!contact) return res.status(400).json({ success: false, message: 'Contact manquant' });
  const isEmail = typeof contact === 'string' && contact.includes('@');
  let formatValid = false;
  let exists = false;
  let isConfirmed = false;
  let mxOk = false;
  if (isEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    formatValid = !!emailRegex.test(contact);
    if (formatValid) {
      try { const domain = contact.split('@')[1]; const mx = await dns.resolveMx(domain); mxOk = Array.isArray(mx) && mx.length > 0; } catch (e) { mxOk = false; }
    }
  } else {
    // basic phone validation
    const phoneRaw = String(contact).replace(/\s+/g, '');
    formatValid = !!/^\+?[0-9]{8,15}$/.test(phoneRaw);
  }
  try {
    const user = await db.findUserByContact(contact);
    if (user) { exists = true; isConfirmed = !!user.isConfirmed; }
  } catch (e) { /* ignore */ }
  res.json({ success: true, formatValid, exists, isConfirmed, mxOk });
}

app.post('/check-email', checkContactHandler);
app.post('/check-contact', checkContactHandler);

// Admin: activate a user immediately (no code) — for admin use only
app.post('/admin/activate', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email manquant' });
  try {
    const existing = await db.findUserByEmail(email);
    if (!existing) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    await db.confirmUser(email);
    // return updated user list
    const users = await db.getUsers();
    return res.json({ success: true, message: 'Utilisateur activé', users });
  } catch (err) {
    console.error('Erreur activation admin', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Calendar / Events endpoints
// Create an event in a calendar - ADMIN ONLY
app.post('/calendars/:id/events', adminOnly, async (req, res) => {
  const calendarId = req.params.id || null;
  const { organizerEmail, title, description, startAt, endAt, timezone, location, recurrence, attendees } = req.body;
  if (!startAt || !endAt || !title) return res.status(400).json({ success: false, message: 'Données d\'événement manquantes' });
  try {
    const eventId = await db.createEvent({ calendarId, organizerEmail, title, description, startAt, endAt, timezone, location, recurrence });
    // add attendees if provided
    if (Array.isArray(attendees)) {
      for (const a of attendees) {
        try {
          // each attendee can be an email string, phone string, or object { email, phone }
          await db.addAttendee(eventId, a, req.body.invitedBy || null, a.canEdit || false);
        } catch (e) { /* ignore individual failures */ }
      }
    }
    // emit socket update
    const ev = { id: eventId, calendarId, organizerEmail, title, description, startAt, endAt, timezone, location, recurrence };
    io.emit('events:created', ev);
    return res.json({ success: true, message: 'Événement créé', event: ev });
  } catch (err) {
    console.error('Error creating event', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Get events for a calendar (optionally in a date range) - accessible à tous
app.get('/calendars/:id/events', authenticateToken, async (req, res) => {
  const calendarId = req.params.id || null;
  const { rangeStart, rangeEnd } = req.query;
  try {
    const events = await db.getEventsForCalendar(calendarId, rangeStart || null, rangeEnd || null);
    return res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching events', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// RSVP to an event
app.post('/events/:id/rsvp', async (req, res) => {
  const eventId = req.params.id;
  const { email, status } = req.body;
  if (!email || !status) return res.status(400).json({ success: false, message: 'Données manquantes' });
  try {
    const contact = req.body.contact || email;
    const ok = await db.rsvpAttendee(eventId, contact, status);
    if (!ok) return res.status(404).json({ success: false, message: 'Événement ou participant introuvable' });
    io.emit('events:updated', { eventId, attendee: { email, status } });
    return res.json({ success: true, message: 'RSVP enregistré' });
  } catch (err) {
    console.error('Error RSVP', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Admin: grant or revoke edit permission to an attendee
app.post('/events/:id/grant-edit', async (req, res) => {
  const eventId = req.params.id;
  const { contact, canEdit } = req.body; // contact: email or phone or object
  if (!contact || typeof canEdit === 'undefined') return res.status(400).json({ success: false, message: 'Données manquantes' });
  try {
    const ok = await db.setAttendeePermission(eventId, contact, !!canEdit);
    if (!ok) return res.status(404).json({ success: false, message: 'Participant introuvable' });
    io.emit('events:updated', { eventId, permission: { contact, canEdit: !!canEdit } });
    return res.json({ success: true, message: 'Permission mise à jour' });
  } catch (err) {
    console.error('Error setting permission', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour vérifier le code et créer un mot de passe (pour utilisateurs invités)
app.post('/verify-code', async (req, res) => {
  // Accept either `contact` (email or phone) or `email` for compatibility
  const contact = req.body.contact || req.body.email || '';
  const { code, provisionalPassword, newPassword } = req.body;
  console.log('🔍 /verify-code appelé avec:', { contact, code, hasNewPassword: !!newPassword, hasProvisionalPassword: !!provisionalPassword });
  
  if (!contact || !code) return res.status(400).json({ success: false, message: 'Données manquantes' });

  const saved = await db.getCode(contact);
  console.log('🔍 Code enregistré:', saved);
  
  if (saved && String(saved) === String(code)) {
    await db.deleteCode(contact);
    console.log('✅ Code valide, supprimé');
    
    // Si un nouveau mot de passe est fourni (par l'utilisateur), le hacher et confirmer le compte
    if (newPassword) {
      console.log('🔐 Création de mot de passe utilisateur...');
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('🔐 Mot de passe haché:', hashedPassword.substring(0, 20) + '...');
      
      await db.updateUserPassword(contact, hashedPassword);
      console.log('✅ updateUserPassword terminé');
      
      await db.confirmUser(contact);
      console.log('✅ confirmUser terminé');
      
      return res.json({ success: true, message: 'Compte confirmé avec succès ! Vous pouvez maintenant vous connecter.' });
    }
    // Si un mot de passe provisoire est fourni par l'admin, le hacher et le sauvegarder
    else if (provisionalPassword) {
      const hashedPassword = await bcrypt.hash(provisionalPassword, 10);
      await db.setProvisionalPassword(contact, hashedPassword);
      return res.json({ success: true, message: 'Contact confirmé avec succès ! Mot de passe provisoire créé.' });
    } else {
      // Ancienne méthode: juste confirmer le contact sans créer de mot de passe
      await db.confirmUser(contact);
      return res.json({ success: true, message: 'Contact confirmé avec succès ! Veuillez créer un mot de passe.' });
    }
  }

  return res.status(400).json({ success: false, message: 'Code invalide' });
});

// Route pour créer/mettre à jour un utilisateur - ADMIN ONLY
app.post('/create-user', adminOnly, async (req, res) => {
  const { email, password, nom, prenom, role } = req.body;
  if (!email || !password || !nom) return res.status(400).json({ success: false, message: 'Données manquantes' });
  const hashed = await bcrypt.hash(password, 10);
  await db.createOrUpdateUser({ email, password: hashed, nom, prenom, role });
  return res.json({ success: true, message: 'Utilisateur créé/mis à jour' });
});

// Route pour créer un utilisateur directement sans code - ADMIN ONLY
app.post('/create-user-direct', adminOnly, async (req, res) => {
  try {
    const { email, phone, password, nom, prenom, role } = req.body;
    
    // Au moins email OU téléphone requis
    if ((!email && !phone) || !password || !nom || !prenom) {
      return res.status(400).json({ success: false, message: 'Au moins email OU téléphone, mot de passe, nom et prénom requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà (par email ou téléphone)
    const contact = email || phone;
    const existingUser = await db.findUserByContact(contact);
    if (existingUser && existingUser.isConfirmed) {
      return res.status(400).json({ success: false, message: 'Ce contact est déjà utilisé par un compte actif' });
    }
    
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur directement confirmé avec mustChangePassword = 1
    await db.createOrUpdateUser({
      email: email ? email.trim().toLowerCase() : null,
      phone: phone ? phone.trim() : null,
      password: hashedPassword,
      nom: nom.trim(),
      prenom: prenom.trim(),
      role: role || 'medecin'
    });
    
    // Marquer comme devant changer le mot de passe
    await db.setProvisionalPassword(contact, hashedPassword);
    
    return res.json({ 
      success: true, 
      message: 'Utilisateur créé avec succès. Il devra changer son mot de passe lors de sa première connexion.',
      provisionalPassword: password,
      contact: email || phone
    });
  } catch (error) {
    console.error('Error creating user directly:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour changer le mot de passe (participant)
app.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userEmail = req.user.email; // Email du token JWT
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis' });
    }
    
    // Vérifier que le nouveau mot de passe est différent
    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit être différent de l\'ancien' });
    }
    
    // Récupérer l'utilisateur
    const user = await db.findUserByContact(userEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier l'ancien mot de passe
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect' });
    }
    
    // Hacher le nouveau mot de passe et mettre à jour
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUserPassword(userEmail, hashedPassword);
    
    return res.json({ success: true, message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour demander la réinitialisation du mot de passe (envoie un code)
app.post('/forgot-password', async (req, res) => {
  try {
    const { contact } = req.body; // email ou téléphone
    
    if (!contact) {
      return res.status(400).json({ success: false, message: 'Email ou téléphone requis' });
    }
    
    // Vérifier que l'utilisateur existe
    const user = await db.findUserByContact(contact);
    if (!user || !user.isConfirmed) {
      return res.status(404).json({ success: false, message: 'Aucun compte actif trouvé avec cet email/téléphone' });
    }
    
    // Générer un code à 6 chiffres
    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    
    // Sauvegarder le code dans la table codes
    await db.saveCode(contact, resetCode);
    
    // Envoyer le code par email ou Telegram
    try {
      await sendConfirmationContact(contact, resetCode, { 
        nom: user.nom, 
        prenom: user.prenom, 
        role: user.role,
        isPasswordReset: true 
      });
      
      const method = contact.includes('@') ? 'email' : 'Telegram/SMS';
      return res.json({ 
        success: true, 
        message: `Code de réinitialisation envoyé par ${method}`,
        contact 
      });
    } catch (sendErr) {
      console.warn('Send reset code failed (dev-mode):', sendErr.message);
      // En mode dev, on retourne quand même succès avec le code
      return res.json({ 
        success: true, 
        message: 'Code de réinitialisation généré (mode dev)', 
        code: resetCode,
        contact 
      });
    }
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour vérifier le code et réinitialiser le mot de passe
app.post('/reset-password', async (req, res) => {
  try {
    const { contact, code, newPassword } = req.body;

    if (!contact || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Contact, code et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier le code
    const savedCode = await db.getCode(contact);
    if (!savedCode || savedCode !== String(code)) {
      return res.status(400).json({ success: false, message: 'Code incorrect ou expiré' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await db.updateUserPassword(contact, hashedPassword);

    // Supprimer le code utilisé
    await db.deleteCode(contact);

    return res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// CLINO MOBILE ROUTES
// ============================================
// GET - Récupérer toutes les interventions Clino Mobile (accessible à tous)
app.get('/clino-mobile', authenticateToken, async (req, res) => {
  try {
    const data = await db.getClinoMobile();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Erreur récupération clino-mobile:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST - Ajouter une intervention (ADMIN ONLY)
app.post('/clino-mobile', adminOnly, async (req, res) => {
  try {
    const { date, heure, adresse, medecin, commentaire } = req.body;

    if (!date || !heure || !adresse || !medecin) {
      return res.status(400).json({ success: false, message: 'Date, heure, adresse et médecin requis' });
    }

    const id = await db.addClinoMobile({ date, heure, adresse, medecin, commentaire });
    if (!id) {
      return res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout' });
    }

    // Rafraîchir et diffuser via Socket.io
    const data = await db.getClinoMobile();
    io.emit('clino-mobile:update', data);

    res.json({ success: true, message: 'Intervention ajoutée', id, data });
  } catch (err) {
    console.error('Erreur ajout clino-mobile:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT - Modifier une intervention (ADMIN ONLY)
app.put('/clino-mobile/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, heure, adresse, medecin, commentaire } = req.body;

    if (!date || !heure || !adresse || !medecin) {
      return res.status(400).json({ success: false, message: 'Date, heure, adresse et médecin requis' });
    }

    const updated = await db.updateClinoMobile(id, { date, heure, adresse, medecin, commentaire });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Intervention non trouvée' });
    }

    // Rafraîchir et diffuser via Socket.io
    const data = await db.getClinoMobile();
    io.emit('clino-mobile:update', data);

    res.json({ success: true, message: 'Intervention modifiée', data });
  } catch (err) {
    console.error('Erreur modification clino-mobile:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE - Supprimer une intervention (ADMIN ONLY)
app.delete('/clino-mobile/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db.deleteClinoMobile(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Intervention non trouvée' });
    }

    // Rafraîchir et diffuser via Socket.io
    const data = await db.getClinoMobile();
    io.emit('clino-mobile:update', data);

    res.json({ success: true, message: 'Intervention supprimée', data });
  } catch (err) {
    console.error('Erreur suppression clino-mobile:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Wait for DB initialization before starting server
(async () => {
  await db.waitForInit();
  
  // Bind explicitly to 0.0.0.0 so the server is reachable from other network interfaces
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur en cours d'exécution sur http://localhost:${PORT}`);
    try {
      const os = require('os');
      const ifaces = os.networkInterfaces();
      console.log('🔍 Adresses réseau disponibles:');
      Object.keys(ifaces).forEach(name => {
        ifaces[name].forEach(iface => {
          if (!iface.internal) {
            console.log(`   - ${name}: ${iface.address}`);
          }
        });
      });
    } catch (e) {
      // ignore
    }
  });

  // ===== PARTICIPANTS CRUD ENDPOINTS =====
  // Update participant (admin only)
  app.put('/update-user/:id', adminOnly, async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const { nom, prenom, phone, role } = req.body;

      if (!nom || !prenom) {
        return res.status(400).json({ success: false, message: 'Nom et prénom requis' });
      }

      const updated = await db.updateUser(userId, { nom, prenom, phone, role });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      res.json({ success: true, message: 'Participant modifié avec succès' });
    } catch (err) {
      console.error('[/update-user] Error:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur: ' + err.message });
    }
  });

  // Delete participant (admin only)
  app.delete('/delete-user/:id', adminOnly, async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);

      const deleted = await db.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      res.json({ success: true, message: 'Participant supprimé avec succès' });
    } catch (err) {
      console.error('[/delete-user] Error:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur: ' + err.message });
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });
})();
