// Script de test pour Clinique Mobile
const db = require('../db/database.js');

async function testClinoMobile() {
  try {
    await db.waitForInit();
    console.log('✓ Base de données initialisée');

    // Tester getClinoMobile
    const interventions = await db.getClinoMobile();
    console.log('✓ getClinoMobile() fonctionne, nombre d\'interventions:', interventions.length);

    // Tester l'ajout d'une intervention de test
    if (interventions.length === 0) {
      console.log('📝 Ajout d\'une intervention de test...');
      const id = await db.addClinoMobile({
        date: new Date().toISOString().split('T')[0],
        heure: '09:00:00',
        adresse: '123 Rue Test, Ariana',
        medecin: 'Dr. Test',
        commentaire: 'Intervention de test'
      });
      console.log('✓ Intervention ajoutée avec ID:', id);
    }

    // Lister les interventions
    const all = await db.getClinoMobile();
    console.log('📋 Interventions:', JSON.stringify(all, null, 2));

    console.log('\n✅ Tous les tests ont réussi!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

testClinoMobile();

