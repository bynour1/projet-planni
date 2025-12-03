/* eslint-env node */
// Test script to verify planning data in MySQL
require('dotenv').config();
const path = require('path');
const db = require(path.join(__dirname, '..', 'db', 'database'));

async function testPlanning() {
  try {
    await db.waitForInit();
    console.log('✅ Database connected\n');
    
    console.log('📊 Testing Planning System...\n');
    
    // Test 1: Get current planning
    console.log('1️⃣ Fetching current planning from MySQL:');
    const planning = await db.getPlanning();
    console.log('Planning data:', JSON.stringify(planning, null, 2));
    console.log(`Total days with events: ${Object.keys(planning).length}\n`);
    
    // Test 2: Add a test event
    console.log('2️⃣ Adding test event for "Lundi 20 Jan":');
    const testPlanning = {
      ...planning,
      'Lundi 20 Jan': [
        ...(planning['Lundi 20 Jan'] || []),
        {
          medecin: 'Dr. Test',
          technicien: 'Tech Test',
          adresse: '123 rue de Test'
        }
      ]
    };
    
    await db.savePlanning(testPlanning);
    console.log('✅ Test event added\n');
    
    // Test 3: Verify the event was saved
    console.log('3️⃣ Verifying saved data:');
    const updatedPlanning = await db.getPlanning();
    console.log('Updated planning:', JSON.stringify(updatedPlanning, null, 2));
    
    if (updatedPlanning['Lundi 20 Jan']) {
      console.log('✅ Test event successfully saved and retrieved from MySQL!\n');
    } else {
      console.log('❌ Test event not found in database\n');
    }
    
    console.log('🎉 All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPlanning();
