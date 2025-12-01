// ============================================
// DATABASE MODULE - MySQL uniquement
// ============================================
// Ce module gère toutes les opérations de base de données
// Utilise MySQL (XAMPP) comme seule source de données

let pool = null;
let mysqlReady = false;
let mysqlInitPromise = null;

// ============================================
// INITIALISATION MYSQL
// ============================================
async function initMySQL() {
  const host = process.env.DB_HOST;
  if (!host) {
    throw new Error('❌ MySQL non configuré! Veuillez définir DB_HOST dans .env');
  }
  
  try {
    const mysql = require('mysql2/promise');
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
    
    pool = mysql.createPool({
      host,
      port,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'planning',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    
    // Test de connexion
    await pool.query('SELECT 1');
    mysqlReady = true;
    console.log('✅ MySQL connecté:', process.env.DB_NAME);
    return true;
  } catch (err) {
    console.error('❌ Erreur MySQL:', err.message);
    pool = null;
    mysqlReady = false;
    throw err;
  }
}

// Initialiser MySQL au chargement du module
mysqlInitPromise = initMySQL().catch(err => {
  console.error('💥 Impossible de démarrer sans MySQL:', err.message);
  process.exit(1); // Arrêter le serveur si MySQL n'est pas disponible
});

// SQL helpers
async function query(sql, params) {
  if (!pool) throw new Error('No DB pool');
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function execute(sql, params) {
  if (!pool) throw new Error('No DB pool');
  const [result] = await pool.execute(sql, params);
  return result;
}

// ============================================
// EXPORTS - FONCTIONS PUBLIQUES
// ============================================
module.exports = {
  // Initialisation MySQL
  initMySQL,
  
  // Attendre l'initialisation MySQL
  waitForInit: async () => {
    await mysqlInitPromise;
    return mysqlReady;
  },
  
  // ========== USERS ==========
  async getUsers() {
    const rows = await query('SELECT id, email, phone, password, nom, prenom, role, isConfirmed FROM users');
    return rows.map(r => ({ 
      id: r.id, 
      email: r.email, 
      phone: r.phone || null,
      password: r.password || '', 
      nom: r.nom || '', 
      prenom: r.prenom || '', 
      role: r.role || 'medecin', 
      isConfirmed: !!r.isConfirmed 
    }));
  },
  
  // ========== PLANNING ==========
  async getPlanning() {
    // Le planning est stocké en JSON pour l'instant
    // TODO: Migrer vers MySQL si nécessaire
    const rows = await query('SELECT * FROM planning ORDER BY date');
    const planning = {};
    rows.forEach(row => {
      if (!planning[row.date]) planning[row.date] = [];
      planning[row.date].push(JSON.parse(row.events || '[]'));
    });
    return planning;
  },
  
  async savePlanning(obj) {
    // Sauvegarder le planning
    // Pour l'instant, on peut utiliser une table simple
    await query('DELETE FROM planning');
    for (const [date, events] of Object.entries(obj)) {
      await query('INSERT INTO planning (date, events) VALUES (?, ?)', [date, JSON.stringify(events)]);
    }
    return true;
  },
  
  // ========== EVENTS & CALENDARS ==========
  // Events / Calendars / Attendees
  async createEvent({ calendarId = null, organizerEmail = '', title = '', description = '', startAt, endAt, timezone = null, location = null, recurrence = null }) {
    const result = await execute('INSERT INTO events (calendar_id, organizer_email, title, description, start_at, end_at, timezone, location, recurrence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [calendarId, organizerEmail, title, description, startAt, endAt, timezone, location, recurrence]);
    return result && result.insertId ? result.insertId : null;
  },
  
  async getEventsForCalendar(calendarId = null, rangeStart = null, rangeEnd = null) {
    let sql = 'SELECT * FROM events';
    const params = [];
    const where = [];
    if (calendarId !== null) { where.push('calendar_id = ?'); params.push(calendarId); }
    if (rangeStart) { where.push('start_at >= ?'); params.push(rangeStart); }
    if (rangeEnd) { where.push('start_at <= ?'); params.push(rangeEnd); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    const rows = await query(sql, params);
    return rows;
  },
  
  // add attendee by contact object or string (email or phone)
  async addAttendee(eventId, contact, invitedBy = null, canEdit = false) {
    let email = null, phone = null;
    if (!contact) return false;
    if (typeof contact === 'string') {
      if (contact.includes('@')) email = contact; else phone = contact;
    } else if (typeof contact === 'object') {
      email = contact.email || null;
      phone = contact.phone || null;
    }
    try {
      await execute(`INSERT INTO attendees (event_id, email, phone, status, can_edit, invited_by) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), can_edit = VALUES(can_edit), invited_by = VALUES(invited_by)`, [eventId, email, phone, 'invited', canEdit ? 1 : 0, invitedBy]);
      return true;
    } catch (_err) {
      return false;
    }
  },
  

  // RSVP by email or phone
  async rsvpAttendee(eventId, contact, status) {
    let email = null, phone = null;
    if (typeof contact === 'string') { if (contact.includes('@')) email = contact; else phone = contact; }
    else if (typeof contact === 'object') { email = contact.email || null; phone = contact.phone || null; }
    const where = email ? 'email = ?' : 'phone = ?';
    const val = email || phone;
    await execute(`UPDATE attendees SET status = ? WHERE event_id = ? AND ${where}`, [status, eventId, val]);
    return true;
  },
  

  // set attendee permission (admin only) - contact is email or phone
  async setAttendeePermission(eventId, contact, canEdit) {
    let email = null, phone = null;
    if (typeof contact === 'string') { if (contact.includes('@')) email = contact; else phone = contact; }
    else if (typeof contact === 'object') { email = contact.email || null; phone = contact.phone || null; }
    const where = email ? 'email = ?' : 'phone = ?';
    const val = email || phone;
    await execute(`UPDATE attendees SET can_edit = ? WHERE event_id = ? AND ${where}`, [canEdit ? 1 : 0, eventId, val]);
    return true;
  },
  
  async findUserByEmail(email) {
    return await this.findUserByContact(email);
  },
  
  async findUserByContact(contact) {
    if (!contact) return null;
    const rows = await query('SELECT id, email, phone, password, nom, prenom, role, isConfirmed FROM users WHERE email = ? OR phone = ? LIMIT 1', [contact, contact]);
    if (!rows || !rows[0]) return null;
    const r = rows[0];
    return { id: r.id, email: r.email, phone: r.phone || null, password: r.password || '', nom: r.nom || '', prenom: r.prenom || '', role: r.role, isConfirmed: !!r.isConfirmed };
  },
  
  async createOrUpdateUser({ email, password, nom, prenom, role }) {
    const phone = arguments[0].phone || null;
    await query(`INSERT INTO users (email, phone, password, nom, prenom, role, isConfirmed) VALUES (?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE phone = VALUES(phone), password = VALUES(password), nom = VALUES(nom), prenom = VALUES(prenom), role = VALUES(role), isConfirmed = 1`, [email, phone, password, nom, prenom, role || 'medecin']);
    return true;
  },
  
  async addUser({ email, nom = '', prenom = '', role = 'medecin' }) {
    const phone = arguments[0].phone || null;
    try {
      const result = await execute('INSERT INTO users (email, phone, password, nom, prenom, role, isConfirmed) VALUES (?, ?, ?, ?, ?, ?, 0)', [email || null, phone || null, '', nom, prenom, role]);
      return result && result.insertId ? result.insertId : true;
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') return false;
      throw err;
    }
  },
  
  async confirmUser(contact) {
    await query('UPDATE users SET isConfirmed = 1 WHERE email = ? OR phone = ?', [contact, contact]);
  },
  
  async saveCode(contact, code) {
    await query(`INSERT INTO codes (contact, code) VALUES (?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code)`, [contact, String(code)]);
  },
  
  async getCode(contact) {
    const rows = await query('SELECT code FROM codes WHERE contact = ? LIMIT 1', [contact]);
    return rows[0] ? String(rows[0].code) : null;
  },
  
  async deleteCode(contact) {
    await query('DELETE FROM codes WHERE contact = ?', [contact]);
  }
};