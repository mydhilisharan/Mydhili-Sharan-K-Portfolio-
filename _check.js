const fs = require('fs');
const a = fs.readFileSync('ai-gallery.html', 'utf8');
const modalIdx = a.indexOf('id="modal"');
console.log(a.substring(modalIdx, modalIdx + 200));
