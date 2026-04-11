const fs = require('fs');
const files = ['index.html', 'ai-gallery.html'];
const stamp = Date.now();

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  // Strip old query params if any
  c = c.replace(/script\.js(\?v=[0-9]+)?/g, 'script.js?v=' + stamp);
  c = c.replace(/firebase-config\.js(\?v=[0-9]+)?/g, 'firebase-config.js?v=' + stamp);
  fs.writeFileSync(f, c);
}
console.log("Stamps added!");
