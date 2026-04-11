const fs = require('fs');

// ────────────────────────────────────────────────────────────
// FIX 1: script.js — Add loadCertificates() call on page init
// ────────────────────────────────────────────────────────────
let script = fs.readFileSync('script.js', 'utf8');

// Find the DOMContentLoaded that sets up the zoom modal
const target = 'document.addEventListener("DOMContentLoaded", () => {\n  const zoomModal = document.getElementById("zoomModal");';

if (script.includes(target)) {
  const replacement = `document.addEventListener("DOMContentLoaded", () => {
  // Init cert section immediately on page load
  if (typeof loadCertificates === "function") {
    setTimeout(() => loadCertificates(), 600);
  }

  const zoomModal = document.getElementById("zoomModal");`;
  script = script.replace(target, replacement);
  fs.writeFileSync('script.js', script, 'utf8');
  console.log("✅ FIX 1 applied: loadCertificates() called on DOMContentLoaded");
} else {
  console.log("❌ FIX 1 target not found");
}

// ────────────────────────────────────────────────────────────
// FIX 2: ai-gallery.html — Ensure openModal is called from button
// ────────────────────────────────────────────────────────────
let html = fs.readFileSync('ai-gallery.html', 'utf8');

// Check the floating-add button
if (html.includes('onclick="openModal()"')) {
  console.log("✅ FIX 2: Gallery + button already calls openModal()");
} else {
  // Patch the floating add button to ensure it calls openModal
  html = html.replace(
    /class="floating-add"[^>]*>/,
    'class="floating-add" onclick="openModal()" title="Add to Vault">'
  );
  fs.writeFileSync('ai-gallery.html', html, 'utf8');
  console.log("✅ FIX 2 applied: Gallery + button linked to openModal()");
}

// ────────────────────────────────────────────────────────────
// FIX 3: ai-gallery.html — Ensure modal display works
// ────────────────────────────────────────────────────────────
html = fs.readFileSync('ai-gallery.html', 'utf8');
// Ensure the modal has display:none initially so openModal can toggle it
if (html.includes('id="modal"') && !html.includes('id="modal" style="display')) {
  html = html.replace('id="modal"', 'id="modal" style="display:none;"');
  fs.writeFileSync('ai-gallery.html', html, 'utf8');
  console.log("✅ FIX 3 applied: modal starts hidden");
} else {
  console.log("✅ FIX 3: Modal display style already set");
}

console.log("\nAll fixes applied!");
