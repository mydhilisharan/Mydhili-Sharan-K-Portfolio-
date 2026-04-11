const fs = require('fs');

const scriptReplacement = `<script>
        // ==========================================
        // SHARAN VAULT — Pure Firebase Storage Collection System
        // ==========================================

        let galleryData = [];

        // RENDER GALLERY
        async function renderGallery() {
            const vaultContainer = document.getElementById("vaultContent");
            vaultContainer.innerHTML = "";

            // Wait for DOM to be ready if called early
            if (!vaultContainer) return;

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
            
            let hasImages = false;
            let hasVideos = false;

            galleryData.forEach((item, index) => {
                // Safeguard against old local paths
                if (item.src && (item.src.startsWith('file://') || item.src.startsWith('C:/'))) {
                    return; 
                }

                const dateStr = item.date || "Unknown Date";
                const isVideo = item.type === "video";
                
                const cardHTML = \`
                    <div class="gallery-item" onclick="openLightbox(\${index})">
                        \${isVideo 
                            ? \`<div class="video-indicator">▶</div>
                               <video src="\${item.src}" preload="metadata"></video>\`
                            : \`<img src="\${item.src}" loading="lazy" alt="Vault Item">\`
                        }
                        <div class="delete-btn" onclick="deleteMedia(\${index}, "\${item.id}", event)">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </div>
                        <div class="item-overlay">
                            <span class="item-date">\${dateStr}</span>
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

            imagesHTML += '</div>';
            videosHTML += '</div>';

            if (hasImages) vaultContainer.innerHTML += imagesHTML;
            if (hasVideos) vaultContainer.innerHTML += videosHTML;
        }

        // LOAD DATA USING GETDOCS (PROPER ASYNC WITH TRY/FINALLY)
        async function loadGalleryData() {
            const loading = document.getElementById("loading");
            if (loading) loading.style.display = "flex";

            try {
                if (!window.db) {
                    console.warn("Firebase not initialized yet. Using empty state.");
                    galleryData = [];
                    return;
                }

                // Explicit getDocs on the generic collection
                const querySnapshot = await window.getDocs(window.collection(window.db, "gallery"));
                
                galleryData = [];
                querySnapshot.forEach((doc) => {
                    galleryData.push({ id: doc.id, ...doc.data() });
                });

                // Sort newest first
                galleryData.sort((a, b) => b.timestamp - a.timestamp);

            } catch (err) {
                console.warn("Firestore fetch failed:", err);
                galleryData = []; 
            } finally {
                renderGallery();
                // Ensure loader ALWAYS disappears no matter what
                if (loading) loading.style.display = "none";
            }
        }

        // ON-LOAD INITIALIZATION
        window.onload = () => {
            setTimeout(() => {
                loadGalleryData();
            }, 500);
            
            // Hard fallback just in case Firebase hangs forever
            setTimeout(() => {
                const loading = document.getElementById("loading");
                if (loading && loading.style.display !== "none") {
                    loading.style.display = "none";
                    if (galleryData.length === 0) renderGallery();
                }
            }, 4000);
        };

        // FIREBASE STORAGE UPLOAD (Collection Flow)
        async function addMedia() {
            const fileInput = document.getElementById("mediaInput");
            if (!fileInput) return alert("Upload element error");
            const file = fileInput.files[0];
            
            if (!file) {
                alert("Please select a file to upload!");
                return;
            }

            if (!window.db || !window.storage) {
                alert("Cloud Storage is not connected!");
                return;
            }

            const loading = document.getElementById("loading");
            const saveBtn = document.querySelector(".btn-save");
            
            if (loading) {
                loading.style.display = "flex";
                loading.innerHTML = '<div class="spinner"></div><p>Uploading to secure cloud...</p>';
            }
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = "Uploading...";
            }

            try {
                const isVideo = file.type.startsWith('video/');
                
                // Upload to Firebase Storage
                const storagePath = 'gallery/' + Date.now() + '_' + file.name;
                const fileRef = window.ref(window.storage, storagePath);
                await window.uploadBytes(fileRef, file);
                
                // Get public download URL
                const publicUrl = await window.getDownloadURL(fileRef);

                const newItem = {
                    type: isVideo ? "video" : "image",
                    src: publicUrl,
                    date: new Date().toLocaleDateString('en-GB'),
                    timestamp: Date.now()
                };

                // Push explicitly to "gallery" collection
                await window.addDoc(window.collection(window.db, "gallery"), newItem);
                
                closeModal();
                alert("✅ Added tightly to Cloud Vault!");
                await loadGalleryData(); // Refresh cleanly

            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload failed: " + error.message);
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = "Save to Vault";
                }
                if (loading) {
                    loading.innerHTML = '<div class="spinner"></div><p>Loading Vault...</p>';
                    loading.style.display = "none";
                }
            }
        }

        // DELETE MEDIA
        async function deleteMedia(index, docId, event) {
            event.stopPropagation(); 
            
            if (confirm("Permanently delete this from the secure cloud?")) {
                try {
                    const item = galleryData[index];
                    
                    if (item.src.includes('firebasestorage')) {
                        try {
                            const fileRef = window.ref(window.storage, item.src);
                            await window.deleteObject(fileRef);
                        } catch(e) { console.warn("Storage object ignored", e); }
                    }

                    // Strict doc deletion
                    if (docId) {
                        await window.deleteDoc(window.doc(window.db, "gallery", docId));
                        galleryData.splice(index, 1);
                        renderGallery();
                    }
                    
                } catch(e) {
                    alert("Delete failed: " + e.message);
                }
            }
        }

        // ==========================================
        // LIGHTBOX SYSTEM (UNCHANGED)
        // ==========================================
        let currentLightboxIndex = 0;

        function openLightbox(index) {
            currentLightboxIndex = index;
            const lightbox = document.getElementById("lightbox");
            const mediaContainer = document.getElementById("lightboxMedia");
            const img = document.getElementById("lightboxImg");
            const video = document.getElementById("lightboxVideo");
            
            const item = galleryData[index];
            
            if (item.type === "video") {
                img.style.display = "none";
                video.style.display = "block";
                video.src = item.src;
            } else {
                video.style.display = "none";
                img.style.display = "block";
                img.src = item.src;
            }
            
            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeLightbox() {
            const lightbox = document.getElementById("lightbox");
            const video = document.getElementById("lightboxVideo");
            video.pause();
            lightbox.classList.remove("active");
            document.body.style.overflow = "auto";
        }

        function slideLightbox(direction) {
            currentLightboxIndex += direction;
            if (currentLightboxIndex < 0) currentLightboxIndex = galleryData.length - 1;
            if (currentLightboxIndex >= galleryData.length) currentLightboxIndex = 0;
            openLightbox(currentLightboxIndex);
        }

        document.getElementById("lightbox").addEventListener("click", function(e) {
            if (e.target === this) closeLightbox();
        });

        document.addEventListener("keydown", function(e) {
            if (!document.getElementById("lightbox").classList.contains("active")) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") slideLightbox(-1);
            if (e.key === "ArrowRight") slideLightbox(1);
        });
    </script>`

const html = fs.readFileSync('ai-gallery.html', 'utf8');
const start = html.indexOf('<script>');
const end = html.lastIndexOf('</script>') + 9;

if (start !== -1 && end !== -1) {
    const newHtml = html.substring(0, start) + scriptReplacement + html.substring(end);
    fs.writeFileSync('ai-gallery.html', newHtml, 'utf8');
    console.log("ai-gallery.html absolutely fixed to use getDocs/addDoc explicit mapping!");
} else {
    console.error("Could not find script bounds.");
}
