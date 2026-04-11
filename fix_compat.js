const fs = require('fs');

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // getDocs -> .get()
    content = content.replace(/window\.getDocs\(window\.collection\(window\.db,\s*"([^"]+)"\)\)/g, 'window.db.collection("$1").get()');
    
    // addDoc -> .add()
    content = content.replace(/window\.addDoc\(window\.collection\(window\.db,\s*"([^"]+)"\),\s*([^)]+)\)/g, 'window.db.collection("$1").add($2)');
    
    // updateDoc -> .update()
    content = content.replace(/window\.updateDoc\(window\.doc\(window\.db,\s*"([^"]+)",\s*([^)]+)\),\s*([^)]+)\)/g, 'window.db.collection("$1").doc($2).update($3)');

    // deleteDoc -> .delete()
    content = content.replace(/window\.deleteDoc\(window\.doc\(window\.db,\s*"([^"]+)",\s*([^)]+)\)\)/g, 'window.db.collection("$1").doc($2).delete()');

    // storage ref
    content = content.replace(/window\.ref\(window\.storage,\s*([^)]+)\)/g, 'window.storage.ref($1)');

    // uploadBytes -> .put()
    content = content.replace(/window\.uploadBytes\(([^,]+),\s*([^)]+)\)/g, '$1.put($2)');

    // getDownloadURL -> .getDownloadURL()
    content = content.replace(/window\.getDownloadURL\(([^)]+)\)/g, '$1.getDownloadURL()');

    // deleteObject -> .delete()
    content = content.replace(/window\.deleteObject\(([^)]+)\)/g, '$1.delete()');

    fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('script.js');
patchFile('ai-gallery.html');
console.log('Successfully patched for Firebase Compat SDK!');
