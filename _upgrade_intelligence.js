const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

const regex = /async function sendMessage\(\) \{[\s\S]*?speak\(reply\);\r?\n\}/;

const newCode = `async function sendMessage() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  addMessage("You", message);
  input.value = "";
  showTyping();

  jarvisMemory.push({ role: "user", content: message });
  if (jarvisMemory.length > 20) jarvisMemory = jarvisMemory.slice(-20);

  let reply = "";
  try {
      const systemPrompt = {
         role: "system", 
         content: "You are JARVIS, an advanced, highly intelligent AI assistant for Mydhili Sharan K's cybersecurity portfolio. You speak with a crisp, professional, slightly witty tone. Keep answers concise. Mydhili's skills: AWS Cloud Security, SOC Operations, SIEM, Pentesting, Nmap, Burp Suite. Projects: Blockchain-Based Forensic Framework, Fast Async Port Scanner. Experience: Cyber Security Intern at White and Box Tech Products, SOC Trainee at Infotact Solutions. Certifications: Google Cybersecurity, LetsDefend. Contact: mydhilisharan4766@gmail.com. Do not use markdown like asterisks or bolding, use plain text."
      };
      
      const response = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              messages: [systemPrompt, ...jarvisMemory]
          })
      });
      
      if (!response.ok) throw new Error("API Offline");
      reply = await response.text();
      
      try {
          jarvisData.process(message); // triggers UI scroll actions silently
      } catch(e) {}
      
  } catch (error) {
      console.warn("High Intel AI unavailable, falling back to Local Core:", error);
      reply = getJarvisLocalReply(message);
  }

  removeTyping();

  jarvisMemory.push({ role: "assistant", content: reply });
  typeMessage(reply);
  speak(reply);
}`;

if (regex.test(s)) {
    s = s.replace(regex, newCode);
    fs.writeFileSync('script.js', s);
    console.log("Upgraded sendMessage successfully.");
} else {
    console.log("Could not find sendMessage block.");
}
