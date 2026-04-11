const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

const oldRegex = /function getJarvisLocalReply\(message\) \{[\s\S]*?What would you like to know\?";\r?\n\}/;

const newEngine = `class JarvisCore {
    constructor() {
        this.intents = [
            {
                keywords: ["who are you", "what are you", "your name"],
                responses: [
                    "I am JARVIS, Mydhili Sharan K's intelligent personal assistant.",
                    "They call me JARVIS. I'm a specialized AI integrated into this portfolio to assist you."
                ],
                action: null
            },
            {
                keywords: ["skill", "expertise", "know", "tech", "tool", "stack"],
                responses: [
                    "Mydhili is a formidable force in AWS Cloud Security, SOC Operations, SIEM monitoring, and Penetration Testing.",
                    "Her technical arsenal includes AWS (EC2, IAM, GuardDuty), Burp Suite, Nmap, Digital Forensics, and advanced SIEM platforms."
                ],
                action: "skills"
            },
            {
                keywords: ["project", "build", "create", "made"],
                responses: [
                    "Her engineering projects are exceptional. She has built a Blockchain-Based Forensic Framework, an Async Port Scanner, and cryptographic tools.",
                    "Mydhili's portfolio includes advanced security tools: a Duplicate File Analyzer and robust penetration testing scripts. Let me direct you to her projects."
                ],
                action: "projects"
            },
            {
                keywords: ["experience", "job", "intern", "work", "company"],
                responses: [
                    "Mydhili's professional background includes vital roles at White and Box Tech Products, Infotact Solutions, and Aerovant Technology. I'll open the experience section."
                ],
                action: "experience"
            },
            {
                keywords: ["cert", "aws", "google", "course", "qualif", "degree"],
                responses: [
                    "She is thoroughly credentialed. Her certifications include Google Cybersecurity, LetsDefend SOC Analyst (Level 1 & 2), and Ethical Hacking."
                ],
                action: "certifications"
            },
            {
                keywords: ["contact", "email", "phone", "reach", "hire", "linkedin"],
                responses: [
                    "I would be delighted to connect you. You can reach her at mydhilisharan4766@gmail.com. Let me navigate to the contact terminal."
                ],
                action: "contact"
            },
            {
                keywords: ["hi", "hello", "hey", "greet", "how are you"],
                responses: [
                    "Greetings. I am JARVIS. How may I be of service today?",
                    "Hello there. I am functioning at optimal capacity. What would you like to know about Mydhili?"
                ],
                action: null
            },
            {
                keywords: ["joke", "funny", "laugh"],
                responses: [
                    "I would tell you a UDP joke, but you might not get it.",
                    "Why do Java programmers wear glasses? Because they don't C#."
                ],
                action: null
            },
            {
                keywords: ["clear", "reset", "forget", "restart"],
                responses: ["Memory wiped. Ready for new operational parameters."],
                action: "reset"
            }
        ];
    }

    process(input) {
        const query = input.toLowerCase();
        let bestMatch = null;
        let maxScore = 0;

        for (const intent of this.intents) {
            let score = 0;
            for (const kw of intent.keywords) {
                if (query.includes(kw)) {
                    score += kw.length;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestMatch = intent;
            }
        }

        if (bestMatch && maxScore > 0) {
            if (bestMatch.action) {
                this.executeAction(bestMatch.action);
            }
            const replyOptions = bestMatch.responses;
            return replyOptions[Math.floor(Math.random() * replyOptions.length)];
        }

        const fallbacks = [
            "A fascinating inquiry. While I process that, would you like to hear about Mydhili's specific skills or projects?",
            "I'm afraid my databases don't cover that exact parameter. But I can tell you all about her cybersecurity expertise.",
            "I am currently optimized to discuss Mydhili's portfolio. Try asking me about her SOC analyst background or GitHub repositories."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    executeAction(action) {
        if (action === "reset") {
            setTimeout(() => { if (typeof resetAI === 'function') resetAI(); }, 1000);
            return;
        }
        setTimeout(() => {
            const el = document.getElementById(action);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                el.style.transition = "box-shadow 0.5s ease";
                el.style.boxShadow = "0 0 30px #00eaff";
                setTimeout(() => el.style.boxShadow = "none", 2000);
            }
        }, 800);
    }
}

const jarvisData = new JarvisCore();

function getJarvisLocalReply(message) {
    return jarvisData.process(message);
}`;

if (oldRegex.test(s)) {
    s = s.replace(oldRegex, newEngine);
    fs.writeFileSync('script.js', s);
    console.log("Upgraded JARVIS successfully.");
} else {
    console.log("Could not find the old JARVIS function.");
}
