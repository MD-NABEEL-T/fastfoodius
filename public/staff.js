// staff.js (realtime)
import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
  update,
  remove,
  push,
  get
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

(function () {
  "use strict";

  const activeTbody = document.getElementById("activeOrders");
  const servedTbody = document.getElementById("servedOrders");
  const clearHistoryBtn = document.getElementById("clearHistory");

  // ✅ refs
  const ordersRef = ref(db, "orders");
  const servedRef = ref(db, "servedOrders");

  // -------- Rendering --------
 function renderActive(orders) {
  activeTbody.innerHTML = "";

  if (!orders) {
    activeTbody.innerHTML = `<p class="text-muted">No active orders.</p>`;
    return;
  }

  Object.entries(orders)
    .reverse() // newest first
    .forEach(([id, order]) => {

      const status = order.status || "Pending";
      if (status === "Served") return;

      const itemsHtml = Array.isArray(order.items)
        ? order.items.map(it =>
            `${it.name || it.dishName} × ${it.qty || 1}`
          ).join("<br>")
        : order.items;

      const paymentStatus = order.paymentStatus || "Unpaid";

      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
        <h5>Token #${order.token || "-"}</h5>
        <div class="order-meta">
          ₹${order.total || 0} • ${order.time || ""}
        </div>

        <div class="order-items">
          ${itemsHtml}
        </div>

        <div class="mb-2">
          <span class="badge bg-${paymentStatus === "Verified" ? "success" : "danger"}">
            ${paymentStatus}
          </span>

          <span class="badge ${
            status === "Prepared"
              ? "badge-prepared"
              : "badge-pending"
          }">
            ${status}
          </span>
        </div>

        <div class="order-actions">
          ${paymentStatus !== "Verified"
            ? `<button class="btn btn-success btn-sm verify-btn" data-id="${id}">Verify</button>`
            : ""}

          ${status !== "Prepared"
            ? `<button class="btn btn-warning btn-sm prepare-btn" data-id="${id}">Prepare</button>`
            : ""}

          <button class="btn btn-primary btn-sm serve-btn" data-id="${id}">Serve</button>
        </div>
      `;

      activeTbody.appendChild(card);
    });

  if (activeTbody.children.length === 0) {
    activeTbody.innerHTML = `<p class="text-muted">No active orders.</p>`;
  }
}

function renderServed(orders) {
  servedTbody.innerHTML = "";

  if (!orders) {
    servedTbody.innerHTML =
      `<tr><td colspan="3" class="text-muted">No served orders.</td></tr>`;
    return;
  }

  Object.values(orders)
    .reverse()
    .forEach(order => {

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${order.token || "-"}</td>
        <td>₹${order.total || 0}</td>
        <td>${order.time || ""}</td>
      `;
      servedTbody.appendChild(tr);
    });
}

  // -------- Actions --------
  async function markPrepared(id) {
    await update(ref(db, `orders/${id}`), { status: "Prepared" });
  }

  async function markServed(id) {
    const snap = await get(ref(db, `orders/${id}`));
    if (!snap.exists()) return;
    const order = snap.val();

    // ✅ mark as served
    const servedOrder = { ...order, status: "Served", time: order.time || new Date().toLocaleString() };

    // push into servedOrders
    await push(servedRef, servedOrder);

    // remove from active orders
    await remove(ref(db, `orders/${id}`));
  }

  async function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    await remove(ref(db, `orders/${id}`));
  }

  async function clearHistory() {
    if (!confirm("Clear all served orders history?")) return;
    await remove(servedRef);
  }

  // -------- Event Delegation --------
  activeTbody.addEventListener("click", async (e) => {
    const prepareBtn = e.target.closest(".prepare-btn");
    const serveBtn = e.target.closest(".serve-btn");
    const deleteBtn = e.target.closest(".delete-btn");
    const verifyBtn = e.target.closest(".verify-btn");
    
    if (verifyBtn) {
    await update(ref(db, `orders/${verifyBtn.dataset.id}`), {
      paymentStatus: "Verified"
    });
    }else if (prepareBtn) {
      await markPrepared(prepareBtn.dataset.id);
    } else if (serveBtn) {
      await markServed(serveBtn.dataset.id);
    } else if (deleteBtn) {
      await deleteOrder(deleteBtn.dataset.id);
    }
  });

  if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);

  // -------- Realtime listeners --------
  onValue(ordersRef, snap => {
    renderActive(snap.val());
  });

  onValue(servedRef, snap => {
    renderServed(snap.val());
  });

  console.log("✅ staff.js realtime listener active");
})();
