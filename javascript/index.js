import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnPFu3Unu9lonHNPBsIOIGVQ0bk1vUCVU",
  authDomain: "darminkbeauty.firebaseapp.com",
  projectId: "darminkbeauty",
  storageBucket: "darminkbeauty.firebasestorage.app",
  messagingSenderId: "471802299941",
  appId: "1:471802299941:web:d5631ff6b76b921c1f61cc"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

let cartQuantity = 0;
let currentUser  = null;

// index.html is the shop landing page — guests can browse; only guard cart actions
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  const signOutLink = document.getElementById("signOutLink");
  const signInLink  = document.getElementById("signInLink");

  if (user) {
    loadCartCount();
    if (signOutLink) signOutLink.style.display = "inline";
    if (signInLink)  signInLink.style.display  = "none";
  } else {
    updateCartUI();
    if (signOutLink) signOutLink.style.display = "none";
    if (signInLink)  signInLink.style.display  = "inline";
  }
});

async function loadCartCount() {
  if (!currentUser) return;
  try {
    const q        = query(collection(db, "carts"), where("uid", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    cartQuantity   = snapshot.size;
    updateCartUI();
  } catch (err) {
    console.error("Failed to load cart:", err);
  }
}

function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cartQuantity > 0 ? `🛒 ${cartQuantity}` : "🛒";
}

function goToProductDetails(name, price, image) {
  const params = new URLSearchParams({ name, price, image: image || "" });
  window.location.href = `./html/productDetails.html?${params.toString()}`;
}

async function addToCart(name, price, image) {
  if (!currentUser) {
    window.location.href = "./html/signIn.html";
    return;
  }
  try {
    await addDoc(collection(db, "carts"), {
      uid: currentUser.uid, name, price, image: image || "", addedAt: new Date()
    });
    cartQuantity++;
    updateCartUI();
    showToast(`${name} added to cart ✨`);
  } catch (err) {
    console.error("Error adding to cart:", err);
    showToast("Failed to add item. Try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".product").forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", (e) => {
      if (e.target.closest(".buy-btn")) return;
      const name  = card.querySelector("h3")?.innerText.trim()    || "";
      const price = card.querySelector(".price")?.innerText.trim() || "";
      const image = card.querySelector("img")?.src                 || "";
      goToProductDetails(name, price, image);
    });

    const buyBtn = card.querySelector(".buy-btn");
    if (buyBtn) {
      buyBtn.removeAttribute("onclick");
      buyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const name  = card.querySelector("h3")?.innerText.trim()    || "";
        const price = card.querySelector(".price")?.innerText.trim() || "";
        const image = card.querySelector("img")?.src                 || "";
        addToCart(name, price, image);
      });
    }
  });

  // Hero buttons
  document.querySelector(".hero-buttons .primary")?.addEventListener("click", () => {
    window.location.href = "./html/shop.html";
  });
  document.querySelector(".hero-buttons .secondary")?.addEventListener("click", () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  });

  // Cart icon
  const cartEl = document.getElementById("cartCount");
  if (cartEl) {
    cartEl.style.cursor = "pointer";
    cartEl.addEventListener("click", () => {
      window.location.href = "./html/checkOutPage.html";
    });
  }

  // Hamburger
  const toggle = document.getElementById("menuToggle");
  const nav    = document.getElementById("navMenu");
  if (toggle && nav) toggle.addEventListener("click", () => nav.classList.toggle("active"));

  // Sign-out
  document.getElementById("signOutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./html/signIn.html";
  });
});

function showToast(message) {
  document.getElementById("toastMsg")?.remove();
  const toast = document.createElement("div");
  toast.id = "toastMsg";
  toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:30px;right:30px;background:#d63384;color:#fff;
    padding:12px 20px;border-radius:25px;font-size:14px;font-weight:bold;
    box-shadow:0 5px 20px rgba(0,0,0,.2);z-index:9999;animation:fadeIn .3s ease;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}