// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// 1. Go to Firebase Console > Project Settings
// 2. Scroll down to "Your apps"
// 3. Copy the "firebaseConfig" object and replace the placeholder below

const firebaseConfig = {
    apiKey: "AIzaSyDGTJI6x5WEN__t7eWxiTLrWPsmGdI1xPc",
    authDomain: "peercircle-app.firebaseapp.com",
    projectId: "peercircle-app",
    storageBucket: "peercircle-app.firebasestorage.app",
    messagingSenderId: "450673389874",
    appId: "1:450673389874:web:7b61710a6300d6ebd6272b",
    measurementId: "G-32S50XG2GF"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence (optional but good for UX)
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log("Persistence failed: Multiple tabs open");
        } else if (err.code == 'unimplemented') {
            console.log("Persistence not supported by browser");
        }
    });

console.log("Firebase Initialized");
