// Script de diagnostic - Vérifie tous les boutons et leurs handlers
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC DES BOUTONS - VÉRIFICATION COMPLÈTE\n');
console.log('═'.repeat(70));

const screensDir = './screens';
const appDir = './app';

// Lire tous les fichiers des écrans
const screenFiles = fs.readdirSync(screensDir).filter(f => f.endsWith('.js'));

let emptyHandlers = [];
let navigationTargets = new Set();
let potentialIssues = [];

screenFiles.forEach(file => {
  const content = fs.readFileSync(path.join(screensDir, file), 'utf8');
  
  // Chercher les boutons vides
  const emptyPattern = /onPress\s*=\s*\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/g;
  const matches = content.match(emptyPattern);
  if (matches) {
    emptyHandlers.push({
      file,
      count: matches.length
    });
  }
  
  // Chercher les targets de navigation
  const navPattern = /router\.push\(['"`](\/[^'"`]+)['"`]\)/g;
  let match;
  while ((match = navPattern.exec(content)) !== null) {
    navigationTargets.add(match[1]);
  }
});

// Lire et analyser les routes existantes
const appFiles = fs.readdirSync(appDir).filter(f => f.endsWith('.jsx'));
const existingRoutes = new Set(
  appFiles.map(f => '/' + f.replace('.jsx', ''))
);

// Chercher les routes qui n'existent pas
navigationTargets.forEach(target => {
  const routeName = target.split('/')[1] || '';
  if (!appFiles.some(f => f.startsWith(routeName))) {
    potentialIssues.push(target);
  }
});

// Afficher le rapport
console.log('\n📋 RAPPORT D\'ANALYSE\n');

console.log('🚫 BOUTONS SANS FONCTION (Empty Handlers):');
console.log('─'.repeat(70));
if (emptyHandlers.length > 0) {
  emptyHandlers.forEach(item => {
    console.log(`  ❌ ${item.file}: ${item.count} bouton(s) vide(s)`);
  });
} else {
  console.log('  ✅ Aucun bouton vide détecté');
}

console.log('\n🌍 ROUTES DE NAVIGATION TROUVÉES:');
console.log('─'.repeat(70));
const sortedTargets = Array.from(navigationTargets).sort();
sortedTargets.forEach(target => {
  const exists = appFiles.some(f => ('/' + f.replace('.jsx', '')).startsWith(target));
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${target}`);
});

console.log('\n⚠️  ROUTES CASSÉES (Chemins qui ne correspondent à aucun fichier):');
console.log('─'.repeat(70));
if (potentialIssues.length > 0) {
  potentialIssues.forEach(issue => {
    console.log(`  ❌ ${issue}`);
  });
} else {
  console.log('  ✅ Aucune route cassée détectée');
}

console.log('\n📁 FICHIERS ROUTES DISPONIBLES:');
console.log('─'.repeat(70));
appFiles.sort().forEach(f => {
  console.log(`  ✅ /${f.replace('.jsx', '')}`);
});

console.log('\n' + '═'.repeat(70));
console.log('\n✅ DIAGNOSTIC TERMINÉ\n');
