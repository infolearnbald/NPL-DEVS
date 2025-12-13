import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from
"https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

export function protect() {
  onAuthStateChanged(auth, user => {
    if (!user) location.href = "index.html";
  });
}

logout?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html";
});
