import { db } from "./firebase.js";
import {
  collection, addDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { auth } from "./firebase.js";

export function renderPublicChat(el) {
  el.innerHTML = `
    <div id="msgs"></div>
    <input id="msg" placeholder="Mensagem pública">
    <button id="send">Enviar</button>
  `;

  const q = query(collection(db, "publicMessages"), orderBy("time"));
  onSnapshot(q, snap => {
    msgs.innerHTML = "";
    snap.forEach(d =>
      msgs.innerHTML += `<p><b>${d.data().user}</b>: ${d.data().text}</p>`
    );
  });

  send.onclick = async () => {
    await addDoc(collection(db, "publicMessages"), {
      text: msg.value,
      user: auth.currentUser.email,
      time: Date.now()
    });
    msg.value = "";
  };
}

