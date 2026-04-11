const fs = require('fs');

let html = fs.readFileSync('ai-gallery.html', 'utf8');

// 1. Check what ID the file input actually uses in the HTML
const fileInputMatch = html.match(/id="(fileInput|mediaInput|galleryFile)"/);
console.log('File input ID in HTML:', fileInputMatch ? fileInputMatch[1] : 'NOT FOUND');

// 2. Check what the upload-area inputs look like
const uploadAreaStart = html.indexOf('class="upload-area"');
console.log('Upload area HTML:', html.substring(uploadAreaStart, uploadAreaStart+300));

// 3. Check what ID the function references
const addMediaStart = html.indexOf('async function addMedia');
console.log('addMedia function start:', html.substring(addMediaStart, addMediaStart+300));
