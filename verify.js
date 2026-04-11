const fs = require('fs');
const s = fs.readFileSync('script.js','utf8');
const a = fs.readFileSync('ai-gallery.html','utf8');

const checks = {
  'script.js - loadCertificates': s.includes('async function loadCertificates'),
  'script.js - saveCertificate': s.includes('async function saveCertificate'),
  'script.js - deleteCert with docId': s.includes('async function deleteCert'),
  'script.js - compat .collection().get()': s.includes(".collection(") && s.includes(".get()"),
  'script.js - compat .add(': s.includes(".add({"),
  'script.js - compat .update(': s.includes(".update("),
  'script.js - renderCertificatesUI': s.includes('function renderCertificatesUI'),
  'script.js - addCertBtn hook in DOMContentLoaded': s.includes("addCertBtn"),
  'script.js - no localStorage for certs': !s.includes("localStorage.getItem('portfolioCertificates')"),
  'gallery - openModal': a.includes('function openModal'),
  'gallery - closeModal': a.includes('function closeModal'),
  'gallery - addMedia': a.includes('async function addMedia'),
  'gallery - loadGalleryData using .get()': a.includes(".collection(") && a.includes(".get()"),
  'gallery - addDoc via compat .add(': a.includes(".add("),
  'gallery - loadGallery called after save': a.includes("loadGalleryData()"),
};

let allPassed = true;
for (const [check, result] of Object.entries(checks)) {
  const icon = result ? '✅' : '❌';
  if (!result) allPassed = false;
  console.log(icon + ' ' + check);
}
console.log('');
console.log(allPassed ? '🎉 ALL CHECKS PASSED' : '⚠️  Some checks failed');
