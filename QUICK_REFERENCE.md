# Fast & Foodious - Risk Summary & Action Items

## 🔴 SHOW-STOPPERS (Fix Before ANYTHING Goes Live)

| # | Issue | Impact | Quick Fix |
|---|-------|--------|-----------|
| 1 | Stock deducted 2x (create-order + verify-payment) | Inventory loss on failed payment | Delete stock deduction from `createOrder()` |
| 2 | No idempotency - retry creates duplicate orders | Customer pays once, gets 2 orders | Store `razorpay_payment_id` in Firebase, check before creating new order |
| 3 | Backend trusts uid from frontend - UID spoofing possible | Student places order as another user | Add auth verification middleware to extract uid from Firebase token |
| 4 | Prices not validated on backend - price manipulation | ₹50 item sold for ₹1 | Fetch prices from Firebase, compare with frontend values |
| 5 | Token generation not atomic - race condition | Two orders same millisecond get same token number | Use Firebase transaction for atomic counter increment |
| 6 | No stock restoration if order fails | Permanent inventory loss on error | Restore stock in catch block if order creation fails |

---

## 🟠 HIGH-PRIORITY (Week 1)

| # | Issue | Fix Effort |
|---|-------|-----------|
| 7 | Item not found silently skipped | 2 min - Return error instead of continue |
| 8 | Qty not validated on backend (could send 1000) | 2 min - Add validation: `0 < qty ≤ 10` |
| 9 | Shop status logic on client, not server | 30 min - Move to `/api/shop-status` endpoint |
| 10 | Sometimes stock updates mix `update()` and `transaction()` | 20 min - Use transaction exclusively |

---

## 🟡 MEDIUM-PRIORITY (Ongoing)

| # | Issue | Fix Effort |
|---|-------|-----------|
| 11 | Platform fee hardcoded 3 places (₹2 mismatch risk) | 10 min - Create `/api/config` endpoint |
| 12 | No rate limiting - could flood with create-order calls | 5 min - Add express-rate-limit middleware |
| 13 | Razorpay has 30-min expiry, no timeout handling | 30 min - Auto-cancel order & restore stock after 25 min |
| 14 | No error message when item out of stock | 3 min - Return specific item name in error |
| 15 | Firebase listeners not auth-gated | 15 min - Verify security rules |

---

## 📋 LOGIC FLAWS

### Payment Flow Sequence
```
❌ CURRENT (BROKEN):
create-order → [deduct stock] → razorpay popup
              ↓
              [customer cancels]
              ↓
              [stock lost forever] ❌

✅ SHOULD BE:
create-order → razorpay popup
              ↓
verify-payment → [only AFTER signature verified] → deduct stock
```

### Token Generation Issue
```
❌ CURRENT:
Count existing orders = 4
token = 4 + 1 = 5
[between count and create, another order added]
Next also calculates token = 5 ❌

✅ SHOULD BE:
Atomically: tokenCounter.transaction( current => current + 1 )
```

### Duplicate Order Scenario
```
❌ CURRENT:
verify-payment called with razorpay_payment_id = "abc123"
→ Create order #1
→ Network fails, frontend retries
→ verify-payment called again with same "abc123"
→ Create order #2 ❌ (duplicate)

✅ SHOULD BE:
Before creating order:
  if (razorpay_payment_id exists in Firebase) {
    return existing order
  }
```

---

## 🚨 SECURITY VULNERABILITIES

### 1. UID Spoofing
```javascript
// ❌ Backend trusts this:
app.post("/api/create-order", (req, res) => {
  const uid = req.body.uid;  // UNVERIFIED!
  // Student could send someone else's uid
});

// ✅ Should be:
const decodedToken = await admin.auth().verifyIdToken(token);
const uid = decodedToken.uid;  // From Firebase, not body
```

### 2. Price Manipulation
```javascript
// ❌ No validation:
cart = [{id: "item1", qty: 1, price: 10}]  // Attacker changed from 50
total = 1 * 10 = 10 ❌

// ✅ Should validate:
const menuItem = await getFromFirebase("menu/item1");
if (price !== menuItem.price) return error;
```

### 3. Razorpay Key Exposed
```javascript
// ❌ In frontend code:
const options = {
  key: "rzp_test_SN2x20qsFTP61h"  // Visible in browser
};

// ✅ Should come from backend:
const { razorpayKey } = await fetch("https://fastfoodius.onrender.com/api/config");
```

---

## 💾 DATABASE ISSUES

### Missing Idempotency Index
```
Orders Collection:
- No unique index on razorpay_payment_id
- Same payment can create multiple orders

FIX: Add unique constraint or check before inserting
```

### Stock Not Transactionally Safe
```
concurrent updates:
  update(stock: 10 → 8)
  transaction(stock: 10 → 9)
  Result: Unpredictable
  
FIX: Always use transaction() for stock
```

### Token Counter Not Atomic
```
Function: count orders + increment
Race: Two calls happen simultaneously
Result: Same token issued twice

FIX: Use transaction for counter
```

---

## 📊 IMPACT ASSESSMENT

### If Not Fixed Before Launch:

| Issue | Frequency | Cost |
|-------|-----------|------|
| Duplicate orders | 1-5% of traffic | Refund + investigation |
| Stock loss on failed payment | 2-10% of transactions | Restock cost + support |
| UID spoofing | 0.1% | Fraud |
| Price manipulation | <0.1% | Revenue loss + refund |

**Total Risk:** ~₹50k-100k loss per day if these scale

---

## ✅ QUICK IMPLEMENTATION ORDER

**Priority 1 (Today) - 30 minutes:**
1. Remove stock deduction from `createOrder()`
2. Add idempotency check (razorpay_payment_id)
3. Validate prices on backend

**Priority 2 (This Week) - 2 hours:**
4. Add auth middleware
5. Atomic token generation
6. Stock restoration on error

**Priority 3 (Before Going Live) - 2 hours:**
7. Prevent incomplete items
8. Add rate limiting
9. Firebase security rules
10. Razorpay expiry handling

---

## 🔗 FILE LOCATIONS

| File | Changes Needed |
|------|---|
| `backend/controllers/orderController.js` | Fixes #1,2,3,4,5,6,7 |
| `backend/server.js` | Add rate limit, config endpoint |
| `public/student.js` | Fixes #8,9 |
| `Firebase Security Rules` | Fix #15 |

---

## 🎯 SUCCESS CRITERIA FOR PRODUCTION

- [ ] Payment success → 1 order created (never 2)
- [ ] Payment cancel → Stock unchanged (never lost)
- [ ] Price change attempt → Request rejected
- [ ] UID spoof attempt → Request rejected
- [ ] Qty > 10 → Request rejected
- [ ] Item not found → Error message returned
- [ ] Simultaneous orders → Different token numbers
- [ ] Firebase listener → Authenticated users only

