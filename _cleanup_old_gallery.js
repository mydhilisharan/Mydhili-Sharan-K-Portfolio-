const fs = require('fs');
let c = fs.readFileSync('ai-gallery.html', 'utf8');

// Find and remove the OLD renderGallery/loadGalleryData block that runs from the second <script> tag (line 540 area)
// The new IndexedDB rewrite is already injected at the top. We need to remove the old block.

// Find the OLD block - it starts with SHARAN VAULT comment inside the second script tag
const oldStart = c.indexOf('// SHARAN VAULT — Pure Firebase Storage Collection System');
const oldEnd = c.indexOf("document.getElementById(\"lightbox\").addEventListener(\"click\", function(e) {");
// Include through the end of that listener
const listenerEnd = c.indexOf('});', oldEnd) + 3;
const oldBlockToRemove = c.substring(oldStart, listenerEnd);

if (oldStart > -1 && oldEnd > -1) {
    c = c.replace(oldBlockToRemove, '// Gallery handled by IndexedDB (see above)');
    fs.writeFileSync('ai-gallery.html', c);
    console.log('✅ Old Firebase gallery block removed!');
} else {
    console.log('❌ Could not find old block. oldStart:', oldStart, 'oldEnd:', oldEnd);
}
