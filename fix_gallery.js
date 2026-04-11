const fs = require('fs');
let html = fs.readFileSync('ai-gallery.html', 'utf8');

// I am rewriting the entire corrupt section cleanly
const cleanCode = `
            galleryData.forEach((item, index) => {
                const isVideo = item.type === "video";
                let mediaSrc = item.src;

                let mediaEl = "";
                if (isVideo) {
                    if (mediaSrc.startsWith("indexeddb:")) {
                        mediaEl = '\\<video id="offvid_' + index + '" autoplay muted loop playsinline\\<\\/video\\>';
                        offlineVideos.push({ id: 'offvid_' + index, key: mediaSrc.split(":")[1] });
                    } else {
                        mediaEl = '\\<video src="' + mediaSrc + '" autoplay muted loop playsinline\\>\\<\\/video\\>';
                    }
                } else {
                    mediaEl = '\\<img src="' + mediaSrc + '" alt="Vault item" loading="lazy" onclick="openLightbox(' + index + ')"\\>';
                }

                const cardHTML = \\`
                    <div class="gallery-item">
                        <div class="media-wrapper">
                            \${mediaEl}
                        </div>
                        <div class="card-actions">
                            <button class="card-btn-delete" onclick="deleteMedia('\${item.id}', '\${item.storagePath || ""}', '\${item.src}')">Delete</button>
                        </div>
                    </div>
                \\`;

                if (isVideo) {
                    hasVideos = true;
                    videosHTML += cardHTML;
                } else {
                    hasImages = true;
                    imagesHTML += cardHTML;
                }
            });

            imagesHTML += "</div>";
            videosHTML += "</div>";

            let finalHTML = "";
            if (hasImages) finalHTML += imagesHTML;
            if (hasVideos) finalHTML += videosHTML;

            vaultContainer.innerHTML = finalHTML;

            // Resolve offline videos locally
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (offlineVideos.length > 0) {
                if (isLocalhost) {
                    const dbReq = indexedDB.open("VaultOfflineDB", 3);
                    dbReq.onsuccess = (e) => {
                        const db = e.target.result;
                        offlineVideos.forEach(v => {
                            try {
                                const tx = db.transaction("videos", "readonly");
                                const store = tx.objectStore("videos");
                                const getReq = store.get(v.key);
                                getReq.onsuccess = () => {
                                    if (getReq.result) {
                                        const el = document.getElementById(v.id);
                                        if (el) el.src = URL.createObjectURL(getReq.result);
                                    }
                                };
                            } catch (err) { }
                        });
                    };
                } else {
                    offlineVideos.forEach(v => {
                        const el = document.getElementById(v.id);
                        if (el) {
                            const card = el.closest('.media-wrapper');
                            el.style.display = 'none';
                            const notice = document.createElement('div');
                            notice.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;background:rgba(255,100,0,0.1);border:1px dashed rgba(255,100,0,0.5);border-radius:12px;padding:20px;text-align:center;';
                            notice.innerHTML = '<span style="font-size:28px;">📱</span><p style="color:#f97316;font-size:13px;font-weight:600;margin:6px 0 4px;">Local Device Video</p><p style="color:rgba(255,255,255,0.5);font-size:11px;">This video was saved locally. Re-upload here to sync it to the cloud.</p>';
                            card.insertBefore(notice, el);
                        }
                    });
                }
            }
        }

        // PREVIEW FILE BEFORE UPLOAD
        function previewFile() {
            const file = document.getElementById("fileInput").files[0];
            const preview = document.getElementById("preview-img");
            if (file && file.type.startsWith("image")) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = "block";
            } else {
                preview.style.display = "none";
            }
        }

        async function addMedia() {
`;

// Extract markers
const s1 = html.indexOf('galleryData.forEach((item, index) => {');
const s2 = html.indexOf('const file = document.getElementById("fileInput").files[0];\n            if (!file) { alert("Please select a file first!"); return; }');

if (s1 > -1 && s2 > -1) {
    let replaced = html.substring(0, s1) + cleanCode + html.substring(s2);
    // ensure version 3 everywhere
    replaced = replaced.replace(/VaultOfflineDB", 2/g, 'VaultOfflineDB", 3');
    replaced = replaced.replace(/VaultOfflineDB", 1/g, 'VaultOfflineDB", 3');
    fs.writeFileSync('ai-gallery.html', replaced.replace(/\\\\</g, '<'), 'utf8');
    console.log("ai-gallery successfully repaired.");
} else {
    console.log("Could not find markers in ai-gallery");
}
