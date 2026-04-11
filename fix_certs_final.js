const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// Find the broken section boundaries
const startMarker = '// Load saved certificates (localStorage additions on top of defaults)';
const endMarker = '  });\n}\n\n/* RENDER */';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.log('MARKERS NOT FOUND. start:', startIdx, 'end:', endIdx);
    process.exit(1);
}

// Replacement: two clean, separate functions
const replacement = `// Load saved certificates from Firestore
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
}

// Save all certs to Firestore
function saveCertData() {
  if(!window.db) {
    alert("Database not connected. Changes may not be saved.");
    return;
  }
  window.setDoc(window.doc(window.db, "portfolio", "certificates"), { data: certificates })
    .then(() => console.log("Certificates saved to Firebase"))
    .catch(err => {
      alert("Save Failed! Your Firestore Rules may be blocking writes.\\n\\nGo to Firebase Console → Firestore → Rules and set:\\nallow read, write: if true;\\n\\nError: " + err.message);
    });
}

/* RENDER */`;

// Replace from startMarker all the way to end of endMarker
const endCutIdx = endIdx + endMarker.length;
const newCode = code.substring(0, startIdx) + replacement + code.substring(endCutIdx);

fs.writeFileSync('script.js', newCode, 'utf8');
console.log('script.js successfully patched!');
