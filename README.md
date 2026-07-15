<div align="center">
🍔 Fast & Foodious
Realtime Token-Based Canteen Ordering System
Sign in, order food, pay via UPI/Card/Netbanking through Razorpay, and track your token live — no page refresh, ever.
Live Demo • Features • Tech Stack • How It Works
</div>

🚀 Live Demo
PageLink🏠 Homefastfoodius-81742.web.app🔐 Sign In / Sign Up/signin.html · /signup.html🎓 Student Ordering/student.html👨‍🍳 Staff Dashboard/staff.html📝 Feedback / Complaints/feedback.html
📖 About
Fast & Foodious is a realtime canteen ordering web app built for a college food court. Students sign in with a Firebase account, order from a live menu, and pay through Razorpay (UPI-first on mobile, full checkout on desktop). Payments are verified server-side with signature checks, stock is deducted atomically in Firebase, and a daily token number is generated for pickup. Staff get a dedicated dashboard to manage the shop's open/close status, menu stock, and the live order queue.
✨ Features
🔐 Authentication & Roles

Firebase Auth (email/password) sign-in and sign-up
Each user is assigned a role (student or owner) stored in /users/{uid}, which decides where they land after login — staff.html for owners, student.html for students
Students pick a pickup side (Boys Side / Girls Side) at signup, saved to their profile and attached to every order

🎓 For Students

📋 Live category menu — Snacks, Juices, Lunch — synced in realtime from Firebase, with quantity +/- controls
🔍 Cross-category search bar that filters menu items live as you type
🚫 Out-of-stock handling — items with stock <= 0 are shown greyed-out with a badge and disabled qty buttons
🕒 Shop open/close awareness — menu and checkout auto-disable when the shop is closed, driven by both a manual staff toggle and configured opening hours
🧾 Cart & checkout modal with itemized order summary before payment
💳 Razorpay checkout:

On mobile, only UPI is offered and UPI Intent is enabled so Razorpay opens installed apps (Google Pay, PhonePe, BHIM, etc.) directly
On desktop, UPI, card, and netbanking are all available
The last successfully used payment method is remembered per-device (localStorage) for next time


🔢 Daily token number issued only after payment is verified — token count resets each day
📜 "My Orders" tab — realtime list of the signed-in user's orders placed today, showing token, status (Preparing/Ready/Served), items, and total, with a highlighted alert once an order is marked Ready

👨‍🍳 For Staff

🟢🔴 Shop status toggle — manual open/close switch with a 60-minute grace period, plus configurable daily opening/closing times that auto-drive shop status once the manual override expires
📦 Menu stock management — increment/decrement stock per item directly from the dashboard, synced instantly to the live menu
🔁 Order lifecycle controls — move each order through Preparing → Ready → Served
📜 Served order history — served orders are archived to /servedOrders and can be cleared on demand
📊 Live summary counts for active vs. ready vs. served orders
⚡ Every panel updates in realtime via Firebase listeners — no refresh needed on either student or staff side

📝 Feedback / Complaints

Standalone complaint form (category, priority level, free-text feedback) that submits to a Google Apps Script endpoint backing a Google Sheet, generating a shareable complaint ID for the student to reference

🏗️ Under the Hood

💰 Server-side price & stock validation — the backend re-reads each item's price and stock from Firebase (never trusts the client), decrements stock, and computes the payable total (food total + fixed ₹2 platform fee) before creating the Razorpay order
🔏 Razorpay signature verification — verify-payment recomputes the HMAC SHA-256 signature from order_id|payment_id using the Razorpay key secret and rejects mismatches before an order is ever written
🔒 Atomic stock deduction on payment success using Firebase transaction(), preventing overselling under concurrent checkouts
🔢 Daily token counter derived by counting today's existing orders in Firebase, not a separate global counter
📱 Offline fallback page (offline.html) for when connectivity drops

🛠 Tech Stack
LayerTechnologyFrontendHTML, CSS, JavaScript (ES modules), BootstrapAuthFirebase Authentication (email/password)Realtime DataFirebase Realtime DatabaseHostingFirebase HostingBackend APINode.js, Express 5, Firebase Admin SDKPaymentsRazorpay (Orders API + Checkout, UPI Intent on mobile)ComplaintsGoogle Apps Script + Google SheetsUtilitiesdotenv, cors, crypto (signature verification)
🔍 How It Works
Student signs in (Firebase Auth) → role & pickup side loaded from /users/{uid}
        │
        ▼
Browses live /menu → adds items to cart → Checkout
        │
        ▼
POST /api/create-order  (backend re-validates price & stock, deducts stock,
                          adds ₹2 platform fee, creates Razorpay order)
        │
        ▼
Razorpay Checkout opens (UPI Intent on mobile, full checkout on desktop)
        │
        ▼
POST /api/verify-payment  (HMAC signature check → atomic stock re-deduction
                            → daily token assigned → order written to /orders)
        │
        ▼
Staff dashboard (realtime listener) ──► Preparing → Ready → Served
        │                                                   │
        ▼                                                   ▼
Student "My Orders" tab shows live status         Order archived to /servedOrders
Each order stored in /orders contains: items, total, token, time, createdAt, status, paymentStatus, uid, pickupSide.
📂 Project Structure
fastfoodius/
├── public/                      # Static frontend (Firebase Hosting root)
│   ├── index.html               # Landing page (redirects by role if logged in)
│   ├── signin.html / signup.html # Firebase Auth flows
│   ├── student.html/.css/.js    # Student ordering, cart, checkout, order tracking
│   ├── staff.html/.js           # Staff dashboard (shop status, stock, order queue)
│   ├── feedback.html            # Complaint form → Google Apps Script
│   ├── firebase-config.js       # Firebase client SDK init (Auth + Realtime DB)
│   ├── loadingHelper.js         # Shared loading-overlay UI helper
│   ├── offline.html / 404.html
│   ├── images/                  # Menu item images
│   └── sounds/                  # Order alert sounds
├── backend/                     # Express API (order creation & payment verification)
│   ├── server.js
│   ├── controllers/orderController.js  # Razorpay order creation + signature verification
│   ├── routes/orderRoutes.js
│   └── firebase.js              # Firebase Admin SDK init
└── firebase.json                # Firebase Hosting config
🎯 What This Project Demonstrates

Firebase Authentication with role-based routing (student vs. owner)
Server-side payment validation: re-pricing on the backend, HMAC signature verification, atomic stock transactions
Razorpay integration with device-aware checkout (UPI Intent on mobile, full method set on desktop)
Realtime multi-dashboard sync (student + staff) via Firebase listeners
Daily-reset token generation derived from live order data
Third-party form integration via Google Apps Script for lightweight complaint logging

🔐 Security Note

All pricing and stock changes are recomputed and validated on the backend — the client only sends item IDs and quantities
Payments are only accepted after Razorpay signature verification (RAZORPAY_KEY_SECRET, never exposed to the client)
The Razorpay key_id in student.js is a publishable identifier and safe to expose client-side; the key_secret lives only in the backend .env
Firebase security rules should be locked down to authenticated users/roles before any public production deployment

👤 Author
Mohammed Nabeel T
GitHub: @MD-NABEEL-T

<div align="center">
Made with 🍔, ⚡ Firebase, 💳 Razorpay, and a lot of debugging.
</div>
