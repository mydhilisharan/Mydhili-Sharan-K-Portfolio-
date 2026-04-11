const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

// Restore resetAI because it was deleted
const restoreReset = `
}

function resetAI() {
  jarvisMemory = [];
  const chat = document.getElementById("chat-body");
  if (chat) {
    chat.innerHTML = \`<div class="cgpt-bot-row"><div class="cgpt-bot-avatar"><i class="fas fa-robot"></i></div><div class="cgpt-bot-msg">I am JARVIS. 🧠 Memory cleared! Starting fresh — ask me anything about Mydhili.</div></div>\`;
  }
}

// ==========================================
// VOICE ASSISTANT (NATIVE BROWSER API)
// ==========================================
`;

s = s.replace(`}

// ==========================================
// VOICE ASSISTANT (NATIVE BROWSER API)
// ==========================================`, restoreReset);


// Ensure all Pollination API replies get prepended properly if they ain't already starting with JARVIS
const fetchEndBlock = `
  jarvisMemory.push({ role: "assistant", content: reply });
  typeMessage(reply);`;

const prefixedFetchEndBlock = `
  if (!reply.toLowerCase().includes("i am jarvis")) {
      reply = "I am JARVIS. " + reply;
  }
  jarvisMemory.push({ role: "assistant", content: reply });
  typeMessage(reply);`;
  
s = s.replace(fetchEndBlock, prefixedFetchEndBlock);

fs.writeFileSync('script.js', s);
console.log("Successfully prefixed JARVIS!");
