const fs = require('fs');
let s = fs.readFileSync('style.css', 'utf8');

const mobileCSS = `

/* ==========================================
   GLOBAL MOBILE RESPONSIVENESS OVERRIDES
   ========================================== */
@media (max-width: 800px) {
    section { padding: 50px 5% !important; }
    .hero-title { font-size: 2.8rem !important; }
    .hero-subtitle { font-size: 1.2rem !important; }
    
    .cert-grid, .projects-grid, .skills-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
    }
    
    .chat-window {
        width: 90vw !important;
        right: 5vw !important;
        bottom: 5vw !important;
        height: 60vh !important;
    }
    
    .main-nav { padding: 10px 5% !important; flex-wrap: wrap; justify-content: center;gap: 10px;}
    .profile-card img { width: 140px !important; height: 140px !important; }
    .section-title { font-size: 2.2rem !important; margin-bottom: 30px !important; }
    .contact-form { padding: 25px 15px !important; }
}

@media (max-width: 480px) {
    .chat-window {
        width: 100vw !important;
        height: 75vh !important;
        right: 0 !important;
        bottom: 0 !important;
        border-radius: 20px 20px 0 0 !important;
    }
    .hero-title { font-size: 2.2rem !important; }
    .hero-buttons { flex-direction: column; width: 100%; }
    .hero-buttons .btn { width: 100%; display: block; margin: 5px 0 !important; text-align: center; }
    section { padding: 40px 5% !important; }
    .title-wrapper { display: flex; flex-direction: column; text-align: center; }
}
`;

s += mobileCSS;

fs.writeFileSync('style.css', s);
console.log("Global mobile responsiveness overrides injected successfully.");
