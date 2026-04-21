import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// ⚠️ Replace these values with your own Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAnPFu3Unu9lonHNPBsIOIGVQ0bk1vUCVU",
    authDomain: "darminkbeauty.firebaseapp.com",
    projectId: "darminkbeauty",
    storageBucket: "darminkbeauty.firebasestorage.app",
    messagingSenderId: "471802299941",
    appId: "1:471802299941:web:d5631ff6b76b921c1f61cc"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in login.js and signup.js
export { auth, db };