import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { setDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// --- LOGIN ---
document.getElementById("loginBtn").onclick = async () => {
    const email = loginEmail.value.trim();
    const pass = loginPass.value.trim();
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        window.location.href = "home.html";
    } catch (e) {
        alert(e.message);
    }
};

// --- CADASTRO ---
document.getElementById("regBtn").onclick = async () => {
    const user = regUsername.value.trim();
    const email = regEmail.value.trim();
    const pass = regPass.value.trim();

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "users", cred.user.uid), {
            username: user,
            email: email,
            createdAt: Date.now()
        });

        window.location.href = "home.html";

    } catch (e) {
        alert(e.message);
    }
};
