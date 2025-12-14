import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrziQM8nHq6h7m5zHnZi3E1w9DwmkeLvI",
  authDomain: "npl-devs.firebaseapp.com",
  projectId: "npl-devs",
  storageBucket: "npl-devs.firebasestorage.app",
  messagingSenderId: "721966132336",
  appId: "1:721966132336:web:8be6df97fe6c9dd41158b5"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);