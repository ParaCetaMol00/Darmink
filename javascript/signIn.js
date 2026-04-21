import { auth } from "../firebaseKeys/authKeys.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// ─── Redirect destination after login ────────────────────────────────────────
// If the user was sent to sign-in because they clicked "Add to Cart" while
// logged out, send them back to where they came from; otherwise go to index.
function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "../index.html";
}

// ─── Email Sign In ────────────────────────────────────────────────────────────
async function emailSignIn() {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const btn      = document.getElementById("emailSignInBtn");

  if (!email || !password) {
    showMessage("error", "Please enter your email and password.");
    return;
  }

  btn.disabled    = true;
  btn.textContent = "Signing in…";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage("success", "Login successful! Redirecting…");
    setTimeout(() => { window.location.href = getRedirectTarget(); }, 1500);
  } catch (error) {
    btn.disabled    = false;
    btn.textContent = "Sign In";

    const code = error.code;
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
      showMessage("error", "Incorrect email or password. Please try again.");
    } else if (code === "auth/invalid-email") {
      showMessage("error", "Please enter a valid email address.");
    } else if (code === "auth/too-many-requests") {
      showMessage("error", "Too many failed attempts. Please try again later.");
    } else {
      showMessage("error", "Login failed: " + error.message);
    }
  }
}

// ─── Google Sign In ───────────────────────────────────────────────────────────
async function googleSignIn() {
  const btn = document.getElementById("googleSignInBtn");
  btn.disabled    = true;
  btn.textContent = "Connecting…";

  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    showMessage("success", "Login successful! Redirecting…");
    setTimeout(() => { window.location.href = getRedirectTarget(); }, 1500);
  } catch (error) {
    btn.disabled    = false;
    btn.textContent = "Sign in with Google";

    if (error.code === "auth/popup-closed-by-user") {
      showMessage("error", "Google sign-in was cancelled.");
    } else if (error.code === "auth/popup-blocked") {
      showMessage("error", "Popup was blocked. Please allow popups for this site.");
    } else {
      showMessage("error", "Google sign-in failed: " + error.message);
    }
  }
}

// ─── Show Message ─────────────────────────────────────────────────────────────
function showMessage(type, message) {
  document.getElementById("authMessage")?.remove();
  const msg       = document.createElement("p");
  msg.id          = "authMessage";
  msg.textContent = message;
  msg.style.cssText = `margin-top:10px;font-size:14px;text-align:center;
    color:${type === "success" ? "#22c55e" : "#ef4444"};`;
  document.querySelector(".auth-box").appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
// BUG FIX: listen on "click" for the button (no wrapping <a> tag now),
// and no longer use a "submit" listener on loginForm (there is no <form> element).
document.getElementById("emailSignInBtn").addEventListener("click", emailSignIn);
document.getElementById("googleSignInBtn").addEventListener("click", googleSignIn);