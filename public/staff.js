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
document.addEventListener("DOMContentLoaded", () => {
  const toggleShopBtn = document.getElementById("toggleShopBtn");
  const saveTimingsBtn = document.getElementById("saveTimingsBtn");
  const openTimeInput = document.getElementById("openTimeInput");
  const closeTimeInput = document.getElementById("closeTimeInput");
  const shopRef = ref(db, "shopStatus");

const statusText = document.getElementById("shopStatusText");

// UPDATE BUTTON UI BASED ON SHOP STATE
async function updateToggleButton() {
  const snap = await get(shopRef);
  if (!snap.exists()) return;
  
  const data = snap.val();
  if (data.isOpen) {
    toggleShopBtn.textContent = "🟢 Shop Open";
    toggleShopBtn.classList.remove("btn-danger");
    toggleShopBtn.classList.add("btn-success");
  } else {
    toggleShopBtn.textContent = "🔴 Shop Closed";
    toggleShopBtn.classList.remove("btn-success");
    toggleShopBtn.classList.add("btn-danger");
  }
}

// TOGGLE SHOP STATE
toggleShopBtn.addEventListener("click", async () => {
  const snap = await get(shopRef);
  const currentState = snap.exists() ? snap.val().isOpen : true;
  const newState = !currentState;

  // Update Firebase with toggle timestamp
  await update(shopRef, {
    isOpen: newState,
    closesAt: null,
    lastToggleTime: Date.now()  // Track when manually toggled
  });

  // Update button UI immediately (don't wait for Firebase listener)
  if (newState) {
    toggleShopBtn.textContent = "🟢 Shop Open";
    toggleShopBtn.classList.remove("btn-danger");
    toggleShopBtn.classList.add("btn-success");
  } else {
    toggleShopBtn.textContent = "🔴 Shop Closed";
    toggleShopBtn.classList.remove("btn-success");
    toggleShopBtn.classList.add("btn-danger");
  }
});

// LISTEN TO SHOP STATE CHANGES (realtime update of button)
onValue(shopRef, async () => {
  await updateToggleButton();
});

// Save daily timings
saveTimingsBtn.addEventListener("click", async () => {
  const openTime = openTimeInput.value;
  const closeTime = closeTimeInput.value;

  if (!openTime || !closeTime) {
    alert("Please select both open and close times");
    return;
  }

  await update(shopRef, {
    openTime,
    closeTime
  });

  alert(`Shop timings saved: ${openTime} - ${closeTime}`);
});

// Load saved timings on page load
(async () => {
  const snap = await get(shopRef);
  if (snap.exists()) {
    const data = snap.val();
    if (data.openTime) openTimeInput.value = data.openTime;
    if (data.closeTime) closeTimeInput.value = data.closeTime;
  }
  await updateToggleButton();
})();
});
(function () {
  "use strict";

  const activeTbody = document.getElementById("activeOrders");
  const servedTbody = document.getElementById("servedOrders");
  const menuItemsContainer = document.getElementById("menuItems");
  const clearHistoryBtn = document.getElementById("clearHistory");

  // ✅ refs
  const ordersRef = ref(db, "orders");
  const servedRef = ref(db, "servedOrders");
  const menuRef = ref(db, "menu");
  const activeCountEl = document.getElementById("activeCount");
  const readyCountEl = document.getElementById("readyCount");
  const totalTodayEl = document.getElementById("totalToday");
  // 🔔 New Order Sound
const newOrderSound = new Audio("sounds/new-order.wav");
newOrderSound.volume = 0.7;
  // -------- Rendering --------
function isToday(timestamp) {
  const orderDate = new Date(timestamp);
  const today = new Date();

  return (
    orderDate.getDate() === today.getDate() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getFullYear() === today.getFullYear()
  );
}

  function renderActive(orders) {
    activeTbody.innerHTML = "";

    if (!orders) {
      activeTbody.innerHTML = `<p class="text-muted">No active orders.</p>`;
      return;
    }

    Object.entries(orders)
      .reverse() // newest first
      .forEach(([id, order]) => {

        const status = order.status || "Preparing";
        
        // FILTER: Hide served orders
        if (status === "Served") return;
        
        // FILTER: Show only today's orders
        if (!isToday(order.time)) return;

        const itemsHtml = Array.isArray(order.items)
          ? order.items.map(it =>
            `${it.name || it.dishName} × ${it.qty || 1}`
          ).join("<br>")
          : order.items;

        const card = document.createElement("div");
        card.className = "order-card";

        // Pickup side badge styling
        const pickupSide = order.pickupSide || "Boys Side";
        const isBoySide = pickupSide === "Boys Side";
        const pickupBadgeStyle = isBoySide 
          ? "background:#e3f2fd; color:#1976d2; border-left:4px solid #1976d2;"
          : "background:#fce4ec; color:#c2185b; border-left:4px solid #c2185b;";
        const pickupEmoji = isBoySide ? "🔵" : "🌸";

        card.innerHTML = `
        <h5>Token #${order.token || "-"}</h5>

        <div class="order-meta">
          <span class="order-amount">
            ₹${order.total || 0}
          </span>
          • ${order.time || ""}
        </div>

        <div style="padding: 8px; border-radius: 4px; margin: 8px 0; ${pickupBadgeStyle}">
          <strong>${pickupEmoji} ${pickupSide}</strong>
        </div>

        <div class="order-items">
          ${itemsHtml}
        </div>

        <div class="mb-2">
          <span class="badge ${status === "Preparing"
            ? "badge-preparing"
            : status === "Ready"
            ? "badge-ready"
            : "badge-pending"
          }">
            ${status}
          </span>
        </div>

        <div class="order-actions">
          ${status === "Preparing"
            ? `<button class="btn btn-warning btn-sm ready-btn" data-id="${id}">Mark Ready</button>`
            : ""}

          ${status === "Ready"
            ? `<button class="btn btn-success btn-sm served-btn" data-id="${id}">Serve Order</button>`
            : ""}
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

  // -------- Menu Rendering --------
  function renderMenuItems(menuData) {
    menuItemsContainer.innerHTML = "";

    if (!menuData) {
      menuItemsContainer.innerHTML = `<p class="text-muted">No menu items.</p>`;
      return;
    }

    Object.entries(menuData)
      .sort(([, a], [, b]) => (a.name || "").localeCompare(b.name || ""))
      .forEach(([itemId, item]) => {
        const stock = item.stock || 0;
        const itemCard = document.createElement("div");
        itemCard.className = "menu-item-card";
        itemCard.dataset.itemId = itemId;

        // LOW STOCK WARNING
        const lowStockWarning = stock < 5 ? `<div class="low-stock-warning">⚠ Low Stock</div>` : "";

        itemCard.innerHTML = `
          <div class="menu-item-name">${item.name || "Unknown"}</div>
          <div class="menu-item-stock">
            <button class="btn-stock-control btn-minus" data-item-id="${itemId}" ${stock === 0 ? "disabled" : ""}>−</button>
            <span class="stock-display" data-item-id="${itemId}">${stock}</span>
            <button class="btn-stock-control btn-plus" data-item-id="${itemId}">+</button>
          </div>
          ${lowStockWarning}
        `;

        menuItemsContainer.appendChild(itemCard);
      });

    if (menuItemsContainer.children.length === 0) {
      menuItemsContainer.innerHTML = `<p class="text-muted">No menu items.</p>`;
    }
  }

  // -------- Actions --------
async function markPreparing(id) {
  await update(ref(db, `orders/${id}`), { status: "Preparing" });
}
  async function markReady(id) {
    await update(ref(db, `orders/${id}`), { status: "Ready" });
  }
async function markServed(id) {
  const confirmServe = confirm("Mark this order as served?");
  if (!confirmServe) return;

  const orderRef = ref(db, `orders/${id}`);
  const snapshot = await get(orderRef);

  if (!snapshot.exists()) return;

  const orderData = snapshot.val();

  // 1️⃣ Add to servedOrders
  await push(ref(db, "servedOrders"), {
    ...orderData,
    status: "Served"
  });

  // 2️⃣ Update status in orders (keep for student view)
  await update(orderRef, {
    status: "Served"
  });
}

  async function updateStock(itemId, change) {
    const snap = await get(ref(db, `menu/${itemId}`));
    if (!snap.exists()) return;
    
    const item = snap.val();
    const currentStock = item.stock || 0;
    const newStock = Math.max(0, currentStock + change);

    // PREVENT NEGATIVE STOCK: Don't allow negative values
    if (newStock < 0) return;

    await update(ref(db, `menu/${itemId}`), { stock: newStock });
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
    const readyBtn = e.target.closest(".ready-btn");
    const servedBtn = e.target.closest(".served-btn");

    if (readyBtn) {
      await markReady(readyBtn.dataset.id);
    } else if (servedBtn) {
      await markServed(servedBtn.dataset.id);
    }
  });

  // Menu stock control event delegation
  menuItemsContainer.addEventListener("click", async (e) => {
    const minusBtn = e.target.closest(".btn-minus");
    const plusBtn = e.target.closest(".btn-plus");

    // PREVENT NEGATIVE STOCK: Check if button is disabled
    if (minusBtn && minusBtn.disabled) {
      return;
    }

    if (minusBtn) {
      const itemId = minusBtn.dataset.itemId;
      await updateStock(itemId, -1);
    } else if (plusBtn) {
      const itemId = plusBtn.dataset.itemId;
      await updateStock(itemId, 1);
    }
  });

  if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);

  function updateSummary(activeOrders, servedOrders) {
    let activeCount = 0;
    let readyCount = 0;
    let totalCount = 0;

    // Active orders (today only)
    if (activeOrders) {
      Object.values(activeOrders).forEach(order => {
        // Count only today's orders
        if (!isToday(order.time)) return;
        
        totalCount++;
        
        if (order.status !== "Served") {
          activeCount++;
        }

        if (order.status === "Ready") {
          readyCount++;
        }
      });
    }

    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (readyCountEl) readyCountEl.textContent = readyCount;
    if (totalTodayEl) totalTodayEl.textContent = totalCount;
  }

  let previousOrderCount = 0;
  let isFirstLoad = true;

  // -------- Realtime listeners --------
  let activeCache = null;
  let servedCache = null;

onValue(ordersRef, snap => {
  activeCache = snap.val();

  const currentCount = activeCache
    ? Object.keys(activeCache).length
    : 0;

  // 🔔 Play sound only when new order added (not on first load)
  if (!isFirstLoad && currentCount > previousOrderCount) {
    newOrderSound.play().catch(() => {});
  }

  previousOrderCount = currentCount;
  isFirstLoad = false;

  renderActive(activeCache);
  updateSummary(activeCache, servedCache);
});

  onValue(servedRef, snap => {
    servedCache = snap.val();
    renderServed(servedCache);
    updateSummary(activeCache, servedCache);
  });

  // Menu realtime listener
  onValue(menuRef, snap => {
    const menuData = snap.val();
    renderMenuItems(menuData);
  });

  // -------- TAB SWITCHING --------
  const ordersTabBtn = document.getElementById("ordersTabBtn");
  const menuTabBtn = document.getElementById("menuTabBtn");
  const ordersSection = document.getElementById("ordersSection");
  const menuSection = document.getElementById("menuSection");

  ordersTabBtn.addEventListener("click", () => {
    ordersTabBtn.classList.add("active");
    menuTabBtn.classList.remove("active");
    ordersSection.classList.remove("d-none");
    menuSection.classList.add("d-none");
  });

  menuTabBtn.addEventListener("click", () => {
    menuTabBtn.classList.add("active");
    ordersTabBtn.classList.remove("active");
    menuSection.classList.remove("d-none");
    ordersSection.classList.add("d-none");
  });

  console.log("✅ staff.js realtime listener active");
})();
