import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Elementos do HTML
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const errorMsg = document.getElementById("errorMsg");

// LOGIN
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => window.location.href = "chat.html")
            .catch(e => errorMsg.innerText = e.message);
    });
}

// CADASTRO
if (registerBtn) {
    registerBtn.addEventListener("click", () => {
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                // Atualiza nome do usuário
                return updateProfile(userCredential.user, { displayName: name });
            })
            .then(() => window.location.href = "chat.html")
            .catch(e => errorMsg.innerText = e.message);
    });
}
