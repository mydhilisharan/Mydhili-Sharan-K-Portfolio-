const fs = require('fs');
let s = fs.readFileSync('ai-gallery.html', 'utf8');
s = s.replace(/!== 'sharan123'/g, '!== "1206"');
s = s.replace(/!== "sharan123"/g, '!== "1206"');
fs.writeFileSync('ai-gallery.html', s);
console.log('Updated passwords in ai-gallery.html');
