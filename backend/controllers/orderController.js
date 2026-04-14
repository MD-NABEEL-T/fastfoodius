const Razorpay = require("razorpay");
const { db } = require("../firebase");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const { cart, uid, pickupSide } = req.body;

    console.log("Incoming cart:", JSON.stringify(cart, null, 2));

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let total = 0;

    // Validate items from DB and accumulate total
for (let item of cart) {
  console.log(`[VALIDATION] Processing: ${item.name} (ID: ${item.id}), Qty: ${item.qty}, Price: ₹${item.price}`);

  const itemRef = db.ref(`menu/${item.id}`);
  const snapshot = await itemRef.once("value");

  const menuItem = snapshot.val();

  console.log("[LIVE FIREBASE ITEM]", menuItem);

  if (!menuItem) {
    console.error(`[ERROR] Item not found: ${item.id}`);
    continue;
  }

  const currentStock = menuItem.stock || 0;

  if (currentStock < item.qty) {
    console.error(`[ERROR] Insufficient stock for ${item.name}. Available: ${currentStock}, Requested: ${item.qty}`);
    continue;
  }

  const newStock = currentStock - item.qty;

  await itemRef.update({
    stock: newStock
  });

  // ✅ ACCUMULATE TOTAL
  total += item.qty * item.price;

  console.log(`[SUCCESS] ${item.name} stock updated: ${currentStock} → ${newStock}. Item total: ₹${item.qty * item.price}`);
}

    const platformFee = 2;
    const finalAmount = total + platformFee;

    console.log(`\n📊 PAYMENT BREAKDOWN:`);
    console.log(`   Food Total: ₹${total}`);
    console.log(`   Platform Fee: ₹${platformFee}`);
    console.log(`   Final Payable: ₹${finalAmount} (${finalAmount * 100} paise)\n`);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    console.log(`[SUCCESS] Razorpay order created with ID: ${razorpayOrder.id}`);
    console.log(`[RAZORPAY] Amount sent to Razorpay: ${razorpayOrder.amount} paise (₹${finalAmount})\n`);

    return res.status(200).json({
      success: true,
      razorpayOrder,
      finalAmount,
      breakdown: {
        foodTotal: total,
        platformFee: platformFee,
        payableAmount: finalAmount
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


const crypto = require("crypto");

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      cart,
      uid,
      total,
      pickupSide
    } = req.body;

    // 1️⃣ Verify Razorpay Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // 2️⃣ Deduct Stock Atomically
    console.log("\n[STOCK DEDUCTION] Starting stock deduction for cart items...");
    
    for (let item of cart) {
      const stockRef = db.ref(`menu/${item.id}/stock`);
      console.log(`[STOCK DEDUCTION] Processing: ${item.name} (ID: ${item.id}), Qty to deduct: ${item.qty}`);

      const result = await stockRef.transaction((currentStock) => {
        console.log(`[STOCK DEDUCTION] Current stock in Firebase: ${currentStock}`);
        
        if (currentStock === null || currentStock < item.qty) {
          console.error(`[STOCK ERROR] Cannot deduct - Insufficient stock. Current: ${currentStock}, Needed: ${item.qty}`);
          return; // abort transaction
        }
        
        const newStock = currentStock - item.qty;
        console.log(`[STOCK DEDUCTION] ✅ Deducting ${item.qty} from ${item.name}. New stock: ${newStock}`);
        return newStock;
      });

      if (!result.committed) {
        console.error(`[STOCK ERROR] Transaction failed for ${item.name}`);
      }
    }
    
    console.log("[STOCK DEDUCTION] ✅ All stock deductions completed successfully");

    // 3️⃣ Generate Token (Reset Daily)
    const ordersRef = db.ref("orders");
    const ordersSnapshot = await ordersRef.once("value");
    
    const allOrders = ordersSnapshot.val() || {};
    const today = new Date().toLocaleDateString('en-IN');
    
    // Count only today's orders
    const todayOrders = Object.values(allOrders).filter(order => {
      const orderDate = new Date(order.time).toLocaleDateString('en-IN');
      return orderDate === today;
    });
    
    const tokenNumber = todayOrders.length + 1;

    // 4️⃣ Create Order
    const orderRef = db.ref("orders").push();

    await orderRef.set({
      items: cart,
      total,
      token: tokenNumber,
      time: Date.now(),
      createdAt: new Date().toLocaleString('en-IN'),
      status: "Preparing",
      paymentStatus: "Verified",
      uid,
      pickupSide: pickupSide || "Boys Side"
    });

    console.log(`[ORDER CREATED] ✅ Order created with token #${tokenNumber}`);
    console.log(`[PAYMENT FLOW] ✅ Payment verification complete - Order ID: ${orderRef.key}`);

    return res.status(200).json({
      success: true,
      token: tokenNumber,
      orderId: orderRef.key
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Payment verification failed" });
  }
};