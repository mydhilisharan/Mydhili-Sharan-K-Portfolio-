const fs = require('fs');
let c = fs.readFileSync('ai-gallery.html', 'utf8');

const badgeCSS = `
        /* VIDEO PLAY BADGE */
        .video-play-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            background: linear-gradient(135deg, rgba(0,200,255,0.85), rgba(0,80,255,0.85));
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            padding: 4px 8px;
            border-radius: 20px;
            z-index: 15;
            pointer-events: none;
            backdrop-filter: blur(4px);
            box-shadow: 0 2px 8px rgba(0,200,255,0.5);
        }
        /* Animated cyan glow border for video cards */
        .gallery-item:has(video) {
            border: 1.5px solid rgba(0,200,255,0.5);
            animation: videoGlow 2.5s ease-in-out infinite alternate;
        }
        @keyframes videoGlow {
            from { box-shadow: 0 0 8px rgba(0,200,255,0.3); border-color: rgba(0,200,255,0.3); }
            to   { box-shadow: 0 0 22px rgba(0,200,255,0.8); border-color: rgba(0,200,255,0.8); }
        }

`;

const anchor = '/* ========== MOBILE RESPONSIVENESS ==========';
if (c.includes(anchor)) {
    c = c.replace(anchor, badgeCSS + '        ' + anchor);
    fs.writeFileSync('ai-gallery.html', c);
    console.log('✅ Badge CSS added!');
} else {
    // Try just before </style>
    c = c.replace('</style>', badgeCSS + '    </style>');
    fs.writeFileSync('ai-gallery.html', c);
    console.log('✅ Badge CSS added before </style>');
}
