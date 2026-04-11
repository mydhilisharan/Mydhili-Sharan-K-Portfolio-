const fs = require('fs');

let html = fs.readFileSync('ai-gallery.html', 'utf8');

// Replace the floating-add button with a bulletproof inline onclick
// that directly manipulates the DOM without calling an external function 
html = html.replace(
  /<button class="floating-add"[^>]*>.*?<\/button>/s,
  `<button class="floating-add" id="vaultAddBtn" title="Add to Vault" style="z-index:9999;">+</button>`
);

// Add a guaranteed DOMContentLoaded hook right before </body>
// This is the most reliable way to wire up the button
const hookScript = `
<script>
  document.addEventListener("DOMContentLoaded", function() {
    var addBtn = document.getElementById("vaultAddBtn");
    var modal = document.getElementById("modal");
    var cancelBtn = document.querySelector(".btn-cancel");

    if (addBtn && modal) {
      addBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        modal.style.cssText = "display:flex !important; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center;";
        console.log("Vault modal opened");
      });
    }

    if (cancelBtn && modal) {
      cancelBtn.addEventListener("click", function() {
        modal.style.display = "none";
      });
    }

    // Also override the global functions just in case
    window.openModal = function() {
      if (modal) modal.style.cssText = "display:flex !important; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center;";
    };
    window.closeModal = function() {
      if (modal) modal.style.display = "none";
    };
  });
</script>
`;

html = html.replace('</body>', hookScript + '</body>');

fs.writeFileSync('ai-gallery.html', html, 'utf8');
console.log("✅ Gallery + button wired with bulletproof inline addEventListener");
