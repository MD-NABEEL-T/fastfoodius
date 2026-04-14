//student.js
import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  query,
  orderByChild,
  equalTo
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// SHOP STATUS TRACKING
let isShopOpen = true;

const shopRef = ref(db, "shopStatus");
onValue(shopRef, (snap) => {
  const data = snap.val();
  if (!data) return;

  const menuSection = document.getElementById("menuSection");
  const confirmOrder = document.getElementById("confirmOrderBtn");
  const menuItems = document.querySelectorAll(".menu-item");
  const qtyButtons = document.querySelectorAll(".plus, .minus");

  let banner = document.getElementById("shopBanner");

  // CHECK: Get current shop state from Firebase
  let shopOpen = data.isOpen || false;
  
  // DETERMINE: Should shop be open based on time?
  let shouldBeOpenByTime = true;  // Default: assume shop should be open
  
  if (data.openTime && data.closeTime) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Check if current time is within opening hours
    shouldBeOpenByTime = (currentTime >= data.openTime && currentTime <= data.closeTime);
  }
  
  // CHECK: Is this a manual override or auto-scheduled state?
  const lastToggleTime = data.lastToggleTime || 0;
  const timeSinceToggle = Date.now() - lastToggleTime;  // milliseconds
  const GRACE_PERIOD = 60 * 60 * 1000;  // 60 minutes - manual override within this period
  const isRecentManualChange = timeSinceToggle < GRACE_PERIOD;
  
  // LOGIC:
  // If manual toggle is recent, respect it regardless of time
  // If manual toggle is old, sync with time-based logic
  if (!isRecentManualChange) {
    // No recent manual override - use time-based logic
    shopOpen = shouldBeOpenByTime;
  }
  // else: Respect the manual override from shopOpen = data.isOpen

  // UPDATE GLOBAL STATUS
  isShopOpen = shopOpen;

  // UPDATE UI - Set all styles for the banner
  if (!shopOpen) {
    banner.textContent = "🚫 Shop is currently closed";
    banner.style.padding = "10px";
    banner.style.textAlign = "center";
    banner.style.fontWeight = "600";
    banner.style.margin = "10px";
    banner.style.borderRadius = "8px";
    banner.style.background = "#ffcccc";
    banner.style.color = "#900";
    banner.style.display = "block";
    menuSection.classList.add("d-none");
    
    // DISABLE CHECKOUT BUTTON
    if (confirmOrder) {
      confirmOrder.disabled = true;
    }

    // DISABLE QUANTITY BUTTONS & REDUCE OPACITY
    qtyButtons.forEach(btn => {
      btn.disabled = true;
    });
    menuItems.forEach(item => {
      item.style.opacity = "0.5";
      item.style.pointerEvents = "none";
    });
  } else {
    let text = "🟢 Shop is open";

    // Show timings if set
    if (data.openTime && data.closeTime) {
      text += ` (${data.openTime} - ${data.closeTime})`;
    }

    // Show scheduled close if set
    if (data.closesAt) {
      const time = new Date(data.closesAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      text += ` • Manual close at ${time}`;
    }

    banner.textContent = text;
    banner.style.padding = "10px";
    banner.style.textAlign = "center";
    banner.style.fontWeight = "600";
    banner.style.margin = "10px";
    banner.style.borderRadius = "8px";
    banner.style.background = "#d1e7dd";
    banner.style.color = "#0f5132";
    banner.style.display = "block";
    menuSection.classList.remove("d-none");
    
    // ENABLE CHECKOUT BUTTON
    if (confirmOrder) {
      confirmOrder.disabled = false;
    }

    // ENABLE QUANTITY BUTTONS & RESTORE OPACITY
    qtyButtons.forEach(btn => {
      btn.disabled = false;
    });
    menuItems.forEach(item => {
      item.style.opacity = "1";
      item.style.pointerEvents = "auto";
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openShopBtn");
  const closeBtn = document.getElementById("closeShopBtn");
  const scheduleBtn = document.getElementById("scheduleCloseBtn");
  const input = document.getElementById("closeAfterInput");

  // your button logic here
});
function loadMyOrders() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return;



  const ordersRef = ref(db, "orders");

  onValue(ordersRef, (snapshot) => {
    const orders = snapshot.val();
    const container = document.getElementById("myOrdersList");

    container.innerHTML = "";

    if (!orders) {
      container.innerHTML = `
        <div class="empty-orders">
          <div class="empty-orders-icon">🍔</div>
          <p>No orders yet. Start ordering now!</p>
        </div>
      `;
      return;
    }

    // Filter orders for current user AND today only
    const today = new Date().toLocaleDateString('en-IN');
    const userOrders = Object.entries(orders)
      .filter(([_, order]) => {
        const isCurrentUser = order.uid === user.uid;
        const isToday = order.time ? new Date(order.time).toLocaleDateString('en-IN') === today : false;
        return isCurrentUser && isToday;
      })
      .sort((a, b) => new Date(b[1].time) - new Date(a[1].time)); // Latest first

    if (userOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-orders">
          <div class="empty-orders-icon">🍔</div>
          <p>No orders yet. Start ordering now!</p>
        </div>
      `;
      return;
    }

    userOrders.forEach(([orderId, order]) => {
      const orderDiv = document.createElement("div");
      orderDiv.className = "order-card";

      // Format time
      const orderTime = order.time
        ? new Date(order.time).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        : 'N/A';

      // Build items list
      let itemsHTML = '';
      if (order.items && typeof order.items === 'object') {
        Object.values(order.items).forEach(item => {
          itemsHTML += `
            <div class="order-item">
              <span class="order-item-name">${item.name || 'Item'}</span>
              <span class="order-item-qty">x${item.qty}</span>
            </div>
          `;
        });
      }

      // Status badge color
      const statusClass = `status-${(order.status || 'pending').toLowerCase()}`;

      // SHOW READY ORDER ALERT
      const readyMessage = order.status === 'Ready' ? `
        <div class="ready-alert">
          ✅ Your order is ready for pickup!
        </div>
      ` : '';

      orderDiv.innerHTML = `
        <div class="order-header">
          <div>
            <div class="token-label">Token Number</div>
            <div class="token-badge">#${order.token || 'N/A'}</div>
          </div>
          <span class="status-badge ${statusClass}">
            ${order.status || 'Pending'}
          </span>
        </div>

        ${readyMessage}

        ${itemsHTML ? `
          <div class="order-items">
            <div class="order-items-title">Items Ordered</div>
            ${itemsHTML}
          </div>
        ` : ''}

        <div class="order-footer">
          <div class="order-total">₹${order.total || 0}</div>
          <div class="order-time">${orderTime}</div>
        </div>
      `;

      container.appendChild(orderDiv);
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const snacksContainer = document.getElementById("snacks");
  const juicesContainer = document.getElementById("juices");
  const lunchContainer = document.getElementById("lunch");

  const menuRef = ref(db, "menu");

  // ADD THIS (at the top of DOMContentLoaded, around line 70):
  // ADD THIS (at the top of DOMContentLoaded, around line 70):
  const searchInput = document.getElementById("searchInput");
  let isSearchActive = false;

  // ADD search functionality - cross-category search
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const allItems = document.querySelectorAll(".menu-item");
      const tabPanes = document.querySelectorAll(".tab-pane");

      if (!query) {
        // Clear search - restore normal tab behavior
        isSearchActive = false;
        allItems.forEach(item => item.style.display = "");
        
        // Restore tab visibility to Bootstrap defaults
        tabPanes.forEach(pane => {
          pane.classList.remove("show", "active");
        });
        
        // Re-activate the current active tab
        const activeTab = document.querySelector(".nav-link.active");
        if (activeTab) {
          const targetId = activeTab.getAttribute("data-bs-target");
          const targetPane = document.querySelector(targetId);
          if (targetPane) {
            targetPane.classList.add("show", "active");
          }
        }
        return;
      }

      // Search is active - filter across all categories
      isSearchActive = true;
      let hasMatches = false;

      allItems.forEach(item => {
        const name = item.dataset.name.toLowerCase();
        const isMatch = name.includes(query);
        item.style.display = isMatch ? "" : "none";
        if (isMatch) hasMatches = true;
      });

      // Show all tab panes during search (so items from all categories are visible)
      tabPanes.forEach(pane => {
        pane.classList.add("show", "active");
        pane.style.display = "block";
      });
    });
  }
  onValue(menuRef, (snapshot) => {
    const menu = snapshot.val();

    snacksContainer.innerHTML = "";
    juicesContainer.innerHTML = "";
    lunchContainer.innerHTML = "";

    if (!menu) return;

    Object.entries(menu).forEach(([id, item]) => {
      // TASK 6: Show all items - even out of stock (buttons will be disabled)
      const isOutOfStock = item.stock <= 0;
      const itemDiv = document.createElement("div");
      itemDiv.className = `menu-item ${isOutOfStock ? "disabled" : ""}`; itemDiv.setAttribute("data-name", item.name);
      itemDiv.setAttribute("data-price", item.price);
      itemDiv.setAttribute("data-stock", item.stock);
      itemDiv.setAttribute("data-id", id);
      
      // OUT OF STOCK LABEL
      const stockLabel = isOutOfStock ? `<div class="stock-badge">OUT OF STOCK</div>` : '';
      
      itemDiv.innerHTML = `
  <img src="${item.image || 'images/default.jpg'}" class="${isOutOfStock ? 'out-of-stock-img' : ''}">
  <div class="details">
    <h5>${item.name}</h5>
    <p>₹${item.price}</p>
    ${stockLabel}
<div class="qty-control">
  <button class="minus" ${isOutOfStock ? "disabled" : ""}>-</button>
  <span class="qty">0</span>
  <button class="plus" ${isOutOfStock ? "disabled" : ""}>+</button>
</div>
  </div>
`;

      if (item.category === "Snacks") {
        snacksContainer.appendChild(itemDiv);
      } else if (item.category === "Juices") {
        juicesContainer.appendChild(itemDiv);
      } else if (item.category === "Lunch") {
        lunchContainer.appendChild(itemDiv);
      }
    });

    // Handle category tab clicks - clear search if active
    const categoryTabs = document.querySelectorAll(".nav-link[data-bs-toggle='tab']");
    categoryTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        if (isSearchActive) {
          searchInput.value = "";
          isSearchActive = false;
        }
      });
    });
  });

  const cart = {};
  const cartBar = document.getElementById("cartBar");
  const cartSummary = document.getElementById("cartSummary");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const orderSummary = document.getElementById("orderSummary");
  const modalTotal = document.getElementById("modalTotal");
  const confirmOrder = document.getElementById("confirmOrder");

  document.addEventListener("click", (e) => {
    const itemDiv = e.target.closest(".menu-item");
    if (!itemDiv) return;

    const id = itemDiv.dataset.id;
    const name = itemDiv.dataset.name;
    const price = parseInt(itemDiv.dataset.price);
    const stock = parseInt(itemDiv.dataset.stock);
    const qtySpan = itemDiv.querySelector(".qty");
    
    if (!cart[id]) {
      cart[id] = {
        id,
        name,
        price,
        qty: 0
      };
    }

    if (e.target.classList.contains("plus")) {
      if (cart[id].qty < stock) {
        cart[id].qty++;
      }
    }

    if (e.target.classList.contains("minus")) {
      if (cart[id].qty > 0) {
        cart[id].qty--;
        if (cart[id].qty === 0) {
          delete cart[id];
        }
      }
    }

    qtySpan.textContent = cart[id]?.qty || 0;
    updateCart();
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

    Object.values(cart).forEach(item => {
      const li = document.createElement("li");
      const itemTotal = item.qty * item.price;
      li.innerHTML = `
        <span>${item.name} ×${item.qty}</span>
        <span>₹${itemTotal}</span>
      `;
      orderSummary.appendChild(li);
      total += itemTotal;
    });

    const fee = 2;
    const payable = total + fee;

    document.getElementById("foodTotal").textContent =
      `₹${total}`;

    document.getElementById("platformFee").textContent =
      `₹${fee}`;

    modalTotal.textContent =
      `₹${payable}`;
    new bootstrap.Modal(document.getElementById("paymentModal")).show();
  });

  confirmOrder.addEventListener("click", async () => {
    // CHECK: Shop must be open to order
    if (!isShopOpen) {
      alert("Shop is closed. Cannot place order.");
      return;
    }

    // DISABLE BUTTON & CHANGE TEXT TO PREVENT MULTIPLE CLICKS
    confirmOrder.disabled = true;
    confirmOrder.textContent = "Processing Payment...";
    
    showLoading("Creating order & processing payment...");

    let orderItems = [];
    let total = 0;

    Object.values(cart).forEach(item => {
      orderItems.push({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price
      });
      total += item.qty * item.price;
    });

    console.log("Order items being sent to backend:", JSON.stringify(orderItems, null, 2));
    console.log("Total before fee:", total);

    if (orderItems.length === 0) {
      hideLoading();
      confirmOrder.disabled = false;
      confirmOrder.textContent = "Confirm & Pay";
      return;
    }
    try {

      const auth = getAuth();
      const user = auth.currentUser;

      // Get user's pickup side from Firebase
      const userSnap = await get(ref(db, "users/" + user.uid));
      const pickupSide = userSnap.exists() ? userSnap.val().pickupSide : "Boys Side";

      const response = await fetch("http://localhost:5000/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cart: orderItems,
          uid: user.uid,
          pickupSide: pickupSide
        })
      });
      const data = await response.json();

      console.log("Backend response status:", response.status);
      console.log("Backend response data:", data);

      if (!response.ok) {
        console.error("Order creation failed:", data.error);
        confirmOrder.disabled = false;
        confirmOrder.textContent = "Confirm & Pay";
        hideLoading();
        return;
      }

      if (data.success) {

        console.log(`\n💰 PAYMENT FLOW:`);
        console.log(`   Food Total: ₹${total}`);
        console.log(`   Platform Fee: ₹2`);
        console.log(`   Total Payable: ₹${total + 2}`);
        console.log(`   Razorpay Amount (paise): ${data.razorpayOrder.amount}`);
        console.log(`   Order ID: ${data.razorpayOrder.id}\n`);

        const options = {
          key: "rzp_test_SN2x20qsFTP61h",
          amount: data.razorpayOrder.amount,
          currency: "INR",
          name: "Fast & Foodious",
          description: "Canteen Order Payment",
          order_id: data.razorpayOrder.id,
          
          handler: async function (response) {
            console.log("✅ Payment Success:", response);
            console.log(`Razorpay Payment ID: ${response.razorpay_payment_id}`);

            try {
              const fee = 2;
              const payable = total + fee;
              const auth = getAuth();
              const user = auth.currentUser;

              const verifyRes = await fetch("http://localhost:5000/api/verify-payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  cart: orderItems,
                  uid: user.uid,
                  total: payable,
                  pickupSide: pickupSide
                })
              });

              const verifyData = await verifyRes.json();

              console.log("Verification response status:", verifyRes.status);
              console.log("Verification response data:", verifyData);

              if (verifyData.success) {
                console.log("✅ Payment verified! Token number:", verifyData.token);
                hideLoading();

                // Close modal properly
                const modalElement = document.getElementById("paymentModal");
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                  modal.hide();
                }

                // Remove modal backdrop if lingering
                document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

                // Switch to My Orders tab after payment
                menuTab.classList.remove("active");
                ordersTab.classList.add("active");

                menuSection.classList.add("d-none");
                ordersSection.classList.remove("d-none");

                // Reload orders to show new order
                loadMyOrders();
              } else {
                hideLoading();
                confirmOrder.disabled = false;
                confirmOrder.textContent = "Confirm & Pay";
                alert("Payment verification failed. Please try again.");
                console.error("Verification failed:", verifyData.error);
              }

            } catch (err) {
              hideLoading();
              confirmOrder.disabled = false;
              confirmOrder.textContent = "Confirm & Pay";
              alert("An error occurred while verifying your payment. Please try again.");
              console.error("Payment verification error:", err);
            }
          },

          modal: {
            ondismiss: function() {
              console.log("❌ Payment cancelled by user");
              hideLoading();
              confirmOrder.disabled = false;
              confirmOrder.textContent = "Confirm & Pay";
              alert("Payment cancelled. Your cart is still saved. Please try again when ready.");
            }
          },

          theme: {
            color: "#3399cc"
          },

          method: {
            upi: true,
            card: true,
            netbanking: false,
            wallet: false,
            emi: false
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();

      }
      else {
        hideLoading();
        confirmOrder.disabled = false;
        confirmOrder.textContent = "Confirm & Pay";
        alert("Failed to create order. Please check your cart and try again.");
        console.error("Order creation error:", data.error);
      }

    } catch (err) {
      hideLoading();
      confirmOrder.disabled = false;
      confirmOrder.textContent = "Confirm & Pay";
      alert("Connection error. Please check your internet and try again.");
      console.error("Payment flow error:", err);
    }

  });

  const menuTab = document.getElementById("menuTab");
  const ordersTab = document.getElementById("ordersTab");

  const menuSection = document.getElementById("menuSection");
  const ordersSection = document.getElementById("ordersSection");

  menuTab.addEventListener("click", () => {
    // Only restore tab filtering if search is NOT active
    if (!isSearchActive) {
      const tabPanes = document.querySelectorAll(".tab-pane");
      tabPanes.forEach(pane => {
        pane.classList.remove("show", "active");
      });
    }

    menuTab.classList.add("active");
    ordersTab.classList.remove("active");

    menuSection.classList.remove("d-none");
    ordersSection.classList.add("d-none");

    document.getElementById("successScreen").classList.add("d-none");

    document.querySelector(".tab-content").classList.remove("d-none");
    document.getElementById("cartBar").classList.remove("d-none");

  });

  ordersTab.addEventListener("click", () => {
    // Clear search when switching to orders tab
    if (searchInput) {
      searchInput.value = "";
      isSearchActive = false;
    }
    
    ordersTab.classList.add("active");
    menuTab.classList.remove("active");

    menuSection.classList.add("d-none");
    ordersSection.classList.remove("d-none");

  });
  // Reset form
  orderSummary.innerHTML = "";

  // AUTO-LOAD ORDERS AFTER AUTH CONFIRMED
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      loadMyOrders();
    }
  });
});