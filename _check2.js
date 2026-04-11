const fs = require('fs');
const a = fs.readFileSync('ai-gallery.html', 'utf8');

// Find the addMedia function to see what it's doing for upload
const startIdx = a.indexOf('async function addMedia');
const endIdx = a.indexOf('\n        }', startIdx + 100) + 10;
console.log(a.substring(startIdx, endIdx));
