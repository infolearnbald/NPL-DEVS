import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// LOGIN
loginBtn?.addEventListener("click", async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
  location.href = "app.html";
});

// SIGNUP
signupBtn?.addEventListener("click", async () => {
  const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
  await setDoc(doc(db, "users", cred.user.uid), {
    username: username.value,
    role: role.value,
    createdAt: Date.now()
  });
  location.href = "app.html";
});

// RESET
resetBtn?.addEventListener("click", async () => {
  await sendPasswordResetEmail(auth, email.value);
  alert("Email enviado");
});
