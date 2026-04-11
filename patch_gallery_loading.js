const fs = require('fs');
let code = fs.readFileSync('ai-gallery.html', 'utf8');

// Reduce timeout from 5s to 3s and also call renderGallery on timeout
code = code.replace(
    '// Hardcode 5 second timeout fallback\n                setTimeout(() => {\n                    if (loading) loading.style.display = "none";\n                }, 5000);',
    '// Hard 3-second timeout - hides spinner regardless of Firebase status\n                setTimeout(() => {\n                    if (loading) loading.style.display = "none";\n                    if (galleryData.length === 0) renderGallery();\n                }, 3000);'
);

// Also fix the onSnapshot to include an error handler
code = code.replace(
    'window.onSnapshot(window.doc(window.db, "portfolio", "gallery"), (docSnap) => {',
    'window.onSnapshot(window.doc(window.db, "portfolio", "gallery"), (docSnap) => {'
);

// Add error callback to onSnapshot if not present
const badOnSnapshot = 'window.onSnapshot(window.doc(window.db, "portfolio", "gallery"), (docSnap) => {\n                        if (docSnap.exists() && docSnap.data().data) {\n                            galleryData = docSnap.data().data;\n                        } else {\n                            galleryData = [];\n                        }\n                        renderGallery();\n                        if (loading) loading.style.display = "none";\n                    });';

const goodOnSnapshot = 'window.onSnapshot(\n                        window.doc(window.db, "portfolio", "gallery"),\n                        (docSnap) => {\n                            if (docSnap.exists() && docSnap.data().data) {\n                                galleryData = docSnap.data().data;\n                            } else {\n                                galleryData = [];\n                            }\n                            renderGallery();\n                            if (loading) loading.style.display = "none";\n                        },\n                        (err) => {\n                            console.warn("Firebase gallery read blocked:", err.code || err.message);\n                            galleryData = [];\n                            renderGallery();\n                            if (loading) loading.style.display = "none";\n                        }\n                    );';

if (code.includes(badOnSnapshot)) {
    code = code.replace(badOnSnapshot, goodOnSnapshot);
    console.log("Fixed onSnapshot error handler");
} else {
    console.log("onSnapshot pattern not matched exactly, but timeout was updated");
}

fs.writeFileSync('ai-gallery.html', code, 'utf8');
console.log("ai-gallery.html patched!");
