const fs = require('fs');
let html = fs.readFileSync('ai-gallery.html', 'utf8');

const missingFuncs = \`
        // UI MODAL CONTROLS
        function openModal() {
            const m = document.getElementById("modal");
            if(m) m.style.display = "flex";
        }
        function closeModal() {
            const m = document.getElementById("modal");
            if(m) m.style.display = "none";
        }
\`;

if (!html.includes('function openModal')) {
    html = html.replace('</script>', missingFuncs + '\\n    </script>');
    fs.writeFileSync('ai-gallery.html', html, 'utf8');
    console.log('Restored openModal/closeModal to ai-gallery.html');
} else {
    console.log('Already exists');
}
