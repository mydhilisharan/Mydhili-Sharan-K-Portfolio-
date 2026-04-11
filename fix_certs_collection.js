const fs = require('fs');

const scriptReplacement = `// Load saved certificates - Pure Firebase sync (Collection Flow)
async function loadCertsFromStorage() {
  if (!window.db) {
    certificates = [...DEFAULT_CERTIFICATES];
    renderCertificates();
    return;
  }
  
  try {
    const querySnapshot = await window.getDocs(window.collection(window.db, "certificates"));
    
    // Only compile dynamic certificates from Firebase
    let firebaseCerts = [];
    querySnapshot.forEach((doc) => {
        firebaseCerts.push({ id: doc.id, ...doc.data() });
    });

    // Merge static default certs with firebase uploaded certs
    certificates = [...DEFAULT_CERTIFICATES, ...firebaseCerts];
    
  } catch (err) {
    console.warn("Firestore collection fetch failed, reverting to defaults:", err);
    certificates = [...DEFAULT_CERTIFICATES];
  } finally {
    renderCertificates();
  }
}

// Global update trigger when edits happen (not needed natively for Collections but serves as fallback interface)
async function saveCertData() {
    // Left empty because we use explicit addDoc/updateDoc in saveCert now.
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
    // Filter out cached local data paths
    if (imgSrc.startsWith('file://') || imgSrc.startsWith('C:/')) {
        return; 
    }

    // Pass the Firebase doc id to the delete function if it's not a default hardcoded statuc cert
    const docIdArg = c.id ? \`'\${c.id}'\` : 'null';

    const adminTools = editMode ? \`
      <button class="edit" onclick="openCertModal(\${index})">Edit</button>
      <button class="delete" onclick="deleteCert(\${index}, \${docIdArg})">Delete</button>
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
async function deleteCert(index, docId) {
  if (confirm(\`Permanently delete "\${certificates[index].title}" from Cloud Storage?\`)) {
    try {
        if (!docId) {
             // Basic hardcoded static array filter if they choose to delete default certs locally
             certificates.splice(index, 1);
             renderCertificates();
             return;
        }

        // Strict doc deletion from Firebase
        await window.deleteDoc(window.doc(window.db, "certificates", docId));
        certificates.splice(index, 1);
        renderCertificates();
        alert("Certificate removed from cloud.");
    } catch (e) {
        alert("Delete failed: " + e.message);
    }
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

/* SAVE CERT — Direct Cloud Collection Upload */
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

  const saveBtns = document.querySelectorAll(".cert-modal-content button.save, .cert-modal-content .btn.primary");
  const activeBtn = saveBtns.length > 0 ? saveBtns[saveBtns.length - 1] : null;

  if(activeBtn) {
      activeBtn.innerHTML = "Saving to Cloud...";
      activeBtn.disabled = true;
  }

  try {
    let publicUrl = null;
    let docId = editId !== null ? certificates[editId].id : null;

    // Editing text only (no new image)
    if (editId !== null && !file) {
      if (docId) {
          await window.updateDoc(window.doc(window.db, "certificates", docId), {
              title, org, desc
          });
      }
      
      await loadCertsFromStorage(); // Refresh everything natively
      closeCertModal();
      alert("✅ Certificate updated in Cloud!");
      return;
    }

    if (!file) {
      alert("Please select an image!");
      if(activeBtn) {
          activeBtn.innerHTML = "Save";
          activeBtn.disabled = false;
      }
      return;
    }
    
    if (!window.storage) {
       alert("Firebase Storage not initialized.");
       if(activeBtn) { activeBtn.innerHTML = "Save"; activeBtn.disabled = false;}
       return;
    }

    // Upload to Firebase Storage
    const storagePath = 'certificates/' + Date.now() + '_' + file.name;
    const fileRef = window.ref(window.storage, storagePath);
    await window.uploadBytes(fileRef, file);
    
    // Get public URL
    publicUrl = await window.getDownloadURL(fileRef);

    if (editId !== null && docId) {
        // Update existing document
        await window.updateDoc(window.doc(window.db, "certificates", docId), {
             title, org, desc, image: publicUrl
        });
    } else {
        // Add completely new document to collection
        await window.addDoc(window.collection(window.db, "certificates"), {
             title, org, desc, image: publicUrl
        });
    }

    await loadCertsFromStorage(); // Refresh natively
    closeCertModal();
    alert("✅ Certificate saved safely to specific Firebase Collection!");

  } catch (e) {
    console.error("Cert upload failed", e);
    alert("Upload failed: " + e.message);
  } finally {
    if(activeBtn) {
        activeBtn.innerHTML = "Save";
        activeBtn.disabled = false;
    }
  }
}`;

let code = fs.readFileSync('script.js', 'utf8');

// Using exact string bounds from previous modification
const targetStart = '// Load saved certificates - Pure Firebase sync';

const afterSaveCertSignatures = [
  'function openAddSkillModal',
  'function closeSkillModal',
  '// --- Skills',
  '// --- TEXT EDITING',
  '// Data objects for real-time portfolio items',
  'function enableTextEdit'
];

let saveCertStart = code.indexOf('function saveCert()');
if (saveCertStart === -1) {
    saveCertStart = code.indexOf('async function saveCert()');
}

let targetEnd = -1;
for (const sig of afterSaveCertSignatures) {
  const index = code.indexOf(sig, saveCertStart);
  if (index !== -1 && (targetEnd === -1 || index < targetEnd)) {
    targetEnd = index;
  }
}

// Now trace back to the last closing brace '}' before targetEnd
let actualEnd = -1;
for (let i = targetEnd - 1; i > saveCertStart; i--) {
    if (code[i] === '}') {
        actualEnd = i + 1; // include the brace
        break;
    }
}

const startReplacementIndex = code.indexOf(targetStart);
if (startReplacementIndex !== -1 && actualEnd !== -1) {
    const newCode = code.substring(0, startReplacementIndex) + scriptReplacement + "\n\n" + code.substring(actualEnd);
    fs.writeFileSync('script.js', newCode, 'utf8');
    console.log("script.js updated to exact Collection mappings and Add/Save Button requirements.");
} else {
    console.log("Could not find script bounds for replacement.", startReplacementIndex, actualEnd);
}
