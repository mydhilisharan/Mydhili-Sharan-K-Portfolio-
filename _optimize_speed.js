const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

// 1. Reduce typing effect speed to ultra-fast 5ms
s = s.replace(/setTimeout\(type, 18\)/g, 'setTimeout(type, 5)');

// 2. Reduce hero typing delays
s = s.replace(/setTimeout\(typeLoop, 800\)/g, 'setTimeout(typeLoop, 200)');

// 3. Remove long artificial delays from script
s = s.replace(/await new Promise\(r => setTimeout\(r, 800\)\)/g, '/* artificial delay removed for speed */');

// 4. Reduce certificate UI load delay
s = s.replace(/setTimeout\(\(\) => loadCertificates\(\), 600\)/g, 'setTimeout(() => loadCertificates(), 50)');

// 5. Add abort controller to fetch array in sendMessage
const fetchBlock = "const response = await fetch('https://text.pollinations.ai/', {";
const fastFetchBlock = `
      // Inject ultra-fast timeout controller so Jarvis never lags
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch('https://text.pollinations.ai/', {
          signal: controller.signal,`;

if (s.includes(fetchBlock) && !s.includes('controller.signal')) {
    s = s.replace(fetchBlock, fastFetchBlock);
    
    // Also clear the timeout after response
    const fetchEndBlock = `
      if (!response.ok) throw new Error("API Offline");`;
    const fetchFastEndBlock = `
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("API Offline");`;
    s = s.replace(fetchEndBlock, fetchFastEndBlock);
}

fs.writeFileSync('script.js', s);
console.log("Successfully sped up all sessions!");
