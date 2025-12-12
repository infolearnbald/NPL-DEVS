import { addDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Criar notificação
async function createNotification(toUid, fromUid, type, title, message) {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
        to: toUid,
        from: fromUid,
        type: type,
        title: title,
        message: message,
        read: false,
        timestamp: serverTimestamp()
    });
}

// Receber notificações em tempo real
function listenNotifications(uid, callback) {
    const notificationsRef = collection(db, "notifications");
    return onSnapshot(notificationsRef, (snapshot) => {
        const userNotifs = snapshot.docs
            .map(doc => doc.data())
            .filter(n => n.to === uid && !n.read);
        callback(userNotifs);
    });
}

