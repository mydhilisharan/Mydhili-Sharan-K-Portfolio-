const fs = require('fs');
let c = fs.readFileSync('ai-gallery.html', 'utf8');

// Replace the entire <script> block (the main one) with the new IndexedDB version
const oldScriptStart = c.indexOf('    <script>\n        // ==========================================\n        // SHARAN VAULT');
const oldScriptEnd = c.indexOf('</script>\n\n<script>\n  document.addEventListener');
const oldBlock = c.substring(oldScriptStart, oldScriptEnd + '</script>'.length);

const newScript = `    <script>
        // ==========================================
        // SHARAN VAULT — IndexedDB Storage (No size limit, instant, offline)
        // ==========================================

        let galleryData = [];
        const DB_NAME = 'SharanVault';
        const DB_VERSION = 1;
        const STORE_NAME = 'media';

        // Open IndexedDB
        function openDB() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.open(DB_NAME, DB_VERSION);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };
                req.onsuccess = (e) => resolve(e.target.result);
                req.onerror = (e) => reject(e.target.error);
            });
        }

        // Load all items from IndexedDB
        async function loadFromDB() {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.getAll();
                req.onsuccess = () => {
                    const items = req.result.sort((a, b) => b.timestamp - a.timestamp);
                    resolve(items);
                };
                req.onerror = () => reject(req.error);
            });
        }

        // Save one item to IndexedDB
        async function saveToDB(item) {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.add(item);
                req.onsuccess = () => resolve(req.result); // returns new id
                req.onerror = () => reject(req.error);
            });
        }

        // Delete one item from IndexedDB by id
        async function deleteFromDB(id) {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.delete(id);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        }

        // RENDER GALLERY
        function renderGallery() {
            const vaultContainer = document.getElementById("vaultContent");
            if (!vaultContainer) return;
            vaultContainer.innerHTML = "";

            // Update count badge
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

            let imagesHTML = '<h2 class="section-title">Images Session</h2><div class="gallery-grid">';
            let videosHTML = '<h2 class="section-title">Videos Session</h2><div class="gallery-grid">';
            let hasImages = false, hasVideos = false;

            galleryData.forEach((item, index) => {
                const dateStr = item.date || "Unknown Date";
                const isVideo = item.type === "video";

                const cardHTML = \`
                    <div class="gallery-item" ondblclick="openLightbox(\${index})" onclick="">
                        \${isVideo
                            ? \`<video src="\${item.src}" autoplay muted loop playsinline preload="auto" style="width:100%;height:100%;object-fit:cover;border-radius:12px;"></video>
                               <div class="video-play-badge">🎬 VIDEO</div>\`
                            : \`<img src="\${item.src}" loading="lazy" alt="Vault Item">\`
                        }
                        <div class="delete-btn" onclick="deleteMedia(\${index}, \${item.id}, event)">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </div>
                        <div class="item-overlay">
                            <span class="item-date">\${dateStr}</span>
                        </div>
                    </div>
                \`;

                if (isVideo) { hasVideos = true; videosHTML += cardHTML; }
                else { hasImages = true; imagesHTML += cardHTML; }
            });

            imagesHTML += '</div>';
            videosHTML += '</div>';

            if (hasImages) vaultContainer.innerHTML += imagesHTML;
            if (hasVideos) vaultContainer.innerHTML += videosHTML;

            // Force all videos to autoplay after DOM injection
            setTimeout(() => {
                vaultContainer.querySelectorAll('video').forEach(v => {
                    v.muted = true;
                    v.play().catch(() => {});
                });
            }, 150);
        }

        // LOAD FROM IndexedDB
        async function loadGalleryData() {
            const loading = document.getElementById("loading");
            if (loading) loading.style.display = "flex";
            try {
                galleryData = await loadFromDB();
            } catch (err) {
                console.warn("IndexedDB load failed:", err);
                galleryData = [];
            } finally {
                renderGallery();
                if (loading) loading.style.display = "none";
            }
        }

        // ON-LOAD INITIALIZATION
        window.onload = () => {
            loadGalleryData();
            // Safety fallback
            setTimeout(() => {
                const loading = document.getElementById("loading");
                if (loading && loading.style.display !== "none") {
                    loading.style.display = "none";
                    renderGallery();
                }
            }, 3000);
        };

        // ADD MEDIA — saves to IndexedDB (no size limit)
        async function addMedia() {
            const fileInput = document.getElementById("fileInput");
            if (!fileInput) return alert("Upload element error");
            const file = fileInput.files[0];

            if (!file) { alert("Please select a file!"); return; }

            const loading = document.getElementById("loading");
            const saveBtn = document.querySelector(".btn-save");
            if (loading) { loading.style.display = "flex"; loading.innerHTML = '<div class="spinner"></div><p>Saving to Vault...</p>'; }
            if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = "Saving..."; }

            try {
                const isVideo = file.type.startsWith('video/');

                // Read file as dataURL (works for both images and videos, no size limit)
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onerror = () => reject(new Error('File read failed'));
                    reader.onload = (e) => {
                        if (isVideo) {
                            resolve(e.target.result);
                        } else {
                            // Compress image before storing
                            const img = new Image();
                            img.onerror = () => reject(new Error('Image load failed'));
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                let w = img.width, h = img.height;
                                const max = 1200;
                                if (w > max || h > max) {
                                    if (w > h) { h *= max / w; w = max; }
                                    else { w *= max / h; h = max; }
                                }
                                canvas.width = w; canvas.height = h;
                                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                                resolve(canvas.toDataURL('image/jpeg', 0.85));
                            };
                            img.src = e.target.result;
                        }
                    };
                    reader.readAsDataURL(file);
                });

                const newItem = {
                    type: isVideo ? "video" : "image",
                    src: dataUrl,
                    name: file.name,
                    date: new Date().toLocaleDateString('en-GB'),
                    timestamp: Date.now()
                };

                await saveToDB(newItem);
                closeModal();
                await loadGalleryData();
                alert("✅ Saved to Vault successfully!");

            } catch (error) {
                console.error("Save failed", error);
                alert("Save failed: " + error.message);
            } finally {
                if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = "Save to Vault"; }
                if (loading) { loading.innerHTML = '<div class="spinner"></div><p>Loading Vault...</p>'; loading.style.display = "none"; }
            }
        }

        // DELETE MEDIA
        async function deleteMedia(index, dbId, event) {
            event.stopPropagation();
            if (confirm("Permanently delete this from the Vault?")) {
                try {
                    await deleteFromDB(dbId);
                    galleryData.splice(index, 1);
                    renderGallery();
                } catch(e) {
                    alert("Delete failed: " + e.message);
                }
            }
        }

        // ==========================================
        // LIGHTBOX — double-click to open, full display, video support
        // ==========================================
        let currentLightboxIndex = 0;

        function openLightbox(index) {
            currentLightboxIndex = index;
            const lightbox = document.getElementById("lightbox");
            const lbImg = document.getElementById("lightboxImg");
            const lbVideo = document.getElementById("lightboxVideo");
            const item = galleryData[index];
            if (!item) return;

            if (item.type === "video") {
                lbImg.style.display = "none";
                lbVideo.style.display = "block";
                lbVideo.src = item.src;
                lbVideo.play();
            } else {
                lbVideo.pause();
                lbVideo.src = "";
                lbVideo.style.display = "none";
                lbImg.style.display = "block";
                lbImg.src = item.src;
            }

            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeLightbox() {
            const lightbox = document.getElementById("lightbox");
            const lbVideo = document.getElementById("lightboxVideo");
            lbVideo.pause();
            lbVideo.src = "";
            lightbox.classList.remove("active");
            document.body.style.overflow = "auto";
        }

        function slideLightbox(direction) {
            currentLightboxIndex += direction;
            if (currentLightboxIndex < 0) currentLightboxIndex = galleryData.length - 1;
            if (currentLightboxIndex >= galleryData.length) currentLightboxIndex = 0;
            openLightbox(currentLightboxIndex);
        }

        document.addEventListener("keydown", function(e) {
            if (!document.getElementById("lightbox").classList.contains("active")) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") slideLightbox(-1);
            if (e.key === "ArrowRight") slideLightbox(1);
        });
    </script>`;

if (c.includes('    <script>\n        // ==========================================\n        // SHARAN VAULT')) {
    c = c.replace(oldBlock, newScript);
    fs.writeFileSync('ai-gallery.html', c);
    console.log('✅ Gallery JS replaced with IndexedDB version!');
} else {
    console.log('❌ Could not find old script block. Manual check needed.');
    console.log('Old block starts at:', oldScriptStart, 'ends at:', oldScriptEnd);
}
