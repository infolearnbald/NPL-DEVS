import { db } from "./firebase.js";
import {
  collection, addDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { auth } from "./firebase.js";

export function renderPrivateChat(el) {
  el.innerHTML = `
    <input id="to" placeholder="Email do usuário">
    <div id="msgs"></div>
    <input id="msg" placeholder="Mensagem privada">
    <button id="send">Enviar</button>
  `;

  onSnapshot(collection(db, "privateMessages"), snap => {
    msgs.innerHTML = "";
    snap.forEach(d => {
      const m = d.data();
      if (
        (m.from === auth.currentUser.email && m.to === to.value) ||
        (m.to === auth.currentUser.email && m.from === to.value)
      ) {
        msgs.innerHTML += `<p>${m.from}: ${m.text}</p>`;
      }
    });
  });

  send.onclick = async () => {
    await addDoc(collection(db, "privateMessages"), {
      from: auth.currentUser.email,
      to: to.value,
      text: msg.value,
      time: Date.now()
    });
    msg.value = "";
  };
}
