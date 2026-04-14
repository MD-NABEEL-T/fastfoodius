// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js"; 

export const firebaseConfig = {
  apiKey: "AIzaSyD-rfWYy0AAOzLhaVmOAQaYoK_yl1Z8YcY",
  authDomain: "fastfoodius-81742.firebaseapp.com",
  databaseURL: "https://fastfoodius-81742-default-rtdb.firebaseio.com",
  projectId: "fastfoodius-81742",
  storageBucket: "fastfoodius-81742.firebasestorage.app",
  messagingSenderId: "280966787530",
  appId: "1:280966787530:web:809b4e799e4a2ed0739f33"
};

// 🔑 THIS WAS MISSING
const app = initializeApp(firebaseConfig);

// 🔑 Export db correctly
export const db = getDatabase(app);

export const auth = getAuth(app); 


// Debug
console.log("🔥 Firebase initialized", app);