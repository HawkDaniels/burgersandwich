/* chat-client.js: the burgersandwich chat. The one copy of the chat used everywhere:
     /pages/chat.html            the chat page (also embedded by the homepages)
     BurgerOS BS Messenger       homepage/burgeros/apps/messenger.js
   It talks to the chat in the bs-backend Worker at /api/chat on this same site.

   Usage:
     <script src="/chat/chat-client.js"></script>
     var chat = BSChat.mount(someElement, {
       look: "page",                        // "page" (the full-page chat) or "window" (inside a BurgerOS window)
       title: "burgersandwich messenger",   // draws the blue title bar with this text; leave out for none
       server: "",                          // chat server address; "" = this site (see wsUrl below)
       fitViewport: true,                   // full page only: keep the entry row above a phone's keyboard
       autofocus: false,                    // put the cursor in the message box straight away
       onIncoming: function (message, info) {}  // each new message from someone else; info.mention = names you
     });
     chat.close();   // disconnect and stop (BurgerOS calls this when the window closes)
     chat.focus();   // put the cursor in the message box

   The screen name, colour, recent messages and browser id are kept in localStorage (chatName, chatColor,
   chatCache, chatId), so every chat on this site shares them. The login comes from the website's cookie. */
(function () {
  "use strict";
  if (window.BSChat) return;

  // ---------------------------------------------------------------- styles
  // "page" and "window" differ only in the rules marked with .page / .win.
  var CSS = [
    ".bschat { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #c0c0c0; }",
    ".bschat [hidden] { display: none !important; }",
    ".bschat .titlebar { background: linear-gradient(90deg, #000080, #1084d0); color: #fff; font-weight: bold; padding: 3px 6px; }",
    ".bschat .msgwrap { flex: 1; min-height: 0; position: relative; display: flex; }",
    ".bschat.page .msgwrap { margin: 4px; }",
    ".bschat.win .msgwrap { margin: 2px 2px 4px; }",
    ".bschat .messages { flex: 1; min-height: 0; overflow-y: auto; margin: 0; padding: 4px 6px; background: #fff;",
    "  border: 2px solid; border-color: #808080 #fff #fff #808080; box-shadow: inset 1px 1px 0 #000;",
    "  font: 15px/1.3 'Times New Roman', Times, serif; overflow-wrap: anywhere; word-break: break-word; }",
    ".bschat.page .messages { overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }",
    ".bschat.win .messages { user-select: text; -webkit-user-select: text; }", // BurgerOS turns selection off elsewhere
    ".bschat .messages .id { display: none; color: #808080; font: 11px Tahoma, Verdana, sans-serif; margin-right: 4px; }",
    ".bschat.admin .messages .id { display: inline; }",
    ".bschat .messages .time { color: #6b6b6b; font: 11px Tahoma, Verdana, sans-serif; margin-right: 5px; white-space: nowrap; }",
    ".bschat .messages .name { font-weight: bold; }",
    ".bschat .messages .mention { background: #ffffcc; box-shadow: inset 3px 0 0 #e0c000; margin: 0 -6px; padding: 0 6px 0 9px; }",
    // reply to a filtered message, seen only by its sender: bright yellow name (no one can pick it), outlined to stay readable
    ".bschat .messages .warning { background: #ffe4e4; box-shadow: inset 3px 0 0 #c00000; margin: 0 -6px; padding: 0 6px 0 9px; }",
    ".bschat .messages .warning .name { text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }",
    ".bschat .earlierRow { text-align: center; padding: 2px 0 6px; }",
    ".bschat .earlier { padding: 2px 12px; font-size: 11px; }",
    ".bschat .earlier:disabled { color: #6b6b6b; cursor: default; }",
    ".bschat .jump { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 3; padding: 3px 14px; white-space: nowrap; font-size: 12px; }",
    // local-only output window (/help, /users, /filter list, ...): never part of the chat
    ".bschat .panel { position: absolute; left: 6px; right: 6px; top: 6px; z-index: 4; max-height: calc(100% - 12px); display: flex; flex-direction: column; padding: 3px;",
    "  background: #c0c0c0; border: 2px solid; border-color: #fff #000 #000 #fff;",
    "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 2px 2px 0 rgba(0, 0, 0, 0.3); }",
    ".bschat .ptitle { display: flex; align-items: center; gap: 4px; padding: 1px 2px 1px 5px; background: linear-gradient(90deg, #000080, #1084d0); color: #fff; font-weight: bold; }",
    ".bschat .panelTitle { flex: 1; min-width: 0; }",
    ".bschat .panelClose { padding: 0 7px; line-height: 16px; font-size: 13px; }",
    ".bschat .panelBody { overflow-y: auto; margin-top: 3px; padding: 4px 6px; background: #fff; border: 2px solid; border-color: #808080 #fff #fff #808080;",
    "  box-shadow: inset 1px 1px 0 #000; font: 13px/1.4 Tahoma, Verdana, sans-serif; }",
    ".bschat.page .panelBody { overscroll-behavior: contain; }",
    ".bschat.win .panelBody { user-select: text; -webkit-user-select: text; }",
    ".bschat .panelBody div { white-space: pre-wrap; overflow-wrap: anywhere; }",
    ".bschat .panelBody .head { font-weight: bold; margin-top: 8px; }",
    ".bschat .panelBody .head:first-child { margin-top: 0; }",
    // entry row: [colour] [name] [message ........] [Send]
    ".bschat form { display: grid; grid-template-columns: auto 130px 1fr auto; grid-template-areas: 'color name text send'; gap: 4px; align-items: stretch; margin: 0; }",
    ".bschat.page form { padding: 4px; border-top: 2px solid #fff; }",
    ".bschat.win form { padding: 4px 2px; border-top: 1px solid #808080; box-shadow: inset 0 1px #fff; }",
    ".bschat .colorwrap { grid-area: color; position: relative; display: flex; }",
    ".bschat .nameIn { grid-area: name; }",
    ".bschat .textIn { grid-area: text; }",
    ".bschat .send { grid-area: send; }",
    ".bschat input { -webkit-appearance: none; appearance: none; border-radius: 0; width: 100%; min-width: 0;",
    "  border: 2px solid; border-color: #808080 #fff #fff #808080; box-shadow: inset 1px 1px 0 #000; padding: 3px 4px; background: #fff; color: #000; }",
    ".bschat.win input { user-select: text; -webkit-user-select: text; }",
    ".bschat.page input { font: 16px 'Times New Roman', Times, serif; }", // 16px stops iOS zooming in on focus
    ".bschat.win input { font: 15px 'Times New Roman', Times, serif; }",
    ".bschat input:focus, .bschat input:focus-visible { outline: none; }",
    ".bschat input[readonly] { background: #ece9d8; color: #333; }",
    ".bschat button { -webkit-appearance: none; appearance: none; border-radius: 0; font: bold 12px Tahoma, Verdana, sans-serif; color: #000;",
    "  background: #c0c0c0; padding: 4px 14px; cursor: pointer; border: 2px solid; border-color: #fff #000 #000 #fff;",
    "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080; }",
    ".bschat button:active { border-color: #000 #fff #fff #000; box-shadow: inset 1px 1px 0 #808080; }",
    ".bschat.page button:focus-visible { outline: 2px dotted #000; outline-offset: 1px; }",
    ".bschat.win button:focus-visible { outline: 1px dotted #000; outline-offset: -4px; }",
    // name colour picker
    ".bschat .colorbtn { padding: 3px 5px; display: flex; align-items: center; justify-content: center; min-width: 30px; }",
    ".bschat .colorChip { display: block; width: 16px; height: 16px; border: 1px solid #000; }",
    ".bschat .palette { position: absolute; bottom: calc(100% + 4px); left: 0; z-index: 5; display: grid; grid-template-columns: repeat(7, 22px); gap: 3px; padding: 5px;",
    "  background: #c0c0c0; border: 2px solid; border-color: #fff #000 #000 #fff;",
    "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 2px 2px 0 rgba(0, 0, 0, 0.3); }",
    ".bschat .swatch { width: 22px; height: 22px; padding: 0; box-shadow: none; border: 2px solid; border-color: #808080 #fff #fff #808080; }",
    ".bschat .swatch.selected { outline: 2px solid #000; outline-offset: 1px; }",
    // status line and online count
    ".bschat .foot { display: flex; align-items: center; gap: 6px; }",
    ".bschat.page .foot { padding: 0 6px 4px; }",
    ".bschat.win .foot { padding: 0 2px 2px; }",
    ".bschat .status { flex: 1; min-width: 0; color: #444; }",
    ".bschat.page .status { min-height: 16px; }",
    ".bschat.win .status { min-height: 18px; padding: 2px 4px; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".bschat .onlinewrap { position: relative; flex: none; }",
    ".bschat .onlineBtn { padding: 1px 8px; font-size: 11px; white-space: nowrap; }",
    ".bschat .onlinelist { position: absolute; right: 0; bottom: calc(100% + 4px); z-index: 5; min-width: 150px; overflow-y: auto;",
    "  padding: 4px; background: #c0c0c0; border: 2px solid; border-color: #fff #000 #000 #fff;",
    "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 2px 2px 0 rgba(0, 0, 0, 0.3); }",
    ".bschat.page .onlinelist { max-width: min(260px, 80vw); max-height: 40vh; overscroll-behavior: contain; }",
    ".bschat.win .onlinelist { max-width: 260px; max-height: 300px; }",
    ".bschat .onlinelist h2 { margin: 0 0 3px; padding: 1px 4px; font: bold 11px Tahoma, Verdana, sans-serif; color: #fff; background: linear-gradient(90deg, #000080, #1084d0); }",
    ".bschat .onlinelist ul { list-style: none; margin: 0; padding: 2px 4px; background: #fff; border: 2px solid; border-color: #808080 #fff #fff #808080; box-shadow: inset 1px 1px 0 #000; }",
    ".bschat .onlinelist li { padding: 1px 0; overflow-wrap: anywhere; font: 13px Tahoma, Verdana, sans-serif; }",
    ".bschat .onlinelist li.admin { font-weight: bold; }",
    ".bschat .onlinelist li.none { color: #6b6b6b; }",
    // full page on a phone: two rows (colour + name, then message + Send), and bigger tap targets on touch screens
    "@media (max-width: 540px) {",
    "  .bschat.page form { grid-template-columns: auto 1fr auto; grid-template-areas: 'color name name' 'text text send'; }",
    "}",
    "@media (pointer: coarse) {",
    "  .bschat.page input, .bschat.page button { min-height: 38px; }",
    "  .bschat.page .onlineBtn, .bschat.page .earlier, .bschat.page .panelClose { min-height: 30px; }",
    "  .bschat.page .palette { grid-template-columns: repeat(7, 32px); gap: 4px; }",
    "  .bschat.page .swatch { width: 32px; height: 32px; min-height: 0; }",
    "  .bschat.page .messages { font-size: 16px; }",
    "}",
  ].join("\n");

  function addStyle() {
    if (document.getElementById("bschat-style")) return;
    var s = document.createElement("style");
    s.id = "bschat-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var HTML =
    '<div class="msgwrap">' +
      '<div class="messages" role="log" aria-live="polite"></div>' +
      '<button type="button" class="jump" hidden>Jump to new message</button>' +
      '<div class="panel" role="dialog" aria-label="Command output" hidden>' +
        '<div class="ptitle"><span class="panelTitle"></span><button type="button" class="panelClose" aria-label="Close">&times;</button></div>' +
        '<div class="panelBody"></div>' +
      '</div>' +
    '</div>' +
    '<form autocomplete="off">' +
      '<div class="colorwrap">' +
        '<button type="button" class="colorbtn" title="Name color" aria-label="Choose name color" aria-haspopup="true" aria-expanded="false"><span class="colorChip"></span></button>' +
        '<div class="palette" hidden></div>' +
      '</div>' +
      '<input class="nameIn" placeholder="Screen name" aria-label="Screen name" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">' +
      '<input class="textIn" maxlength="500" placeholder="Type a message" aria-label="Message" autocomplete="off" enterkeyhint="send">' +
      '<button type="submit" class="send">Send</button>' +
    '</form>' +
    '<div class="foot">' +
      '<div class="status" role="status" aria-live="polite"></div>' +
      '<div class="onlinewrap">' +
        '<button type="button" class="onlineBtn" aria-haspopup="true" aria-expanded="false" title="Who is online">Online: –</button>' +
        '<div class="onlinelist" role="region" aria-label="People online" hidden></div>' +
      '</div>' +
    '</div>';

  // Where the chat server is, when no address is given: this same site (burgersandwich.jp/api/chat, the
  // bs-backend Worker). On the live site that is the only right answer: the login cookie only belongs to
  // burgersandwich.jp. When testing locally (Live Server), connect straight to the local backend
  // (npm run dev in bs-backend, port 8787), which sees the local login cookie.
  function defaultServer() {
    return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? "http://" + location.hostname + ":8787" : "";
  }

  function mount(host, opts) {
    opts = opts || {};
    addStyle();
    var look = opts.look === "window" ? "window" : "page";
    var CHAT_SERVER = opts.server ? String(opts.server) : defaultServer();
    var onIncoming = typeof opts.onIncoming === "function" ? opts.onIncoming : null;

    var root = document.createElement("div");
    root.className = "bschat " + (look === "window" ? "win" : "page");
    root.innerHTML = (opts.title ? '<div class="titlebar"></div>' : "") + HTML;
    if (opts.title) root.querySelector(".titlebar").textContent = String(opts.title);
    host.appendChild(root);
    var $ = function (s) { return root.querySelector(s); };

    var list = $(".messages"), nameInput = $(".nameIn"), textInput = $(".textIn"), statusEl = $(".status");
    var colorWrap = $(".colorwrap"), colorBtn = $(".colorbtn"), colorChip = $(".colorChip"), paletteEl = $(".palette");
    var onlineWrap = $(".onlinewrap"), onlineBtn = $(".onlineBtn"), onlineList = $(".onlinelist");
    var jumpBtn = $(".jump"), panelEl = $(".panel"), panelTitle = $(".panelTitle"), panelBody = $(".panelBody"), formEl = $("form");

    var closed = false;
    var cleanups = [];
    function listen(target, type, fn, o) {
      target.addEventListener(type, fn, o);
      cleanups.push(function () { target.removeEventListener(type, fn, o); });
    }
    function store(k, v) {
      try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
    }

    // ---- local output window: only the person who ran the command sees it ----
    // /logs arrives in pieces; when all are in, save them as a CSV file.
    var logParts = {};
    function receiveLogs(m) {
      if (!m || typeof m.id !== "string" || !Number.isInteger(m.part) || !Number.isInteger(m.parts) || m.parts < 1 || m.parts > 500) return;
      var e = logParts[m.id] || (logParts[m.id] = { parts: [], n: 0 });
      if (e.parts[m.part] === undefined) { e.parts[m.part] = String(m.data); e.n++; }
      if (e.n < m.parts) return;
      delete logParts[m.id];
      var file = String(m.file || "chatlog.csv").replace(/[^A-Za-z0-9._-]/g, "_");
      var blob = new Blob([String.fromCharCode(0xfeff) + e.parts.join("\n")], { type: "text/csv;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = file;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    }

    function showPanel(title, lines) {
      panelTitle.textContent = String(title || "");
      panelBody.textContent = "";
      (Array.isArray(lines) ? lines : []).forEach(function (line) {
        var d = document.createElement("div");
        if (line && typeof line === "object") { d.className = "head"; d.textContent = String(line.head == null ? "" : line.head); }
        else d.textContent = String(line);
        panelBody.append(d);
      });
      panelBody.scrollTop = 0;
      panelEl.hidden = false;
    }
    function hidePanel() { panelEl.hidden = true; }
    $(".panelClose").addEventListener("click", hidePanel);

    // Clicking elsewhere, or Escape, closes the pop-ups. Typing in the entry row keeps the command window
    // open (so a list stays visible while you type the next command).
    // pointerdown (not click): iOS Safari doesn't deliver click events for taps on plain page areas.
    listen(document, "pointerdown", function (e) {
      if (!panelEl.contains(e.target) && !formEl.contains(e.target)) hidePanel();
      if (!colorWrap.contains(e.target)) setPaletteOpen(false);
      if (!onlineWrap.contains(e.target)) setOnlineOpen(false);
    });
    listen(document, "keydown", function (e) {
      if (e.key === "Escape") { hidePanel(); setPaletteOpen(false); setOnlineOpen(false); }
    });

    var MAX_NAME = 16;
    var MAX_ROWS = 300; // oldest lines are dropped from the page beyond this
    var FALLBACK_COLOR = "#000000";
    function safeColor(c) { return typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? c : FALLBACK_COLOR; }
    function rowEl(id) { return list.querySelector('.row[data-id="' + Number(id) + '"]'); }

    // ---- scrolling ----
    function nearBottom() { return list.scrollHeight - list.scrollTop - list.clientHeight < 40; }
    var stick = true; // true while the reader is at the bottom, so new lines keep it there
    var unseen = 0;   // new messages that arrived while the reader was scrolled up
    function updateJump() {
      jumpBtn.hidden = unseen === 0;
      jumpBtn.textContent = unseen > 1 ? "Jump to new messages (" + unseen + ")" : "Jump to new message";
    }
    function jumpToBottom() { list.scrollTop = list.scrollHeight; stick = true; unseen = 0; updateJump(); }
    jumpBtn.addEventListener("click", jumpToBottom);
    list.addEventListener("scroll", function () {
      stick = nearBottom();
      if (stick && unseen) { unseen = 0; updateJump(); }
    }, { passive: true });

    // ---- keyboard (phones, full page only) ----
    // iOS Safari doesn't shrink the page when the keyboard opens; it pans the visual viewport instead.
    // Pin the page to the visible area so the entry row stays above the keyboard. The page's own CSS uses
    // --app-h / --app-top and body.kb. Skipped inside an iframe, where visualViewport describes the parent page.
    if (opts.fitViewport && window.visualViewport && window.top === window.self) {
      var vv = window.visualViewport;
      var docEl = document.documentElement;
      var fit = function () {
        if (vv.scale > 1.01) return; // pinch-zoomed: leave the layout alone
        docEl.style.setProperty("--app-h", vv.height + "px");
        docEl.style.setProperty("--app-top", vv.offsetTop + "px");
        document.body.classList.toggle("kb", window.innerHeight - vv.height > 120);
        if (stick) list.scrollTop = list.scrollHeight;
      };
      listen(vv, "resize", fit);
      listen(vv, "scroll", fit);
      fit();
    }

    // ---- account: set while logged in; the name box then shows the username and is locked ----
    var account = null;

    // ---- screen name ----
    // "@" marks admin messages, so it can't be typed into a name. Length is counted in whole characters
    // (an emoji is one), which a plain maxlength attribute can't do.
    function nameKey(v) { return String(v == null ? "" : v).normalize("NFC").toLowerCase(); }
    function fitName(v) { return Array.from(String(v).replace(/@/g, "")).slice(0, MAX_NAME).join(""); }
    nameInput.value = fitName(store("chatName") || "");
    // Saved as you type (and once for a newly generated name), not only when a message is sent.
    function saveName() {
      if (account) return; // a logged-in username isn't the saved guest name
      var v = fitName(nameInput.value).trim();
      if (v) store("chatName", v);
    }
    if (!nameInput.value) nameInput.value = "burger" + Math.floor(100 + Math.random() * 900);
    saveName();
    // Not touched mid-composition, so Japanese/Chinese/Korean input keeps working.
    function trimName() { var v = fitName(nameInput.value); if (v !== nameInput.value) nameInput.value = v; }
    nameInput.addEventListener("input", function (e) { if (!e.isComposing) { trimName(); saveName(); } });
    nameInput.addEventListener("compositionend", function () { trimName(); saveName(); });
    nameInput.addEventListener("change", function () { saveName(); sendName(); });
    nameInput.addEventListener("blur", function () { sendName(); });

    // Logged in: show the username and lock the box. Logged out: give back the saved guest name.
    function setAccount(name) {
      var was = account;
      account = name || null;
      if (account) {
        nameInput.value = account;
        nameInput.readOnly = true;
        nameInput.title = "Logged in as " + account + ". Log out on the website to change your name.";
      } else {
        nameInput.readOnly = false;
        nameInput.title = "";
        if (was) {
          nameInput.value = fitName(store("chatName") || "") || "burger" + Math.floor(100 + Math.random() * 900);
          saveName();
          sendName();
        }
      }
    }

    // ---- name colour ----
    var palette = [];          // supplied by the server on connect
    var adminColor = "#ff0000";
    var isAdmin = false;
    var savedColor = null;     // the visitor's own colour, kept across visits (null = none yet)
    var sc = store("chatColor");
    if (/^#[0-9a-f]{6}$/i.test(sc || "")) savedColor = sc.toLowerCase();
    var color = savedColor || FALLBACK_COLOR; // colour used for the next message

    function updateChip() { colorChip.style.background = color; }
    function setPaletteOpen(open) {
      paletteEl.hidden = !open;
      colorBtn.setAttribute("aria-expanded", String(open));
    }
    function renderPalette() {
      paletteEl.textContent = "";
      palette.forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "swatch" + (c.hex === color ? " selected" : "");
        b.style.background = safeColor(c.hex);
        b.title = c.name;
        b.setAttribute("aria-label", c.name);
        b.addEventListener("click", function () { pickColor(c.hex); });
        paletteEl.append(b);
      });
    }
    function pickColor(hex) {
      if (isAdmin) return;
      color = savedColor = hex;
      store("chatColor", hex);
      updateChip(); renderPalette(); setPaletteOpen(false);
    }
    function applyPalette(p, admin) {
      palette = Array.isArray(p) ? p : [];
      adminColor = safeColor(admin || adminColor);
      if (palette.length && !palette.some(function (c) { return c.hex === savedColor; })) {
        // First visit (or a colour that is no longer offered): pick one at random and keep it.
        // Plain black is skipped so the colour looks like it was assigned.
        var pool = palette.filter(function (c) { return c.hex !== "#000000"; });
        var from = pool.length ? pool : palette;
        savedColor = from[Math.floor(Math.random() * from.length)].hex;
        store("chatColor", savedColor);
        if (!isAdmin) color = savedColor;
      }
      renderPalette(); updateChip();
    }
    // Admins are always bright red. Logging out restores the colour they had before.
    function setAdmin(on) {
      if (on === isAdmin) return;
      isAdmin = on;
      root.classList.toggle("admin", on);
      color = on ? adminColor : savedColor || FALLBACK_COLOR;
      colorBtn.title = on ? "Admin names are always red" : "Name color";
      setPaletteOpen(false); updateChip(); renderPalette();
    }
    colorBtn.addEventListener("click", function () {
      if (isAdmin) { flash("Admin names are always red."); return; }
      if (!palette.length) return;
      setPaletteOpen(paletteEl.hidden);
      if (!paletteEl.hidden) setOnlineOpen(false);
    });
    updateChip();

    // ---- online list ----
    var onlineUsers = [], onlineCount = null; // null = unknown (not connected)
    function renderOnline() {
      onlineBtn.textContent = "Online: " + (onlineCount === null ? "–" : onlineCount);
      onlineList.textContent = "";
      var h = document.createElement("h2");
      h.textContent = onlineCount === null ? "Online now" : "Online now (" + onlineCount + ")";
      var ul = document.createElement("ul");
      if (!onlineUsers.length) {
        var li = document.createElement("li");
        li.className = "none";
        li.textContent = onlineCount === null ? "Not connected" : "Nobody yet";
        ul.append(li);
      }
      onlineUsers.forEach(function (u) {
        var li = document.createElement("li");
        if (u.admin) li.className = "admin";
        li.textContent = (u.admin ? "@" : "") + u.name;
        ul.append(li);
      });
      var more = onlineCount === null ? 0 : onlineCount - onlineUsers.length;
      if (more > 0) {
        var li2 = document.createElement("li");
        li2.className = "none";
        li2.textContent = "…and " + more + " more";
        ul.append(li2);
      }
      onlineList.append(h, ul);
    }
    function setOnline(users, count) {
      onlineUsers = Array.isArray(users) ? users : [];
      onlineCount = Number.isInteger(count) ? count : onlineUsers.length;
      renderOnline();
    }
    function setOnlineOpen(open) {
      onlineList.hidden = !open;
      onlineBtn.setAttribute("aria-expanded", String(open));
      if (open) setPaletteOpen(false);
    }
    onlineBtn.addEventListener("click", function () { setOnlineOpen(onlineList.hidden); });
    renderOnline();

    // ---- status line: connection, lock state, and short-lived notices ----
    // The full page stays blank while all is well; the BurgerOS window has a status bar that always says something.
    var TEXT_DOWN = look === "window" ? "Connecting..." : "Connection lost. Reconnecting...";
    var TEXT_UP = look === "window" ? "Connected" : "";
    var connected = false, locked = false, slowMs = 0, serverOutdated = false, flashText = "", flashTimer;
    var ban = null; // { until (null = permanent), reason } while this visitor is banned from posting
    function fmtMs(ms) {
      if (ms >= 120000) return Math.round(ms / 60000) + " min";
      if (ms >= 1000) return (ms / 1000).toFixed(ms % 1000 ? 1 : 0) + " s";
      return ms + " ms";
    }
    // "You're banned from the chat until 4 Nov, 15:00." The time is shown in the visitor's own time zone.
    function banText(until, reason) {
      var when = until == null ? "." : " until " + dateTimeFmt.format(new Date(until)) + ".";
      return "You're banned from the chat" + when + (reason ? " Reason: " + reason : "");
    }
    function activeBan() {
      if (ban && ban.until != null && ban.until <= Date.now()) ban = null; // ran out
      return ban;
    }
    function renderStatus() {
      var b = activeBan();
      statusEl.textContent =
        flashText ||
        (!connected ? TEXT_DOWN :
         b ? banText(b.until, b.reason) :
         locked ? "Chat is temporarily locked." :
         slowMs ? "Slow mode: one message every " + fmtMs(slowMs) + "." :
         serverOutdated ? "Name colors are unavailable: the chat server needs the latest update." : TEXT_UP);
    }
    function flash(text, ms) {
      flashText = text;
      renderStatus();
      clearTimeout(flashTimer);
      flashTimer = setTimeout(function () { flashText = ""; renderStatus(); }, ms || 3000);
    }

    // ---- messages ----
    var timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
    var dateTimeFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    // Today's messages show just the time; older ones also show the date.
    function timeEl(ts) {
      var d = new Date(ts);
      if (typeof ts !== "number" || isNaN(d.getTime())) return null;
      var el = document.createElement("time");
      el.className = "time";
      el.dateTime = d.toISOString();
      el.title = d.toLocaleString();
      el.textContent = d.toDateString() === new Date().toDateString() ? timeFmt.format(d) : dateTimeFmt.format(d);
      return el;
    }

    // "Load earlier messages" link, always the first child of the list.
    var hasMore = false, loadingEarlier = false, loadTimer;
    var earlierRow = document.createElement("div");
    earlierRow.className = "earlierRow";
    earlierRow.hidden = true;
    var earlierBtn = document.createElement("button");
    earlierBtn.type = "button";
    earlierBtn.className = "earlier";
    earlierRow.append(earlierBtn);
    list.append(earlierRow);
    function rowCount() { return list.childElementCount - 1; }
    function updateEarlier() {
      earlierRow.hidden = !hasMore;
      earlierBtn.disabled = loadingEarlier;
      earlierBtn.textContent = loadingEarlier ? "Loading…" : "Load earlier messages";
    }
    earlierBtn.addEventListener("click", function () {
      if (loadingEarlier || !ws || ws.readyState !== 1) return;
      var first = list.querySelector(".row");
      var id = first ? Number(first.dataset.id) : 0;
      if (!id) return;
      loadingEarlier = true;
      updateEarlier();
      clearTimeout(loadTimer);
      loadTimer = setTimeout(function () { loadingEarlier = false; updateEarlier(); }, 5000);
      ws.send(JSON.stringify({ type: "before", id: id }));
    });
    function prependEarlier(messages, more) {
      clearTimeout(loadTimer);
      var frag = document.createDocumentFragment();
      messages.forEach(function (m) { if (!rowEl(m.id)) frag.append(buildRow(m)); });
      var height = list.scrollHeight, top = list.scrollTop;
      list.setAttribute("aria-busy", "true"); // don't make screen readers read the whole backlog
      earlierRow.after(frag);
      list.scrollTop = top + (list.scrollHeight - height); // keep the reader where they were
      list.removeAttribute("aria-busy");
      hasMore = !!more;
      loadingEarlier = false;
      updateEarlier();
    }

    // Does this message mention me? Whole-name match, any capitals; my own messages and
    // very short names (under 3 characters) never count.
    var WORD_CHAR = /[\p{L}\p{N}_]/u;
    function isOwn(m) { return String(m.name).toLowerCase() === fitName(nameInput.value).trim().toLowerCase(); }
    function mentionsMe(m) {
      var me = fitName(nameInput.value).trim().toLowerCase();
      if (Array.from(me).length < 3 || isOwn(m)) return false;
      var text = String(m.text).toLowerCase();
      for (var i = text.indexOf(me); i !== -1; i = text.indexOf(me, i + 1)) {
        var before = Array.from(text.slice(Math.max(0, i - 2), i)).pop() || "";
        var after = Array.from(text.slice(i + me.length, i + me.length + 2))[0] || "";
        if (!WORD_CHAR.test(before) && !WORD_CHAR.test(after)) return true;
      }
      return false;
    }

    function buildRow(m) {
      var row = document.createElement("div");
      row.dataset.id = m.id;
      row.dataset.lname = String(m.name).toLowerCase();
      row.dataset.admin = m.admin ? "1" : "0";
      row.className = mentionsMe(m) ? "row mention" : "row";
      var id = document.createElement("span");
      id.className = "id";
      id.textContent = "#" + m.id;
      var who = document.createElement("span");
      who.className = "name";
      who.style.color = safeColor(m.color);
      who.textContent = (m.admin ? "@" : "") + m.name + ": ";
      var body = document.createElement("span");
      body.textContent = m.text;
      [id, timeEl(m.ts), who, body].forEach(function (x) { if (x) row.append(x); });
      return row;
    }

    // A pretend account's reply to a message that contained a filtered word. Only this person sees it;
    // it is never stored or cached, so it is gone after a reload.
    function showWarning(w) {
      var row = document.createElement("div");
      row.className = "warning";
      row.setAttribute("role", "alert");
      var who = document.createElement("span");
      who.className = "name";
      who.style.color = safeColor(w.color);
      who.textContent = String(w.name) + ": ";
      var body = document.createElement("span");
      body.textContent = String(w.text);
      [timeEl(w.ts), who, body].forEach(function (x) { if (x) row.append(x); });
      list.append(row);
      while (rowCount() > MAX_ROWS) { list.children[1].remove(); hasMore = true; }
      updateEarlier();
      jumpToBottom();
    }

    function add(m) {
      var follow = nearBottom();
      list.append(buildRow(m));
      if (follow) {
        // Only trim the top while the reader is at the bottom, so reading older lines isn't disturbed.
        while (rowCount() > MAX_ROWS) { list.children[1].remove(); hasMore = true; }
        updateEarlier();
        list.scrollTop = list.scrollHeight;
      } else if (!isOwn(m)) {
        unseen++;
        updateJump();
      }
    }

    // A hidden message was restored: put it back in its place (or, if it's older than anything
    // on screen, let "Load earlier messages" find it).
    function insertRestored(m) {
      if (rowEl(m.id)) return;
      var rows = list.querySelectorAll(".row");
      var follow = nearBottom();
      var row = buildRow(m);
      if (!rows.length) list.append(row);
      else if (Number(rows[0].dataset.id) > m.id) { hasMore = true; updateEarlier(); return; }
      else {
        var after = rows[0];
        for (var i = rows.length - 1; i >= 0; i--) if (Number(rows[i].dataset.id) < m.id) { after = rows[i]; break; }
        after.after(row);
      }
      if (follow) list.scrollTop = list.scrollHeight;
    }

    // An admin renamed someone: change the name on everything already on screen.
    function applyRename(oldLower, name) {
      var lower = String(name).toLowerCase();
      list.querySelectorAll(".row").forEach(function (row) {
        if (row.dataset.lname !== oldLower) return;
        row.dataset.lname = lower;
        var who = row.querySelector(".name");
        if (who) who.textContent = (row.dataset.admin === "1" ? "@" : "") + name + ": ";
      });
    }

    function showHistory(messages, more) {
      var frag = document.createDocumentFragment();
      messages.forEach(function (m) { frag.append(buildRow(m)); });
      list.textContent = "";
      list.append(earlierRow, frag);
      hasMore = !!more;
      loadingEarlier = false;
      updateEarlier();
      unseen = 0;
      updateJump();
      list.scrollTop = list.scrollHeight;
      stick = true;
    }

    // ---- saved copy of the newest messages ----
    // The last CACHE_MAX messages are kept in localStorage and shown at once on load. On connecting the
    // chat tells the server the newest id it has; the server sends only newer messages, unless an admin
    // has hidden, restored or renamed anything since (the version number then differs).
    var CACHE_MAX = 100, CACHE_KEY = "chatCache";
    var cache = [], cacheVer = 0, cacheMore = false;
    function saveCache() {
      if (cache.length > CACHE_MAX) { cache = cache.slice(-CACHE_MAX); cacheMore = true; }
      store(CACHE_KEY, JSON.stringify({ v: cacheVer, more: cacheMore, msgs: cache }));
    }
    function slim(m) { return { id: m.id, name: m.name, text: m.text, ts: m.ts, color: m.color, admin: m.admin ? 1 : 0 }; }
    function loadCache() {
      try {
        var o = JSON.parse(store(CACHE_KEY) || "null");
        if (!o || !Array.isArray(o.msgs) || !Number.isSafeInteger(o.v) || o.v < 0) return;
        var ok = o.msgs.every(function (m, i) {
          return m && Number.isSafeInteger(m.id) && m.id > 0 && typeof m.name === "string" &&
            typeof m.text === "string" && isFinite(m.ts) && (i === 0 || o.msgs[i - 1].id < m.id);
        });
        if (!ok || !o.msgs.length) return;
        cache = o.msgs.map(slim); cacheVer = o.v; cacheMore = !!o.more;
        showHistory(cache, cacheMore);
      } catch (e) { cache = []; }
    }
    function cacheAdd(m) { cache.push(slim(m)); saveCache(); }

    // ---- connection ----
    var ws = null, retry = 0, reconnectTimer = null, lastAlive = Date.now(), lastSent = "", nameRetries = 0;

    function markDown() {
      onlineUsers = []; onlineCount = null; renderOnline();
      connected = false;
      flashText = "";
      clearTimeout(flashTimer);
      setAdmin(false);
      renderStatus();
    }
    function scheduleReconnect(ms) {
      clearTimeout(reconnectTimer);
      if (!closed) reconnectTimer = setTimeout(connect, ms);
    }

    function handle(m) {
      if (m.type === "history") {
        serverOutdated = !Array.isArray(m.palette);
        applyPalette(m.palette, m.adminColor);
        cacheVer = Number(m.ver) || 0;
        if (m.incremental) {
          (m.messages || []).forEach(function (msg) {
            if (rowEl(msg.id)) return;
            add(msg); cache.push(slim(msg));
          });
          saveCache();
        } else {
          showHistory(m.messages || [], m.hasMore);
          cache = (m.messages || []).map(slim); cacheMore = !!m.hasMore;
          saveCache();
        }
        setOnline(m.users, m.count);
        locked = !!m.locked;
        slowMs = Number(m.slow) || 0;
        renderStatus();
      } else if (m.type === "earlier") {
        prependEarlier(m.messages || [], m.hasMore);
      } else if (m.type === "nametaken") {
        // That name can't be used: take the free name the server suggests (unless the box has moved on since).
        if (nameKey(m.name) !== nameKey(fitName(nameInput.value).trim())) return;
        if (m.suggestion) { nameInput.value = fitName(m.suggestion); saveName(); }
        var why = m.reason === "blocked" ? "can't be used"
          : m.reason === "reserved" ? "belongs to a registered account (log in on the website to use it)"
          : "is already in use";
        flash('"' + m.name + '" ' + why + ', so you\'re now "' + nameInput.value + '".', 7000);
        if (nameRetries++ < 3) sendName(true);
      } else if (m.type === "presence") {
        setOnline(m.users, m.count);
      } else if (m.type === "message") {
        if (rowEl(m.message.id)) return;
        add(m.message);
        cacheAdd(m.message);
        if (onIncoming && !isOwn(m.message)) {
          try { onIncoming(m.message, { mention: mentionsMe(m.message) }); } catch (e) {}
        }
      } else if (m.type === "delete") {
        var ids = (m.ids || [m.id]).map(Number);
        ids.forEach(function (id) { var el = rowEl(id); if (el) el.remove(); });
        cache = cache.filter(function (c) { return ids.indexOf(c.id) < 0; });
        cacheVer = Number(m.ver) || cacheVer; saveCache();
      } else if (m.type === "ok") {
        if (textInput.value.trim() === lastSent) textInput.value = "";
        jumpToBottom(); // your own message: always show it
      } else if (m.type === "rejected") {
        if (m.reason === "locked") { locked = true; renderStatus(); flash("Chat is locked. Message not sent."); }
        else if (m.reason === "command") flash("Messages can't start with /.");
        else if (m.reason === "name") flash("Enter a screen name.");
        else if (m.reason === "banned") {
          // The status line already says so for as long as the ban lasts (and clears when it's lifted).
          ban = { until: m.until == null ? null : m.until, reason: m.banReason || "" };
          flashText = ""; clearTimeout(flashTimer); renderStatus();
        }
        else if (m.reason === "filter") {
          if (m.warning) showWarning(m.warning);
          else flash("Your message contains a word that isn't allowed. Message not sent.");
        }
        else if (m.wait > 0) flash("Slow down: wait " + fmtMs(Math.ceil(m.wait / 100) * 100) + " before sending again.");
        else flash("You're sending too fast. Message not sent.");
      } else if (m.type === "lock") {
        locked = !!m.locked; renderStatus();
      } else if (m.type === "cmd") {
        flash(m.text, 6000);
      } else if (m.type === "auth") {
        ban = m.banned ? { until: m.banned.until == null ? null : m.banned.until, reason: m.banned.reason || "" } : null;
        setAccount(m.account);
        setAdmin(!!m.admin);
        renderStatus();
      } else if (m.type === "logs") {
        receiveLogs(m);
      } else if (m.type === "panel") {
        showPanel(m.title, m.lines);
      } else if (m.type === "restored") {
        (m.messages || []).forEach(function (msg) {
          insertRestored(msg);
          if (cache.some(function (c) { return c.id === msg.id; })) return;
          if (!cache.length || msg.id > cache[0].id) { cache.push(slim(msg)); cache.sort(function (a, b) { return a.id - b.id; }); }
          else cacheMore = true;
        });
        cacheVer = Number(m.ver) || cacheVer; saveCache();
      } else if (m.type === "renamed") {
        applyRename(m.old, m.name);
        cache.forEach(function (c) { if (c.name.toLowerCase() === m.old) c.name = m.name; });
        cacheVer = Number(m.ver) || cacheVer; saveCache();
      } else if (m.type === "forcename") {
        nameInput.value = fitName(m.name);
        saveName();
        flash('An admin changed your name to "' + nameInput.value + '".', 7000);
      } else if (m.type === "slow") {
        slowMs = Number(m.ms) || 0; renderStatus();
      }
    }

    function wsUrl() {
      var base = CHAT_SERVER.trim().replace(/\/+$/, "");
      if (base) return base.replace(/^http/i, "ws") + "/api/chat";
      return (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/api/chat";
    }

    // ---- follow the website login ----
    // The chat takes its name from the site login. When someone logs in or out in another tab (or the
    // page around this one), reconnect so the server sees the new cookie.
    function reconnectNow() {
      retry = 0;
      if (ws && ws.readyState <= 1) { try { ws.close(); } catch (e) {} }
      else connect();
    }
    var bc = null;
    try { bc = new BroadcastChannel("site-auth"); bc.onmessage = reconnectNow; } catch (e) {}
    listen(window, "storage", function (e) { if (e.key === "siteAuthPing") reconnectNow(); });
    // Coming back to the tab: if the login changed meanwhile (and no message said so), reconnect.
    listen(document, "visibilitychange", function () {
      if (closed || document.visibilityState !== "visible" || typeof fetch !== "function" || CHAT_SERVER.trim()) return;
      fetch("/api/me", { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j) return;
          var who = (j.user || {}).username || null;
          if ((who || "").toLowerCase() !== (account || "").toLowerCase()) reconnectNow();
        })
        .catch(function () {});
    });

    function connect() {
      clearTimeout(reconnectTimer);
      if (closed || (ws && ws.readyState <= 1)) return; // closed, or already connecting or open
      var since = cache.length ? "?after=" + cache[cache.length - 1].id + "&ver=" + cacheVer : "";
      var sock;
      try { sock = new WebSocket(wsUrl() + since); }
      catch (e) { markDown(); scheduleReconnect(Math.min(1000 * Math.pow(2, retry++), 15000)); return; }
      ws = sock;
      // While a login is showing, wait for the server's "auth" (sent straight after connecting) before giving a
      // name: after a logout elsewhere the box still shows the account name, which a guest may not use.
      sock.onopen = function () { retry = 0; lastAlive = Date.now(); connected = true; renderStatus(); if (!account) sendName(); };
      sock.onmessage = function (e) {
        lastAlive = Date.now();
        if (e.data === "pong") return;
        var m;
        try { m = JSON.parse(e.data); } catch (err) { return; }
        handle(m);
      };
      sock.onclose = function () {
        if (ws !== sock) return;
        markDown();
        scheduleReconnect(Math.min(1000 * Math.pow(2, retry++), 15000));
      };
    }

    // Throw away a socket we believe is dead and open a fresh one straight away.
    function dropAndReconnect() {
      var old = ws;
      ws = null;
      if (old) { old.onopen = old.onmessage = old.onclose = null; try { old.close(); } catch (e) {} }
      markDown();
      retry = 0;
      scheduleReconnect(0);
    }

    // Phones freeze or silently kill sockets when the tab is backgrounded or the screen locks, and the
    // page may never get a "close" event. Ping, and reconnect if nothing comes back.
    function checkAlive() {
      if (closed) return;
      if (!ws || ws.readyState >= 2) { retry = 0; connect(); return; }
      if (ws.readyState === 0) return;
      var sock = ws, before = lastAlive;
      try { sock.send("ping"); } catch (e) {}
      setTimeout(function () { if (ws === sock && lastAlive === before) dropAndReconnect(); }, 5000);
    }
    listen(document, "visibilitychange", function () { if (document.visibilityState === "visible") checkAlive(); });
    listen(window, "pageshow", function (e) { if (e.persisted) checkAlive(); });
    listen(window, "online", checkAlive);
    var aliveTimer = setInterval(function () { if (document.visibilityState === "visible") checkAlive(); }, 25000);

    // The server lists connected people by screen name, so it needs to be told ours. A random id kept in
    // this browser lets the server tell your own tabs (allowed to share a name) from someone else who
    // picked the same name (not allowed).
    var clientId = store("chatId");
    if (!/^[0-9a-f]{16,64}$/.test(clientId || "")) {
      var bytes = new Uint8Array(16);
      if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
      else for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      clientId = Array.from(bytes, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      store("chatId", clientId);
    }
    function sendName(auto) {
      if (!auto) nameRetries = 0;
      if (!ws || ws.readyState !== 1) return;
      var name = fitName(nameInput.value).trim();
      if (name) { try { ws.send(JSON.stringify({ type: "name", name: name, cid: clientId })); } catch (e) {} }
    }

    // ---- sending ----
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = fitName(nameInput.value).trim();
      var text = textInput.value.trim();
      if (!text || !ws || ws.readyState !== 1) return;
      // Anything starting with "/" is a command and is never posted as a chat message.
      // The box is cleared immediately so a token doesn't stay on screen.
      if (text.charAt(0) === "/") {
        ws.send(JSON.stringify({ type: "command", text: text }));
        textInput.value = "";
        return;
      }
      if (!name) { flash("Enter a screen name."); return; }
      if (!account) store("chatName", name);
      lastSent = text;
      ws.send(JSON.stringify({ name: name, text: text, color: color, cid: clientId }));
      textInput.focus();
    });

    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(reconnectTimer);
      clearTimeout(flashTimer);
      clearTimeout(loadTimer);
      clearInterval(aliveTimer);
      cleanups.forEach(function (f) { try { f(); } catch (e) {} });
      if (bc) { try { bc.close(); } catch (e) {} }
      if (ws) { ws.onopen = ws.onmessage = ws.onclose = null; try { ws.close(); } catch (e) {} }
    }

    renderStatus();
    loadCache();
    connect();
    if (opts.autofocus) textInput.focus();

    return { close: close, focus: function () { textInput.focus(); }, root: root };
  }

  window.BSChat = { mount: mount };
})();
