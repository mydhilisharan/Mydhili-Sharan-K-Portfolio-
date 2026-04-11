const fs = require('fs');
let c = fs.readFileSync('script.js', 'utf8');
c = c.split('\\\\n').join('\\n');
fs.writeFileSync('script.js', c, 'utf8');
console.log('Fixed');
