const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// The marker where we start to replace
const startIndex = code.indexOf('// ==========================================');
// Start looking for the end of the corrupted zone which was the end of renderCertificates()
const endMarker = 'function closeZoom() {';
const endIndex = code.indexOf(endMarker);

if(startIndex > -1 && endIndex > -1) {
  const cleanCode = `// ==========================================
// CERTIFICATE SYSTEM — Static File-Based (GitHub Compatible)
// ==========================================

// Default hardcoded certificates using real image files from /certificate/ folder
const DEFAULT_CERTIFICATES = [
  { title: "Cyber Crime Analytics - Part 1", org: "LetsDefend", desc: "Cybercrime analytics training covering investigation techniques and threat analysis.", image: "certificate/cyber%20crime%20analytics%201.jgp.jpeg" },
  { title: "Cyber Crime Analytics - Part 2", org: "LetsDefend", desc: "Advanced cybercrime analytics covering forensic methodologies and case analysis.", image: "certificate/cyber%20crime%20analytics%202.jpg.jpeg" },
  { title: "Data Analytics", org: "Coursera", desc: "Data analytics fundamentals including visualization, interpretation, and reporting.", image: "certificate/data%20analytics%20.jpg.jpeg" },
  { title: "Ethical Hacking", org: "NPTEL", desc: "Comprehensive ethical hacking course covering network security and penetration testing.", image: "certificate/ethical%20hacking%20course.jpg.jpeg" },
  { title: "Google Cybersecurity", org: "Google", desc: "Google's professional cybersecurity certificate covering security operations and risk management.", image: "certificate/google.jpg.jpeg" },
  { title: "SOC Analysis - Level 2", org: "LetsDefend", desc: "Advanced SOC analyst certification covering incident response and threat hunting.", image: "certificate/letdefend2.jpg.jpeg" },      
  { title: "SOC Analysis - Level 1", org: "LetsDefend", desc: "SOC analyst training covering SIEM operations, log analysis, and alert triaging.", image: "certificate/letsdefend.jpg.jpeg" },       
  { title: "MSK Security Badge", org: "Mydhili Sharan K", desc: "Personal achievement badge recognizing excellence in cybersecurity practice.", image: "certificate/MSHARAN.jpg.jpg" },
  { title: "Project Completion", org: "Academic", desc: "Project completion certificate for cybersecurity-focused academic work.", image: "certificate/project.jpg.jpeg" },
  { title: "TryHackMe", org: "TryHackMe", desc: "Hands-on cybersecurity training completing real-world hacking challenges and labs.", image: "certificate/try%20hack%20me.jpg.jpeg" }
];

let certificates = [...DEFAULT_CERTIFICATES];
let editId = null;

// Load saved certificates (localStorage additions on top of defaults)
function loadCertsFromStorage() {
  if(!window.db) return;
  window.onSnapshot(window.doc(window.db, "portfolio", "certificates"), (docSnap) => {
    if (docSnap.exists() && docSnap.data().data) {
      certificates = docSnap.data().data;
    } else {
      certificates = [...DEFAULT_CERTIFICATES];
    }
    renderCertificates();
  });
}

// Save all certs to localStorage
function saveCertData() {
  if(!window.db) return;
  window.setDoc(window.doc(window.db, "portfolio", "certificates"), { data: certificates })
    .then(() => {
        const adminStatus = document.getElementById("adminStatus");
        if(adminStatus) adminStatus.innerHTML = '<span style="color:#00ff88">✅ Database sync successful!</span>';
    })
    .catch((error) => {
        console.error("Firebase Sync Error:", error);
        alert("\\n\\nWARNING: Database Sync Failed!\\n\\nFirebase blocked your save because of missing Authenticated Database Rules! Your edits will be lost upon refreshing the page. Please set your Firebase Firestore Rules to 'allow read, write: if true;'\\n\\n");
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

    const escapedTitle = c.title.replace(/'/g, "\\\\'");
    grid.innerHTML += \`
      <div class="cert-card">
        <div class="cert-img">
          <img src="\${imgSrc}" alt="\${c.title}" loading="lazy"
            onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML+='<div style=\\'display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;background:rgba(0,200,255,0.05);border:1px dashed rgba(0,200,255,0.3);border-radius:8px;padding:10px;\\'><div style=\\'font-size:40px;\\'>🏅</div><span style=\\'color:rgba(0,200,255,0.6);font-size:12px;margin-top:6px;text-align:center;\\'>\${escapedTitle}</span></div>'">
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
let zoomLevel = 1;

function openZoom(index) {
  const cert = certificates[index];
  if (!cert) return;
  const modal = document.getElementById("zoomModal");
  const img   = document.getElementById("zoomModalImg");
  const fb = document.getElementById('zoomModalFallback');
  if (fb) fb.remove();
  img.style.display = 'block';
  img.src = cert.image || "";
  img.onerror = function() {
    img.style.display = 'none';
    const msg = document.createElement('div');
    msg.id = 'zoomModalFallback';
    msg.style.cssText = 'text-align:center;padding:40px;color:rgba(255,255,255,0.6);';
    msg.innerHTML = '<div style="font-size:48px;">🏅</div><h3 style="color:cyan;margin:12px 0 6px;">' + cert.title + '</h3><p style="color:rgba(255,255,255,0.5);">Image not found. Upload it via admin panel.</p>';
    img.parentElement.appendChild(msg);
  };
  zoomLevel = 1;
  img.style.transform = "scale(1)";
  modal.classList.add("active");
}

`;

  const newCode = code.substring(0, startIndex) + cleanCode + code.substring(endIndex);
  fs.writeFileSync('script.js', newCode, 'utf8');
  console.log("Certificate system rewritten and Database sync validation added!");
} else {
  console.log("Could not find markers!", startIndex, endIndex);
}
