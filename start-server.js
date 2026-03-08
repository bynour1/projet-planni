// Script de démarrage forcé sur le port 8083 (Frontend Expo utilise 8081)
process.env.PORT = '8083';
require('./server.js');

