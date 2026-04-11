const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname);
const MIME = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.jpeg':'image/jpeg','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf','.webp':'image/webp' };
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url === '/' ? '/index.html' : req.url).split('?')[0];
  let file = path.join(ROOT, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    res.end(data);
  });
}).listen(8080, () => console.log('Preview server running at http://localhost:8080'));
