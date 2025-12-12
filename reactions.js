import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Adicionar ou remover reação
async function toggleReaction(chatType, chatId, messageIndex, reactionType, userId) {
    const chatRef = doc(db, chatType, chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) return;

    const messages = chatSnap.data().messages;
    const msg = messages[messageIndex];
    msg.reactions = msg.reactions || {};
    msg.reactions[reactionType] = msg.reactions[reactionType] || [];

    if (msg.reactions[reactionType].includes(userId)) {
        // remover reação
        msg.reactions[reactionType] = msg.reactions[reactionType].filter(uid => uid !== userId);
    } else {
        // adicionar reação
        msg.reactions[reactionType].push(userId);
    }

    messages[messageIndex] = msg;
    await updateDoc(chatRef, { messages: messages });
}

