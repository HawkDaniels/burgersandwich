/* BurgerOS BS Messenger.
   A BurgerOS version of chat.html: it talks to the same chat server (set
   messenger.server in content.js) so it looks and behaves like the other apps. */
(function () {
"use strict";
var OS = window.BurgerOS;

OS.addStyle("messenger", [
  ".bsm { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #c0c0c0; }",
  ".bsm [hidden] { display: none !important; }",
  ".bsm .msgwrap { flex: 1; min-height: 0; position: relative; display: flex; margin: 2px 2px 4px; }",
  ".bsm .messages { flex: 1; min-height: 0; overflow-y: auto; margin: 0; padding: 4px 6px; background: #fff;",
  "  border: 2px solid; border-color: #808080 #fff #fff #808080; box-shadow: inset 1px 1px 0 #000;",
  "  font: 15px/1.3 'Times New Roman', Times, serif; overflow-wrap: anywhere; word-break: break-word;",
  "  user-select: text; -webkit-user-select: text; }",
  ".bsm .messages .id { display: none; color: #808080; font: 11px Tahoma, Verdana, sans-serif; margin-right: 4px; }",
  ".bsm.admin .messages .id { display: inline; }",
  ".bsm .messages .time { color: #6b6b6b; font: 11px Tahoma, Verdana, sans-serif; margin-right: 5px; white-space: nowrap; }",
  ".bsm .messages .name { font-weight: bold; }",
  ".bsm .messages .mention { background: #ffffcc; box-shadow: inset 3px 0 0 #e0c000; margin: 0 -6px; padding: 0 6px 0 9px; }",
  ".bsm .earlierRow { text-align: center; padding: 2px 0 6px; }",
  ".bsm .earlier { padding: 2px 12px; font-size: 11px; }",
  ".bsm .earlier:disabled { color: #6b6b6b; cursor: default; }",
  ".bsm .jump { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 3; padding: 3px 14px; white-space: nowrap; font-size: 12px; }",
  ".bsm .panel { position: absolute; left: 6px; right: 6px; top: 6px; z-index: 4; max-height: calc(100% - 12px); display: flex; flex-direction: column; padding: 3px;",
  "  background: #c0c0c0; border: 2px solid; border-color: #fff #000 #000 #fff;",
  "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 2px 2px 0 rgba(0,0,0,0.3); }",
  ".bsm .ptitle { display: flex; align-items: center; gap: 4px; padding: 1px 2px 1px 5px; background: linear-gradient(90deg, #000080, #1084d0); color: #fff; font-weight: bold; }",
  ".bsm .panelTitle { flex: 1; min-width: 0; }",
  ".bsm .panelClose { padding: 0 7px; line-height: 16px; font-size: 13px; }",
  ".bsm .panelBody { overflow-y: auto; margin-top: 3px; padding: 4px 6px; background: #fff; border: 2px solid; border-color: #808080 #fff #fff #808080;",
  "  box-shadow: inset 1px 1px 0 #000; font: 13px/1.4 Tahoma, Verdana, sans-serif; user-select: text; -webkit-user-select: text; }",
  ".bsm .panelBody div { white-space: pre-wrap; overflow-wrap: anywhere; }",
  ".bsm .panelBody .head { font-weight: bold; margin-top: 8px; }",
  ".bsm .panelBody .head:first-child { margin-top: 0; }",
  ".bsm form { display: grid; grid-template-columns: auto 130px 1fr auto; gap: 4px; padding: 4px 2px; align-items: stretch;",
  "  border-top: 1px solid #808080; box-shadow: inset 0 1px #fff; margin: 0; }",
  ".bsm .colorwrap { position: relative; display: flex; }",
  ".bsm input { -webkit-appearance: none; appearance: none; border-radius: 0; width: 100%; min-width: 0; font: 15px 'Times New Roman', Times, serif;",
  "  border: 2px solid; border-color: #808080 #fff #fff #808080; box-shadow: inset 1px 1px 0 #000; padding: 3px 4px; background: #fff; color: #000;",
  "  user-select: text; -webkit-user-select: text; }",
  ".bsm input:focus { outline: none; }",
  ".bsm input[readonly] { background: #ece9d8; color: #333; }",
  ".bsm button { -webkit-appearance: none; appearance: none; border-radius: 0; font: bold 12px Tahoma, Verdana, sans-serif; color: #000;",
  "  background: #c0c0c0; padding: 4px 14px; cursor: pointer; border: 2px solid; border-color: #fff #000 #000 #fff;",
  "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080; }",
  ".bsm button:active { border-color: #000 #fff #fff #000; box-shadow: inset 1px 1px 0 #808080; }",
  ".bsm button:focus-visible { outline: 1px dotted #000; outline-offset: -4px; }",
  ".bsm .colorbtn { padding: 3px 5px; display: flex; align-items: center; justify-content: center; min-width: 30px; }",
  ".bsm .colorChip { display: block; width: 16px; height: 16px; border: 1px solid #000; }",
  ".bsm .palette { position: absolute; bottom: calc(100% + 4px); left: 0; z-index: 5; display: grid; grid-template-columns: repeat(7, 22px); gap: 3px; padding: 5px;",
  "  background: #c0c0c0; border: 2px solid; border-color: #fff #000 #000 #fff;",
  "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 2px 2px 0 rgba(0,0,0,0.3); }",
  ".bsm .swatch { width: 22px; height: 22px; padding: 0; box-shadow: none; border: 2px solid; border-color: #808080 #fff #fff #808080; }",
  ".bsm .swatch.selected { outline: 2px solid #000; outline-offset: 1px; }",
  ".bsm .foot { display: flex; align-items: center; gap: 6px; padding: 0 2px 2px; }",
  ".bsm .status { flex: 1; min-width: 0; color: #444; min-height: 18px; padding: 2px 4px; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080;",
  "  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
  ".bsm .onlinewrap { position: relative; flex: none; }",
  ".bsm .onlineBtn { padding: 1px 8px; font-size: 11px; white-space: nowrap; }",
  ".bsm .onlinelist { position: absolute; right: 0; bottom: calc(100% + 4px); z-index: 5; min-width: 150px; max-width: 260px; max-height: 300px; overflow-y: auto;",
  "  padding: 4px; background: #c0c0c0; border: 2px solid; border-color: #fff #000 #000 #fff;",
  "  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 2px 2px 0 rgba(0,0,0,0.3); }",
  ".bsm .onlinelist h2 { margin: 0 0 3px; padding: 1px 4px; font: bold 11px Tahoma, Verdana, sans-serif; color: #fff; background: linear-gradient(90deg, #000080, #1084d0); }",
  ".bsm .onlinelist ul { list-style: none; margin: 0; padding: 2px 4px; background: #fff; border: 2px solid; border-color: #808080 #fff #fff #808080; box-shadow: inset 1px 1px 0 #000; }",
  ".bsm .onlinelist li { padding: 1px 0; overflow-wrap: anywhere; font: 13px Tahoma, Verdana, sans-serif; }",
  ".bsm .onlinelist li.admin { font-weight: bold; }",
  ".bsm .onlinelist li.none { color: #6b6b6b; }"
].join("\n"));

OS.registerApp("messenger", {
  open: function () {
    var cfg = OS.content.messenger || {};
    var TITLE = cfg.title || "BS Messenger";
    var CHAT_SERVER = cfg.server == null ? "" : String(cfg.server);

    var win = OS.openWindow({ title: TITLE, icon: "chat", width: 640, height: 480 });
    var root = document.createElement("div");
    root.className = "bsm";
    root.innerHTML =
      '<div class="msgwrap">' +
        '<div class="messages" role="log" aria-live="polite"></div>' +
        '<button type="button" class="jump" hidden>Jump to new message</button>' +
        '<div class="panel" role="dialog" aria-label="Command output" hidden>' +
          '<div class="ptitle"><span class="panelTitle"></span><button type="button" class="panelClose" aria-label="Close">&times;</button></div>' +
          '<div class="panelBody"></div>' +
        '</div>' +
      '</div>' +
      '<form autocomplete="off">' +
        '<div class="colorwrap"><button type="button" class="colorbtn" title="Name color"><span class="colorChip"></span></button>' +
          '<div class="palette" hidden></div></div>' +
        '<input class="nameIn" placeholder="Screen name" aria-label="Screen name" autocomplete="off" spellcheck="false">' +
        '<input class="textIn" maxlength="500" placeholder="Type a message" aria-label="Message" autocomplete="off">' +
        '<button type="submit">Send</button>' +
      '</form>' +
      '<div class="foot"><div class="status" role="status"></div>' +
        '<div class="onlinewrap"><button type="button" class="onlineBtn" title="Who is online">Online: –</button>' +
        '<div class="onlinelist" hidden></div></div></div>';
    win.body.appendChild(root);
    var $ = function (s) { return root.querySelector(s); };

    var list = $(".messages"), nameInput = $(".nameIn"), textInput = $(".textIn"), statusEl = $(".status");
    var colorWrap = $(".colorwrap"), colorBtn = $(".colorbtn"), colorChip = $(".colorChip"), paletteEl = $(".palette");
    var onlineWrap = $(".onlinewrap"), onlineBtn = $(".onlineBtn"), onlineList = $(".onlinelist");
    var jumpBtn = $(".jump"), panelEl = $(".panel"), panelTitle = $(".panelTitle"), panelBody = $(".panelBody"), formEl = $("form");
    var closed = false;
    function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

    // ---- unread count in the title while the window isn't in front ----
    var unread = 0;
    function inFront() { return !win.hidden && !win.el.classList.contains("inactive"); }
    function updateTitle() { win.setTitle((unread ? "(" + unread + ") " : "") + TITLE); }
    win.onFocus = function () { if (unread) { unread = 0; updateTitle(); } };
    function noteIncoming(m, mention) {
      if (inFront() || isOwn(m)) return;
      unread++;
      updateTitle();
      if (mention) OS.notify({ title: TITLE, icon: "chat", text: m.name + ": " + m.text, onClick: function () { win.show(); } });
    }

    // ---- local output window (/help, /users ...) ----
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
    root.addEventListener("pointerdown", function (e) {
      if (!panelEl.contains(e.target) && !formEl.contains(e.target)) hidePanel();
      if (!colorWrap.contains(e.target)) setPaletteOpen(false);
      if (!onlineWrap.contains(e.target)) setOnlineOpen(false);
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { hidePanel(); setPaletteOpen(false); setOnlineOpen(false); }
    });

    var MAX_NAME = 16, MAX_ROWS = 300, FALLBACK_COLOR = "#000000";
    function safeColor(c) { return typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? c : FALLBACK_COLOR; }
    function rowEl(id) { return list.querySelector('.row[data-id="' + Number(id) + '"]'); }

    // ---- scrolling ----
    function nearBottom() { return list.scrollHeight - list.scrollTop - list.clientHeight < 40; }
    var stick = true, unseen = 0;
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

    // ---- account and screen name ----
    var account = null;
    function fitName(v) { return Array.from(String(v).replace(/@/g, "")).slice(0, MAX_NAME).join(""); }
    nameInput.value = fitName(store("chatName") || "");
    function saveName() {
      if (account) return;
      var v = fitName(nameInput.value).trim();
      if (v) store("chatName", v);
    }
    if (!nameInput.value) nameInput.value = "burger" + Math.floor(100 + Math.random() * 900);
    saveName();
    function trimName() { var v = fitName(nameInput.value); if (v !== nameInput.value) nameInput.value = v; }
    nameInput.addEventListener("input", function (e) { if (!e.isComposing) { trimName(); saveName(); } });
    nameInput.addEventListener("compositionend", function () { trimName(); saveName(); });
    nameInput.addEventListener("change", function () { saveName(); sendName(); });
    nameInput.addEventListener("blur", function () { sendName(); });

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
    var palette = [], adminColor = "#ff0000", isAdmin = false, savedColor = null;
    var sc = store("chatColor");
    if (/^#[0-9a-f]{6}$/i.test(sc || "")) savedColor = sc.toLowerCase();
    var color = savedColor || FALLBACK_COLOR;
    function updateChip() { colorChip.style.background = color; }
    function setPaletteOpen(open) { paletteEl.hidden = !open; }
    function renderPalette() {
      paletteEl.textContent = "";
      palette.forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "swatch" + (c.hex === color ? " selected" : "");
        b.style.background = safeColor(c.hex);
        b.title = c.name;
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
        var pool = palette.filter(function (c) { return c.hex !== "#000000"; });
        var from = pool.length ? pool : palette;
        savedColor = from[Math.floor(Math.random() * from.length)].hex;
        store("chatColor", savedColor);
        if (!isAdmin) color = savedColor;
      }
      renderPalette(); updateChip();
    }
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
    var onlineUsers = [], onlineCount = null;
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
    function setOnlineOpen(open) { onlineList.hidden = !open; if (open) setPaletteOpen(false); }
    onlineBtn.addEventListener("click", function () { setOnlineOpen(onlineList.hidden); });
    renderOnline();

    // ---- status line ----
    var connected = false, locked = false, slowMs = 0, serverOutdated = false, flashText = "", flashTimer;
    function fmtMs(ms) {
      if (ms >= 120000) return Math.round(ms / 60000) + " min";
      if (ms >= 1000) return (ms / 1000).toFixed(ms % 1000 ? 1 : 0) + " s";
      return ms + " ms";
    }
    function renderStatus() {
      statusEl.textContent =
        flashText ||
        (!connected ? "Connecting..." :
         locked ? "Chat is temporarily locked." :
         slowMs ? "Slow mode: one message every " + fmtMs(slowMs) + "." :
         serverOutdated ? "Name colors are unavailable: the chat server needs the latest update." : "Connected");
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
      var first = list.children[1];
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
      earlierRow.after(frag);
      list.scrollTop = top + (list.scrollHeight - height);
      hasMore = !!more;
      loadingEarlier = false;
      updateEarlier();
    }

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
      var t = timeEl(m.ts);
      [id, t, who, body].forEach(function (x) { if (x) row.append(x); });
      return row;
    }
    function add(m) {
      var follow = nearBottom();
      list.append(buildRow(m));
      if (follow) {
        while (rowCount() > MAX_ROWS) { list.children[1].remove(); hasMore = true; }
        updateEarlier();
        list.scrollTop = list.scrollHeight;
      } else if (!isOwn(m)) {
        unseen++;
        updateJump();
      }
    }
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

    // ---- saved copy of the newest messages (shown straight away next time) ----
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
        noteIncoming(m.message, mentionsMe(m.message));
      } else if (m.type === "delete") {
        var ids = (m.ids || [m.id]).map(Number);
        ids.forEach(function (id) { var el = rowEl(id); if (el) el.remove(); });
        cache = cache.filter(function (c) { return ids.indexOf(c.id) < 0; });
        cacheVer = Number(m.ver) || cacheVer; saveCache();
      } else if (m.type === "ok") {
        if (textInput.value.trim() === lastSent) textInput.value = "";
        jumpToBottom();
      } else if (m.type === "rejected") {
        if (m.reason === "locked") { locked = true; renderStatus(); flash("Chat is locked. Message not sent."); }
        else if (m.reason === "command") flash("Messages can't start with /.");
        else if (m.reason === "name") flash("Enter a screen name.");
        else if (m.reason === "filter") flash("Your message contains a word that isn't allowed. Message not sent.");
        else if (m.wait > 0) flash("Slow down: wait " + fmtMs(Math.ceil(m.wait / 100) * 100) + " before sending again.");
        else flash("You're sending too fast. Message not sent.");
      } else if (m.type === "lock") {
        locked = !!m.locked; renderStatus();
      } else if (m.type === "cmd") {
        flash(m.text, 6000);
      } else if (m.type === "auth") {
        setAccount(m.account);
        setAdmin(!!m.admin);
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
    function reconnectNow() {
      retry = 0;
      if (ws && ws.readyState <= 1) { try { ws.close(); } catch (e) {} }
      else connect();
    }
    var bc = null;
    try { bc = new BroadcastChannel("site-auth"); bc.onmessage = reconnectNow; } catch (e) {}
    win.listen(window, "storage", function (e) { if (e.key === "siteAuthPing") reconnectNow(); });

    function connect() {
      clearTimeout(reconnectTimer);
      if (closed || (ws && ws.readyState <= 1)) return;
      var since = cache.length ? "?after=" + cache[cache.length - 1].id + "&ver=" + cacheVer : "";
      var sock;
      try { sock = new WebSocket(wsUrl() + since); }
      catch (e) { markDown(); scheduleReconnect(Math.min(1000 * Math.pow(2, retry++), 15000)); return; }
      ws = sock;
      sock.onopen = function () { retry = 0; lastAlive = Date.now(); connected = true; renderStatus(); sendName(); };
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
    function dropAndReconnect() {
      var old = ws;
      ws = null;
      if (old) { old.onopen = old.onmessage = old.onclose = null; try { old.close(); } catch (e) {} }
      markDown();
      retry = 0;
      scheduleReconnect(0);
    }
    function checkAlive() {
      if (closed) return;
      if (!ws || ws.readyState >= 2) { retry = 0; connect(); return; }
      if (ws.readyState === 0) return;
      var sock = ws, before = lastAlive;
      try { sock.send("ping"); } catch (e) {}
      setTimeout(function () { if (ws === sock && lastAlive === before) dropAndReconnect(); }, 5000);
    }
    win.listen(document, "visibilitychange", function () { if (document.visibilityState === "visible") checkAlive(); });
    win.listen(window, "online", checkAlive);
    var aliveTimer = setInterval(function () { if (document.visibilityState === "visible") checkAlive(); }, 25000);

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

    // Closing the window disconnects
    win.onClose = function () {
      closed = true;
      clearTimeout(reconnectTimer);
      clearTimeout(flashTimer);
      clearTimeout(loadTimer);
      clearInterval(aliveTimer);
      if (bc) try { bc.close(); } catch (e) {}
      if (ws) { ws.onopen = ws.onmessage = ws.onclose = null; try { ws.close(); } catch (e) {} }
    };

    renderStatus();
    loadCache();
    connect();
    textInput.focus();
    return win;
  }
});
})();
