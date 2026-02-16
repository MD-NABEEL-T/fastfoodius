🍔 Fast & Foodious – Realtime Canteen Ordering System

Fast & Foodious is a realtime, token-based canteen ordering web application that allows students to place food orders, make payments (Cash / UPI), and staff to manage and verify them live without page refreshes.

🚀 Tech Live Demo

Home page
🔗 https://fastfoodius-81742.web.app

Student page
🔗 https://fastfoodius-81742.web.app/student.html

Staff page
🔗 https://fastfoodius-81742.web.app/staff.html

🛠 Tech Stack

Frontend: HTML, CSS, JavaScript, Bootstrap

Backend: Firebase Realtime Database

Hosting: Firebase Hosting

Payments: UPI Deep Link Integration

Other Tools: html2canvas (bill screenshot)

🔥 Features & Logic Overview
1️⃣ Landing Page (Home)

Feature:
Displays branding and entry points.

Logic:
Firebase Hosting loads index.html as default entry.

2️⃣ Student Ordering Interface

Feature:
Students can browse and select food quantities.

Logic:
+ / - buttons dynamically update quantity fields using JS event listeners.

3️⃣ Category Tabs (Snacks / Juices / Lunch)

Feature:
Switch categories without page reload.

Logic:
Bootstrap tabs dynamically toggle content.

4️⃣ Dietary & Health-Safe Filtering 🥗

Feature:
Students can filter menu items based on dietary needs:

Vegan (No Egg / No Non-Veg)

No Dairy

Diabetic Friendly (Low Sugar)

Logic:
Each menu item contains data-tags.
JavaScript hides items based on exclusion filtering.

5️⃣ Generate Bill System

Feature:
Creates real-time bill summary.

Logic:
Loops through menu items → calculates price × quantity → builds ordered list dynamically.

6️⃣ Bill Modal + Screenshot

Feature:
Shows breakdown + allows screenshot download.

Logic:

Bootstrap modal

html2canvas converts DOM → image

7️⃣ Emergency Nutrition Support 💛 (Social Impact Feature)
Contribution

Students can donate ₹5 during checkout

Donation stored inside order object

Redemption

Student activates “Support Mode”

₹30 discount applied automatically

Limited to one use per session

Discount never exceeds bill total

Logic:

Session-based restriction using sessionStorage

Discount tracked via discountAmount

Order stores supportUsed

8️⃣ Atomic Token System

Feature:
Every order receives a unique increasing token number.

Logic:
Firebase runTransaction() increments counters/nextToken.

9️⃣ Realtime Order Storage

Orders are stored in:

/orders


Each order includes:

items
total
token
time
status
donationAmount
supportUsed
discountAmount
paymentMethod
paymentStatus

🔟 Payment System (Cash + UPI)

After confirming order, a Payment Modal appears.

Option 1: Cash

Sets paymentMethod = "Cash"

Sets paymentStatus = "Pending Verification"

Option 2: UPI

Generates dynamic UPI deep link:

upi://pay?pa=<upiId>&pn=<merchant>&am=<amount>&tn=Token-XX


Opens GPay / PhonePe on mobile

Auto-fills:

Amount

Merchant Name

Token number in note

Logic:
Payment method and status stored in Firebase.

1️⃣1️⃣ Payment Status Tracking

Each order has:

paymentMethod
paymentStatus


Possible statuses:

Unpaid

Pending Verification

Verified

1️⃣2️⃣ Staff Payment Verification System

Staff dashboard shows:

Payment status badge

"Verify Payment" button

Workflow:

Student pays via UPI

Staff receives payment with token in note

Staff clicks “Verify Payment”

Status updates to "Verified"

Realtime sync updates student view instantly.

1️⃣3️⃣ Order Lifecycle Tracking

Order states:

Pending → Prepared → Served

Staff controls:

Prepare

Serve

Delete

1️⃣4️⃣ Served Order History

Served orders move to:

/servedOrders


Staff can clear history.

1️⃣5️⃣ Realtime Sync

Firebase onValue() listeners update:

Student dashboard

Staff dashboard

No page refresh required.

1️⃣6️⃣ Session-Based Memory

Orders linked via session token storage

One support use per session

No authentication required (demo mode)

1️⃣7️⃣ Firebase Hosting

Static files in public/ deployed using:

firebase deploy

1️⃣8️⃣ Development Mode (No Auth)

Firebase rules currently open for demo/testing.

Authentication + rule locking can be added later.

🎯 What This Project Demonstrates

✔ Realtime database architecture
✔ Atomic transactions
✔ Payment integration (UPI deep link)
✔ Manual payment verification system
✔ Social impact subsidy system
✔ Health-aware filtering logic
✔ Live dashboard synchronization
✔ Structured scalable order schema

🔐 Security Note

UPI ID should be stored securely for production.

Firebase rules should be locked before public scaling.

Current build is optimized for demo showcase.

🧾 Summary

Fast & Foodious is a full realtime canteen ordering system with digital payments, staff verification workflow, dietary filtering, and emergency meal support logic — built entirely using Firebase and frontend technologies without authentication.

👤 Author

Mohammed Nabeel T