import { db } from "./firebase-config.js";
import {
  ref,
  push,
  set,
  runTransaction,
  get
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {

  const cart = {};
  const cartBar = document.getElementById("cartBar");
  const cartSummary = document.getElementById("cartSummary");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const orderSummary = document.getElementById("orderSummary");
  const modalTotal = document.getElementById("modalTotal");
  const confirmOrder = document.getElementById("confirmOrder");

  // PLUS / MINUS
  document.querySelectorAll(".menu-item").forEach(item => {
    const name = item.dataset.name;
    const price = parseInt(item.dataset.price);
    const qtySpan = item.querySelector(".qty");
    const plus = item.querySelector(".plus");
    const minus = item.querySelector(".minus");

    plus.addEventListener("click", () => {
      cart[name] = cart[name] || { price, qty: 0 };
      cart[name].qty++;
      qtySpan.textContent = cart[name].qty;
      updateCart();
    });

    minus.addEventListener("click", () => {
      if (cart[name] && cart[name].qty > 0) {
        cart[name].qty--;
        qtySpan.textContent = cart[name].qty;
        if (cart[name].qty === 0) delete cart[name];
        updateCart();
      }
    });
  });

  function updateCart() {
    let totalItems = 0;
    let totalAmount = 0;

    Object.values(cart).forEach(item => {
      totalItems += item.qty;
      totalAmount += item.qty * item.price;
    });

    if (totalItems > 0) {
      cartBar.classList.remove("d-none");
      cartSummary.textContent = `${totalItems} Items | ₹${totalAmount}`;
    } else {
      cartBar.classList.add("d-none");
    }
  }

  // CHECKOUT CLICK
  checkoutBtn.addEventListener("click", () => {
    orderSummary.innerHTML = "";
    let total = 0;

    Object.entries(cart).forEach(([name, item]) => {
      const li = document.createElement("li");
      li.textContent = `${name} x${item.qty}`;
      orderSummary.appendChild(li);
      total += item.qty * item.price;
    });

    modalTotal.textContent = `Total: ₹${total}`;

    new bootstrap.Modal(document.getElementById("paymentModal")).show();
  });

  // CONFIRM ORDER
  confirmOrder.addEventListener("click", async () => {

    let orderItems = [];
    let total = 0;

    Object.entries(cart).forEach(([name, item]) => {
      orderItems.push({
        name,
        qty: item.qty,
        price: item.price,
        amount: item.qty * item.price
      });
      total += item.qty * item.price;
    });

    if (orderItems.length === 0) return;

    const tokenRef = ref(db, "counters/nextToken");
    await runTransaction(tokenRef, current => (current || 0) + 1);
    const tokenSnap = await get(tokenRef);
    const token = tokenSnap.val();

    const orderObj = {
      items: orderItems,
      total,
      token,
      time: new Date().toLocaleString(),
      status: "Pending",
      paymentStatus: "Unpaid"
    };

    await push(ref(db, "orders"), orderObj);

    alert(`Order placed! Token #${token}`);

    location.reload();
  });

  // SEARCH
  document.getElementById("searchInput").addEventListener("input", function () {
    const value = this.value.toLowerCase();
    document.querySelectorAll(".menu-item").forEach(item => {
      const name = item.dataset.name.toLowerCase();
      item.style.display = name.includes(value) ? "" : "none";
    });
  });

});