const http = require('http');
const data = JSON.stringify({ email: 'Chakroun.sarra72@gmtariana.tn', password: 'Sarra.' });
const options = { hostname: '127.0.0.1', port: 8001, path: '/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.setEncoding('utf8');
  res.on('data', chunk => body += chunk);
  res.on('end', () => { console.log('BODY:', body); });
});
req.on('error', (e) => { console.error('request error', e); });
req.write(data);
req.end();
