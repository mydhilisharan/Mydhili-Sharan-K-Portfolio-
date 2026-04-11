const fs = require('fs');
let html = fs.readFileSync('ai-gallery.html', 'utf8');
html = html.replace('<script type="module" src="firebase-config.js"></script>', '<script type="module" src="firebase-config.js?v=2"></script>');
fs.writeFileSync('ai-gallery.html', html, 'utf8');
