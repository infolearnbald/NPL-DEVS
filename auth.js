import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const email = document.getElementById('email');
const password = document.getElementById('password');
const username = document.getElementById('username');
const role = document.getElementById('role');

document.getElementById('btnRegister').onclick = async () => {
  const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
  await setDoc(doc(db,'users',cred.user.uid), {
    username: username.value,
    role: role.value,
    online: true
  });
  location.href = 'app.html';
};

document.getElementById('btnLogin').onclick = async () => {
  const cred = await signInWithEmailAndPassword(auth, email.value, password.value);
  await updateDoc(doc(db,'users',cred.user.uid), { online:true });
  location.href = 'app.html';
};