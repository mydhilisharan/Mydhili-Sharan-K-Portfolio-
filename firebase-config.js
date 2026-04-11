// ================================================
// FIREBASE COMPAT SDK CONFIG
// Works as a regular <script> tag (no modules)
// Compatible with file://, http://, and https://
// ================================================

const firebaseConfig = {
  apiKey: "AIzaSyCXSthpVJTyIq553w4lBjCRM1vbhyYC7i4",
  authDomain: "sharan-portfolio-660af.firebaseapp.com",
  projectId: "sharan-portfolio-660af",
  storageBucket: "sharan-portfolio-660af.firebasestorage.app",
  messagingSenderId: "95290821520",
  appId: "1:95290821520:web:64144c8697523700df0115",
  measurementId: "G-0TSRXBVNFJ"
};

try {
  firebase.initializeApp(firebaseConfig);

  // Expose Firestore and Storage globally
  window.db          = firebase.firestore();
  window.storage     = firebase.storage();

  // ── Firestore wrappers ──────────────────────────
  // collection(db, "vault") → db.collection("vault")
  window.collection  = (db, name)       => db.collection(name);
  // doc(db, "portfolio", "certificates") → db.doc("portfolio/certificates")
  window.doc         = (db, ...segs)    => db.doc(segs.join('/'));
  window.onSnapshot  = (ref, ok, err)   => ref.onSnapshot(ok, err);
  window.setDoc      = (ref, data)      => ref.set(data);
  window.getDoc      = (ref)            => ref.get();
  window.addDoc      = (ref, data)      => ref.add(data);
  window.deleteDoc   = (ref)            => ref.delete();
  window.updateDoc   = (ref, data)      => ref.update(data);

  // ── Storage wrappers ────────────────────────────
  window.ref           = (storage, path) => storage.ref(path);
  window.uploadBytes   = async (ref, file) => { await ref.put(file); return ref; };
  window.getDownloadURL = (ref)           => ref.getDownloadURL();
  window.deleteObject  = (ref)            => ref.delete();

  // Signal that Firebase is ready
  window.firebaseInitialized = true;
  console.log("✅ Firebase Initialized (Compat Mode)");
  window.dispatchEvent(new Event("firebaseReady"));

} catch (error) {
  console.error("❌ Firebase Init Error:", error);
  // Still signal ready so UI doesn't freeze — just without DB
  window.firebaseInitialized = false;
  window.dispatchEvent(new Event("firebaseReady"));
}
