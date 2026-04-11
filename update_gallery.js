const fs = require('fs');
let html = fs.readFileSync('ai-gallery.html', 'utf8');

// The new Firebase Gallery logic
const replacementScript = `
        let galleryData = [];

        // RENDER GALLERY (SEPARATED SESSIONS)
        function renderGallery() {
            const vaultContainer = document.getElementById("vaultContent");
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

            // Separate images and videos trackers
            let hasImages = false;
            let hasVideos = false;

            let imagesHTML = '<h2 class="section-title">Images Session</h2><div class="gallery-grid">';
            let videosHTML = '<h2 class="section-title">Videos Session</h2><div class="gallery-grid">';

            galleryData.forEach((item, index) => {
                const isVideo = item.type === "video";

                const mediaEl = isVideo
                    ? \`<video src="\${item.src}" autoplay muted loop playsinline></video>\`
                    : \`<img src="\${item.src}" alt="Vault item" loading="lazy" onclick="openLightbox(\${index})">\`;

                const cardHTML = \`
                    <div class="gallery-item">
                        <div class="media-wrapper">
                            \${mediaEl}
                        </div>
                        <div class="card-actions">
                            <button class="card-btn-delete" onclick="deleteMedia('\${item.id}', '\${item.storagePath || ""}')">Delete</button>
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

            let finalHTML = "";
            if (hasImages) finalHTML += imagesHTML;
            if (hasVideos) finalHTML += videosHTML;

            vaultContainer.innerHTML = finalHTML;
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

        // ADD MEDIA
        async function addMedia() {
            const file = document.getElementById("fileInput").files[0];
            if (!file) { alert("Please select a file first!"); return; }

            // Show uploading text on button
            const btn = document.querySelector(".btn-save");
            const ogText = btn.textContent;
            btn.textContent = "Uploading...";
            btn.disabled = true;

            try {
                // Upload to Firebase Storage
                const storagePath = 'vault/' + Date.now() + '_' + file.name;
                const fileRef = window.ref(window.storage, storagePath);
                await window.uploadBytes(fileRef, file);
                const downloadURL = await window.getDownloadURL(fileRef);

                // Save info to Firestore Database
                await window.addDoc(window.collection(window.db, "vault"), {
                    src: downloadURL,
                    type: file.type.startsWith("video") ? "video" : "image",
                    name: file.name,
                    storagePath: storagePath,
                    date: new Date().toLocaleDateString(),
                    timestamp: Date.now()
                });

                closeModal();
            } catch (err) {
                console.error("Upload Error:", err);
                alert("Failed to upload. Size too big or Network Error.");
            } finally {
                btn.textContent = ogText;
                btn.disabled = false;
            }
        }

        // DELETE MEDIA
        async function deleteMedia(docId, storagePath) {
            if (confirm("Delete this item from Vault permanently?")) {
                try {
                    // Try to delete from storage first if it exists
                    if (storagePath) {
                        const fileRef = window.ref(window.storage, storagePath);
                        try {
                            await window.deleteObject(fileRef);
                        } catch(se) {
                            console.warn("Storage item not found or already deleted:", se);
                        }
                    }
                    
                    // Delete from database
                    await window.deleteDoc(window.doc(window.db, "vault", docId));
                } catch(err) {
                    console.error("Failed to delete", err);
                    alert("Error deleting file!");
                }
            }
        }

        // MODAL
        function openModal() {
            const pass = prompt("Enter Admin Password:");
            if (pass !== "1206") {
                alert("Access Denied ❌");
                return;
            }
            document.getElementById("modal").style.display = "flex";
            document.getElementById("fileInput").value = "";
            document.getElementById("preview-img").style.display = "none";
        }

        function closeModal() {
            document.getElementById("modal").style.display = "none";
        }

        // LIGHTBOX
        function openLightbox(index) {
            const src = galleryData[index].src;
            document.getElementById("lightbox-img").src = src;
            document.getElementById("lightbox").classList.add("active");
        }

        function closeLightbox() {
            document.getElementById("lightbox").classList.remove("active");
        }

        // Close modal on backdrop click
        document.getElementById("modal").addEventListener("click", function(e) {
            if (e.target === this) closeModal();
        });

        // INIT ON LOAD
        window.addEventListener("firebaseReady", () => {
            if(!window.db) {
                document.getElementById("loading").style.display = "none";
                return;
            }
            window.onSnapshot(window.collection(window.db, "vault"), (snapshot) => {
                galleryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort by newest first
                galleryData.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));

                renderGallery();
                document.getElementById("loading").style.display = "none";
            }, (error) => {
                console.error("Vault real-time sync failed:", error);
                document.getElementById("loading").style.display = "none";
                alert("Database connection error");
            });
        });
`;

let newHtml = html.replace(/let vaultDB = null;[\s\S]*?\n\s+<\/script>/, replacementScript + '\n    </script>');
fs.writeFileSync('ai-gallery.html', newHtml, 'utf8');
console.log("ai-gallery.html successfully updated to Firebase!");
