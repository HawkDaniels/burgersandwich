/* BurgerOS BS Messenger.
   The chat itself is /chat/chat-client.js, the same one /pages/chat.html uses; this file only puts it in a
   BurgerOS window (without its own title bar: the window has one) and adds the BurgerOS extras: an unread
   count in the window title and a notification when someone mentions you while the window isn't in front.
   Settings: messenger in content.js. */
(function () {
"use strict";
var OS = window.BurgerOS;
var CLIENT = "/chat/chat-client.js";

// Load the shared chat once, the first time it's needed.
var clientReady = null;
function loadClient() {
  if (window.BSChat) return Promise.resolve();
  if (clientReady) return clientReady;
  clientReady = new Promise(function (resolve, reject) {
    var s = document.createElement("script");
    s.src = CLIENT;
    s.onload = resolve;
    s.onerror = function () { s.remove(); clientReady = null; reject(new Error("Could not load " + CLIENT)); };
    document.head.appendChild(s);
  });
  return clientReady;
}
loadClient().catch(function () {});

OS.registerApp("messenger", {
  open: function () {
    var cfg = OS.content.messenger || {};
    var TITLE = cfg.title || "BS Messenger";

    var win = OS.openWindow({ title: TITLE, icon: "chat", width: 640, height: 480 });
    var chat = null, closed = false;

    // ---- unread count in the title while the window isn't in front ----
    var unread = 0;
    function inFront() { return !win.hidden && !win.el.classList.contains("inactive"); }
    function updateTitle() { win.setTitle((unread ? "(" + unread + ") " : "") + TITLE); }
    win.onFocus = function () { if (unread) { unread = 0; updateTitle(); } };
    function noteIncoming(m, info) {
      if (inFront()) return;
      unread++;
      updateTitle();
      if (info.mention) OS.notify({ title: TITLE, icon: "chat", text: m.name + ": " + m.text, onClick: function () { win.show(); } });
    }

    // Closing the window disconnects
    win.onClose = function () { closed = true; if (chat) chat.close(); };

    loadClient().then(function () {
      if (closed) return;
      chat = window.BSChat.mount(win.body, {
        look: "window",
        server: cfg.server,
        autofocus: true,
        onIncoming: noteIncoming
      });
    }, function () {
      var p = document.createElement("p");
      p.style.cssText = "margin: 12px; font: 12px Tahoma, Verdana, sans-serif;";
      p.textContent = "BS Messenger couldn't load. Check your connection and open it again.";
      win.body.appendChild(p);
    });
    return win;
  }
});
})();
