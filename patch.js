const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

// The broken block to replace
const broken = `/* RENDER */\r\nfunction renderCertificates() {\r\n  const grid = document.getElementById("certGrid");\r\n  if (!grid) return;\r\n\r\ndocument.addEventListener("DOMContentLoaded", () => {`;

// The fixed block
const fixed = `/* RENDER */
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

document.addEventListener("DOMContentLoaded", () => {`;

if (s.includes(broken)) {
  s = s.replace(broken, fixed);
  fs.writeFileSync('script.js', s, 'utf8');
  console.log('SUCCESS: renderCertificates restored!');
} else {
  // Try with \n instead of \r\n
  const broken2 = broken.replace(/\r\n/g, '\n');
  if (s.includes(broken2)) {
    s = s.replace(broken2, fixed);
    fs.writeFileSync('script.js', s, 'utf8');
    console.log('SUCCESS (LF): renderCertificates restored!');
  } else {
    console.log('PATTERN NOT FOUND. Dumping area around line 748:');
    const lines = s.split('\n');
    lines.slice(745, 760).forEach((l, i) => console.log((745+i+1) + ': ' + JSON.stringify(l)));
  }
}
