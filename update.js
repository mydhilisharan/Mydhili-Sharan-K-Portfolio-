const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

// 1. replace loadCertsFromStorage
content = content.replace(/function loadCertsFromStorage\(\) \{[\s\S]*?\n\}/, `function loadCertsFromStorage() {
  if(!window.db) return;
  window.onSnapshot(window.doc(window.db, "portfolio", "certificates"), (docSnap) => {
    if (docSnap.exists() && docSnap.data().data) {
      certificates = docSnap.data().data;
    } else {
      certificates = [...DEFAULT_CERTIFICATES];
    }
    renderCertificates();
  });
}`);

// 2. replace saveCertData
content = content.replace(/function saveCertData\(\) \{[\s\S]*?\n\}/, `function saveCertData() {
  if(!window.db) return;
  window.setDoc(window.doc(window.db, "portfolio", "certificates"), { data: certificates });
}`);

// 3. remove local storage logic from window.addEventListener
content = content.replace(/window\.addEventListener\("DOMContentLoaded", \(\) => \{[\s\S]*?\}\);/, `window.addEventListener("firebaseReady", () => {
  if (typeof loadTextContent === "function") loadTextContent();
  loadCertsFromStorage();
  
  if(!window.db) return;
  window.onSnapshot(window.doc(window.db, "portfolio", "addedSkills"), (docSnap) => {
    addedSkills = docSnap.exists() ? (docSnap.data().data || []) : [];
    const grid = document.querySelector(".skills-grid");
    if(grid) {
      grid.innerHTML = "";
      addedSkills.forEach((skill, index) => appendSkillToGrid(skill, index));
    }
  });

  window.onSnapshot(window.doc(window.db, "portfolio", "addedProjects"), (docSnap) => {
    addedProjects = docSnap.exists() ? (docSnap.data().data || []) : [];
    const grid = document.querySelector(".projects-grid");
    if(grid) {
      grid.innerHTML = "";
      addedProjects.forEach((proj, index) => appendProjToGrid(proj, index));
    }
  });

  window.onSnapshot(window.doc(window.db, "portfolio", "addedExperience"), (docSnap) => {
    addedExperience = docSnap.exists() ? (docSnap.data().data || []) : [];
    const timeline = document.querySelector(".timeline");
    if(timeline) {
      timeline.innerHTML = "";
      addedExperience.forEach((exp, index) => appendExpToTimeline(exp, index));
    }
  });
});`);

// 4. replace save/load TextContent
content = content.replace(/function loadTextContent\(\) \{[\s\S]*?\n\}/, `function loadTextContent() {
  if(!window.db) return;
  window.onSnapshot(window.doc(window.db, "portfolio", "textContent"), (docSnap) => {
    if (docSnap.exists() && docSnap.data().data) {
      docSnap.data().data.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.innerHTML = item.content;
      });
    }
  });
}`);

content = content.replace(/function saveTextContent\(\) \{[\s\S]*?\n\}/, `function saveTextContent() {
  const editables = document.querySelectorAll('[contenteditable="true"]');
  let toSave = [];
  editables.forEach(el => {
    if (el.id) toSave.push({ id: el.id, content: el.innerHTML });
  });
  if(window.db) {
    window.setDoc(window.doc(window.db, "portfolio", "textContent"), { data: toSave });
  }
}`);

// 5. Update save functions for skills, projects, and experiences
content = content.replace(/function saveSkills\(\) \{[\s\S]*?\n\}/, `function saveSkills() {
  if (window.db) window.setDoc(window.doc(window.db, "portfolio", "addedSkills"), { data: addedSkills });
}`);

content = content.replace(/function saveProjects\(\) \{[\s\S]*?\n\}/, `function saveProjects() {
  if (window.db) window.setDoc(window.doc(window.db, "portfolio", "addedProjects"), { data: addedProjects });
}`);

content = content.replace(/function saveExperience\(\) \{[\s\S]*?\n\}/, `function saveExperience() {
  if (window.db) window.setDoc(window.doc(window.db, "portfolio", "addedExperience"), { data: addedExperience });
}`);

// 6. Delete the standalone localStorage initialization since we handle it in firebaseReady listener now
content = content.replace(/let addedSkills = JSON\.parse.*?(\[\]|;)/, 'let addedSkills = [];');
content = content.replace(/let addedProjects = JSON\.parse.*?(\[\]|;)/, 'let addedProjects = [];');
content = content.replace(/let addedExperience = JSON\.parse.*?(\[\]|;)/g, 'let addedExperience = [];'); // Might be multiple

// Avoid duplicates and DOM adds since firebaseReady handles it
content = content.replace(/addedSkills\.forEach\(.*?appendSkillToGrid.*?\);/, '');
content = content.replace(/addedProjects\.forEach\(.*?appendProjToGrid.*?\);/, '');
content = content.replace(/addedExperience\.forEach\(.*?appendExpToTimeline.*?\);/g, '');

fs.writeFileSync('script.js', content, 'utf8');
console.log("Updated script.js successfully!");
