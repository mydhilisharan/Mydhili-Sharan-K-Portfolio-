const fs = require('fs');

const freshScriptBlock = `
        // ==========================================
        // SHARAN VAULT — IndexedDB + Firebase System
        // ==========================================

        let galleryData = [];

        // RENDER GALLERY (SEPARATED SESSIONS)
        async function renderGallery() {
            const vaultContainer = document.getElementById("vaultContent");
            vaultContainer.innerHTML = "";

            document.getElementById("itemCount").textContent =
                galleryData.length + (galleryData.length === 1 ? " item" : " items");

            if (galleryData.length === 0) {
                vaultContainer.innerHTML = \`
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2.5"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(0,255,255,0.3)" stroke="none"/>
                            <polyline points="21,15 16,10 11,15.5 8,12 3,18"/>
                        </svg>
                        <p>Your vault is empty</p>
                        <span>Click the + button to add images or videos</span>
                    </div>\`;
                return;
            }

            let hasImages = false;
            let hasVideos = false;

            let imagesHTML = '<h2 class="section-title">Images Session</h2><div class="gallery-grid">';
            let videosHTML = '<h2 class="section-title">Videos Session</h2><div class="gallery-grid">';

            const offlineVideos = [];

            galleryData.forEach((item, index) => {
                const isVideo = item.type === "video";
                let mediaSrc = item.src;
                let mediaEl = "";

                if (isVideo) {
                    if (mediaSrc.startsWith("indexeddb:")) {
                        mediaEl = \`<video id="offvid_\${index}" autoplay muted loop playsinline></video>\`;
                        offlineVideos.push({ id: \`offvid_\${index}\`, key: mediaSrc.split(":")[1] });
                    } else {
                        mediaEl = \`<video src="\${mediaSrc}" autoplay muted loop playsinline></video>\`;
                    }
                } else {
                    mediaEl = \`<img src="\${mediaSrc}" alt="Vault item" loading="lazy" onclick="openLightbox(\${index})">\`;
                }

                const cardHTML = \`
                    <div class="gallery-item">
                        <div class="media-wrapper">
                            \${mediaEl}
                        </div>
                        <div class="card-actions">
                            <button class="card-btn-delete" onclick="deleteMedia('\${item.id}', '\${item.storagePath || ""}', '\${item.src}')">Delete</button>
                        </div>
                    </div>
                \`;

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
                    dbReq.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains("videos")) db.createObjectStore("videos");
                    };
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
                            } catch (err) { console.error(err); }
                        });
                    };
                } else {
                    offlineVideos.forEach(v => {
                        const el = document.getElementById(v.id);
                        if (el) {
                            const card = el.closest('.media-wrapper');
                            el.style.display = 'none';
                            const notice = document.createElement('div');
                            notice.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;background:rgba(255,100,0,0.1);border:1px dashed rgba(255,100,0,0.5);border-radius:12px;padding:20px;text-align:center;box-sizing:border-box;margin-top:10px;';
                            notice.innerHTML = '<span style="font-size:28px;">📱</span><p style="color:#f97316;font-size:13px;font-weight:600;margin:6px 0 4px;">Local Device Video</p><p style="color:rgba(255,255,255,0.5);font-size:11px;">This video was saved locally. Re-upload here to sync it to the cloud.</p>';
                            if (card) card.insertBefore(notice, el);
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

        // ADD MEDIA TO DATABASE
        async function addMedia() {
            const file = document.getElementById("fileInput").files[0];
            if (!file) { alert("Please select a file first!"); return; }

            const btn = document.querySelector(".btn-save");
            const ogText = btn.textContent;
            btn.textContent = "Processing...";
            btn.disabled = true;

            const isVideo = file.type.startsWith("video");
            let finalSrc = "";
            let finalStoragePath = "";
            const timeoutMs = 7000;

            try {
                const storagePath = 'vault/' + Date.now() + '_' + file.name;
                const fileRef = window.ref(window.storage, storagePath);
                const uploadTask = window.uploadBytes(fileRef, file);
                const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("Storage Timeout")), timeoutMs));

                await Promise.race([uploadTask, timeoutTask]);
                finalSrc = await window.getDownloadURL(fileRef);
                finalStoragePath = storagePath;
            } catch (storageErr) {
                console.warn("Storage blocked! Switching to Emergency Fallbacks...", storageErr);

                if (isVideo) {
                    btn.textContent = "Local Bypass...";
                    
                    const dbReq = indexedDB.open("VaultOfflineDB", 3);
                    dbReq.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains("videos")) db.createObjectStore("videos");
                    };

                    finalSrc = await new Promise((resolve, reject) => {
                        dbReq.onsuccess = (e) => {
                            try {
                                const db = e.target.result;
                                const tx = db.transaction("videos", "readwrite");
                                const store = tx.objectStore("videos");
                                const key = 'vid_' + Date.now();
                                const putReq = store.put(file, key);
                                putReq.onsuccess = () => resolve("indexeddb:" + key);
                                putReq.onerror = () => reject("Failed to save video offline");
                            } catch (err) {
                                reject("IndexedDB Error: " + err.message);
                            }
                        };
                        dbReq.onerror = () => reject("Database failed to open");
                    });
                    finalStoragePath = "offline_video";
                } else {
                    btn.textContent = "Compressing...";
                    finalSrc = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const img = new Image();
                            img.onload = function() {
                                const canvas = document.createElement("canvas");
                                const MAX = 600;
                                let w = img.width, h = img.height;
                                if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
                                else if (h > MAX) { w *= MAX / h; h = MAX; }
                                canvas.width = w; canvas.height = h;
                                const ctx = canvas.getContext("2d");
                                ctx.drawImage(img, 0, 0, w, h);
                                resolve(canvas.toDataURL("image/jpeg", 0.6));
                            };
                            img.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    });
                    finalStoragePath = "offline_image";
                }
            }

            const newDoc = {
                id: Date.now().toString(),
                type: isVideo ? "video" : "image",
                src: finalSrc,
                storagePath: finalStoragePath,
                timestamp: Date.now()
            };

            galleryData.unshift(newDoc);
            
            try {
                await window.setDoc(window.doc(window.db, "portfolio", "gallery"), { data: galleryData });
                closeModal();
            } catch (fbErr) {
                alert("Database save failed. File was processed but cannot be synced to the cloud.");
                closeModal();
                renderGallery(); // Render anyway to show the local edit
            }
        }

        async function deleteMedia(id, storagePath, src) {
            if (!confirm("Are you sure you want to delete this item?")) return;

            if (storagePath && storagePath !== "offline_video" && storagePath !== "offline_image") {
                try {
                    const fileRef = window.ref(window.storage, storagePath);
                    await window.deleteObject(fileRef);
                } catch(e) {
                    console.log("Could not delete from storage, might be missing.", e);
                }
            }

            if (src.startsWith("indexeddb:")) {
                const key = src.split(":")[1];
                const dbReq = indexedDB.open("VaultOfflineDB", 3);
                dbReq.onsuccess = (e) => {
                    try {
                        const db = e.target.result;
                        const tx = db.transaction("videos", "readwrite");
                        tx.objectStore("videos").delete(key);
                    } catch(err) {}
                };
            }

            galleryData = galleryData.filter(item => item.id !== id);
            await window.setDoc(window.doc(window.db, "portfolio", "gallery"), { data: galleryData });
        }

        function openLightbox(index) {
            const item = galleryData[index];
            if (!item || item.type === "video") return;
            const lb = document.getElementById("lightbox");
            const img = document.getElementById("lightbox-img");
            img.src = item.src;
            lb.classList.add("active");
        }

        function closeLightbox() {
            document.getElementById("lightbox").classList.remove("active");
        }

        function openModal() {
            document.getElementById("modal").classList.add("active");
            document.getElementById("fileInput").value = "";
            document.getElementById("preview-img").style.display = "none";
            const btn = document.querySelector(".btn-save");
            btn.textContent = "Save to Vault";
            btn.disabled = false;
        }

        function closeModal() {
            document.getElementById("modal").classList.remove("active");
        }

        document.getElementById("modal").addEventListener("click", function(e) {
            if (e.target === this) closeModal();
        });

        // Initialize Data Stream
        window.onload = () => {
            const loading = document.getElementById("loading");

            // Hardcode 5 second timeout fallback
            setTimeout(() => {
                if (loading) loading.style.display = "none";
            }, 5000);

            if (window.db) {
                try {
                    window.onSnapshot(window.doc(window.db, "portfolio", "gallery"), (docSnap) => {
                        if (docSnap.exists() && docSnap.data().data) {
                            galleryData = docSnap.data().data;
                        } else {
                            galleryData = [];
                        }
                        renderGallery();
                        if (loading) loading.style.display = "none";
                    });
                } catch (e) {
                    console.log("Firebase error", e);
                    if (loading) loading.style.display = "none";
                    renderGallery();
                }
            } else {
                if (loading) loading.style.display = "none";
                renderGallery();
            }
        };
`;

const baseHtml = fs.readFileSync('ai-gallery.html', 'utf8');
const lines = baseHtml.split('\\n');
const s1 = lines.findIndex(l => l.includes('<script>'));
const s2 = lines.findIndex(l => l.includes('</script>'));

if (s1 !== -1 && s2 !== -1) {
    const finalHtml = lines.slice(0, s1 + 1).join('\\n') + freshScriptBlock + lines.slice(s2).join('\\n');
    fs.writeFileSync('ai-gallery.html', finalHtml, 'utf8');
    console.log("Successfully replaced script entirely without touching HTML or CSS!");
} else {
    console.log("Error: <script> bounds not found");
}
