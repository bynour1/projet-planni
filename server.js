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
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESSE REJETÉE NON GÉRÉE:', reason);
  process.exit(1);
});

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 8001;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_changez_moi_en_production';

// Middlewares
app.use(cors());
app.use(express.json());

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

// Configure Nodemailer transporter using environment variables.
// Support either a named service (EMAIL_SERVICE) or explicit SMTP settings (SMTP_HOST/SMTP_PORT/SMTP_SECURE).
function createTransporter() {
  const opts = {};
  if (process.env.EMAIL_SERVICE) {
    opts.service = process.env.EMAIL_SERVICE;
  } else if (process.env.SMTP_HOST) {
    opts.host = process.env.SMTP_HOST;
    opts.port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    opts.secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';
  }

  // Add auth if provided
  if (process.env.EMAIL_USER || process.env.SMTP_USER) {
    opts.auth = {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || ''
    };
  }

  // If nothing configured, transporter will still be created but sending will likely fail.
  return nodemailer.createTransport(opts);
}

const transporter = createTransporter();

// ===== ENDPOINT DE LOGIN =====
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
  }
  
  try {
    // Récupérer l'utilisateur
    const user = await db.findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
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
  
  // if looks like email -> send email
  if (typeof to === 'string' && to.includes('@')) {
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
            <h1>🏥 Code de Confirmation</h1>
          </div>
          <div class="content">
            <p>Bonjour${userInfo.nom ? ' ' + userInfo.prenom + ' ' + userInfo.nom : ''},</p>
            <p>Vous avez été invité(e) à rejoindre la plateforme <strong>Planning Médical</strong>.</p>
            <p>Voici votre code de confirmation à 6 chiffres :</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p><strong>Important :</strong></p>
            <ul>
              <li>Ce code est valable pour une seule utilisation</li>
              <li>Communiquez ce code à l'administrateur pour activer votre compte</li>
              <li>Une fois votre compte activé, vous pourrez créer votre mot de passe</li>
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
    
    const textVersion = `Bonjour${userInfo.nom ? ' ' + userInfo.prenom + ' ' + userInfo.nom : ''},\n\nVotre code de confirmation est : ${code}\n\nCommuniquez ce code à l'administrateur pour activer votre compte.\n\n© 2025 Planning Médical`;
    
    return transporter.sendMail({ 
      from, 
      to, 
      subject: '🔐 Code de confirmation - Planning Médical', 
      text: textVersion,
      html: htmlTemplate
    });
  }

  // else assume phone number -> use Twilio if configured
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM;
  if (!sid || !token || !fromNumber) {
    // no Twilio configured; throw to let caller fall back to dev-mode
    const err = new Error('Twilio not configured');
    err.code = 'NO_TWILIO';
    throw err;
  }
  // require twilio lazily so app doesn't crash if package missing and user doesn't use SMS
  const twilio = require('twilio')(sid, token);
  return twilio.messages.create({ 
    body: `Planning Médical - Votre code de confirmation est : ${code}\n\nCommuniquez ce code à l'administrateur.`, 
    from: fromNumber, 
    to 
  });
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

// Route pour vérifier le code
app.post('/verify-code', async (req, res) => {
  // Accept either `contact` (email or phone) or `email` for compatibility
  const contact = req.body.contact || req.body.email || '';
  const { code, provisionalPassword } = req.body;
  if (!contact || !code) return res.status(400).json({ success: false, message: 'Données manquantes' });

  const saved = await db.getCode(contact);
  if (saved && String(saved) === String(code)) {
    await db.deleteCode(contact);
    
    // Si un mot de passe provisoire est fourni par l'admin, le hacher et le sauvegarder
    if (provisionalPassword) {
      const hashedPassword = await bcrypt.hash(provisionalPassword, 10);
      await db.setProvisionalPassword(contact, hashedPassword);
      return res.json({ success: true, message: 'Contact confirmé avec succès ! Mot de passe provisoire créé.' });
    } else {
      // Ancienne méthode: juste confirmer le contact sans créer de mot de passe
      await db.confirmUser(contact);
      return res.json({ success: true, message: 'Contact confirmé avec succès !' });
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

// Wait for DB initialization before starting server
(async () => {
  await db.waitForInit();
  
  server.listen(PORT, () => {
    console.log(`🚀 Serveur en cours d'exécution sur http://localhost:${PORT}`);
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });
})();
