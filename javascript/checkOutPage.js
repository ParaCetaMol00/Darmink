import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  query, where, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

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

const DELIVERY_FEE = 1500;
let currentUser = null;
let cartItems   = [];

// ─── Auth guard ───────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadCart();
  } else {
    // BUG FIX: correct relative path from html/ subfolder
    window.location.href = "../html/signIn.html";
  }
});

// ─── Load cart from Firestore ─────────────────────────────────────────────────
async function loadCart() {
  const container = document.getElementById("cartItems");
  try {
    const q        = query(collection(db, "carts"), where("uid", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    cartItems = [];
    snapshot.forEach((docSnap) => cartItems.push({ id: docSnap.id, ...docSnap.data() }));
    renderCart();
  } catch (err) {
    container.innerHTML = `<p class="empty-msg">Failed to load cart. Please refresh.</p>`;
    console.error(err);
  }
}

// ─── Render cart ──────────────────────────────────────────────────────────────
function renderCart() {
  const container = document.getElementById("cartItems");

  if (cartItems.length === 0) {
    container.innerHTML = `
      <p class="empty-msg">
        Your cart is empty 🛒<br>
        <a href="../index.html" style="color:#d63384">Continue shopping</a>
      </p>`;
    updateSummary();
    return;
  }

  container.innerHTML = "";
  cartItems.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-left">
        ${item.image
          ? `<img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.style.display='none' ">`
          : ""}
        <span class="item-name">${item.name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:15px">
        <span class="item-price">${item.price}</span>
        <button class="remove-btn" data-id="${item.id}" title="Remove">✕</button>
      </div>`;
    container.appendChild(div);
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => removeItem(e.target.dataset.id));
  });

  updateSummary();
}

// ─── Remove item ──────────────────────────────────────────────────────────────
async function removeItem(itemId) {
  try {
    await deleteDoc(doc(db, "carts", itemId));
    cartItems = cartItems.filter((i) => i.id !== itemId);
    renderCart();
  } catch (err) {
    console.error("Failed to remove item:", err);
  }
}

// ─── Price parsing ────────────────────────────────────────────────────────────
function parsePrice(priceStr) {
  return parseInt(priceStr.replace(/[₦,]/g, "").trim()) || 0;
}

// ─── Update order summary ─────────────────────────────────────────────────────
function updateSummary() {
  const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price), 0);
  const total    = subtotal + DELIVERY_FEE;
  document.getElementById("subtotal").textContent    = `₦${subtotal.toLocaleString()}`;
  document.getElementById("totalAmount").textContent = `₦${total.toLocaleString()}`;
}

// ─── Place Order ──────────────────────────────────────────────────────────────
// BUG FIX: wrapped in DOMContentLoaded so the button exists before attaching listener
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("placeOrderBtn").addEventListener("click", async () => {
    const name    = document.getElementById("deliveryName").value.trim();
    const phone   = document.getElementById("deliveryPhone").value.trim();
    const address = document.getElementById("deliveryAddress").value.trim();
    const state   = document.getElementById("deliveryState").value;
    const payment = document.getElementById("paymentMethod").value;
    const errorEl = document.getElementById("formError");
    const btn     = document.getElementById("placeOrderBtn");

    if (!name || !phone || !address || !state || !payment) {
      errorEl.style.display = "block";
      errorEl.textContent   = "Please fill in all delivery details.";
      return;
    }
    if (cartItems.length === 0) {
      errorEl.style.display = "block";
      errorEl.textContent   = "Your cart is empty.";
      return;
    }

    errorEl.style.display = "none";
    btn.disabled          = true;
    btn.textContent       = "Placing Order…";

    try {
      const subtotal = cartItems.reduce((sum, i) => sum + parsePrice(i.price), 0);
      const total    = subtotal + DELIVERY_FEE;

      await addDoc(collection(db, "orders"), {
        uid:           currentUser.uid,
        email:         currentUser.email,
        items:         cartItems.map((i) => ({ name: i.name, price: i.price, image: i.image || "" })),
        delivery:      { name, phone, address, state },
        paymentMethod: payment,
        subtotal,
        deliveryFee:   DELIVERY_FEE,
        total,
        status:        "pending",
        orderedAt:     new Date()
      });

      await Promise.all(cartItems.map((item) => deleteDoc(doc(db, "carts", item.id))));

      document.getElementById("successModal").classList.add("show");
    } catch (err) {
      btn.disabled    = false;
      btn.textContent = "Place Order 💄";
      errorEl.style.display = "block";
      errorEl.textContent   = "Order failed. Please try again.";
      console.error(err);
    }
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