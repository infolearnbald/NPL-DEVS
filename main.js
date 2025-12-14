import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    collection, addDoc, doc, getDoc,
    updateDoc, arrayUnion, onSnapshot, serverTimestamp, setDoc
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

let currentUser;

// --- AUTH ---
onAuthStateChanged(auth, async user => {
    if (!user) return window.location.href = "index.html";
    currentUser = user;
    loadUsers();
    loadPublicChat();
});

// --- LOGOUT ---
logoutBtn.onclick = () => signOut(auth);

// --- TABS ---
document.querySelectorAll(".tabBtn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tabContent").forEach(t => t.classList.remove("active"));
        document.getElementById(btn.dataset.tab).classList.add("active");
    };
});

/* -------------------------
      CHAT PÚBLICO
-------------------------- */

function loadPublicChat() {
    const ref = collection(db, "messages");
    onSnapshot(ref, snap => {
        messages.innerHTML = "";
        snap.docs.forEach(docSnap => {
            const m = docSnap.data();
            const el = document.createElement("div");
            el.className = "message";
            el.innerHTML = `<b>${m.username}:</b> ${m.text} <div class="reactions"></div>`;
            messages.appendChild(el);

            ["like","love"].forEach(r => {
                const btn = document.createElement("button");
                btn.innerText = r;
                btn.className = "reactionBtn";
                if (m.reactions?.[r]?.includes(currentUser.uid)) btn.classList.add("active");
            });
        });
    });
}

sendMsgBtn.onclick = async () => {
    if (!msg.value.trim()) return;

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    await addDoc(collection(db, "messages"), {
        userId: currentUser.uid,
        username: userDoc.data().username,
        text: msg.value,
        timestamp: serverTimestamp(),
        reactions: {}
    });

    msg.value = "";
};

/* -------------------------
      CHAT PRIVADO
-------------------------- */

async function loadUsers() {
    onSnapshot(collection(db, "users"), snap => {
        privateSelect.innerHTML = "<option value=''>Selecione…</option>";
        snap.docs.forEach(u => {
            if (u.id !== currentUser.uid) {
                let op = document.createElement("option");
                op.value = u.id;
                op.text = u.data().username;
                privateSelect.appendChild(op);
            }
        });
    });
}

privateSelect.onchange = () => openPrivate(privateSelect.value);

function openPrivate(uid2) {
    if (!uid2) return;
    const id = [currentUser.uid, uid2].sort().join("_");
    const ref = doc(db, "private_chats", id);

    onSnapshot(ref, snap => {
        privateMessages.innerHTML = "";
        if (!snap.exists()) return;

        snap.data().messages.forEach(m => {
            let el = document.createElement("div");
            el.className = "message";
            el.innerHTML = `<b>${m.sender === currentUser.uid ? "Você" : m.sender}:</b> ${m.text}`;
            privateMessages.appendChild(el);
        });
    });
}

sendPrivateBtn.onclick = async () => {
    const uid2 = privateSelect.value;
    if (!uid2 || !privateMsg.value.trim()) return;

    const id = [currentUser.uid, uid2].sort().join("_");
    const ref = doc(db, "private_chats", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, { members: [currentUser.uid, uid2], messages: [] });
    }

    await updateDoc(ref, {
        messages: arrayUnion({
            sender: currentUser.uid,
            text: privateMsg.value,
            timestamp: Date.now()
        })
    });

    privateMsg.value = "";
};
