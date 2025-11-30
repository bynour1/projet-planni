// server.js
require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcryptjs");
const dns = require('dns').promises;

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const db = require('./db/database');

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

// Utility: send confirmation either by email or by SMS (Twilio)
async function sendConfirmationContact(to, code) {
  // if looks like email -> send email
  const from = process.env.EMAIL_FROM || (process.env.EMAIL_USER || 'no-reply@example.com');
  if (typeof to === 'string' && to.includes('@')) {
    return transporter.sendMail({ from, to, subject: 'Code de confirmation', text: `Votre code de confirmation est : ${code}` });
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
  return twilio.messages.create({ body: `Votre code de confirmation est : ${code}`, from: fromNumber, to });
}

// GET users (for frontend to load existing users)
app.get('/users', async (req, res) => {
  const users = await db.getUsers();
  res.json({ success: true, users });
});

// Planning endpoints
app.get('/planning', async (req, res) => {
  const planning = await db.getPlanning();
  res.json({ success: true, planning });
});

// Replace whole planning
app.post('/planning/replace', async (req, res) => {
  const { planning } = req.body;
  if (!planning || typeof planning !== 'object') return res.status(400).json({ success: false, message: 'Planning invalide' });
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, message: 'Planning remplacé' });
});

// Add event
app.post('/planning/event', async (req, res) => {
  const { jour, event } = req.body;
  if (!jour || !event) return res.status(400).json({ success: false, message: 'Données manquantes' });
  const planning = await db.getPlanning();
  planning[jour] = [...(planning[jour] || []), event];
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, planning });
});

// Update event
app.put('/planning/event', async (req, res) => {
  const { jour, index, event } = req.body;
  if (!jour || typeof index !== 'number' || !event) return res.status(400).json({ success: false, message: 'Données manquantes' });
  const planning = await db.getPlanning();
  if (!planning[jour] || !planning[jour][index]) return res.status(404).json({ success: false, message: 'Événement non trouvé' });
  planning[jour][index] = event;
  await db.savePlanning(planning);
  io.emit('planning:update', planning);
  res.json({ success: true, planning });
});

// Delete event
app.delete('/planning/event', async (req, res) => {
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
app.post('/invite-user', async (req, res) => {
  // Accept contact (email or phone) for invitation
  const { contact, nom = '', prenom = '', role = 'medecin' } = req.body;
  if (!contact) return res.status(400).json({ success: false, message: 'Contact manquant' });
  const isEmail = typeof contact === 'string' && contact.includes('@');
  if (isEmail && !contact.includes('@')) return res.status(400).json({ success: false, message: 'Email invalide' });
  if (!isEmail) {
    const phoneRaw = String(contact).replace(/\s+/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(phoneRaw)) return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide' });
  }

  const added = await db.addUser({ email: isEmail ? contact : null, phone: !isEmail ? contact : null, nom, prenom, role });
  if (!added) return res.status(400).json({ success: false, message: 'Utilisateur existe déjà' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.saveCode(contact, code);
  try {
    try {
      await sendConfirmationContact(contact, code);
      return res.json({ success: true, message: 'Invité créé et code envoyé', userId: added });
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
app.post('/check-contact', async (req, res) => {
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
});

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
// Create an event in a calendar
app.post('/calendars/:id/events', async (req, res) => {
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

// Get events for a calendar (optionally in a date range)
app.get('/calendars/:id/events', async (req, res) => {
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
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ success: false, message: 'Données manquantes' });

  const saved = await db.getCode(email);
  if (saved && String(saved) === String(code)) {
    await db.deleteCode(email);
    await db.confirmUser(email);
    return res.json({ success: true, message: 'Email confirmé avec succès !' });
  }

  return res.status(400).json({ success: false, message: 'Code invalide' });
});

// Route pour créer/mettre à jour un utilisateur (attend nom, prenom, email, password, role)
app.post('/create-user', async (req, res) => {
  const { email, password, nom, prenom, role } = req.body;
  if (!email || !password || !nom) return res.status(400).json({ success: false, message: 'Données manquantes' });
  const hashed = await bcrypt.hash(password, 10);
  await db.createOrUpdateUser({ email, password: hashed, nom, prenom, role });
  return res.json({ success: true, message: 'Utilisateur créé/mis à jour' });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});
