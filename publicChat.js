import { db, auth } from './firebase.js';
import {
  collection, addDoc, onSnapshot,
  serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const messages = document.getElementById('messages');
const msg = document.getElementById('msg');
const btnSend = document.getElementById('btnSend');

const q = query(collection(db,'publicChat'), orderBy('time'));

onSnapshot(q, snap => {
  messages.innerHTML='';
  snap.forEach(d => {
    messages.innerHTML += `<p>${d.data().text}</p>`;
  });
});

btnSend.onclick = async () => {
  if(!msg.value) return;
  await addDoc(collection(db,'publicChat'), {
    text: msg.value,
    uid: auth.currentUser.uid,
    time: serverTimestamp()
  });
  msg.value='';
};

