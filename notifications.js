import { db } from "./firebase.js";
import { collection, addDoc }
from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

export async function notify(user, text) {
  await addDoc(collection(db, "notifications"), {
    user,
    text,
    time: Date.now()
  });
}
