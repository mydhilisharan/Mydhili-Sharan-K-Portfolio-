const fs = require('fs');
let c = fs.readFileSync('style.css', 'utf8');

// Find and replace both cert-buttons blocks with one canonical well-styled block
// First remove old .cert-buttons blocks and button styling
const patterns = [
    /\/\* ====== CERT BUTTONS FINAL FIX ====== \*\/[\s\S]*?\.cert-buttons button:hover \{[^}]+\}/g,
    /\/\* COLORS \(MATCH YOUR UI\) \*\/\n\.view \{[^}]+\}\n\.dl \{[^}]+\}\n\.edit \{[^}]+\}\n\.delete \{[^}]+\}/g,
    /\.cert-buttons \{[\s\S]*?\}\n\n\.cert-buttons button \{[\s\S]*?\}\n/g
];

// Add the canonical styles before /* MODAL FIX */
const insertBefore = '/* MODAL FIX */';
const newStyles = `/* ====== CERT BUTTONS — CANONICAL ====== */
.cert-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 12px;
}
.cert-buttons button {
  flex: 1;
  min-width: 60px;
  padding: 8px 6px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: transform 0.2s, opacity 0.2s;
}
.cert-buttons button:hover { opacity: 0.9; transform: translateY(-2px); }
.cert-buttons .view   { background: linear-gradient(135deg, #00c6ff, #0072ff); color: #fff; }
.cert-buttons .dl     { background: linear-gradient(135deg, #7b4fff, #5e35d4); color: #fff; }
.cert-buttons .edit   { background: linear-gradient(135deg, #ffcc00, #f59e0b); color: #000; display: none; }
.cert-buttons .delete { background: linear-gradient(135deg, #ff4d4d, #cc0000); color: #fff; display: none; }
body.admin-mode .cert-buttons .edit,
body.admin-mode .cert-buttons .delete {
  display: flex;
  align-items: center;
  justify-content: center;
}

`;

if (c.includes(insertBefore)) {
    c = c.replace(insertBefore, newStyles + insertBefore);
    fs.writeFileSync('style.css', c);
    console.log('✅ style.css updated!');
} else {
    console.log('❌ Anchor not found — appending to end');
    c += '\n' + newStyles;
    fs.writeFileSync('style.css', c);
    console.log('✅ Appended to end of style.css');
}
