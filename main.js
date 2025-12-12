import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, serverTimestamp, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

let currentUser;

// --- DETECTAR PÁGINA ---
const path = window.location.pathname;

// -------------------
// LOGIN / REGISTRO
// -------------------
if (path.includes("index.html") || path === "/") {
    setupLogin();
    setupRegister();
}

function setupLogin() {
    const loginBtn = document.getElementById("loginBtn");
    loginBtn?.addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "chat.html";
        } catch (error) {
            document.getElementById("errorMsg").innerText = error.message;
        }
    });
}

function setupRegister() {
    const registerBtn = document.getElementById("registerBtn");
    registerBtn?.addEventListener("click", async () => {
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        const username = document.getElementById("username").value;
        const photoUrl = document.getElementById("photoUrl")?.value || null;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: email,
                username: username,
                photoUrl: photoUrl,
                createdAt: serverTimestamp()
            });
            window.location.href = "chat.html";
        } catch (error) {
            document.getElementById("errorMsgReg")?.innerText = error.message;
        }
    });
}

// -------------------
// CHAT
// -------------------
if (path.includes("chat.html")) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            initChatElements();
        } else {
            window.location.href = "index.html";
        }
    });
}

// --- FUNÇÃO DE INICIALIZAÇÃO DO CHAT ---
function initChatElements() {
    // LOGOUT
    document.getElementById("logoutBtn")?.addEventListener("click", () => 
        signOut(auth).then(() => window.location.href = "index.html")
    );

    // TABS
    document.querySelectorAll(".tabBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.querySelectorAll(".tabContent").forEach(tc => tc.classList.remove("active"));
            document.getElementById(btn.dataset.tab)?.classList.add("active");
        });
    });

    // CARREGAR USUÁRIOS PARA CHAT PRIVADO
    loadUsers();

    // CHAT COLETIVO
    const messagesRef = collection(db, "messages");
    const messagesDiv = document.getElementById("messages");
    const sendBtn = document.getElementById("sendMsgBtn");
    const msgInput = document.getElementById("msg");

    sendBtn?.addEventListener("click", async () => {
        if (!msgInput.value) return;
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        await addDoc(messagesRef, {
            userId: currentUser.uid,
            username: userDoc.data().username,
            text: msgInput.value,
            fileUrl: null,
            timestamp: serverTimestamp(),
            reactions: {}
        });
        msgInput.value = "";
    });

    onSnapshot(messagesRef, snapshot => {
        if (!messagesDiv) return;
        messagesDiv.innerHTML = "";
        snapshot.docs.forEach((docSnap, idx) => {
            const msg = docSnap.data();
            const msgEl = document.createElement("div");
            msgEl.classList.add("message");
            msgEl.innerHTML = `<b>${msg.username}:</b> ${msg.text}<div class="reactions"></div>`;
            messagesDiv.appendChild(msgEl);

            ["like", "love"].forEach(type => {
                const btn = document.createElement("button");
                btn.innerText = type;
                btn.className = "reactionBtn";
                if (msg.reactions?.[type]?.includes(currentUser.uid)) btn.classList.add("active");
                btn.addEventListener("click", () => toggleReaction("messages", docSnap.id, idx, type));
                msgEl.querySelector(".reactions")?.appendChild(btn);
            });
        });
    });

    // CHAT PRIVADO
    const privateSelect = document.getElementById("privateSelect");
    const privateMessagesDiv = document.getElementById("privateMessages");
    const sendPrivateBtn = document.getElementById("sendPrivateBtn");
    const privateMsgInput = document.getElementById("privateMsg");
    let activePrivateChat = null;

    privateSelect?.addEventListener("change", (e) => {
        activePrivateChat = e.target.value;
        listenPrivateChat(currentUser.uid, activePrivateChat, msgs => {
            if (!privateMessagesDiv) return;
            privateMessagesDiv.innerHTML = "";
            msgs.forEach((msg, idx) => {
                const msgEl = document.createElement("div");
                msgEl.classList.add("message");
                msgEl.innerHTML = `<b>${msg.sender === currentUser.uid ? "Você" : msg.sender}:</b> ${msg.text}<div class="reactions"></div>`;
                privateMessagesDiv.appendChild(msgEl);
                ["like", "love"].forEach(type => {
                    const btn = document.createElement("button");
                    btn.innerText = type;
                    btn.className = "reactionBtn";
                    if (msg.reactions?.[type]?.includes(currentUser.uid)) btn.classList.add("active");
                    btn.addEventListener("click", () => toggleReaction("private_chats", `${[currentUser.uid, activePrivateChat].sort().join("_")}`, idx, type));
                    msgEl.querySelector(".reactions")?.appendChild(btn);
                });
            });
        });
    });

    sendPrivateBtn?.addEventListener("click", async () => {
        if (!privateMsgInput.value || !activePrivateChat) return;
        await sendPrivateMessage(currentUser.uid, activePrivateChat, privateMsgInput.value);
        privateMsgInput.value = "";
    });

    // NOTIFICAÇÕES
    listenNotifications();
}

// -------------------
// FUNÇÕES AUXILIARES
// -------------------
async function toggleReaction(chatType, chatId, messageIndex, reactionType) {
    const chatRef = doc(db, chatType, chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) return;

    const messages = chatSnap.data().messages;
    const msg = messages[messageIndex];
    msg.reactions = msg.reactions || {};
    msg.reactions[reactionType] = msg.reactions[reactionType] || [];

    if (msg.reactions[reactionType].includes(currentUser.uid)) {
        msg.reactions[reactionType] = msg.reactions[reactionType].filter(uid => uid !== currentUser.uid);
    } else {
        msg.reactions[reactionType].push(currentUser.uid);
    }

    messages[messageIndex] = msg;
    await updateDoc(chatRef, { messages });
}

async function loadUsers() {
    const usersRef = collection(db, "users");
    const select = document.getElementById("privateSelect");
    onSnapshot(usersRef, snapshot => {
        if (!select) return;
        select.innerHTML = '<option value="">Selecione um usuário</option>';
        snapshot.docs.forEach(docSnap => {
            if (docSnap.id !== currentUser.uid) {
                const option = document.createElement("option");
                option.value = docSnap.id;
                option.text = docSnap.data().username;
                select.appendChild(option);
            }
        });
    });
}

async function sendPrivateMessage(uid1, uid2, text) {
    const [a, b] = [uid1, uid2].sort();
    const chatId = `${a}_${b}`;
    const chatRef = doc(db, "private_chats", chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
        await setDoc(chatRef, { members: [a, b], messages: [] });
    }
    await updateDoc(chatRef, { messages: arrayUnion({ sender: uid1, text: text, fileUrl: null, timestamp: serverTimestamp(), reactions: {} }) });
}

function listenPrivateChat(uid1, uid2, callback) {
    const [a, b] = [uid1, uid2].sort();
    const chatId = `${a}_${b}`;
    const chatRef = doc(db, "private_chats", chatId);
    return onSnapshot(chatRef, snap => {
        if (snap.exists()) callback(snap.data().messages);
        else callback([]);
    });
}

function listenNotifications() {
    const notifCount = document.getElementById("notifCount");
    const notificationsRef = collection(db, "notifications");
    onSnapshot(notificationsRef, snapshot => {
        if (!notifCount) return;
        const userNotifs = snapshot.docs.filter(doc => doc.data().to === currentUser.uid && !doc.data().read);
        notifCount.innerText = userNotifs.length;
    });
}
