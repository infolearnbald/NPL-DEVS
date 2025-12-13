import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

// LOGIN
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Preencha email e senha");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // 🔥 NÃO redireciona aqui
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

// REDIRECIONAMENTO AUTOMÁTICO
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "app.html";
  }
});
