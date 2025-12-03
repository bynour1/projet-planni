/* eslint-env node */
// Script to clear test data from planning table
require('dotenv').config();
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearPlanningData() {
  try {
    const db = require(path.join(__dirname, '..', 'db', 'database'));
    await db.waitForInit();
    console.log('✅ Database connected\n');
    
    // Show current data
    const currentPlanning = await db.getPlanning();
    const daysCount = Object.keys(currentPlanning).length;
    
    if (daysCount === 0) {
      console.log('ℹ️  La table planning est déjà vide.');
      process.exit(0);
    }
    
    console.log('📊 Données actuelles dans le planning:');
    console.log(JSON.stringify(currentPlanning, null, 2));
    console.log(`\nTotal: ${daysCount} jour(s) avec événements\n`);
    
    // Ask for confirmation
    rl.question('⚠️  Voulez-vous vraiment supprimer toutes ces données? (oui/non): ', async (answer) => {
      if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        // Clear all data
        await db.savePlanning({});
        console.log('\n✅ Toutes les données du planning ont été supprimées.');
        
        // Verify
        const verifyPlanning = await db.getPlanning();
        if (Object.keys(verifyPlanning).length === 0) {
          console.log('✅ Vérification: la table est vide.');
        }
      } else {
        console.log('\n❌ Opération annulée. Aucune donnée n\'a été supprimée.');
      }
      
      rl.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    rl.close();
    process.exit(1);
  }
}

clearPlanningData();
