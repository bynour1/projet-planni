const http = require('http');

// Test d'invitation utilisateur
async function testInviteUser() {
  const data = JSON.stringify({
    email: 'chakroun.sarra72@gmtariana.tn',
    phone: '+216 1234 5678',
    nom: 'Chakroun',
    prenom: 'Sarra',
    role: 'medecin',
    sendCodeBy: 'email'  // ou 'phone'
  });

  const options = {
    hostname: 'localhost',
    port: 8083,
    path: '/invite-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log('\n📬 RÉSULTAT D\'INVITATION:');
        console.log('Status:', res.statusCode);
        console.log('Response:', JSON.parse(body));
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erreur:', e.message);
      reject(e);
    });

    console.log('📧 Invitation en cours...');
    console.log('Email: chakroun.sarra72@gmtariana.tn');
    console.log('Nom: Sarra Chakroun');
    console.log('Role: medecin');
    console.log('');

    req.write(data);
    req.end();
  });
}

testInviteUser();
