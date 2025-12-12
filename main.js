// ===============================
// NPL-DEVS - MAIN ULTRA
// Sistema completo sem Storage
// ===============================

import { auth, db } from "./firebase.js";
import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import {
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    updateDoc,
    serverTimestamp,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

let currentUser = null;

// ===============================
// VERIFICAR LOGIN
// ===============================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUser = user;
    console.log("User ativo:", user.uid);

    initTabs();
    loadUsers();
    loadColetivo();
    listenNotifications();
});

// ===============================
// LOGOUT
// ===============================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    signOut(auth);
});

// ===============================
// SISTEMA DE TABS
// ===============================
function initTabs() {
    const buttons = document.querySelectorAll(".tabBtn");
    const contents = document.querySelectorAll(".tabContent");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");

            const tab = btn.dataset.tab;
            document.getElementById(tab).classList.add("active");
        });
    });
}
// ===============================
// CHAT COLETIVO
// ===============================
const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const sendMsgBtn = document.getElementById("sendMsgBtn");

// Carregar mensagens em tempo real
function loadColetivo() {
    const msgRef = collection(db, "messages");

    onSnapshot(msgRef, (snapshot) => {
        messagesDiv.innerHTML = "";

        snapshot.docs
            .sort((a, b) => a.data().timestamp - b.data().timestamp)
            .forEach((docSnap, index) => {
                const msg = docSnap.data();
                const el = document.createElement("div");
                el.className = "message";

                el.innerHTML = `
                    <b>${msg.username}</b>: ${msg.text}
                    <div class="reactions" id="react-${docSnap.id}"></div>
                `;

                messagesDiv.appendChild(el);

                createReactions("messages", docSnap.id, msg, index);
            });
    });
}

// Enviar mensagem coletiva
sendMsgBtn?.addEventListener("click", async () => {
    if (!msgInput.value.trim()) return;

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const username = userDoc.data().username;

    await addDoc(collection(db, "messages"), {
        userId: currentUser.uid,
        username,
        text: msgInput.value,
        timestamp: serverTimestamp(),
        reactions: {}
    });

    msgInput.value = "";
});

// ===================================
// Reações
// ===================================
function createReactions(type, messageId, msg, index) {
    const container = document.getElementById(`react-${messageId}`);
    container.innerHTML = "";

    const reacts = ["👍", "❤️", "🔥", "😎"];

    reacts.forEach(reaction => {
        const btn = document.createElement("button");
        btn.className = "reactionBtn";
        btn.innerText = reaction;

        const list = msg.reactions?.[reaction] || [];

        if (list.includes(currentUser.uid)) {
            btn.classList.add("active");
        }

        btn.addEventListener("click", () =>
            toggleReaction(type, messageId, reaction)
        );

        container.appendChild(btn);
    });
}

// Ativar ou remover reação
async function toggleReaction(collectionName, msgId, reaction) {
    const ref = doc(db, collectionName, msgId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    let msg = snap.data();
    msg.reactions = msg.reactions || {};
    msg.reactions[reaction] = msg.reactions[reaction] || [];

    if (msg.reactions[reaction].includes(currentUser.uid)) {
        msg.reactions[reaction] = msg.reactions[reaction].filter(
            uid => uid !== currentUser.uid
        );
    } else {
        msg.reactions[reaction].push(currentUser.uid);
    }

    await updateDoc(ref, { reactions: msg.reactions });
}


// ===============================
// LISTA DE USUÁRIOS PARA CHAT PRIVADO
// ===============================
async function loadUsers() {
    const usersRef = collection(db, "users");
    const select = document.getElementById("privateSelect");

    onSnapshot(usersRef, (snapshot) => {
        select.innerHTML = '<option value="">Selecionar usuário</option>';

        snapshot.docs.forEach(u => {
            if (u.id !== currentUser.uid) {
                const op = document.createElement("option");
                op.value = u.id;
                op.textContent = u.data().username;
                select.appendChild(op);
            }
        });
    });
}

// ===============================
// CHAT PRIVADO
// ===============================
let activeChat = null;

const privateSelect = document.getElementById("privateSelect");
const privateInput = document.getElementById("privateMsg");
const privateBtn = document.getElementById("sendPrivateBtn");
const privateMessages = document.getElementById("privateMessages");

privateSelect?.addEventListener("change", (e) => {
    activeChat = e.target.value;
    loadPrivateMessages();
});

function getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
}

function loadPrivateMessages() {
    if (!activeChat) return;

    const chatId = getChatId(currentUser.uid, activeChat);
    const chatRef = doc(db, "private_chats", chatId);

    onSnapshot(chatRef, (snap) => {
        privateMessages.innerHTML = "";

        if (!snap.exists()) return;

        snap.data().messages.forEach(msg => {
            const el = document.createElement("div");
            el.className = "message";
            el.innerHTML = `<b>${msg.sender === currentUser.uid ? "Você" : msg.username}</b>: ${msg.text}`;
            privateMessages.appendChild(el);
        });
    });
}

// Enviar mensagem privada
privateBtn?.addEventListener("click", async () => {
    if (!privateInput.value.trim() || !activeChat) return;

    const chatId = getChatId(currentUser.uid, activeChat);
    const chatRef = doc(db, "private_chats", chatId);
    const snap = await getDoc(chatRef);

    if (!snap.exists()) {
        await setDoc(chatRef, {
            members: [currentUser.uid, activeChat],
            messages: []
        });
    }

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));

    await updateDoc(chatRef, {
        messages: arrayUnion({
            sender: currentUser.uid,
            username: userDoc.data().username,
            text: privateInput.value,
            timestamp: Date.now()
        })
    });

    privateInput.value = "";
});

// ===============================
// NOTIFICAÇÕES
// ===============================
function listenNotifications() {
    const notifCount = document.getElementById("notifCount");
    const notifList = document.getElementById("notifList");

    const notifRef = collection(db, "notifications");

    onSnapshot(notifRef, (snap) => {
        notifList.innerHTML = "";

        const list = snap.docs.filter(n =>
            n.data().to === currentUser.uid && !n.data().read
        );

        notifCount.innerText = list.length;

        list.forEach(n => {
            const el = document.createElement("div");
            el.className = "message";
            el.innerText = n.data().text;
            notifList.appendChild(el);
        });
    });
}
