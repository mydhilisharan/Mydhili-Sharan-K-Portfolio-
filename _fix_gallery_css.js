const fs = require('fs');
let c = fs.readFileSync('ai-gallery.html', 'utf8');

// The exact broken pattern (using \r\n since it's Windows)
const oldBlock = `.spinner {\r\n            width: 40px;\r\n            height: 40px;\r\n            border: 3px solid rgba(0,255,255,0.2);\r\n            border-top-color: #00eaff;\r\n            border-radius: 50%;\r\n            }\r\n            .header {\r\n                padding: 30px 15px;\r\n            }\r\n            .header h1 {\r\n                font-size: 2.2rem;\r\n            }\r\n            .header p {\r\n                font-size: 0.85rem;\r\n                padding: 0 10px;\r\n            }\r\n            .floating-add {\r\n                bottom: 80px; \r\n                right: 20px; \r\n                left: auto; /* move it to right so it doesn't block text overflow too heavily */\r\n                width: 50px;\r\n                height: 50px;\r\n                font-size: 24px;\r\n                display: flex;\r\n                align-items: center;\r\n                justify-content: center;\r\n                line-height: 0;\r\n            }\r\n            #modal .modal-content {\r\n                width: 90%;\r\n                padding: 24px;\r\n            }\r\n        }\r\n    </style>`;

const newBlock = `.spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0,255,255,0.2);
            border-top-color: #00eaff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* GALLERY ITEM DELETE BUTTON */
        .gallery-item { position: relative; overflow: hidden; }
        .delete-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 34px;
            height: 34px;
            background: rgba(220, 30, 70, 0.92);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 30;
            opacity: 0;
            transform: scale(0.7);
            transition: opacity 0.2s ease, transform 0.2s ease;
            box-shadow: 0 2px 12px rgba(220,30,70,0.6);
            border: none;
        }
        .delete-btn svg { width: 15px; height: 15px; stroke: white; fill: none; stroke-width: 2.5; }
        .gallery-item:hover .delete-btn { opacity: 1; transform: scale(1); }
        .delete-btn:hover { background: #ff1a3c !important; transform: scale(1.2) !important; }

        /* ========== MOBILE RESPONSIVENESS ========== */
        @media (max-width: 768px) {
            .gallery-grid, .vault-content {
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 15px;
                padding: 20px 15px;
            }
            .header {
                padding: 30px 15px;
            }
            .header h1 {
                font-size: 2.2rem;
            }
            .header p {
                font-size: 0.85rem;
                padding: 0 10px;
            }
            .floating-add {
                bottom: 80px;
                right: 20px;
                left: auto;
                width: 50px;
                height: 50px;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 0;
            }
            #modal .modal-content {
                width: 90%;
                padding: 24px;
            }
            .delete-btn { opacity: 1; transform: scale(1); } /* Always visible on mobile */
        }
    </style>`;

if (c.includes(oldBlock)) {
    c = c.replace(oldBlock, newBlock);
    fs.writeFileSync('ai-gallery.html', c);
    console.log('✅ Fixed successfully!');
} else {
    // Try normalizing line endings
    const normalized = c.replace(/\r\n/g, '\n');
    const oldNorm = oldBlock.replace(/\r\n/g, '\n');
    if (normalized.includes(oldNorm)) {
        const fixed = normalized.replace(oldNorm, newBlock);
        fs.writeFileSync('ai-gallery.html', fixed);
        console.log('✅ Fixed (normalized LF)!');
    } else {
        console.log('❌ Still not found. Lengths: old=' + oldBlock.length);
        const spinnerIdx = c.indexOf('.spinner {');
        const closeStyle = c.indexOf('</style>', spinnerIdx);
        console.log('Spinner to </style>:', JSON.stringify(c.substring(spinnerIdx, closeStyle + 8)));
    }
}
