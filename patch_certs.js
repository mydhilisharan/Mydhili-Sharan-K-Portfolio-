const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// Find the exact broken spot - where array entry is missing closing and functions are gone
const badMarker = '  { title: "Project Completion", org: "Academic", desc: "Project completion certificate for cybersecurity-focused academic work.", image: "certificate/project.jpg.jpeg" },\r\nlet zoomLevel = 1;';

const goodReplacement = `  { title: "Project Completion", org: "Academic", desc: "Project completion certificate for cybersecurity-focused academic work.", image: "certificate/project.jpg.jpeg" },
  { title: "TryHackMe", org: "TryHackMe", desc: "Hands-on cybersecurity training completing real-world hacking challenges and labs.", image: "certificate/try%20hack%20me.jpg.jpeg" }
];

let certificates = [...DEFAULT_CERTIFICATES];
let editId = null;

// Load saved certificates from Firestore
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
      alert("Save Failed! Your Firestore Rules may be blocking writes.\\n\\nGo to Firebase Console > Firestore > Rules and set:\\nallow read, write: if true;\\n\\nError: " + err.message);
    });
}

/* RENDER */
function renderCertificates() {
  const grid = document.getElementById("certGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (certificates.length === 0) {
    grid.innerHTML = \`<p style="color:rgba(255,255,255,0.4); text-align:center; grid-column:1/-1;">No certificates added yet.</p>\`;
    return;
  }

  certificates.forEach((c, index) => {
    const imgSrc = c.image || "";
    const adminTools = editMode ? \`
      <button class="edit" onclick="openCertModal(\${index})">Edit</button>
      <button class="delete" onclick="deleteCert(\${index})">Delete</button>
    \` : "";

    grid.innerHTML += \`
      <div class="cert-card">
        <div class="cert-img">
          <img src="\${imgSrc}" alt="\${c.title}" loading="lazy"
            onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML+='<div style=\\'display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;background:rgba(0,200,255,0.05);border:1px dashed rgba(0,200,255,0.3);border-radius:8px;padding:10px;\\'><div style=\\'font-size:40px;\\'>🏅</div></div>'">
        </div>
        <div class="cert-content">
          <h3>\${c.title}</h3>
          <span>\${c.org}</span>
          <p>\${c.desc || "No description added"}</p>
          <div class="cert-buttons">
            <button class="view" onclick="openZoom(\${index})">View</button>
            <button class="dl" onclick="downloadCert(\${index})">Download</button>
            \${adminTools}
          </div>
        </div>
      </div>
    \`;
  });
}

/* ZOOM LIGHTBOX */
let zoomLevel = 1;`;

// Try to find the bad marker (handle both \r\n and \n)
let idx = code.indexOf('  { title: "Project Completion", org: "Academic"');
if (idx === -1) {
    console.log("Could not find Project Completion entry");
    process.exit(1);
}

// Find where "let zoomLevel = 1" is
let zlIdx = code.indexOf('let zoomLevel = 1;');
if (zlIdx === -1) {
    console.log("Could not find zoomLevel");
    process.exit(1);
}

// Replace everything from project entry to (but not including) "let zoomLevel" line end
const newCode = code.substring(0, idx) + goodReplacement + code.substring(zlIdx + 'let zoomLevel = 1;'.length);

fs.writeFileSync('script.js', newCode, 'utf8');
console.log("Patched successfully! File size:", newCode.length);
