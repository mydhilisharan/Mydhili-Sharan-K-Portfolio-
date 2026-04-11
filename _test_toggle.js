const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const script = fs.readFileSync("script.js", "utf8");
const config = fs.readFileSync("firebase-config.js", "utf8");

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;

// Mock Firebase
window.firebase = {
  firestore: () => ({ collection: () => ({ get: async () => ({ docs: [] }) }) }),
  storage: () => ({ ref: () => {} }),
  initializeApp: () => {}
};
window.db = window.firebase.firestore();
window.storage = window.firebase.storage();

try {
  window.eval(config);
  window.eval(script);
  
  // Set up mock edit mode
  window.editMode = false;
  window.verifyAdmin = () => true; 
  
  // trigger toggleEdit
  console.log("Calling toggleEdit()...");
  window.toggleEdit();
  
  console.log("Check certGrid contents:");
  console.log(window.document.getElementById("certGrid").innerHTML);
  
} catch (e) {
  console.error("ERROR CAUGHT:", e);
}
