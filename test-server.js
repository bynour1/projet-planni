// Test simple du serveur
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
// const db = require('./db/database');

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Serveur OK!' });
});

// Login endpoint simplifié
app.post('/login', async (req, res) => {
  console.log('📨 Login request received:', req.body);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }
    
    console.log('🔍 Looking for user:', email);
    // Test sans DB
    return res.json({ success: true, message: 'DB disabled for test', email });
  } catch (error) {
    console.error('💥 Error during login:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('Try: curl http://localhost:5000/test');
});
