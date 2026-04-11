const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/onclick="saveCert\(\)"/g, 'onclick="saveCertificate()"');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html for saveCertificate onclick.');
