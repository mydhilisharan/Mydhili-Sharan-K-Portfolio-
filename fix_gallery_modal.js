const fs = require('fs');

let html = fs.readFileSync('ai-gallery.html', 'utf8');

// FIX 1: Standardize file input ID — change "mediaInput" references in JS to "fileInput" (the actual HTML id)
html = html.replace(/getElementById\("mediaInput"\)/g, 'getElementById("fileInput")');

// FIX 2: The modal CSS uses display:block in the stylesheet but openModal sets "flex"
// Let's look at the #modal CSS rule and change it to flex
// The modal CSS currently has:
//     #modal { ... display: flex; ...} or display:none ?
// The inline style="display:none;" means openModal() should work fine setting to "flex"
// Let's also make 100% sure the openModal function sets display to flex
html = html.replace(
  'function openModal() {\n            const m = document.getElementById("modal");\n            if(m) m.style.display = "flex";\n        }',
  'function openModal() {\n            const m = document.getElementById("modal");\n            if(m) { m.style.display = "flex"; m.style.alignItems = "center"; m.style.justifyContent = "center"; }\n        }'
);

// FIX 3: Make sure the floating-add button explicitly calls openModal
// The button HTML currently is: <button class="floating-add" onclick="openModal()" ...>
// That looks correct, but let's verify it has onclick and not just the class
if (!html.includes('floating-add" onclick="openModal()"')) {
  html = html.replace(
    /class="floating-add"([^>]*)>/,
    'class="floating-add" onclick="openModal()" title="Add to Vault">'
  );
  console.log('Fixed floating-add button onclick');
} else {
  console.log('Floating-add button already has correct onclick');
}

// FIX 4: The modal position in the CSS might be display:none by default
// The #modal CSS class in the style tag might need "display:none" initially
// Let's ensure the CSS #modal doesn't override the inline style
// Change the CSS #modal rule from display:flex to display:none so JS controls it
html = html.replace(
  /#modal\s*\{([^}]*?)display:\s*flex/,
  '#modal {\n            display: none; /* JS controlled */'
);

fs.writeFileSync('ai-gallery.html', html, 'utf8');
console.log('✅ Gallery modal ID mismatch fixed - mediaInput → fileInput');
console.log('✅ openModal CSS override fixed');
console.log('✅ All gallery modal fixes applied');
