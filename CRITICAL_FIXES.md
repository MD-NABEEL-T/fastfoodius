# CRITICAL FIXES - Implementation Guide
**Priority: Must complete before production deployment**

---

## FIX #1: Remove Stock Deduction from createOrder()

**File:** `backend/controllers/orderController.js`  
**Lines:** ~44-54  
**Action:** DELETE this block

Currently:
```javascript
const newStock = currentStock - item.qty;
await itemRef.update({
  stock: newStock
});
```

Remove entirely. Stock should ONLY be deducted in `verifyPayment()` after signature verification.

**Why:** Stock is deducted twice (once here, once in verify-payment), causing inventory loss on payment failure.

**Impact:** CRITICAL - Prevents inventory loss

---

## FIX #2: Add Idempotency Check (Prevent Duplicate Orders)

**File:** `backend/controllers/orderController.js`  
**Function:** `exports.verifyPayment`  
**Location:** Top of function, after signature verification (line ~130)

**Add this code after signature verification:**

```javascript
// ✅ CHECK: Has this payment already been processed?
const existingOrders = (await ordersRef.once("value")).val() || {};
const isDuplicate = Object.entries(existingOrders).find(([key, order]) => {
  return order.razorpay_payment_id === razorpay_payment_id;
});

if (isDuplicate) {
  console.log(`[DUPLICATE] Payment ${razorpay_payment_id} already processed. Returning existing token.`);
  return res.status(200).json({
    success: true,
    token: isDuplicate[1].token,
    orderId: isDuplicate[0],
    message: "Order already created for this payment"
  });
}
```

**Why:** Prevents creating duplicate orders if verify-payment API is called twice (network retry scenario).

**Impact:** CRITICAL - Prevents duplicate orders and double charging

---

## FIX #3: Add Backend Auth Middleware

**File:** `backend/controllers/orderController.js`  
**Location:** Top of both `createOrder` and `verifyPayment` functions

**Add this check at the start:**

```javascript
// ✅ SECURITY: Verify user identity
const authHeader = req.headers.authorization;
if (!authHeader) {
  return res.status(401).json({error: "Missing auth token"});
}

// TODO: Implement Firebase Admin SDK verification
// For now, at minimum, verify uid is being sent:
const receivedUid = req.body.uid;
if (!receivedUid) {
  return res.status(400).json({error: "uid required"});
}
```

**Note:** Proper implementation requires Firebase Admin SDK:
```javascript
const admin = require("firebase-admin");
const decodedToken = await admin.auth().verifyIdToken(authHeader);
const authenticatedUid = decodedToken.uid;
if (authenticatedUid !== receivedUid) {
  return res.status(403).json({error: "Auth mismatch"});
}
```

**Why:** Prevents UID spoofing - a student could otherwise claim to be another user.

**Impact:** CRITICAL - Prevents fraud (placing orders as other users)

---

## FIX #4: Validate Cart Item Prices

**File:** `backend/controllers/orderController.js`  
**Function:** `exports.createOrder`  
**Location:** Inside the cart validation loop (line ~26-54)

**Add after getting menuItem:**

```javascript
// ✅ VALIDATE: Price must match Firebase
if (item.price !== menuItem.price) {
  return res.status(400).json({
    error: `Price mismatch for ${item.name}. Expected ₹${menuItem.price}, got ₹${item.price}`
  });
}

// ✅ VALIDATE: Quantity bounds
if (item.qty <= 0 || item.qty > 10) {
  return res.status(400).json({
    error: `Invalid quantity for ${item.name}. Must be 1-10.`
  });
}
```

**Why:** Frontend can be manipulated. Attacker could change ₹50 item to ₹10.

**Impact:** HIGH - Prevents price manipulation attack

---

## FIX #5: Atomic Token Generation

**File:** `backend/controllers/orderController.js`  
**Function:** `exports.verifyPayment`  
**Location:** Replace lines ~176-186 (token generation)

**Replace this:**
```javascript
const allOrders = ordersSnapshot.val() || {};
const today = new Date().toLocaleDateString('en-IN');
const todayOrders = Object.values(allOrders).filter(order => {
  const orderDate = new Date(order.time).toLocaleDateString('en-IN');
  return orderDate === today;
});
const tokenNumber = todayOrders.length + 1;
```

**With this:**
```javascript
// ✅ Use atomic transaction for token generation
const tokenCounterRef = db.ref("shopConfig/tokenCounter");
let tokenNumber = 0;

const result = await tokenCounterRef.transaction((currentCounter) => {
  const counter = currentCounter || 0;
  tokenNumber = counter + 1;
  return tokenNumber;
});

if (!result.committed) {
  return res.status(500).json({error: "Failed to generate token"});
}
```

**Why:** Current method not atomic - two simultaneous orders could get same token number.

**Impact:** HIGH - Prevents token number collisions

---

## FIX #6: Restore Stock on Error

**File:** `backend/controllers/orderController.js`  
**Function:** `exports.verifyPayment`  
**Location:** Add catch block error handling (line ~267)

**Replace the catch block:**

```javascript
catch (err) {
  console.error("[ERROR] Payment verification failed:", err);
  
  // ✅ SAFETY: Restore stock if error occurred
  for (let item of cart) {
    try {
      const stockRef = db.ref(`menu/${item.id}/stock`);
      await stockRef.transaction((currentStock) => {
        return (currentStock || 0) + item.qty; // Add back
      });
    } catch (e) {
      console.error(`[CRITICAL] Failed to restore stock for ${item.id}:`, e);
    }
  }
  
  return res.status(500).json({error: "Payment verification failed"});
}
```

**Why:** If order creation fails after stock deduction, inventory is lost forever.

**Impact:** MEDIUM - Prevents permanent inventory loss on errors

---

## FIX #7: Prevent Incomplete Item Processing

**File:** `backend/controllers/orderController.js`  
**Function:** `exports.createOrder`  
**Location:** Item validation loop (line ~26-54)

**Change this:**
```javascript
if (!menuItem) {
  console.error(`[ERROR] Item not found: ${item.id}`);
  continue;  // ❌ BAD: Silently skips
}
```

**To this:**
```javascript
if (!menuItem) {
  return res.status(400).json({
    error: `Item not found: ${item.name} (${item.id}). Please refresh menu and try again.`
  });
}
```

**Why:** Currently skips missing items without telling frontend. Partial orders created silently.

**Impact:** HIGH - Prevents incomplete orders

---

## FIX #8: Add Null Check for Current User

**File:** `public/student.js`  
**Locations:** Lines ~501, ~556

**Add before using `auth.currentUser`:**

```javascript
const auth = getAuth();
const user = auth.currentUser;

// ✅ GUARD: User must be authenticated
if (!user) {
  hideLoading();
  alert("Session expired. Please log in again.");
  window.location.href = "signin.html";
  return;
}
```

**Why:** If auth state not ready, `user.uid` would throw error.

**Impact:** LOW - Prevents runtime errors

---

## FIX #9: Clear Cart on Logout

**File:** `public/student.html`  
**Location:** Logout button script (around line 700)

**Add this in logout handler:**

```javascript
document.getElementById("logoutBtn").addEventListener("click", async () => {
  // ✅ Clear cart data before logout
  const cart = {};  // This should reference the actual cart object
  Object.keys(cart).forEach(key => delete cart[key]);
  
  showLoading("Logging you out...");
  await signOut(auth);
  window.location.href = "index.html";
});
```

**Why:** Cart persists in memory if student logs out mid-payment. Next login could reuse old cart.

**Impact:** LOW - Prevents confusion on logout

---

## FIX #10: Platform Fee Configuration

**File:** `backend/server.js`  
**Action:** Add new endpoint

```javascript
app.get("/api/config", (req, res) => {
  return res.status(200).json({
    platformFee: 2,
    minOrder: 50,
    maxQtyPerItem: 10,
    timeZone: "Asia/Kolkata"
  });
});
```

**Frontend Usage:** `public/student.js` (load on page init)

```javascript
let CONFIG = {};
(async () => {
  const res = await fetch("https://fastfoodius.onrender.com/api/config");
  CONFIG = await res.json();
  // Use CONFIG.platformFee instead of hardcoded 2
})();
```

**Why:** Single source of truth for configuration. Easier to maintain.

**Impact:** LOW - Improves maintainability

---

## DEPLOYMENT CHECKLIST

- [ ] Fix #1: Remove stock deduction from createOrder
- [ ] Fix #2: Add idempotency check
- [ ] Fix #3: Add auth verification
- [ ] Fix #4: Validate prices and quantities
- [ ] Fix #5: Atomic token generation
- [ ] Fix #6: Stock restoration on error
- [ ] Fix #7: Prevent incomplete items
- [ ] Fix #8: Null guard on currentUser
- [ ] Fix #9: Clear cart on logout
- [ ] Fix #10: Config endpoint

**Estimated Time:** 2-3 hours

**Testing:**
- [ ] Simulate payment cancellation → Verify stock restored
- [ ] Call verify-payment twice → Verify only one order created
- [ ] Send wrong price → Verify rejected
- [ ] Try to place order as another user → Verify rejected
- [ ] Logout mid-cart → Verify cart cleared on re-login

---

## NOTES

- Some fixes require Firebase Admin SDK setup
- Ensure environment variables are configured
- Test all fixes with actual Razorpay sandbox before going live
- Enable Firebase security rules before launch
- Set up error logging/monitoring

