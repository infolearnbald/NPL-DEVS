import { auth, db } from "./firebase.js";
import { doc, getDoc, updateDoc }
from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

export async function renderProfile(el) {
  const ref = doc(db, "users", auth.currentUser.uid);
  const data = (await getDoc(ref)).data();

  el.innerHTML = `
    <input id="username" value="${data.username}">
    <input id="cargo" value="${data.cargo || ""}">
    <select id="area">
      <option>frontend</option>
      <option>backend</option>
    </select>
    <button id="save">Salvar</button>
  `;

  save.onclick = async () => {
    await updateDoc(ref, {
      username: username.value,
      cargo: cargo.value,
      area: area.value
    });
    alert("Perfil atualizado");
  };
}
