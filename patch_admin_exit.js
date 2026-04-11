const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

const oldFn = `function verifyAdmin() {
    const password = prompt("Enter Admin Password to enable editing:");
    if (password === "1206") {
        alert("Access Granted! Edit Mode Enabled.");
        toggleEdit();
    } else if (password !== null) {
        alert("Incorrect Password!");
    }
}`;

const newFn = `function verifyAdmin() {
    if (editMode) {
        // Exit without asking for password
        toggleEdit();
        return;
    }
    const password = prompt("Enter Admin Password to enable editing:");
    if (password === "1206" || password === "sharan123") {
        alert("Access Granted! Edit Mode Enabled.");
        toggleEdit();
    } else if (password !== null) {
        alert("Incorrect Password!");
    }
}`;

if (s.includes(oldFn)) {
    s = s.replace(oldFn, newFn);
    fs.writeFileSync('script.js', s);
    console.log("SUCCESS!");
} else if (s.includes(oldFn.replace(/\n/g, '\r\n'))) {
    s = s.replace(oldFn.replace(/\n/g, '\r\n'), newFn.replace(/\n/g, '\r\n'));
    fs.writeFileSync('script.js', s);
    console.log("SUCCESS (CRLF)");
} else {
    console.log("NOT FOUND");
}
