const fs = require('fs');

const scriptReplacement = `// Load saved certificates - Exact Snippet Integration
async function loadCertificates() {
  const container = document.getElementById("certGrid");
  if (!container) return;
  
  // Safe default load explicitly required by user layout constraints
  if (!window.db) {
     certificates = [...DEFAULT_CERTIFICATES];
     renderCertificatesUI(container);
     return;
  }

  container.innerHTML = "<p style='color:#00e5ff; text-align:center; grid-column:1/-1;'>Loading certificates from secure cloud...</p>";

  try {
    const querySnapshot = await window.getDocs(window.collection(window.db, "certificates"));

    let firebaseCerts = [];
    querySnapshot.forEach((doc) => {
        firebaseCerts.push({ id: doc.id, ...doc.data() });
    });

    // Merge default and db certificates 
    certificates = [...DEFAULT_CERTIFICATES, ...firebaseCerts];

    if (certificates.length === 0) {
      container.innerHTML = "<p style='color:rgba(255,255,255,0.4); text-align:center; grid-column:1/-1;'>No certificates found</p>";
      return;
    }

    renderCertificatesUI(container);

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red; text-align:center; grid-column:1/-1;'>Error loading certificates ❌</p>";
  }
}

function renderCertificatesUI(container) {
    container.innerHTML = "";
    certificates.forEach((c, index) => {
        const imgSrc = c.image || "";
        if (imgSrc.startsWith('file://') || imgSrc.startsWith('C:/')) return;

        const docIdArg = c.id ? \`'\${c.id}'\` : 'null';
        const adminTools = editMode ? \`
          <button class="edit" onclick="openCertModal(\${index})">Edit</button>
          <button class="delete" onclick="deleteCert(\${index}, \${docIdArg})">Delete</button>
        \` : "";

        container.innerHTML += \`
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

// Global hook update
async function saveCertData() { }

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
  
  // MAP ADD CERTIFICATE BUTTON (MISSING FIX)
  const addBtn = document.getElementById("addCertBtn");
  if(addBtn) {
      addBtn.onclick = () => {
          document.getElementById("certModal").style.display = "flex";
      };
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
             certificates.splice(index, 1);
             loadCertificates();
             return;
        }
        await window.deleteDoc(window.doc(window.db, "certificates", docId));
        certificates.splice(index, 1);
        loadCertificates();
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

/* SAVE CERT — EXACT SNIPPET FLOW */
async function saveCertificate() {
  const title = document.getElementById("certTitle").value;
  const org = document.getElementById("certOrg").value;
  const desc = document.getElementById("certDesc").value;
  const file = document.getElementById("certImage").files[0];

  let docId = editId !== null ? certificates[editId].id : null;

  // Modified slightly to support editing text without needing to re-upload image
  if (!title || !org) {
    alert("Title and Org are required");
    return;
  }
  
  if (!file && editId === null) {
      alert("Please select an image!");
      return;
  }

  // Bind to the explicit save button
  const saveBtn = document.querySelector("#certModal .btn.primary");

  try {
    if(saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";
    }

    let url = null;
    if (file) {
        // Upload to Firebase Storage
        const storageRef = window.ref(window.storage, "certificates/" + Date.now() + "_" + file.name);
        await window.uploadBytes(storageRef, file);
        url = await window.getDownloadURL(storageRef);
    }

    if (editId !== null && docId) {
        const payload = { title, org, desc };
        if (url) payload.image = url;
        await window.updateDoc(window.doc(window.db, "certificates", docId), payload);
    } else {
        // Save to Firestore
        await window.addDoc(window.collection(window.db, "certificates"), {
            title,
            org,
            desc,
            image: url,
            createdAt: new Date().getTime()
        });
    }

    alert("Saved Successfully ✅");
    document.getElementById("certModal").style.display = "none";
    loadCertificates(); // reload UI

  } catch (err) {
    console.error(err);
    alert("Error saving certificate ❌");
  } finally {
    if(saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save";
    }
  }
}`;

let code = fs.readFileSync('script.js', 'utf8');

const targetStart = '// Load saved certificates - Pure Firebase sync';

const afterSaveCertSignatures = [
  'function openAddSkillModal',
  'function closeSkillModal',
  '// --- Skills',
  '// --- TEXT EDITING',
  '// Data objects for real-time portfolio items',
  'function enableTextEdit'
];

let saveCertStart = code.indexOf('async function saveCert()');
if (saveCertStart === -1) {
    saveCertStart = code.indexOf('function saveCert()');
}

let targetEnd = -1;
for (const sig of afterSaveCertSignatures) {
  const index = code.indexOf(sig, saveCertStart);
  if (index !== -1 && (targetEnd === -1 || index < targetEnd)) {
    targetEnd = index;
  }
}

let actualEnd = -1;
for (let i = targetEnd - 1; i > saveCertStart; i--) {
    if (code[i] === '}') {
        actualEnd = i + 1; // include the brace
        break;
    }
}

const startReplacementIndex = code.indexOf(targetStart);
if (startReplacementIndex !== -1 && actualEnd !== -1) {
    
    // Globally replace any loadCertsFromStorage() calls to loadCertificates()
    let newCode = code.substring(0, startReplacementIndex) + scriptReplacement + "\\n\\n" + code.substring(actualEnd);
    newCode = newCode.replace(/loadCertsFromStorage\(\)/g, "loadCertificates()");
    
    // Force the HTML button mapping to saveCertificate
    newCode = newCode.replace(/function saveCert\(/g, "function saveCertificate("); 
    
    fs.writeFileSync('script.js', newCode, 'utf8');
    console.log("SUCCESS: Applied user explicit script fixes mapping.");
} else {
    console.log("Could not find script bounds for replacement.", startReplacementIndex, actualEnd);
}
