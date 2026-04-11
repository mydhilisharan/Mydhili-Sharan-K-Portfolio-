const fs = require('fs');

const oldScript = fs.readFileSync('script_b2a4eb9.js', 'utf8');
const currentScript = fs.readFileSync('script.js', 'utf8');

// Find the start of the missing block in the old script
const startAdminMarker = 'let editMode = false;';
let startIndex = oldScript.indexOf(startAdminMarker);
if (startIndex === -1) {
    // try finding function toggleEdit
    startIndex = oldScript.indexOf('function toggleEdit()');
    if (startIndex !== -1) {
        // backtrack to the // ADMIN CMS LOGIC start
        startIndex = oldScript.lastIndexOf('let editMode = false;', startIndex);
    }
}

// Find the end of the missing block in the old script (start of Certificates)
const endAdminMarker = 'CERTIFICATE SYSTEM — Static File-Based (GitHub Compatible)';
let endIndex = oldScript.indexOf(endAdminMarker);
if (endIndex !== -1) {
    // Backtrack to the // ============ line before it
    endIndex = oldScript.lastIndexOf('// ==========================================', endIndex);
}

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const missingBlock = oldScript.substring(startIndex, endIndex);
    
    // Now where to insert it in currentScript?
    // It should go RIGHT BEFORE the Certificate section.
    const certIndex = currentScript.indexOf('// ==========================================\n// CERTIFICATE SYSTEM');
    
    if (certIndex !== -1) {
        const newScript = currentScript.substring(0, certIndex) + '\n' + missingBlock + '\n' + currentScript.substring(certIndex);
        fs.writeFileSync('script.js', newScript, 'utf8');
        console.log('SUCCESS: Admin block restored! Length:', newScript.length);
    } else {
        console.log('Could not find insert point in current script.');
    }
} else {
    console.log('Could not find missing block in old script.', startIndex, endIndex);
}
