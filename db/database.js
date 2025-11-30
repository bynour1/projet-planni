const path = require('path');
const fs = require('fs').promises;

// Use process.cwd() to build paths so ESLint doesn't complain about __dirname in ESM contexts
const dataDir = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(dataDir, 'users.json');
const CODES_FILE = path.join(dataDir, 'codes.json');
const PLANNING_FILE = path.join(dataDir, 'planning.json');

// File-based helpers (existing behavior)
async function ensureFiles() {
  try { await fs.access(dataDir); } catch (_) { await fs.mkdir(dataDir, { recursive: true }); }
  try { await fs.access(USERS_FILE); } catch (_) { await fs.writeFile(USERS_FILE, '[]', 'utf8'); }
  try { await fs.access(CODES_FILE); } catch (_) { await fs.writeFile(CODES_FILE, '{}', 'utf8'); }
}

async function readUsers() {
  await ensureFiles();
  const content = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(content || '[]');
}

async function writeUsers(users) {
  await ensureFiles();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

async function readCodes() {
  await ensureFiles();
  const content = await fs.readFile(CODES_FILE, 'utf8');
  return JSON.parse(content || '{}');
}

async function writeCodes(obj) {
  await ensureFiles();
  await fs.writeFile(CODES_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

async function readPlanningFile() {
  try {
    await ensureFiles();
    const content = await fs.readFile(PLANNING_FILE, 'utf8');
    return JSON.parse(content || '{}');
  } catch {
    return {};
  }
}

async function writePlanningFile(obj) {
  await ensureFiles();
  await fs.writeFile(PLANNING_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

// Optional MySQL support (XAMPP)
let useMySQL = false;
let pool = null;
let mysqlInitPromise = null;

async function initMySQL() {
  const host = process.env.DB_HOST;
  if (!host) {
    console.log('MySQL not configured, using file-based storage');
    return false;
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
      queueLimit: 0
    });
    // quick test connection
    await pool.query('SELECT 1');
    useMySQL = true;
    console.log('✅ MySQL database connected');
    return true;
  } catch (err) {
    console.warn('⚠️ MySQL init failed, using file-based storage:', err.message);
    pool = null;
    useMySQL = false;
    return false;
  }
}

// Initialize MySQL on first module load (wrapped in Promise to handle async)
mysqlInitPromise = initMySQL().catch(err => {
  console.error('Error initializing MySQL:', err);
  return false;
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

module.exports = {
  // Wait for MySQL initialization
  waitForInit: async () => {
    await mysqlInitPromise;
    return useMySQL;
  },
  async getUsers() {
    if (useMySQL && pool) {
        const rows = await query('SELECT id, email, password, nom, prenom, role, isConfirmed FROM users');
        return rows.map(r => ({ id: r.id, email: r.email, password: r.password || '', nom: r.nom || '', prenom: r.prenom || '', role: r.role || 'medecin', isConfirmed: !!r.isConfirmed }));
    }
    return await readUsers();
  },
  async getPlanning() {
    // For now planning is file-backed. If MySQL is later added for planning, implement here.
    return await readPlanningFile();
  },
  async savePlanning(obj) {
    return await writePlanningFile(obj);
  },
  // Events / Calendars / Attendees
  async createEvent({ calendarId = null, organizerEmail = '', title = '', description = '', startAt, endAt, timezone = null, location = null, recurrence = null }) {
    if (useMySQL && pool) {
      const result = await execute('INSERT INTO events (calendar_id, organizer_email, title, description, start_at, end_at, timezone, location, recurrence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [calendarId, organizerEmail, title, description, startAt, endAt, timezone, location, recurrence]);
      return result && result.insertId ? result.insertId : null;
    }
    // file-backed: store under planning.json as events array per calendar
    const planning = await readPlanningFile();
    const events = planning._events || [];
    const maxId = events.reduce((m, e) => (e.id && Number(e.id) > m ? Number(e.id) : m), 0);
    const newId = maxId + 1;
    const ev = { id: newId, calendarId, organizerEmail, title, description, startAt, endAt, timezone, location, recurrence };
    events.push(ev);
    planning._events = events;
    await writePlanningFile(planning);
    return newId;
  },
  async getEventsForCalendar(calendarId = null, rangeStart = null, rangeEnd = null) {
    if (useMySQL && pool) {
      let sql = 'SELECT * FROM events';
      const params = [];
      const where = [];
      if (calendarId !== null) { where.push('calendar_id = ?'); params.push(calendarId); }
      if (rangeStart) { where.push('start_at >= ?'); params.push(rangeStart); }
      if (rangeEnd) { where.push('start_at <= ?'); params.push(rangeEnd); }
      if (where.length) sql += ' WHERE ' + where.join(' AND ');
      const rows = await query(sql, params);
      return rows;
    }
    const planning = await readPlanningFile();
    const events = planning._events || [];
    let filtered = events;
    if (calendarId !== null) filtered = filtered.filter(e => String(e.calendarId) === String(calendarId));
    if (rangeStart) filtered = filtered.filter(e => new Date(e.startAt) >= new Date(rangeStart));
    if (rangeEnd) filtered = filtered.filter(e => new Date(e.startAt) <= new Date(rangeEnd));
    return filtered;
  },
  // add attendee by contact object or string (email or phone)
  async addAttendee(eventId, contact, invitedBy = null, canEdit = false) {
    // contact can be a string (email or phone) or an object { email, phone }
    let email = null, phone = null;
    if (!contact) return false;
    if (typeof contact === 'string') {
      if (contact.includes('@')) email = contact; else phone = contact;
    } else if (typeof contact === 'object') {
      email = contact.email || null;
      phone = contact.phone || null;
    }
    if (useMySQL && pool) {
      // use email or phone as unique key per event (email+event_id or phone+event_id)
      try {
        await execute(`INSERT INTO attendees (event_id, email, phone, status, can_edit, invited_by) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), can_edit = VALUES(can_edit), invited_by = VALUES(invited_by)`, [eventId, email, phone, 'invited', canEdit ? 1 : 0, invitedBy]);
        return true;
      } catch (_err) {
        // ignore duplicate or other errors
        return false;
      }
    }
    const planning = await readPlanningFile();
    const events = planning._events || [];
    const ev = events.find(e => String(e.id) === String(eventId));
    if (!ev) return false;
    ev.attendees = ev.attendees || [];
    const exists = ev.attendees.find(a => (email && a.email === email) || (phone && a.phone === phone));
    if (!exists) ev.attendees.push({ email, phone, status: 'invited', can_edit: !!canEdit, invited_by: invitedBy, invited_at: new Date().toISOString() });
    await writePlanningFile(planning);
    return true;
  },

  // RSVP by email or phone
  async rsvpAttendee(eventId, contact, status) {
    let email = null, phone = null;
    if (typeof contact === 'string') { if (contact.includes('@')) email = contact; else phone = contact; }
    else if (typeof contact === 'object') { email = contact.email || null; phone = contact.phone || null; }
    if (useMySQL && pool) {
      const where = email ? 'email = ?' : 'phone = ?';
      const val = email || phone;
      await execute(`UPDATE attendees SET status = ? WHERE event_id = ? AND ${where}`, [status, eventId, val]);
      return true;
    }
    const planning = await readPlanningFile();
    const events = planning._events || [];
    const ev = events.find(e => String(e.id) === String(eventId));
    if (!ev || !ev.attendees) return false;
    const at = ev.attendees.find(a => (email && a.email === email) || (phone && a.phone === phone));
    if (!at) return false;
    at.status = status;
    await writePlanningFile(planning);
    return true;
  },

  // set attendee permission (admin only) - contact is email or phone
  async setAttendeePermission(eventId, contact, canEdit) {
    let email = null, phone = null;
    if (typeof contact === 'string') { if (contact.includes('@')) email = contact; else phone = contact; }
    else if (typeof contact === 'object') { email = contact.email || null; phone = contact.phone || null; }
    if (useMySQL && pool) {
      const where = email ? 'email = ?' : 'phone = ?';
      const val = email || phone;
      await execute(`UPDATE attendees SET can_edit = ? WHERE event_id = ? AND ${where}`, [canEdit ? 1 : 0, eventId, val]);
      return true;
    }
    const planning = await readPlanningFile();
    const events = planning._events || [];
    const ev = events.find(e => String(e.id) === String(eventId));
    if (!ev || !ev.attendees) return false;
    const at = ev.attendees.find(a => (email && a.email === email) || (phone && a.phone === phone));
    if (!at) return false;
    at.can_edit = !!canEdit;
    await writePlanningFile(planning);
    return true;
  },
  async findUserByEmail(email) {
    // Backwards-compatible: find by email only
    return await this.findUserByContact(email);
  },
  async findUserByContact(contact) {
    if (!contact) return null;
    if (useMySQL && pool) {
      const rows = await query('SELECT id, email, phone, password, nom, prenom, role, isConfirmed FROM users WHERE email = ? OR phone = ? LIMIT 1', [contact, contact]);
      if (!rows || !rows[0]) return null;
      const r = rows[0];
      return { id: r.id, email: r.email, phone: r.phone || null, password: r.password || '', nom: r.nom || '', prenom: r.prenom || '', role: r.role, isConfirmed: !!r.isConfirmed };
    }
    const u = await readUsers(); return u.find(x => x.email === contact || x.phone === contact) || null;
  },
  async createOrUpdateUser({ email, password, nom, prenom, role }) {
    // Accept optional phone in the payload as well (for phone-based users)
    const phone = arguments[0].phone || null;
    if (useMySQL && pool) {
      // upsert, include phone if provided
      await query(`INSERT INTO users (email, phone, password, nom, prenom, role, isConfirmed) VALUES (?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE phone = VALUES(phone), password = VALUES(password), nom = VALUES(nom), prenom = VALUES(prenom), role = VALUES(role), isConfirmed = 1`, [email, phone, password, nom, prenom, role || 'medecin']);
      return true;
    }
    const users = await readUsers();
    const idx = users.findIndex(u => (email && u.email === email) || (phone && u.phone === phone));
    if (idx >= 0) {
      users[idx].password = password;
      users[idx].nom = nom;
      users[idx].prenom = prenom;
      users[idx].role = role || users[idx].role;
      users[idx].isConfirmed = true;
      if (phone) users[idx].phone = phone;
    } else {
      // assign incremental id for file-based storage
      const maxId = users.reduce((m, u) => (u.id && Number(u.id) > m ? Number(u.id) : m), 0);
      const newId = maxId + 1;
      users.push({ id: newId, email, phone, password, nom, prenom, role: role || 'medecin', isConfirmed: true });
    }
    await writeUsers(users);
    return true;
  },
  async addUser({ email, nom = '', prenom = '', role = 'medecin' }) {
      // allow phone in addUser payload
      const phone = arguments[0].phone || null;
      if (useMySQL && pool) {
        try {
          const result = await execute('INSERT INTO users (email, phone, password, nom, prenom, role, isConfirmed) VALUES (?, ?, ?, ?, ?, ?, 0)', [email || null, phone || null, '', nom, prenom, role]);
          return result && result.insertId ? result.insertId : true;
        } catch (err) {
          if (err && err.code === 'ER_DUP_ENTRY') return false;
          throw err;
        }
      }
    const users = await readUsers();
    const existing = users.find(u => (email && u.email === email) || (phone && u.phone === phone));
    if (existing) return false; // already exists
    // assign incremental numeric id for file-based storage
    const maxId = users.reduce((m, u) => (u.id && Number(u.id) > m ? Number(u.id) : m), 0);
    const newId = maxId + 1;
    users.push({ id: newId, email, phone, password: '', nom, prenom, role, isConfirmed: false });
    await writeUsers(users);
    return newId;
  },
  async confirmUser(contact) {
    // Accept email or phone contact
    if (useMySQL && pool) {
      await query('UPDATE users SET isConfirmed = 1 WHERE email = ? OR phone = ?', [contact, contact]);
      return;
    }
    const users = await readUsers();
    const u = users.find(x => x.email === contact || x.phone === contact);
    if (u) { u.isConfirmed = true; await writeUsers(users); }
  },
  async saveCode(contact, code) {
    if (useMySQL && pool) {
      await query(`INSERT INTO codes (contact, code) VALUES (?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code)`, [contact, String(code)]);
      return;
    }
    const codes = await readCodes();
    codes[contact] = String(code);
    await writeCodes(codes);
  },
  async getCode(contact) {
    if (useMySQL && pool) {
      const rows = await query('SELECT code FROM codes WHERE contact = ? LIMIT 1', [contact]);
      return rows[0] ? String(rows[0].code) : null;
    }
    const codes = await readCodes();
    return codes[contact] || null;
  },
  async deleteCode(contact) {
    if (useMySQL && pool) {
      await query('DELETE FROM codes WHERE contact = ?', [contact]);
      return;
    }
    const codes = await readCodes();
    if (codes[contact]) { delete codes[contact]; await writeCodes(codes); }
  }
};