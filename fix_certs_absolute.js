const fs = require('fs');

const scriptReplacement = `// Load saved certificates - Pure Firebase sync
async function loadCertsFromStorage() {
  if (!window.db) {
    certificates = [...DEFAULT_CERTIFICATES];
    renderCertificates();
    return;
  }
  
  try {
    const docRef = window.doc(window.db, "portfolio", "certificates");
    const docSnap = await window.getDoc(docRef, { source: 'server' });
    
    if (docSnap.exists() && docSnap.data().data) {
      certificates = docSnap.data().data;
    } else {
      certificates = [...DEFAULT_CERTIFICATES];
    }
  } catch (err) {
    console.warn("Firestore fetch failed, reverting to default certs:", err);
    certificates = [...DEFAULT_CERTIFICATES];
  } finally {
    renderCertificates();
  }
}

// Save all certs - Pure Firebase sync
async function saveCertData() {
  if (!window.db) {
    alert("Database not connected to Cloud Storage!");
    return;
  }

  try {
    await window.setDoc(window.doc(window.db, "portfolio", "certificates"), { data: certificates });
    console.log("Certificates synced to strict Firebase storage.");
  } catch(err) {
    console.error("Firebase save failed:", err.message);
    alert("Save Failed! Your Firebase access might be restricted.\\nError: " + err.message);
  }
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
    // Filter out cached local data paths that might be retained in browser session during transition
    if (imgSrc.startsWith('file://') || imgSrc.startsWith('C:/')) {
      return; 
    }

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

function closeZoom() {
  document.getElementById("zoomModal").classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const zoomModal = document.getElementById("zoomModal");
  if (zoomModal) {
    zoomModal.addEventListener("click", (e) => {
      if (e.target === zoomModal) closeZoom();
    });
    document.getElementById("zoomModalImg").addEventListener("click", (e) => {
      e.stopPropagation();
      zoomLevel = zoomLevel >= 3 ? 1 : zoomLevel + 0.5;
      e.target.style.transform = \`scale(\${zoomLevel})\`;
      e.target.style.cursor = zoomLevel >= 3 ? "zoom-out" : "zoom-in";
    });
  }
});

/* DOWNLOAD */
function downloadCert(index) {
  const cert = certificates[index];
  if (!cert || !cert.image) return alert("No image to download!");
  const link = document.createElement("a");
  link.href = cert.image;
  link.download = cert.title + " Certificate.png";
  link.click();
}

/* DELETE */
function deleteCert(index) {
  if (confirm(\`Delete "\${certificates[index].title}" from Cloud Storage?\`)) {
    // Note: To be fully clean we should also delete the Storage object here, 
    // but the main requirement is removing from DB.
    certificates.splice(index, 1);
    saveCertData();
    renderCertificates();
  }
}

/* MODAL */
function openCertModal(index = null) {
  const modal = document.getElementById("certModal");
  modal.style.display = "flex";

  const titleInput = document.getElementById("certTitle");
  const orgInput = document.getElementById("certOrg");
  const descInput = document.getElementById("certDesc");
  const fileInput = document.getElementById("certImage");

  fileInput.value = "";

  if (index !== null && index >= 0) {
    titleInput.value = certificates[index].title;
    orgInput.value = certificates[index].org;
    descInput.value = certificates[index].desc || "";
    editId = index;
  } else {
    titleInput.value = "";
    orgInput.value = "";
    descInput.value = "";
    editId = null;
  }
}

function closeCertModal() {
  document.getElementById("certModal").style.display = "none";
}

/* SAVE CERT — Direct Cloud Upload (No base64) */
async function saveCert() {
  const title = document.getElementById("certTitle").value.trim();
  const org   = document.getElementById("certOrg").value.trim();
  const desc  = document.getElementById("certDesc").value.trim();
  const fileInput = document.getElementById("certImage");
  const file  = fileInput.files[0];

  if (!title || !org) {
    alert("Please fill in Title and Organization!");
    return;
  }

  const saveBtn = document.querySelector(".cert-modal-content button.save");
  if(saveBtn) saveBtn.innerHTML = "Saving to Cloud...";

  try {
    let publicUrl = null;

    // Editing text only (no new image)
    if (editId !== null && !file) {
      certificates[editId].title = title;
      certificates[editId].org   = org;
      certificates[editId].desc  = desc;
      await saveCertData();
      renderCertificates();
      closeCertModal();
      alert("✅ Certificate updated in Cloud!");
      return;
    }

    if (!file) {
      alert("Please select an image!");
      return;
    }
    
    if (!window.storage) {
       alert("Firebase Storage not initialized.");
       return;
    }

    // Upload to Firebase Storage
    const storagePath = 'certificates/' + Date.now() + '_' + file.name;
    const fileRef = window.ref(window.storage, storagePath);
    await window.uploadBytes(fileRef, file);
    
    // Get public URL
    publicUrl = await window.getDownloadURL(fileRef);

    if (editId !== null) {
      certificates[editId] = { ...certificates[editId], title, org, desc, image: publicUrl };
    } else {
      certificates.push({ title, org, desc, image: publicUrl });
    }

    await saveCertData();
    renderCertificates();
    closeCertModal();
    alert("✅ Certificate saved directly to Cloud!");

  } catch (e) {
    console.error("Cert upload failed", e);
    alert("Upload failed: " + e.message);
  } finally {
    if(saveBtn) saveBtn.innerHTML = "Save Certificate";
  }
}`;

let code = fs.readFileSync('script.js', 'utf8');

// The exact string to replace from is:
const targetStart = '// Load saved certificates - localStorage first';

// We need to replace until the end of the saveCert() function block. Let's find the saveCert function first
const saveCertStart = code.indexOf('function saveCert()');
if (saveCertStart === -1) {
  console.log('Error: Could not find saveCert()');
  process.exit(1);
}

// Find a known function signature AFTER saveCert that we do NOT want to replace
const afterSaveCertSignatures = [
  'function openAddSkillModal',
  'function closeSkillModal',
  '// --- Skills',
  '// --- TEXT EDITING',
  '// Data objects for real-time portfolio items',
  'function enableTextEdit'
];

let targetEnd = -1;
for (const sig of afterSaveCertSignatures) {
  const index = code.indexOf(sig, saveCertStart);
  if (index !== -1 && (targetEnd === -1 || index < targetEnd)) {
    targetEnd = index;
  }
}

if (targetEnd === -1) {
    console.log('Could not find suitable end marker after saveCert()');
    process.exit(1);
}

// Now trace back to the last closing brace '}' before targetEnd
let actualEnd = -1;
for (let i = targetEnd - 1; i > saveCertStart; i--) {
    if (code[i] === '}') {
        actualEnd = i + 1; // include the brace
        break;
    }
}

if (actualEnd === -1) {
    console.log("Could not find brace to wrap up saveCert()");
    process.exit(1);
}

const startReplacementIndex = code.indexOf(targetStart);
if (startReplacementIndex === -1) {
    console.log('Error: Could not find targetStart');
    process.exit(1);
}

// Perform Replacement
const newCode = code.substring(0, startReplacementIndex) + scriptReplacement + "\n\n" + code.substring(actualEnd);
fs.writeFileSync('script.js', newCode, 'utf8');
console.log("SUCCESS! script.js injected with pure Firebase certificates logic.");
