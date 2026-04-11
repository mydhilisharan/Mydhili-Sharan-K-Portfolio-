const fs = require('fs');
let s = fs.readFileSync('ai-gallery.html', 'utf8');

const cssFix = `
        @media (max-width: 500px) {
            .gallery-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
            .gallery-item { min-height: 120px !important; width: 100% !important; aspect-ratio: 1 !important; display: block !important; }
            .gallery-item img, .gallery-item video { border-radius: 8px !important; }
        }
`;

if (s.includes('</style>') && !s.includes('@media (max-width: 500px)')) {
    s = s.replace('</style>', cssFix + '</style>');
    fs.writeFileSync('ai-gallery.html', s);
    console.log("Applied Mobile iOS Grid Fallback to ai-gallery.html");
} else {
    console.log("Fallback already applied or tag not found.");
}
