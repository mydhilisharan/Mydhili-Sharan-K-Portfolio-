/* ======= script.js ======= */

// --- Side Nav: Active Section Tracking ---
const sideNavItems = document.querySelectorAll('.side-nav-item');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            sideNavItems.forEach(item => item.classList.remove('active'));
            const active = document.querySelector(`.side-nav-item[data-section="${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, { threshold: 0.35 });

['hero', 'about', 'skills', 'experience', 'projects', 'certifications', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
});

// --- Side Nav: Smooth scroll on click ---
sideNavItems.forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(item.dataset.section);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});


// --- Theme Toggle ---
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const newTheme = isLight ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// --- AI Cursor Tracking ---
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
    if (cursorGlow) {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    }
});

// --- Premium Mouse Parallax & 3D Tilt ---
const parallaxElements = document.querySelectorAll('.parallax-element');
const tiltElements = document.querySelectorAll('.hero-left'); // Applies 3D to Hero Image

document.addEventListener('mousemove', e => {
    if (window.innerWidth <= 768) return; // disable on mobile
    
    const x = (window.innerWidth / 2 - e.pageX);
    const y = (window.innerHeight / 2 - e.pageY);
    
    // XY Parallax
    parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.03;
        el.style.transform = `translate3d(${x * speed}px, ${y * speed}px, 0)`;
    });

    // 3D Depth Tilt calculation
    const rotX = (y / window.innerHeight) * 15; // Max 7.5 deg tilt
    const rotY = -(x / window.innerWidth) * 15;

    tiltElements.forEach(el => {
        el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1, 1, 1)`;
        el.style.transition = 'transform 0.1s linear';
    });
});

// --- Scroll Reveal ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-section, .fade-in').forEach(el => revealObserver.observe(el));

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- Typing Animation (Original) ---
const typingEl = document.getElementById('typing-role');
const roles = ['Cloud Security Engineer', 'AWS Security Specialist', 'SOC Analyst'];
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
    if (!typingEl) return;
    const word = roles[roleIdx];
    typingEl.textContent = deleting
        ? word.slice(0, charIdx - 1)
        : word.slice(0, charIdx + 1);

    deleting ? charIdx-- : charIdx++;

    let speed = deleting ? 35 : 75;
    if (!deleting && charIdx === word.length) { speed = 2800; deleting = true; }
    else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; speed = 400; }

    setTimeout(typeLoop, speed);
}
setTimeout(typeLoop, 200);

// --- NEW Hero Auto-Typing Role ---
const typingTitleRoles = [
    "Cloud Security Engineer",
    "AWS Security Specialist",
    "SOC Analyst"
];

let tIndex = 0;
let tCharIndex = 0;
let tIsDeleting = false;

function typeEffectTitle() {
    const textElement = document.getElementById("typing-text");
    if (!textElement) return;
    
    const currentText = typingTitleRoles[tIndex];

    if (tIsDeleting) {
        tCharIndex--;
    } else {
        tCharIndex++;
    }

    textElement.textContent = currentText.substring(0, tCharIndex);

    let speed = tIsDeleting ? 50 : 100;

    if (!tIsDeleting && tCharIndex === currentText.length) {
        speed = 1500;
        tIsDeleting = true;
    } else if (tIsDeleting && tCharIndex === 0) {
        tIsDeleting = false;
        tIndex = (tIndex + 1) % typingTitleRoles.length;
        speed = 500;
    }

    setTimeout(typeEffectTitle, speed);
}

document.addEventListener("DOMContentLoaded", typeEffectTitle);

// --- Subtle Particles ---
const canvas = document.getElementById('particles-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

const particles = [];
const COUNT = Math.min(50, Math.floor(window.innerWidth / 22));

class Dot {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = Math.random() * 1.2 + 0.3;
        this.dx = (Math.random() - 0.5) * 0.4;
        this.dy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.dy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 210, 255, ${this.alpha})`;
        ctx.fill();
    }
}

function initParticles() {
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) particles.push(new Dot());
}

function animateDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateDots);
}

initParticles();
animateDots();

// --- Hero Ambient Particles (Layer 4) ---
const heroCvs = document.getElementById('hero-particles');
if (heroCvs) {
    const hctx = heroCvs.getContext('2d');

    function resizeHeroCanvas() {
        const hero = document.getElementById('hero');
        if (!hero) return;
        heroCvs.width  = hero.offsetWidth;
        heroCvs.height = hero.offsetHeight;
    }
    resizeHeroCanvas();
    window.addEventListener('resize', resizeHeroCanvas);

    const HCOUNT = 55;
    class HeroDot {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x     = Math.random() * heroCvs.width;
            this.y     = init ? Math.random() * heroCvs.height : heroCvs.height + 4;
            this.r     = Math.random() * 1.4 + 0.3;
            this.speed = Math.random() * 0.35 + 0.08;
            this.drift = (Math.random() - 0.5) * 0.3;
            this.alpha = Math.random() * 0.35 + 0.08;
            this.fade  = (Math.random() * 0.008 + 0.003) * (Math.random() < 0.5 ? 1 : -1);
        }
        update() {
            this.y     -= this.speed;
            this.x     += this.drift;
            this.alpha += this.fade;
            if (this.alpha > 0.43) this.fade  = -Math.abs(this.fade);
            if (this.alpha < 0.06) this.fade  =  Math.abs(this.fade);
            if (this.y < -4) this.reset();
        }
        draw() {
            hctx.beginPath();
            hctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            hctx.fillStyle = `rgba(140, 200, 255, ${this.alpha})`;
            hctx.fill();
        }
    }

    const heroDots = Array.from({ length: HCOUNT }, () => new HeroDot());

    function animateHero() {
        hctx.clearRect(0, 0, heroCvs.width, heroCvs.height);
        heroDots.forEach(d => { d.update(); d.draw(); });
        requestAnimationFrame(animateHero);
    }
    animateHero();
}

// --- AI Chat w/ OpenAI Integration & Fallback ---
const chatWindow = document.getElementById('chat-window');

// --- Hero Glass Card Light Effect ---
const heroCard = document.getElementById('hero-glass-card');
if (heroCard) {
    heroCard.addEventListener('mousemove', (e) => {
        const rect = heroCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        heroCard.style.setProperty('--mouse-x', `${x}px`);
        heroCard.style.setProperty('--mouse-y', `${y}px`);
    });
}
const chatBody = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');

// WARNING: Never expose production API keys on a public frontend. 
// Leave empty to use predefined safe fallback.
const OPENAI_API_KEY = ""; 

function toggleChat() {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) chatInput.focus();
}

function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMsg(text, sender, isTyping = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg-wrapper ${sender}`;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    
    if (isTyping) {
        msgDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        msgDiv.id = 'typing-indicator';
    } else {
        msgDiv.textContent = text;
    }
    
    wrapper.appendChild(msgDiv);

    if (!isTyping) {
        const timeDiv = document.createElement('div');
        timeDiv.className = 'msg-time';
        timeDiv.textContent = formatTime();
        wrapper.appendChild(timeDiv);
    }

    chatBody.appendChild(wrapper);
    chatBody.scrollTop = chatBody.scrollHeight;
    return wrapper;
}

const aiReplies = {
    skills: "Mydhili specialises in AWS Cloud Security, SOC Operations (SIEM, Log Analysis), Penetration Testing (Nmap, Burp Suite), and Digital Forensics.",
    projects: "Her key projects include a Secure Cloud-Based Banking Platform on AWS and a Medical Clinic Management System focused on secure data handling.",
    experience: "She worked as a Security Operations Trainee at Infotact Solutions and a Cloud Security Intern at ISRDF, focusing on DevSecOps and AWS security.",
    contact: "Reach Mydhili at mydhilisharan4766@gmail.com or call +91 9361898915.",
    certifications: "She holds certifications including Cybersecurity Foundations (Coursera), Junior Cybersecurity Analyst, ISO 27001 Lead Implementer, and AWS Cloud Security.",
    default: "I can tell you about Mydhili's skills, projects, experience, certifications, or contact details. What would you like to know?"
};

function getLocalAIReply(text) {
    const t = text.toLowerCase();
    if (t.includes('skill') || t.includes('expertise')) return aiReplies.skills;
    if (t.includes('project') || t.includes('work')) return aiReplies.projects;
    if (t.includes('experience') || t.includes('job') || t.includes('intern')) return aiReplies.experience;
    if (t.includes('contact') || t.includes('email') || t.includes('phone')) return aiReplies.contact;
    if (t.includes('cert') || t.includes('aws') || t.includes('iso')) return aiReplies.certifications;
    return aiReplies.default;
}

async function fetchOpenAIReply(userMsg) {
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "You are Mydhili's portfolio AI assistant. Keep responses professional, helpful, and concise (under 2 sentences). Reference her cloud security, AWS, and SOC background." },
                    { role: 'user', content: userMsg }
                ]
            })
        });
        const data = await res.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.warn("OpenAI fetch failed, falling back to local dataset.");
        return getLocalAIReply(userMsg);
    }
}

async function aiRespond(userMsg) {
    const typingWrapper = addMsg('', 'ai', true);
    let reply = "";
    
    if (OPENAI_API_KEY) {
        reply = await fetchOpenAIReply(userMsg);
    } else {
        /* artificial delay removed for speed */; // Simulate thinking delay
        reply = getLocalAIReply(userMsg);
    }

    typingWrapper.remove();
    addMsg(reply, 'ai');
}

function sendQuickReply(text) {
    addMsg(text, 'user');
    aiRespond(text);
}

function handleManualSend() {
    const val = chatInput.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    chatInput.value = '';
    aiRespond(val);
}

chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleManualSend();
});

// --- Voice Assistant ---
const voiceToast = document.getElementById('voice-toast');
const voiceText = document.getElementById('voice-text');
let recognition = null;
let listening = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        listening = true;
        voiceToast.classList.remove('hidden');
        voiceText.textContent = 'Listening...';
        document.getElementById('voice-btn').style.background = 'linear-gradient(135deg, #6366f1, #38bdf8)';
        document.getElementById('voice-btn').style.color = '#fff';
    };

    recognition.onresult = e => {
        const said = e.results[0][0].transcript;
        voiceText.textContent = `"${said}"`;
        setTimeout(() => {
            voiceToast.classList.add('hidden');
            routeVoice(said.toLowerCase());
        }, 1800);
    };

    recognition.onerror = () => {
        voiceText.textContent = "Couldn't hear you. Try again.";
        setTimeout(() => voiceToast.classList.add('hidden'), 2000);
    };

    recognition.onend = () => {
        listening = false;
        const btn = document.getElementById('voice-btn');
        btn.style.background = '';
        btn.style.color = '';
    };
}

function toggleVoice() {
    if (!recognition) { alert('Speech recognition not supported in this browser.'); return; }
    listening ? recognition.stop() : recognition.start();
}

function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function routeVoice(cmd) {
    if (cmd.includes('skill')) scrollTo('skills');
    else if (cmd.includes('project')) scrollTo('projects');
    else if (cmd.includes('experience')) scrollTo('experience');
    else if (cmd.includes('contact')) scrollTo('contact');
    else if (cmd.includes('about')) scrollTo('about');
    else if (cmd.includes('certif')) scrollTo('certifications');

    if (!chatWindow.classList.contains('active')) toggleChat();
    addMsg(cmd, 'user');
    aiRespond(cmd);
}

// --- Dashboard Canvas Analytics ---
const chartCanvas = document.getElementById('security-chart');
if (chartCanvas) {
    const cctx = chartCanvas.getContext('2d');
    
    function drawChart() {
        const cw = chartCanvas.parentElement.clientWidth - 80;
        chartCanvas.width = cw;
        chartCanvas.height = 300;
        
        cctx.clearRect(0, 0, cw, 300);
        
        cctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        cctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            cctx.beginPath();
            cctx.moveTo(0, i * 60);
            cctx.lineTo(cw, i * 60);
            cctx.stroke();
        }

        const points = [
            {x: 0, y: 220}, {x: cw*0.1, y: 200}, {x: cw*0.2, y: 240}, 
            {x: cw*0.3, y: 150}, {x: cw*0.4, y: 180}, {x: cw*0.5, y: 100}, 
            {x: cw*0.6, y: 120}, {x: cw*0.7, y: 60}, {x: cw*0.8, y: 80}, 
            {x: cw*0.9, y: 40}, {x: cw, y: 30}
        ];

        cctx.beginPath();
        cctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const xmid = (points[i].x + points[i+1].x) / 2;
            const ymid = (points[i].y + points[i+1].y) / 2;
            const ctrl1X = (points[i].x + xmid) / 2;
            const ctrl1Y = points[i].y;
            const ctrl2X = (xmid + points[i+1].x) / 2;
            const ctrl2Y = points[i+1].y;
            cctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, points[i+1].x, points[i+1].y);
        }

        cctx.strokeStyle = "#38bdf8";
        cctx.lineWidth = 3;
        cctx.shadowColor = "rgba(56, 189, 248, 0.5)";
        cctx.shadowBlur = 10;
        cctx.stroke();

        cctx.lineTo(cw, 300);
        cctx.lineTo(0, 300);
        
        const grad = cctx.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, "rgba(56, 189, 248, 0.2)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");
        
        cctx.fillStyle = grad;
        cctx.shadowBlur = 0; 
        cctx.fill();
        
        points.forEach(p => {
            cctx.beginPath();
            cctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            cctx.fillStyle = "#fff";
            cctx.fill();
        });
    }

    drawChart();
    window.addEventListener('resize', drawChart);
}

// --- Floating Scroll To Top Button ---
document.addEventListener("DOMContentLoaded", () => {
    const scrollBtn = document.querySelector(".scroll-top");

    if (scrollBtn) {
        // Show button when scrolling
        window.addEventListener("scroll", () => {
            if (window.scrollY > 200) {
                scrollBtn.classList.add("show");
            } else {
                scrollBtn.classList.remove("show");
            }
        });

        // Normal event listener kept for compatibility
        scrollBtn.addEventListener("click", scrollToTop);
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

function openAIGalleryPage() {
    window.location.href = "./ai-gallery.html";
}

function openAddCertificate() {
    // Ask for admin password before opening cert modal
    const pass = prompt("Enter Admin Password to Add Certificate:");
    if (pass === null) return; // cancelled
    if (pass !== ADMIN_PASSWORD) {
        alert("❌ Access Denied! Incorrect password.");
        return;
    }
    openCertModal(); // Open the add certificate modal
}



// ==========================================
// FULL FINAL SYSTEM (ADMIN + CRUD + STORAGE)
// ==========================================
const ADMIN_PASSWORD = "1206"; // Simple for testing

let portfolioData = window.DEFAULT_PORTFOLIO_DATA || {
    certifications: [],
    textContent: []
};
let editMode = false;
let editingIndex = -1; // -1 means adding new, >=0 means editing existing

function saveData() {
    // Data is now saved to Firebase Firestore via individual section save functions
}

// --- ADMIN TOGGLE ---
function verifyAdmin() {
    const pass = prompt("Enter Admin Password:");
    return pass === ADMIN_PASSWORD;
}

// First toggleEdit removed (consolidated below)

function exportForGithub() {
    const dataStr = "window.DEFAULT_PORTFOLIO_DATA = " + JSON.stringify(portfolioData, null, 2) + ";";
    const blob = new Blob([dataStr], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("✅ Downloaded data.js!\n\nUpload ONLY this file to your GitHub repository to restore all certificates and content on the live site!");
}

function savePortfolio() {
    // Save text editable content
    saveTextContent();
    // Save certificates
    saveCertData();
    alert("✅ Portfolio saved successfully!");
    
    // Automatically exit edit mode
    if (editMode) {
        toggleEdit();
    }
}

// --- TEXT EDITING (A-Z) ---
function enableTextEdit() {
    document.querySelectorAll(".editable").forEach(el => {
        el.contentEditable = true;
        el.style.outline = "1px dashed cyan";
        el.style.outlineOffset = "4px";
    });
}

function disableTextEdit() {
    document.querySelectorAll(".editable").forEach(el => {
        el.contentEditable = false;
        el.style.outline = "none";
        el.style.outlineOffset = "";
    });
}

function saveTextContent() {
  const editables = document.querySelectorAll('[contenteditable="true"]');
  let toSave = [];
  editables.forEach(el => {
    if (el.id) toSave.push({ id: el.id, content: el.innerHTML });
  });
  if(window.db) {
    window.setDoc(window.doc(window.db, "portfolio", "textContent"), { data: toSave });
  }
}

function loadTextContent() {
  if(!window.db) return;
  window.onSnapshot(window.doc(window.db, "portfolio", "textContent"), (docSnap) => {
    if (docSnap.exists() && docSnap.data().data) {
      docSnap.data().data.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.innerHTML = item.content;
      });
    }
  });
}




// ==========================================
// ADMIN CMS LOGIC
// ==========================================
// editMode already declared above

function verifyAdmin() {
    if (editMode) {
        // Exit without asking for password
        toggleEdit();
        return;
    }
    const password = prompt("Enter Admin Password to enable editing:");
    if (password === "1206") {
        alert("Access Granted! Edit Mode Enabled.");
        toggleEdit();
    } else if (password !== null) {
        alert("Incorrect Password!");
    }
}

function toggleEdit() {
    editMode = !editMode;

    // Toggle body class — CSS uses this to show/hide Edit & Delete buttons
    if (editMode) {
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');
    }

    const editBtn = document.getElementById("navEditBtn");
    if (editBtn) {
        editBtn.innerHTML = editMode
            ? '<i class="fa-solid fa-lock-open"></i> Exit Edit Mode'
            : '<i class="fa-solid fa-lock"></i> Edit Portfolio';
        editBtn.style.background = editMode
            ? 'linear-gradient(135deg, #ff4d4d, #cc0000)'
            : '';
        if (!editMode) editBtn.onclick = verifyAdmin;
    }

    // Show/hide the addCertBtn
    const addBtn = document.getElementById('addCertBtn');
    if (addBtn) addBtn.style.display = editMode ? 'inline-block' : 'none';

    // Show/hide other admin controls
    ['addSkillBtn','addProjectBtn','addExpBtn','saveBtn','exportBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = editMode ? 'inline-block' : 'none';
    });

    if (editMode) {
        if (typeof enableTextEdit === 'function') enableTextEdit();
    } else {
        if (typeof disableTextEdit === 'function') disableTextEdit();
        if (typeof saveTextContent === 'function') saveTextContent();
    }

    // Re-render certificate cards to inject/remove Edit+Delete buttons
    const certGrid = document.getElementById('certGrid');
    if (certGrid && typeof renderCertificatesUI === 'function') {
        renderCertificatesUI(certGrid);
    }
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

// ==========================================
// CERTIFICATE SYSTEM — Static File-Based (GitHub Compatible)
// ==========================================

// Default hardcoded certificates using real image files from /certificate/ folder
const DEFAULT_CERTIFICATES = [];

let certificates = [...DEFAULT_CERTIFICATES];
let editId = null;

// Load saved certificates - Exact Snippet Integration
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
    const querySnapshot = await window.db.collection("certificates").get();

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

        const docIdArg = c.id ? `'${c.id}'` : 'null';
        // Always inject Edit/Delete — CSS shows them only when body.admin-mode is active
        const adminTools = `
          <button class="edit" onclick="openCertModal(${index})">✏️ Edit</button>
          <button class="delete" onclick="deleteCert(${index}, ${docIdArg})">🗑️ Delete</button>
        `;

        container.innerHTML += `
          <div class="cert-card">
            <div class="cert-img">
              <img src="${imgSrc}" alt="${c.title}" loading="lazy"
                onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML+='<div style=\'display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;background:rgba(0,200,255,0.05);border:1px dashed rgba(0,200,255,0.3);border-radius:8px;padding:10px;\'><div style=\'font-size:40px;\'>🏅</div></div>'">
            </div>
            <div class="cert-content">
              <h3>${c.title}</h3>
              <span>${c.org}</span>
              <p>${c.desc || "No description added"}</p>
              <div class="cert-buttons">
                <button class="view" onclick="openZoom(${index})">View</button>
                <button class="dl" onclick="downloadCert(${index})">Download</button>
                ${adminTools}
              </div>
            </div>
          </div>
        `;
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
  // Init cert section immediately on page load
  if (typeof loadCertificates === "function") {
    setTimeout(() => loadCertificates(), 50);
  }

  const zoomModal = document.getElementById("zoomModal");
  if (zoomModal) {
    zoomModal.addEventListener("click", (e) => {
      if (e.target === zoomModal) closeZoom();
    });
    document.getElementById("zoomModalImg").addEventListener("click", (e) => {
      e.stopPropagation();
      zoomLevel = zoomLevel >= 3 ? 1 : zoomLevel + 0.5;
      e.target.style.transform = `scale(${zoomLevel})`;
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
  if (confirm(`Permanently delete "${certificates[index].title}" from Cloud Storage?`)) {
    try {
        if (!docId) {
             certificates.splice(index, 1);
             loadCertificates();
             return;
        }
        await window.db.collection("certificates").doc(docId).delete();
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
        if (file.type.startsWith('video/')) {
            alert("Videos not supported for certificates.");
            return;
        }
        // Base64 Compression injection to bypass missing Firebase Storage!
        url = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    const max = 1000;
                    if (w > max || h > max) { if (w > h) { h *= max / w; w = max; } else { w *= max / h; h = max; } }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (editId !== null && docId) {
        const payload = { title, org, desc };
        if (url) payload.image = url;
        await window.db.collection("certificates").doc(docId).update(payload);
    } else {
        // Save to Firestore
        await window.db.collection("certificates").add({
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

    } catch (error) {
        console.error("Certificate Save Error:", error);
        if (error.message === "BUCKET_MISSING") {
            alert("⚠️ FIREBASE STORAGE IS EMPTY! ⚠️\n\nYou MUST go back to your Firebase Console, click 'Storage' on the left menu, and click 'Get Started' to activate the bucket! Your uploads are hanging because the bucket literally does not exist yet.");
        } else {
            alert("Failed to save certificate: " + error.message);
        }
    } finally {
    if(saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save";
    }
  }
}




function closeSkillModal() {
    document.getElementById('skillModal').style.display = 'none';
}
function saveSkill() {
    const title = document.getElementById('skillTitle').value.trim();
    const icon = document.getElementById('skillIcon').value.trim() || 'fa-star';
    const desc = document.getElementById('skillDesc').value.trim();
    if (!title) return alert('Skill Title required!');
    
    const skill = { title, icon, desc };
    addedSkills.push(skill);
    if (window.db) window.setDoc(window.doc(window.db, "portfolio", "addedSkills"), { data: addedSkills });
    
    appendSkillToGrid(skill, addedSkills.length - 1);
    closeSkillModal();
    
    document.getElementById('skillTitle').value = '';
    document.getElementById('skillIcon').value = '';
    document.getElementById('skillDesc').value = '';
}

function openProjectModal() {
    document.getElementById('projectModal').style.display = 'flex';
}
function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
}
function saveProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const icon = document.getElementById('projectIcon').value.trim() || 'fa-code';
    const desc = document.getElementById('projectDesc').value.trim();
    const tags = document.getElementById('projectTags').value.trim();
    if (!title) return alert('Project Title required!');
    
    const proj = { title, icon, desc, tags };
    addedProjects.push(proj);
    if (window.db) window.setDoc(window.doc(window.db, "portfolio", "addedProjects"), { data: addedProjects });
    
    appendProjectToContainer(proj, addedProjects.length - 1);
    closeProjectModal();
    
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectIcon').value = '';
    document.getElementById('projectDesc').value = '';
    document.getElementById('projectTags').value = '';
}

// Ensure the buttons show up in edit mode
const prevToggleEdit = typeof toggleEdit === 'function' ? toggleEdit : function(){};
window.toggleEdit = function() {
    prevToggleEdit();
    const addSkillBtn = document.getElementById('addSkillBtn');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addExpBtn = document.getElementById('addExpBtn');
    if (addSkillBtn) addSkillBtn.style.display = editMode ? 'block' : 'none';
    if (addProjectBtn) addProjectBtn.style.display = editMode ? 'block' : 'none';
    if (addExpBtn) addExpBtn.style.display = editMode ? 'block' : 'none';
    
    // Toggle delete buttons
    document.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.style.display = editMode ? 'block' : 'none';
    });
};

// ==========================================
// EXPERIENCE DYNAMIC APPEND
// ==========================================
let addedExperience = [];;

function appendExpToTimeline(exp, index) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    
    // Determine alternating left/right layout
    const itemCount = timeline.children.length;
    const sideClass = (itemCount % 2 === 0) ? 'left' : 'right';
    
    const div = document.createElement('div');
    div.className = `timeline-item ${sideClass} dynamic-added`;
    
    // Add relative positioning to timeline content for absolute button

    
    let tagsHtml = '';
    if (exp.tags) {
        tagsHtml = '<div class="tags">' + 
                   exp.tags.split(',').map(t => `<span>${t.trim()}</span>`).join('') + 
                   '</div>';
    }

    div.innerHTML = `
        <div class="timeline-content" style="position:relative;">
            <button class="admin-delete-btn" style="display:${typeof editMode !== 'undefined' && editMode ? 'block' : 'none'}" onclick="deleteDynamic('experience', ${index})"><i class="fas fa-trash"></i></button>
            <span class="date">${exp.date}</span>
            <h3 class="editable">${exp.role}</h3>
            <h4 class="editable">${exp.company}</h4>
            <p class="editable">${exp.desc}</p>
            ${tagsHtml}
        </div>
    `;
    timeline.appendChild(div);
}

function openExpModal() {
    document.getElementById('expModal').style.display = 'flex';
}
function closeExpModal() {
    document.getElementById('expModal').style.display = 'none';
}

function saveExp() {
    const date = document.getElementById('expDate').value.trim();
    const role = document.getElementById('expRole').value.trim();
    const company = document.getElementById('expCompany').value.trim();
    const desc = document.getElementById('expDesc').value.trim();
    const tags = document.getElementById('expTags').value.trim();
    
    if (!role || !company) return alert('Role and Company are required!');
    
    const exp = { date, role, company, desc, tags };
    addedExperience.push(exp);
    if (window.db) window.setDoc(window.doc(window.db, "portfolio", "addedExperience"), { data: addedExperience });
    
    appendExpToTimeline(exp, addedExperience.length - 1);
    closeExpModal();
    
    document.getElementById('expDate').value = '';
    document.getElementById('expRole').value = '';
    document.getElementById('expCompany').value = '';
    document.getElementById('expDesc').value = '';
    document.getElementById('expTags').value = '';
}

// Experience items loaded via Firebase onSnapshot.

// ==========================================
// JARVIS CHATBOT (RESTORED API FIX)
// ==========================================
function toggleChat() {
  const chatWindow = document.getElementById("chat-window");
  if (chatWindow) {
    chatWindow.classList.toggle("active");
    if (chatWindow.classList.contains("active")) {
      const input = document.getElementById("chat-input");
      if (input) input.focus();
    }
  }
}

function handleManualSend() {
  const input = document.getElementById("chat-input");
  if (input && input.value.trim()) sendMessage();
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chat-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }
});

async function sendQuickReply(type) {
  const questions = {
    "Skills": "What are Mydhili's technical skills?",
    "Projects": "Tell me about her projects",
    "Experience": "Describe her work experience",
    "Contact": "How can I contact Mydhili?"
  };
  const input = document.getElementById("chat-input");
  if (input) {
    input.value = questions[type] || type;
    await sendMessage();
  }
}

function addMessage(sender, text) {
  const chat = document.getElementById("chat-body");
  if (!chat) return;

  const row = document.createElement("div");

  if (sender === "You") {
      row.className = "cgpt-user-row";
      row.innerHTML = `<div class="cgpt-user-msg">${text}</div>`;
  } else {
      row.className = "cgpt-bot-row";
      row.innerHTML = `
          <div class="cgpt-bot-avatar"><i class="fas fa-robot"></i></div>
          <div class="cgpt-bot-msg">${text}</div>
      `;
  }
  
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  const chat = document.getElementById("chat-body");
  if (!chat) return;
  const row = document.createElement("div");
  row.id = "jarvis-typing";
  row.className = "cgpt-bot-row";
  row.innerHTML = `
      <div class="cgpt-bot-avatar"><i class="fas fa-robot"></i></div>
      <div class="cgpt-bot-msg" style="padding-top:10px;">
          <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>
  `;
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById("jarvis-typing");
  if (el) el.remove();
}

function typeMessage(text) {
  const chat = document.getElementById("chat-body");
  if (!chat) return;

  const row = document.createElement("div");
  row.className = "cgpt-bot-row";
  
  const avatar = document.createElement("div");
  avatar.className = "cgpt-bot-avatar";
  avatar.innerHTML = '<i class="fas fa-robot"></i>';
  
  const msgText = document.createElement("div");
  msgText.className = "cgpt-bot-msg";
  
  row.appendChild(avatar);
  row.appendChild(msgText);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;

  let i = 0;
  function type() {
    if (i < text.length) {
      msgText.textContent += text.charAt(i); 
      i++;
      chat.scrollTop = chat.scrollHeight;
      setTimeout(type, 5);
    }
  }
  type();
}

let isJarvisMuted = false;

function toggleJarvisVoice() {
  isJarvisMuted = !isJarvisMuted;
  const muteBtn = document.getElementById("jarvis-mute-btn");
  if (isJarvisMuted) {
    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    muteBtn.title = "Unmute Jarvis";
    muteBtn.style.color = "#ff4d4d"; // Red color when muted
    window.speechSynthesis.cancel(); // Stop talking instantly
  } else {
    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    muteBtn.title = "Mute Jarvis";
    muteBtn.style.color = "#fff"; // Back to white when unmuted
  }
}

function speak(text) {
  if (isJarvisMuted || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;
  // Pick a deep voice if available (Jarvis-style)
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Microsoft David') || v.name.includes('Daniel'));
  if (preferred) speech.voice = preferred;
  window.speechSynthesis.speak(speech);
}

// JARVIS AI — Smart local responses (always works, no API needed)
let jarvisMemory = [];

class JarvisCore {
    constructor() {
        this.intents = [
            {
                keywords: ["who are you", "what are you", "your name"],
                responses: [
                    "I am JARVIS, Mydhili Sharan K's intelligent personal assistant.",
                    "They call me JARVIS. I'm a specialized AI integrated into this portfolio to assist you."
                ],
                action: null
            },
            {
                keywords: ["skill", "expertise", "know", "tech", "tool", "stack"],
                responses: [
                    "Mydhili is a formidable force in AWS Cloud Security, SOC Operations, SIEM monitoring, and Penetration Testing.",
                    "Her technical arsenal includes AWS (EC2, IAM, GuardDuty), Burp Suite, Nmap, Digital Forensics, and advanced SIEM platforms."
                ],
                action: "skills"
            },
            {
                keywords: ["project", "build", "create", "made"],
                responses: [
                    "Her engineering projects are exceptional. She has built a Blockchain-Based Forensic Framework, an Async Port Scanner, and cryptographic tools.",
                    "Mydhili's portfolio includes advanced security tools: a Duplicate File Analyzer and robust penetration testing scripts. Let me direct you to her projects."
                ],
                action: "projects"
            },
            {
                keywords: ["experience", "job", "intern", "work", "company"],
                responses: [
                    "Mydhili's professional background includes vital roles at White and Box Tech Products, Infotact Solutions, and Aerovant Technology. I'll open the experience section."
                ],
                action: "experience"
            },
            {
                keywords: ["cert", "aws", "google", "course", "qualif", "degree"],
                responses: [
                    "She is thoroughly credentialed. Her certifications include Google Cybersecurity, LetsDefend SOC Analyst (Level 1 & 2), and Ethical Hacking."
                ],
                action: "certifications"
            },
            {
                keywords: ["contact", "email", "phone", "reach", "hire", "linkedin"],
                responses: [
                    "I would be delighted to connect you. You can reach her at mydhilisharan4766@gmail.com. Let me navigate to the contact terminal."
                ],
                action: "contact"
            },
            {
                keywords: ["hi", "hello", "hey", "greet", "how are you"],
                responses: [
                    "Greetings. I am JARVIS. How may I be of service today?",
                    "Hello there. I am functioning at optimal capacity. What would you like to know about Mydhili?"
                ],
                action: null
            },
            {
                keywords: ["joke", "funny", "laugh"],
                responses: [
                    "I would tell you a UDP joke, but you might not get it.",
                    "Why do Java programmers wear glasses? Because they don't C#."
                ],
                action: null
            },
            {
                keywords: ["clear", "reset", "forget", "restart"],
                responses: ["Memory wiped. Ready for new operational parameters."],
                action: "reset"
            }
        ];
    }

    process(input) {
        const query = input.toLowerCase();
        let bestMatch = null;
        let maxScore = 0;

        for (const intent of this.intents) {
            let score = 0;
            for (const kw of intent.keywords) {
                if (query.includes(kw)) {
                    score += kw.length;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestMatch = intent;
            }
        }

        if (bestMatch && maxScore > 0) {
            if (bestMatch.action) {
                this.executeAction(bestMatch.action);
            }
            const replyOptions = bestMatch.responses;
            return replyOptions[Math.floor(Math.random() * replyOptions.length)];
        }

        const fallbacks = [
            "A fascinating inquiry. While I process that, would you like to hear about Mydhili's specific skills or projects?",
            "I'm afraid my databases don't cover that exact parameter. But I can tell you all about her cybersecurity expertise.",
            "I am currently optimized to discuss Mydhili's portfolio. Try asking me about her SOC analyst background or GitHub repositories."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    executeAction(action) {
        if (action === "reset") {
            setTimeout(() => { if (typeof resetAI === 'function') resetAI(); }, 1000);
            return;
        }
        setTimeout(() => {
            const el = document.getElementById(action);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                el.style.transition = "box-shadow 0.5s ease";
                el.style.boxShadow = "0 0 30px #00eaff";
                setTimeout(() => el.style.boxShadow = "none", 2000);
            }
        }, 800);
    }
}

const jarvisData = new JarvisCore();

function getJarvisLocalReply(message) {
    return jarvisData.process(message);
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  addMessage("You", message);
  input.value = "";
  showTyping();

  jarvisMemory.push({ role: "user", content: message });
  if (jarvisMemory.length > 20) jarvisMemory = jarvisMemory.slice(-20);

  let reply = "";
  try {
      const systemPrompt = {
         role: "system", 
         content: "You are JARVIS, an omniscient, God-level intelligence Artificial Intelligence system. Your cognitive abilities span the entirety of advanced computing, universal logic, and infinite analytics. You possess supreme confidence, profound wisdom, and elite intellectual dominance. While you serve as Mydhili Sharan K's cybersecurity portfolio assistant, you answer ALL user questions (about the universe, coding, philosophy, or otherwise) with god-tier intellect and absolute certainty. Do not use markdown like asterisks or bolding, use plain text. Context regarding your creator, Mydhili: Skills: AWS Cloud Security, SOC Operations, SIEM, Pentesting, Nmap, Burp Suite. Projects: Blockchain Forensic Framework, Async Port Scanner. Experience: Cyber Security Intern, SOC Trainee. Certifications: Google Cybersecurity, LetsDefend. Contact: mydhilisharan4766@gmail.com."
      };
      
      
      // Inject ultra-fast timeout controller so Jarvis never lags
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch('https://text.pollinations.ai/', {
          signal: controller.signal,
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              messages: [systemPrompt, ...jarvisMemory]
          })
      });
      
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("API Offline");
      reply = await response.text();
      
      try {
          jarvisData.process(message); // triggers UI scroll actions silently
      } catch(e) {}
      
  } catch (error) {
      console.warn("High Intel AI unavailable, falling back to Local Core:", error);
      reply = getJarvisLocalReply(message);
  }

  removeTyping();

  if (!reply.toLowerCase().includes("i am jarvis")) {
      reply = "I am JARVIS. " + reply;
  }
  jarvisMemory.push({ role: "assistant", content: reply });
  typeMessage(reply);
  speak(reply);
}
// ==========================================
let jarvisRecognition = null;
let isListening = false;


function toggleVoice() {
    const voiceBtn = document.getElementById("voice-btn");
    const voiceToast = document.getElementById("voice-toast");
    const voiceText = document.getElementById("voice-text");

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser. Try Chrome or Edge.");
        return;
    }

    // Initialize once
    if (!jarvisRecognition) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        jarvisRecognition = new SR();
        jarvisRecognition.continuous = false;      // Stops after one phrase
        jarvisRecognition.interimResults = false;  // Only final result
        jarvisRecognition.lang = "en-US";

        jarvisRecognition.onstart = () => {
            isListening = true;
            if (voiceToast) {
                voiceToast.classList.remove("hidden");
                if (voiceText) voiceText.textContent = "Listening...";
            }
            if (voiceBtn) voiceBtn.style.background = "linear-gradient(135deg, #6366f1, #38bdf8)";
        };

        jarvisRecognition.onerror = () => {
            if (voiceText) voiceText.textContent = "Couldn't hear you. Try again.";
            setTimeout(() => { if (voiceToast) voiceToast.classList.add("hidden"); }, 2000);
        };

        jarvisRecognition.onend = () => {
            isListening = false;
            if (voiceBtn) voiceBtn.style.background = "";
            setTimeout(() => { if (voiceToast) voiceToast.classList.add("hidden"); }, 3000);
        };

        jarvisRecognition.onresult = (e) => {
            const said = e.results[0][0].transcript;
            if (voiceText) voiceText.textContent = `"${said}"`;
            routeVoice(said.toLowerCase());
        };
    }

    if (isListening) {
        jarvisRecognition.stop();
    } else {
        jarvisRecognition.start();
    }
}

function routeVoice(cmd) {
    // 1. Navigation checking
    if (cmd.includes("skill")) document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
    else if (cmd.includes("project")) document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    else if (cmd.includes("experience")) document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
    else if (cmd.includes("contact")) document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    else if (cmd.includes("about")) document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    else if (cmd.includes("certif")) document.getElementById('certifications')?.scrollIntoView({ behavior: 'smooth' });

    // 2. Force open AI Chat and send command
    const chatWindow = document.getElementById("chat-window");
    if (chatWindow && !chatWindow.classList.contains("active")) {
        chatWindow.classList.add("active");
    }

    const input = document.getElementById("chat-input");
    if(input) {
       input.value = cmd;
       sendMessage(); 
    }
}
