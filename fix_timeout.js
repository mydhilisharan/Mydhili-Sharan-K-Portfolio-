const fs = require('fs');
let code = fs.readFileSync('ai-gallery.html', 'utf8');

const old = `            // Hardcode 5 second timeout fallback
            setTimeout(() => {
                if (loading) loading.style.display = "none";
            }, 5000);`;

const fixed = `            // Hard 3-second timeout - hides spinner regardless of Firebase
            setTimeout(() => {
                if (loading) loading.style.display = "none";
                if (galleryData.length === 0) renderGallery();
            }, 3000);`;

if (code.includes(old)) {
    code = code.replace(old, fixed);
    fs.writeFileSync('ai-gallery.html', code, 'utf8');
    console.log("SUCCESS: Timeout reduced from 5000ms to 3000ms");
} else {
    console.log("Pattern not found, checking current timeout...");
    const i = code.indexOf('setTimeout');
    console.log(code.substring(i, i+200));
}
