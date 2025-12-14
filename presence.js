import { auth, db } from './firebase.js';
import { doc, updateDoc, serverTimestamp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, async user => {
  if(!user) return;
  const ref = doc(db,'users',user.uid);
  await updateDoc(ref,{ online:true, lastSeen:serverTimestamp() });
  window.addEventListener('beforeunload', async()=>{
    await updateDoc(ref,{ online:false, lastSeen:serverTimestamp() });
  });
});

