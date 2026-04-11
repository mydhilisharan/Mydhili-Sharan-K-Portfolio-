const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// ─── FIX 1: Replace loadCertsFromStorage to use localStorage first ───
const oldLoad = `// Load saved certificates from Firestore
function loadCertsFromStorage() {
  if(!window.db) {
    certificates = [...DEFAULT_CERTIFICATES];
    renderCertificates();
    return;
  }
  window.onSnapshot(
    window.doc(window.db, "portfolio", "certificates"),
    (docSnap) => {
      if (docSnap.exists() && docSnap.data().data) {
        certificates = docSnap.data().data;
      } else {
        certificates = [...DEFAULT_CERTIFICATES];
      }
      renderCertificates();
    },
    (err) => {
      console.warn("Firestore cert read failed:", err);
      certificates = [...DEFAULT_CERTIFICATES];
      renderCertificates();
    }
  );
}`;

const newLoad = `// Load saved certificates - localStorage first, Firebase optional sync
function loadCertsFromStorage() {
  // Always load from localStorage first (instant, no network)
  const saved = localStorage.getItem('portfolioCertificates');
  if (saved) {
    try {
      certificates = JSON.parse(saved);
    } catch(e) {
      certificates = [...DEFAULT_CERTIFICATES];
    }
  } else {
    certificates = [...DEFAULT_CERTIFICATES];
  }
  renderCertificates();

  // Try Firebase in background to sync across devices (optional)
  if (window.db) {
    try {
      window.onSnapshot(
        window.doc(window.db, "portfolio", "certificates"),
        (docSnap) => {
          if (docSnap.exists() && docSnap.data().data) {
            certificates = docSnap.data().data;
            localStorage.setItem('portfolioCertificates', JSON.stringify(certificates));
            renderCertificates();
          }
        },
        (err) => {
          console.warn("Firebase sync unavailable, using localStorage:", err.code || err.message);
        }
      );
    } catch(e) {
      console.warn("Firebase cert sync skipped:", e.message);
    }
  }
}`;

// ─── FIX 2: Replace saveCertData to use localStorage first ───
const oldSave = `// Save all certs to Firestore
function saveCertData() {
  if(!window.db) {
    alert("Database not connected. Changes may not be saved.");
    return;
  }
  window.setDoc(window.doc(window.db, "portfolio", "certificates"), { data: certificates })
    .then(() => console.log("Certificates saved to Firebase"))
    .catch(err => {
      alert("Save Failed! Your Firestore Rules may be blocking writes.\\n\\nGo to Firebase Console > Firestore > Rules and set:\\nallow read, write: if true;\\n\\nError: " + err.message);
    });
}`;

const newSave = `// Save all certs - localStorage primary, Firebase optional sync
function saveCertData() {
  // Always save to localStorage (works without Firebase rules)
  localStorage.setItem('portfolioCertificates', JSON.stringify(certificates));
  console.log("Certificates saved to localStorage");

  // Try Firebase sync in background (silently)
  if (window.db) {
    window.setDoc(window.doc(window.db, "portfolio", "certificates"), { data: certificates })
      .then(() => console.log("Certificates synced to Firebase"))
      .catch(err => console.warn("Firebase sync unavailable (localStorage is primary):", err.code || err.message));
  }
}`;

if (!code.includes(oldLoad.substring(0, 50))) {
  console.log("ERROR: Cannot find loadCertsFromStorage function marker");
  process.exit(1);
}
if (!code.includes(oldSave.substring(0, 50))) {
  console.log("ERROR: Cannot find saveCertData function marker");
  process.exit(1);
}

code = code.replace(oldLoad, newLoad);
code = code.replace(oldSave, newSave);

fs.writeFileSync('script.js', code, 'utf8');
console.log("script.js patched - certificates now use localStorage as primary storage!");
