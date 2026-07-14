<div align="center">

# 🍔 Fast & Foodious
### Realtime Token-Based Canteen Ordering System

Order food. Pay instantly. Track it live — no page refresh, ever.

[![Made with Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Bootstrap-563D7C?logo=bootstrap&logoColor=white)](#)
[![Payments](https://img.shields.io/badge/Payments-UPI%20%7C%20Razorpay-00BAF2)](#)
[![Status](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)](#-live-demo)

[Live Demo](#-live-demo) • [Features](#-features) • [Tech Stack](#-tech-stack) • [How It Works](#-how-it-works) • [Setup](#-getting-started)

</div>

---

## 📖 About

**Fast & Foodious** is a realtime canteen ordering web app built for a college food court. Students order and pay (Cash or UPI) from their phone, an atomic token number is generated instantly, and staff verify payments and manage the order lifecycle — all synced live with **zero page refreshes**.

It's more than a menu — it bundles dietary filtering, an emergency meal subsidy for students in need, and a staff-side verification dashboard into one lightweight, auth-free system.

## 🚀 Live Demo

| Page | Link |
|---|---|
| 🏠 Home | [fastfoodius-81742.web.app](https://fastfoodius-81742.web.app) |
| 🎓 Student Ordering | [/student.html](https://fastfoodius-81742.web.app/student.html) |
| 👨‍🍳 Staff Dashboard | [/staff.html](https://fastfoodius-81742.web.app/staff.html) |

## ✨ Features

### 🎓 For Students
- 📋 **Category-based menu** — Snacks, Juices, and Lunch, switchable without reload
- 🥗 **Dietary & health-safe filtering** — Vegan, No Dairy, Diabetic-Friendly tags
- 🧾 **Live bill generation** with itemized breakdown
- 📸 **Downloadable bill screenshot** (via `html2canvas`)
- 💛 **Emergency Nutrition Support** — donate ₹5 at checkout, or activate Support Mode for a one-time ₹30 discount (session-limited, never exceeds bill total)
- 💳 **Cash or UPI payment** — UPI generates a deep link that opens GPay/PhonePe with amount, merchant, and token pre-filled
- 🔴 **Live order & payment status** — Unpaid → Pending Verification → Verified

### 👨‍🍳 For Staff
- ✅ **Payment verification dashboard** — confirm UPI payments received against the token number
- 🔁 **Order lifecycle controls** — Prepare → Serve → Delete
- 📜 **Served order history**, clearable on demand
- ⚡ **Realtime sync** across every connected device via Firebase listeners

### 🏗️ Under the Hood
- 🔢 **Atomic token counter** using Firebase `runTransaction()` — no duplicate tokens, ever, even under concurrent orders
- 🔄 **Realtime Database structure** for `/orders` and `/servedOrders`
- 🔐 Session-based logic for one-time discount usage (no login required — demo-friendly)

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML, CSS, JavaScript, Bootstrap |
| **Realtime Data** | Firebase Realtime Database |
| **Hosting** | Firebase Hosting |
| **Backend (optional API)** | Node.js, Express 5, Firebase Admin SDK |
| **Payments** | UPI Deep Link Integration, Razorpay |
| **Utilities** | `html2canvas` (bill screenshots), `dotenv`, `cors` |

## 🔍 How It Works

```
Student places order
        │
        ▼
Atomic token assigned (Firebase runTransaction)
        │
        ▼
Order written to /orders  ──────────────► Staff dashboard (realtime listener)
        │                                         │
        ▼                                         ▼
Payment Modal (Cash / UPI)              Verifies payment → status: "Verified"
        │                                         │
        ▼                                         ▼
paymentStatus updates in Firebase ◄───── Order moves through Pending → Prepared → Served
        │
        ▼
Served orders archived to /servedOrders
```

Each order document stores: `items`, `total`, `token`, `time`, `status`, `donationAmount`, `supportUsed`, `discountAmount`, `paymentMethod`, `paymentStatus`.

## 📂 Project Structure

```
fastfoodius/
├── public/                 # Static frontend (Firebase Hosting root)
│   ├── index.html          # Landing page
│   ├── student.html/.css/.js   # Student ordering interface
│   ├── staff.html/.css/.js     # Staff verification dashboard
│   ├── signin.html / signup.html
│   ├── images/              # Menu item images
│   └── sounds/               # Order alert sounds
├── backend/                 # Optional Express API layer
│   ├── server.js
│   ├── controllers/orderController.js
│   ├── routes/orderRoutes.js
│   └── firebase.js
└── firebase.json            # Firebase Hosting config
```

## ⚙️ Getting Started

### Prerequisites
- Node.js installed
- A Firebase project with Realtime Database enabled

### 1. Clone the repo
```bash
git clone https://github.com/MD-NABEEL-T/fastfoodius.git
cd fastfoodius
```

### 2. Set up the frontend (Firebase Hosting)
- Add your Firebase config to `public/firebase-config.js`
- Deploy with:
```bash
firebase deploy
```

### 3. (Optional) Run the backend API
```bash
cd backend
npm install
```
Create a `.env` file with your Firebase Admin and Razorpay credentials, then:
```bash
npm start
```

## 🎯 What This Project Demonstrates

- Realtime database architecture with atomic transactions
- UPI deep-link payment integration
- Manual payment verification workflow
- Social-impact subsidy logic (emergency meal support)
- Health-aware menu filtering
- Live, auth-free multi-dashboard synchronization

## 🔐 Security Note

This build is optimized for demo/showcase purposes:
- Firebase rules are currently open for testing
- UPI ID handling and Firebase rule locking should be hardened before any production/public deployment

## 👤 Author

**Mohammed Nabeel T**
GitHub: [@MD-NABEEL-T](https://github.com/MD-NABEEL-T)

---

<div align="center">
Made with 🍔, ⚡ Firebase, and a lot of debugging.
</div>