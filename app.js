import { protect } from "./session.js";
import { renderPublicChat } from "./chat-public.js";
import { renderPrivateChat } from "./chat-private.js";
import { renderProfile } from "./profile.js";
import { renderPlayground } from "./playground.js";

protect();

const view = document.getElementById("view");

document.querySelectorAll("[data-tab]").forEach(btn => {
  btn.onclick = () => {
    const tab = btn.dataset.tab;
    if (tab === "public") renderPublicChat(view);
    if (tab === "private") renderPrivateChat(view);
    if (tab === "profile") renderProfile(view);
    if (tab === "playground") renderPlayground(view);
  };
});
