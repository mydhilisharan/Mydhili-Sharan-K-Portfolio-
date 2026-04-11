const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

// Find the GROQ block to replace
const startMarker = '// Obfuscated API key to bypass GitHub Secret Scanning';
const endMarker = '  try {\r\n    const res = await fetch("https://api.groq.com/openai/v1/chat/completions"';

const startIdx = s.indexOf(startMarker);
// Find the closing of the catch block after the API call
const tryIdx = s.indexOf('  try {\r\n    const res = await fetch("https://api.groq.com', startIdx);
// Find end of function (the catch + finally block end)
const catchEnd = s.indexOf('\r\n}\r\n', tryIdx + 200);

if (startIdx === -1) {
    console.log('❌ startMarker not found');
    process.exit(1);
}

const oldChunk = s.substring(startIdx, catchEnd + 4);
console.log('Found chunk, length:', oldChunk.length);
console.log('Last 100 chars:', JSON.stringify(oldChunk.slice(-100)));

const newChunk = `// JARVIS AI — Smart local responses (API-free, always works)
let jarvisMemory = [];

const JARVIS_SYSTEM_PROMPT = \`You are JARVIS, Mydhili Sharan K's personal AI assistant.\`;

// Smart local JARVIS fallback
function getJarvisLocalReply(message) {
    const t = message.toLowerCase();
    if (t.match(/hi|hello|hey|greet|good/)) return "Good day. I am JARVIS, Mydhili Sharan K's personal AI assistant. How may I be of service?";
    if (t.match(/who are you|what are you|your name/)) return "I am JARVIS — Just A Rather Very Intelligent System — serving as Mydhili Sharan K's personal portfolio assistant. At your service.";
    if (t.match(/skill|expertise|know|tech|tool/)) return "Of course. Mydhili specialises in AWS Cloud Security (EC2, IAM, VPC, GuardDuty), SOC Operations with SIEM platforms, Penetration Testing using Nmap and Burp Suite, and Digital Forensics. Quite an impressive arsenal.";
    if (t.match(/project|build|create/)) return "Certainly. Her notable projects include: a Blockchain-Based Forensic Framework for detecting file timestamp manipulation, a Fast Async Port Scanner for security audits, and a Duplicate File Analyzer using cryptographic hashing.";
    if (t.match(/experience|job|intern|company/)) return "Right away. Mydhili has interned at White and Box Tech Products as a Cyber Security Intern (2026), worked as a Security Operations Trainee at Infotact Solutions, and as a Cloud Security Intern at Aerovant Technology.";
    if (t.match(/cert|aws|google|course|qualif/)) return "Indeed. Her certifications include Google Cybersecurity (Coursera), LetsDefend SOC Analyst (Levels 1 & 2), Ethical Hacking (Udemy), TryHackMe achievements, and Data Analytics. Thoroughly credentialed.";
    if (t.match(/contact|email|phone|reach|hire|linkedin/)) return "Allow me. You may reach Mydhili at mydhilisharan4766@gmail.com or connect via LinkedIn: linkedin.com/in/mydhili-sharan-k-68bb152bb. She is available for cybersecurity opportunities.";
    if (t.match(/github|code|repo/)) return "Her GitHub is at github.com/mydhilisharan. This portfolio you are viewing showcases her projects and certifications in detail.";
    if (t.match(/cloud|aws|azure/)) return "Mydhili's cloud expertise covers AWS EC2, VPC architecture, IAM policy management, CloudTrail auditing, CloudWatch monitoring, GuardDuty threat detection, and KMS encryption.";
    if (t.match(/soc|siem|threat|incident|monitor/)) return "Mydhili is proficient in SOC Operations — SIEM monitoring, log analysis, threat detection, and incident response, applied during her roles at Infotact Solutions.";
    if (t.match(/hack|pentest|penetrat|exploit|nmap|burp/)) return "In penetration testing, Mydhili works with Nmap for network scanning, Burp Suite for web application testing, Metasploit for exploitation, and SQLMap for database vulnerability assessment. Ethically, of course.";
    if (t.match(/thank|thanks|appreciate/)) return "You are most welcome. Is there anything else I may assist you with regarding Mydhili's background?";
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

  // Simulate JARVIS thinking delay, then respond locally
  await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
  removeTyping();

  const reply = getJarvisLocalReply(message);
  jarvisMemory.push({ role: "assistant", content: reply });
  typeMessage(reply);
  speak(reply);

`;

s = s.replace(oldChunk, newChunk);
fs.writeFileSync('script.js', s);
console.log('✅ JARVIS AI fixed with smart local fallback!');
