import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const messagesRef = collection(db, "messages");

onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "login.html";
});

logoutBtn.onclick = () => signOut(auth);

sendBtn.onclick = async () => {
  if (!msg.value) return;
  await addDoc(messagesRef, {
    text: msg.value,
    user: auth.currentUser.email,
    created: serverTimestamp()
  });
  msg.value = "";
};

onSnapshot(messagesRef, snap => {
  messages.innerHTML = "";
  snap.docs.forEach(d => {
    const m = d.data();
    messages.innerHTML += `<p><b>${m.user}</b>: ${m.text}</p>`;
  });
});

