import { db } from './firebase.js';
import { collection, onSnapshot, query, where }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const users = document.getElementById('users');
const q = query(collection(db,'users'), where('online','==',true));

onSnapshot(q, snap => {
  users.innerHTML='';
  snap.forEach(d=>{
    const u=d.data();
    users.innerHTML+=`<p>${u.username} (${u.role})</p>`;
  });
});

