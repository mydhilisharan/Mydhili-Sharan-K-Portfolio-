const fs = require('fs');

const adminCode = `
// ==========================================
// ADMIN CMS LOGIC
// ==========================================
let editMode = false;

function verifyAdmin() {
    const password = prompt("Enter Admin Password to enable editing:");
    if (password === "harishhari") {
        alert("Access Granted! Edit Mode Enabled.");
        toggleEdit();
    } else if (password !== null) {
        alert("Incorrect Password!");
    }
}

function toggleEdit() {
    editMode = !editMode;
    const adminStatus = document.getElementById("adminStatus");
    if (adminStatus) {
        adminStatus.innerHTML = editMode ? '<span style="color:#00ff88">🔓 Edit Mode Active</span>' : '<span style="color:red">🔒 Edit Mode Locked</span>';
    }

    const editBtn = document.getElementById("navEditBtn");
    if (editBtn) {
        editBtn.innerHTML = editMode ? '<i class="fa-solid fa-lock-open"></i> Exit Edit Mode' : '<i class="fa-solid fa-lock"></i> Edit Portfolio';
        editBtn.onclick = editMode ? toggleEdit : verifyAdmin;
    }

    // Toggle specific edit/delete buttons
    document.querySelectorAll(".edit, .delete, .admin-delete-btn").forEach(el => {
        el.style.display = editMode ? "inline-block" : "none";
    });

    // Toggle Add New wrappers
    const addWrappers = [
        document.getElementById('addSkillBtn'),
        document.getElementById('addProjectBtn'),
        document.getElementById('addExpBtn')
    ];
    addWrappers.forEach(el => {
        if(el) el.style.display = editMode ? "block" : "none";
    });

    if (typeof enableTextEdit === "function") {
        if (editMode) enableTextEdit(); else disableTextEdit();
    }
    
    // Rerender grids to show/hide admin buttons within them
    if (typeof renderCertificates === "function") renderCertificates();
    if (typeof renderSkills === "function") renderSkills();
    if (typeof renderProjects === "function") renderProjects();
}

function saveData(type) {
    if (type === 'certificates' && typeof saveCertData === 'function') saveCertData();
    if (type === 'skills' && typeof saveSkills === 'function') saveSkills();
    if (type === 'projects' && typeof saveProjects === 'function') saveProjects();
    if (type === 'experience' && typeof saveExperience === 'function') saveExperience();
    if (type === 'textContent' && typeof saveTextContent === 'function') saveTextContent();
}

function exportForGithub() {
    alert("Export feature replaced by Real-Time Firebase Sync.");
}

function savePortfolio() {
    saveData('certificates');
    saveData('skills');
    saveData('projects');
    saveData('experience');
    saveData('textContent');
    alert("Entire portfolio synchronized to Firebase!");
}
`;

let code = fs.readFileSync('script.js', 'utf8');

// Insert it right before the // CERTIFICATE SYSTEM marker
const targetIndex = code.indexOf('// CERTIFICATE SYSTEM');
if (targetIndex !== -1) {
    // Find previous line start
    const insertPoint = code.lastIndexOf('// =====', targetIndex);
    const finalIndex = insertPoint !== -1 ? insertPoint : targetIndex;
    
    code = code.substring(0, finalIndex) + adminCode + '\\n' + code.substring(finalIndex);
    fs.writeFileSync('script.js', code, 'utf8');
    console.log("Admin code successfully injected!");
} else {
    console.log("Could not find insertion marker.");
}
