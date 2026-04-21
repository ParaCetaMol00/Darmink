import { auth, db } from "../firebaseKeys/authKeys.js";

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// ─── Email Sign Up ───────────────────────────────────────────────────────────

async function emailSignup() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const btn = document.getElementById("emailSignupBtn");

    try {
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            showMessage("error", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("error", "Passwords do not match!");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Creating Account...";

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName: fullName,
            email: email,
            phone: phone,
            createdAt: serverTimestamp(),
        });

        showMessage("success", "Account created successfully! Redirecting...");

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);

    } catch (error) {
        btn.disabled = false;
        btn.textContent = "Create Account";

        if (error.code === "auth/email-already-in-use") {
            showMessage("error", "This email address is already registered.");
        } else if (error.code === "auth/invalid-email") {
            showMessage("error", "Please enter a valid email address.");
        } else if (error.code === "auth/weak-password") {
            showMessage("error", "Password is too weak. Use at least 6 characters.");
        } else {
            showMessage("error", "Sign up failed: " + error.message);
        }
    }
}


// ─── Google Sign Up / Sign In ────────────────────────────────────────────────

async function googleSignup() {
    const btn = document.getElementById("googleSignupBtn");

    try {
        btn.disabled = true;
        btn.textContent = "Connecting...";

        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;

        // Save or update user doc in Firestore (safe to call on every login)
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName: user.displayName || "",
            email: user.email,
            phone: user.phoneNumber || "",
            createdAt: serverTimestamp(),
        }, { merge: true }); // merge:true so existing data is not overwritten on re-login

        showMessage("success", "Account created successfully! Redirecting...");

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);

    } catch (error) {
        btn.disabled = false;
        btn.textContent = "Sign up with Google";

        if (error.code === "auth/popup-closed-by-user") {
            showMessage("error", "Google sign-in was cancelled.");
        } else if (error.code === "auth/popup-blocked") {
            showMessage("error", "Popup was blocked. Please allow popups for this site.");
        } else {
            showMessage("error", "Google sign-in failed: " + error.message);
        }
    }
}


// ─── Show Message Helper ─────────────────────────────────────────────────────

function showMessage(type, message) {
    // Remove any existing message
    const existing = document.getElementById("authMessage");
    if (existing) existing.remove();

    const msg = document.createElement("p");
    msg.id = "authMessage";
    msg.textContent = message;
    msg.style.cssText = `
        margin-top: 10px;
        font-size: 14px;
        text-align: center;
        color: ${type === "success" ? "#22c55e" : "#ef4444"};
    `;

    const authBox = document.querySelector(".auth-box");
    authBox.appendChild(msg);

    // Auto-remove after 4 seconds
    setTimeout(() => msg.remove(), 4000);
}




document.getElementById("emailSignupBtn").addEventListener("click", emailSignup);
document.getElementById("googleSignupBtn").addEventListener("click", googleSignup);