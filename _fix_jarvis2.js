const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

// Precisely target: the GROQ key line only, replace the full sendMessage block
const START = '// Obfuscated API key to bypass GitHub Secret Scanning\r\nconst GROQ_API_KEY =';
const startIdx = s.indexOf(START);
if (startIdx === -1) { console.log('❌ START marker not found'); process.exit(1); }

// Find the closing of the catch block for the GROQ fetch (after the network error message)
const networkErrLine = 'addMessage("AI", "⚠️ Network error. Please check your internet connection.");\r\n  }\r\n}';
const endIdx = s.indexOf(networkErrLine, startIdx);
if (endIdx === -1) { console.log('❌ END marker not found'); process.exit(1); }

const endFull = endIdx + networkErrLine.length;
const oldChunk = s.substring(startIdx, endFull);
console.log('Chunk length:', oldChunk.length, '✅');

const newChunk = `// JARVIS AI — Smart local responses (always works, no API needed)
let jarvisMemory = [];

function getJarvisLocalReply(message) {
    const t = message.toLowerCase();
    if (t.match(/hi|hello|hey|greet|good/)) return "Good day. I am JARVIS, Mydhili Sharan K's personal AI assistant. How may I be of service?";
    if (t.match(/who are you|what are you|your name/)) return "I am JARVIS — Just A Rather Very Intelligent System — serving as Mydhili Sharan K's personal portfolio assistant. At your service.";
    if (t.match(/skill|expertise|know|tech|tool/)) return "Of course. Mydhili specialises in AWS Cloud Security (EC2, IAM, VPC, GuardDuty), SOC Operations with SIEM platforms, Penetration Testing using Nmap and Burp Suite, and Digital Forensics. Quite an impressive arsenal.";
    if (t.match(/project|build|create/)) return "Certainly. Her notable projects include: a Blockchain-Based Forensic Framework for detecting file timestamp manipulation, a Fast Async Port Scanner for security audits, and a Duplicate File Analyzer using cryptographic hashing.";
    if (t.match(/experience|job|intern|company/)) return "Right away. Mydhili has interned at White and Box Tech Products as a Cyber Security Intern (2026), worked as a Security Operations Trainee at Infotact Solutions, and as a Cloud Security Intern at Aerovant Technology.";
    if (t.match(/cert|aws|google|course|qualif/)) return "Indeed. Her certifications include Google Cybersecurity (Coursera), LetsDefend SOC Analyst (Levels 1 & 2), Ethical Hacking (Udemy), and TryHackMe achievements. Thoroughly credentialed.";
    if (t.match(/contact|email|phone|reach|hire|linkedin/)) return "Allow me. You may reach Mydhili at mydhilisharan4766@gmail.com or via LinkedIn: linkedin.com/in/mydhili-sharan-k-68bb152bb. She is available for cybersecurity opportunities.";
    if (t.match(/github|code|repo/)) return "Her GitHub is at github.com/mydhilisharan. This portfolio showcases her projects and certifications in detail.";
    if (t.match(/cloud|aws|azure/)) return "Mydhili's cloud expertise covers AWS EC2, VPC architecture, IAM policy management, CloudTrail auditing, CloudWatch monitoring, GuardDuty threat detection, and KMS encryption.";
    if (t.match(/soc|siem|threat|incident|monitor/)) return "Mydhili is proficient in SOC Operations — SIEM monitoring, log analysis, threat detection, and incident response, applied at Infotact Solutions.";
    if (t.match(/hack|pentest|penetrat|exploit|nmap|burp/)) return "In penetration testing, Mydhili works with Nmap, Burp Suite, Metasploit, and SQLMap for database vulnerability assessment. Ethically, of course.";
    if (t.match(/thank|thanks|appreciate/)) return "You are most welcome. Is there anything else I may assist you with?";
    return "A most intriguing inquiry. I can assist with questions about Mydhili's skills, projects, experience, certifications, and contact details. What would you like to know?";
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  addMessage("You", message);
  input.value = "";
  showTyping();

  jarvisMemory.push({ role: "user", content: message });
  if (jarvisMemory.length > 20) jarvisMemory = jarvisMemory.slice(-20);

  // JARVIS thinking delay
  await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
  removeTyping();

  const reply = getJarvisLocalReply(message);
  jarvisMemory.push({ role: "assistant", content: reply });
  typeMessage(reply);
  speak(reply);
}`;

s = s.replace(oldChunk, newChunk);

// Verify brace count
let open = 0;
for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') open++;
    else if (s[i] === '}') open--;
}
console.log('Net unclosed braces after fix:', open);

if (open === 0) {
    fs.writeFileSync('script.js', s);
    console.log('✅ Saved successfully!');
} else {
    console.log('❌ Still unbalanced, not saving. Check chunk boundaries.');
}
