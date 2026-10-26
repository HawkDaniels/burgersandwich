/* ============================================================
   BurgerOS core
   Window manager, shared save data, unlock checks, quest-system
   sync, the mail model and the built-in programs (folders, Notepad,
   picture viewer, music player, Burger Explorer, Run).

   Content lives in content.js. Mail, Terminal and Burgerfin live in
   apps/ and are only downloaded when needed. No need to edit below.
   ============================================================ */
(function () {
"use strict";

var C = window.BURGER_CONTENT || {};
var CFG = Object.assign({
  startBanner: ["burger", "OS 98"], startIcon: "", startText: "Start",
  desktopColor: "#008080", wallpaper: "", baseDrive: "C:\\", startupOpen: "",
  shutdownLink: "", homePage: "/", browserMaximized: true, browserReuse: true,
  mobileRedirect: "", progressScripts: [], quests: {}, syncTimeout: 4000
}, C.os || {});
C.desktop = C.desktop || [];
C.startMenu = C.startMenu || [];

if (CFG.mobileRedirect && window.matchMedia("(pointer: coarse) and (max-width: 900px)").matches) {
  location.replace(CFG.mobileRedirect);
  return;
}

var BASE = ((document.currentScript && document.currentScript.src) || "").replace(/[^\/]*$/, "");
var APP_FILES = { mail: "apps/mail.js", terminal: "apps/terminal.js", burgerfin: "apps/burgerfin.js", messenger: "apps/messenger.js" };
var APP_ICONS = { mail: "mail", terminal: "terminal", burgerfin: "media", messenger: "chat", explorer: "globe" };
var ALIASES = { bmail: "mail", email: "mail", inbox: "mail", outlook: "mail", cmd: "terminal", term: "terminal",
  bash: "terminal", fin: "burgerfin", jellyfin: "burgerfin", browser: "explorer", internet: "explorer",
  iexplore: "explorer", chat: "messenger", bsmessenger: "messenger", bsm: "messenger", msn: "messenger" };
var BASE_TITLE = document.title;

// ---------- Small helpers ----------
function esc(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function list(v) { return v == null ? [] : Array.isArray(v) ? v : [v]; }
function safe(fn, fallback) {
  try { return fn(); } catch (e) { console.error("[BurgerOS]", e); return fallback; }
}
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = function () { s.remove(); reject(new Error("Could not load " + src)); };
    document.head.appendChild(s);
  });
}
var styles = {};
function addStyle(name, css) {
  if (styles[name]) return;
  var s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
  styles[name] = s;
}

// ---------- Events ----------
// "change"  - flags, quest progress or unlocks may have changed
// "mail"    - anything about the mailbox changed (counts, new mail...)
var handlers = {};
function on(ev, fn) {
  (handlers[ev] = handlers[ev] || []).push(fn);
  return function () { off(ev, fn); };
}
function off(ev, fn) {
  var l = handlers[ev];
  if (l && l.indexOf(fn) >= 0) l.splice(l.indexOf(fn), 1);
}
function emit(ev, data) {
  (handlers[ev] || []).slice().forEach(function (fn) { safe(function () { fn(data); }); });
}
// Many changes in a row become one "change" event
var changeQueued = false;
function changed() {
  if (changeQueued) return;
  changeQueued = true;
  Promise.resolve().then(function () { changeQueued = false; emit("change"); });
}

// ---------- Save data (one key in the visitor's browser) ----------
var KEY = "burgeros";
function freshState() {
  return {
    v: 1,
    flags: {},
    progress: { user: null, achievements: [], quests: {}, items: null, money: null, syncedAt: 0 },
    mail: { read: {}, deleted: {}, purged: {}, sent: [], arrived: {} },
    apps: {}
  };
}
function loadState() {
  var s = freshState(), saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (saved && typeof saved === "object") {
    for (var k in s) if (saved[k] && typeof saved[k] === "object") s[k] = saved[k];
    s.migrated = saved.migrated;
  }
  s.mail = Object.assign(freshState().mail, s.mail);
  s.progress = Object.assign(freshState().progress, s.progress);
  return s;
}
var state = loadState();
var saveTimer = null;
function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}
function save() { if (!saveTimer) saveTimer = setTimeout(flush, 120); }
window.addEventListener("pagehide", flush);
// Another tab changed the save data
window.addEventListener("storage", function (e) {
  if (e.key !== KEY) return;
  state = loadState();
  emit("reload");
  layoutIcons();
  changed();
});

function appState(name) {
  state.apps[name] = state.apps[name] || {};
  return state.apps[name];
}

// One-time import of the old separate pages' saved data
if (!state.migrated) {
  safe(function () {
    var oldMail = JSON.parse(localStorage.getItem("mailState:" + ((C.mail || {}).appName || "Mail")));
    if (oldMail) for (var k in state.mail) if (oldMail[k]) state.mail[k] = oldMail[k];
    var oldFin = JSON.parse(localStorage.getItem("continueWatching:" + ((C.burgerfin || {}).serverName || "BURGERFIN-SERVER")));
    if (Array.isArray(oldFin)) appState("burgerfin").watched = oldFin;
  });
  state.migrated = 1;
  save();
}

// ---------- Progress, unlock checks and effects ----------
function questSteps(id) {
  var s = state.progress.quests[id], p = CFG.quests[id];
  if (!s || !p) return 0;
  var v = s[p.field || "step"];
  if (p.count) return Array.isArray(v) ? v.length : 0;
  return typeof v === "number" ? v : 0;
}
var view = {
  flag: function (n) { return !!state.flags[n]; },
  achievement: function (id) { return state.progress.achievements.indexOf(id) >= 0; },
  quest: function (id) { return state.progress.quests[id] || null; },
  questSteps: questSteps,
  item: function (id) { return (state.progress.items || {})[id] || 0; },
  money: function () { return state.progress.money || 0; },
  user: function () { return state.progress.user; }
};

function check(w) {
  if (!w) return true;
  if (typeof w === "function") return !!safe(function () { return w(view); }, false);
  if (Array.isArray(w)) return w.every(check);
  if (w.any && !list(w.any).some(check)) return false;
  if (w.not && check(w.not)) return false;
  if (w.flag != null && !list(w.flag).every(view.flag)) return false;
  if (w.notFlag != null && list(w.notFlag).some(view.flag)) return false;
  if (w.achievement != null && !list(w.achievement).every(view.achievement)) return false;
  if (w.quest != null) {
    if (!list(w.quest).every(view.quest)) return false;
    if (w.steps != null && !list(w.quest).every(function (q) { return questSteps(q) >= w.steps; })) return false;
  }
  if (w.item != null && !list(w.item).every(function (i) { return view.item(i) > 0; })) return false;
  if (w.loggedIn != null && !!state.progress.user !== !!w.loggedIn) return false;
  if (w.test && !safe(function () { return w.test(view); }, false)) return false;
  return true;
}

function setFlag(name, value) {
  if (value === false) delete state.flags[name];
  else state.flags[name] = Date.now();
  save();
  changed();
}

function runEffects(e) {
  if (!e) return;
  if (Array.isArray(e)) { e.forEach(runEffects); return; }
  if (typeof e === "function") { safe(function () { e(OS); }); return; }
  var dirty = false;
  list(e.flag).forEach(function (f) { if (!state.flags[f]) { state.flags[f] = Date.now(); dirty = true; } });
  list(e.unflag).forEach(function (f) { if (state.flags[f]) { delete state.flags[f]; dirty = true; } });
  if (dirty) { save(); changed(); }
  list(e.event).forEach(reportEvent);
  if (e.open) open(e.open);
  if (e.run) safe(function () { e.run(OS); });
}

function reportEvent(name) {
  var A = window.SiteAccount;
  if (!A || !A.event) return;
  Promise.resolve(A.event(name)).then(function () { sync(); }, function () {});
}

// ---------- Quest system sync ----------
// Saved progress is shown straight away from this browser, then checked
// against the server; the server's answer always wins.
var synced = false, syncing = null, lastSync = 0, syncedOnce = false, defsCache = null;

function questIds() {
  var ids = {};
  Object.keys(CFG.quests).forEach(function (q) { ids[q] = 1; });
  (function scan(v, depth) {
    if (!v || typeof v !== "object" || depth > 12) return;
    if (Array.isArray(v)) { v.forEach(function (x) { scan(x, depth + 1); }); return; }
    if (v.when) list(v.when.quest).forEach(function (q) { ids[q] = 1; });
    if (v.when && v.when.any) scan(v.when.any.map(function (a) { return { when: a }; }), depth + 1);
    if (v.when && v.when.not) scan({ when: v.when.not }, depth + 1);
    for (var k in v) if (k !== "when" && v[k] && typeof v[k] === "object") scan(v[k], depth + 1);
  })(C, 0);
  return Object.keys(ids);
}

function sync() {
  if (syncing) return syncing;
  var A = window.SiteAccount, P = window.SiteProgress, I = window.SiteInventory;
  if (!A || !P) return Promise.resolve(false);
  syncing = (async function () {
    try {
      var me = await A.me();
      if (!me || !me.ok) return false;           // server unreachable: keep what we have
      var next = { user: me.user ? me.user.username : null, achievements: [], quests: {}, items: null, money: null };
      next.achievements = (me.achievements || []).map(function (a) { return a.id; });
      var ids = questIds();
      var loaded = await Promise.all(ids.map(function (id) {
        return Promise.resolve(P.load(id)).catch(function () { return null; });
      }));
      ids.forEach(function (id, i) { if (loaded[i]) next.quests[id] = loaded[i]; });
      if (I && I.get && me.user) {
        var inv = await Promise.resolve(I.get()).catch(function () { return null; });
        if (inv && inv.ok !== false) { next.items = inv.items || {}; next.money = inv.money || 0; }
      }
      var prev = state.progress;
      var before = JSON.stringify([prev.user, prev.achievements, prev.quests, prev.items, prev.money]);
      var after = JSON.stringify([next.user, next.achievements, next.quests, next.items, next.money]);
      next.syncedAt = Date.now();
      if (syncedOnce && next.user === prev.user) {
        announce(next.achievements.filter(function (a) { return prev.achievements.indexOf(a) < 0; }));
      }
      state.progress = next;
      save();
      if (before !== after) changed();
      return true;
    } catch (e) {
      console.warn("[BurgerOS] progress sync failed", e);
      return false;
    }
  })();
  return syncing.then(function (r) {
    syncing = null;
    lastSync = Date.now();
    syncedOnce = true;
    markSynced();
    return r;
  });
}

function markSynced() {
  if (synced) return;
  synced = true;
  changed();
}

async function announce(ids) {
  if (!ids.length) return;
  var titles = ids;
  var A = window.SiteAccount;
  if (A && A.defs) {
    if (!defsCache) defsCache = await Promise.resolve(A.defs()).catch(function () { return null; });
    var defs = (defsCache && defsCache.achievements) || [];
    titles = ids.map(function (id) {
      var d = defs.filter(function (x) { return x.id === id; })[0];
      return d ? d.title : id;
    });
  }
  notify({ title: "Achievement unlocked", text: titles.join(", "), icon: "info" });
}

function bootProgress() {
  var scripts = list(CFG.progressScripts);
  if (!scripts.length) { markSynced(); return; }
  var timer = setTimeout(markSynced, CFG.syncTimeout);
  scripts.reduce(function (p, src) {
    return p.then(function () {
      if (document.querySelector('script[src="' + src + '"]')) return;
      return loadScript(src).catch(function () {});
    });
  }, Promise.resolve()).then(sync).then(function () {
    clearTimeout(timer);
    markSynced();
  });
  // Check again when the visitor comes back to the tab
  function maybeSync() { if (document.visibilityState === "visible" && Date.now() - lastSync > 20000) sync(); }
  document.addEventListener("visibilitychange", maybeSync);
  window.addEventListener("focus", maybeSync);
}

// ---------- Icons ----------
var ICONS = {
  computer: '<rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke="#000"/><rect x="7" y="6" width="18" height="12" fill="#008080"/><rect x="9" y="8" width="8" height="2" fill="#7fd"/><rect x="11" y="21" width="10" height="3" fill="#808080"/><rect x="5" y="24" width="22" height="5" fill="#c0c0c0" stroke="#000"/><rect x="19" y="26" width="5" height="1" fill="#000"/>',
  folder: '<path d="M2 8h10l3 3h15v17H2z" fill="#fc0" stroke="#000"/><path d="M2 13h28" stroke="#c90"/><path d="M3 12h26" stroke="#ffe680"/>',
  globe: '<circle cx="16" cy="16" r="13" fill="#1e6fd9" stroke="#000"/><path d="M11.5 20.3 11.8 20.5 12.9 20.6 14.0 20.4 16.0 20.5 16.3 21.5 17.7 22.2 17.9 22.1 18.6 21.1 19.6 21.3 19.9 21.0 20.4 21.4 20.6 21.2 20.8 20.7 21.0 20.6 21.3 21.1 21.6 21.1 22.3 20.2 22.3 18.5 22.1 17.5 22.5 17.1 22.7 15.6 21.9 14.3 21.7 13.5 21.1 12.8 19.8 12.9 19.5 14.5 19.8 14.9 19.7 15.9 19.3 16.8 18.7 17.5 18.0 17.6 18.0 16.9 17.6 16.8 16.5 18.2 16.0 18.6 13.0 18.5 12.1 19.2 11.5 20.0Z" fill="#3c3"/><path d="M20.2 12.1 21.0 11.4 21.9 11.3 23.6 12.2 25.8 10.9 26.0 10.6 25.3 9.2 24.3 9.4 23.3 8.9 21.1 7.1 20.8 7.0 20.6 7.3 20.7 9.6 20.0 9.5 19.3 10.4 19.7 11.0 19.8 12.0Z" fill="#3c3"/><path d="M10.8 22.7 12.2 23.9 12.9 23.1 13.4 23.5 13.7 23.4 14.2 22.6 13.8 21.8 12.4 21.4 11.4 21.8 10.8 22.3Z" fill="#3c3"/><path d="M8.5 20.8 7.1 21.4 7.0 22.4 7.8 23.3 8.1 24.4 9.0 25.0 9.8 24.4 10.0 22.4 9.5 21.4Z" fill="#3c3"/><circle cx="10.5" cy="9.5" r="2.6" fill="#bdf" opacity=".5"/>',
  chat: '<path d="M12 11h17v11h-3v5l-5-5h-9z" fill="#ffe680" stroke="#000"/><path d="M3 4h18v12H11l-5 5v-5H3z" fill="#fff" stroke="#000"/><rect x="3" y="4" width="18" height="3" fill="#1084d0"/><path d="M3 4h18v12H11l-5 5v-5H3z" fill="none" stroke="#000"/><rect x="7" y="10" width="2" height="2" fill="#000080"/><rect x="11" y="10" width="2" height="2" fill="#000080"/><rect x="15" y="10" width="2" height="2" fill="#000080"/><path d="M17 15h9M17 18h7" stroke="#808080"/>',
  document: '<path d="M6 2h14l6 6v22H6z" fill="#fff" stroke="#000"/><path d="M20 2v6h6" fill="#c0c0c0" stroke="#000"/><path d="M9 13h14M9 17h14M9 21h14M9 25h10" stroke="#000080"/>',
  notepad: '<path d="M6 5h20v25H6z" fill="#fff" stroke="#000"/><rect x="6" y="3" width="20" height="5" fill="#1084d0" stroke="#000"/><path d="M9 12h14M9 16h14M9 20h14M9 24h9" stroke="#808080"/><path d="M9 2v4M13 2v4M17 2v4M21 2v4" stroke="#000"/>',
  recycle: '<path d="M8 9h16l-2 20H10z" fill="#e0e0e0" stroke="#000"/><rect x="6" y="6" width="20" height="3" fill="#c0c0c0" stroke="#000"/><path d="M12 12l1 14M16 12v14M20 12l-1 14" stroke="#808080"/><path d="M13 6V4h6v2" fill="none" stroke="#000"/>',
  image: '<rect x="3" y="5" width="26" height="22" fill="#fff" stroke="#000"/><rect x="5" y="7" width="22" height="18" fill="#9cf"/><circle cx="22" cy="11" r="3" fill="#ff0"/><path d="M5 25l7-9 5 6 4-4 6 7z" fill="#393"/>',
  music: '<path d="M12 6l14-3v18" fill="none" stroke="#000" stroke-width="2"/><path d="M12 6v19" stroke="#000" stroke-width="2"/><ellipse cx="9" cy="25" rx="4" ry="3" fill="#000080"/><ellipse cx="23" cy="21" rx="4" ry="3" fill="#000080"/>',
  mail: '<rect x="3" y="8" width="26" height="18" fill="#fff" stroke="#000"/><path d="M3 8l13 10L29 8" fill="#ffe680" stroke="#000"/><path d="M3 26l10-9M29 26l-10-9" fill="none" stroke="#808080"/>',
  terminal: '<rect x="2" y="4" width="28" height="24" fill="#c0c0c0" stroke="#000"/><rect x="3" y="5" width="26" height="4" fill="#000080"/><rect x="4" y="10" width="24" height="16" fill="#000"/><path d="M7 13l4 3-4 3" fill="none" stroke="#3f3" stroke-width="2"/><rect x="13" y="19" width="7" height="2" fill="#3f3"/>',
  media: '<rect x="3" y="5" width="26" height="18" fill="#101010" stroke="#000"/><circle cx="16" cy="14" r="6" fill="#00a4dc"/><path d="M12 9a6 6 0 0 1 9 1l-5 4z" fill="#aa5cc3"/><path d="M14.5 11v6l5-3z" fill="#fff"/><rect x="12" y="23" width="8" height="2" fill="#808080"/><rect x="8" y="25" width="16" height="3" fill="#c0c0c0" stroke="#000"/>',
  error: '<circle cx="16" cy="16" r="13" fill="#e00" stroke="#600"/><path d="M10 10l12 12M22 10L10 22" stroke="#fff" stroke-width="3.5"/>',
  info: '<path d="M16 3C8 3 3 8 3 14c0 5 3 8 7 10l-2 5 7-4h1c8 0 13-5 13-11S24 3 16 3z" fill="#fff" stroke="#000"/><circle cx="16" cy="9" r="2" fill="#00f"/><rect x="14" y="13" width="4" height="9" fill="#00f"/>',
  warning: '<path d="M16 3l14 25H2z" fill="#ff0" stroke="#000"/><rect x="14.5" y="11" width="3" height="9" fill="#000"/><rect x="14.5" y="22" width="3" height="3" fill="#000"/>',
  help: '<rect x="5" y="3" width="20" height="26" fill="#008080" stroke="#000"/><rect x="25" y="5" width="3" height="24" fill="#fff" stroke="#000"/><text x="15" y="23" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="18" fill="#ff0">?</text>',
  run: '<rect x="3" y="7" width="26" height="18" fill="#c0c0c0" stroke="#000"/><rect x="3" y="7" width="26" height="4" fill="#000080"/><rect x="6" y="15" width="16" height="4" fill="#fff" stroke="#808080"/>',
  shutdown: '<rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke="#000"/><rect x="7" y="6" width="18" height="12" fill="#000"/><rect x="11" y="21" width="10" height="3" fill="#808080"/><rect x="5" y="24" width="22" height="5" fill="#c0c0c0" stroke="#000"/><circle cx="16" cy="12" r="4" fill="none" stroke="#f33" stroke-width="2"/><path d="M16 7v5" stroke="#f33" stroke-width="2"/>',
  start: '<rect x="2" y="3" width="13" height="12" fill="#f33"/><rect x="17" y="3" width="13" height="12" fill="#3c3"/><rect x="2" y="17" width="13" height="12" fill="#36f"/><rect x="17" y="17" width="13" height="12" fill="#fc0"/>'
};
ICONS.warn = ICONS.warning;

// Icons with smooth curved outlines skip pixel-snapping
var SMOOTH_ICONS = { globe: 1 };
function iconHtml(name) {
  var art = ICONS[name];
  if (art) return '<svg viewBox="0 0 32 32"' + (SMOOTH_ICONS[name] ? "" : ' shape-rendering="crispEdges"') + '>' + art + '</svg>';
  return '<img src="' + esc(name) + '" alt="">';
}

var ARROW = {
  back: '<svg class="arrow" viewBox="0 0 20 20"><path d="M1.5 10L9 2.5V7h9.5v6H9v4.5z" stroke-width="1"/></svg>',
  fwd:  '<svg class="arrow" viewBox="0 0 20 20"><path d="M18.5 10L11 2.5V7H1.5v6H11v4.5z" stroke-width="1"/></svg>',
  reload: '<svg viewBox="0 0 20 20"><path d="M16 10a6 6 0 1 1-2-4.5" fill="none" stroke="#1e6fd9" stroke-width="2.5"/><path d="M11 2l5 1-1 5z" fill="#1e6fd9"/></svg>',
  home: '<svg viewBox="0 0 20 20"><path d="M2 10l8-7 8 7" fill="none" stroke="#600" stroke-width="2"/><path d="M4 9v9h4v-5h4v5h4V9l-6-5z" fill="#fc0" stroke="#000"/></svg>',
  out: '<svg viewBox="0 0 20 20"><rect x="2" y="5" width="12" height="12" fill="#fff" stroke="#000"/><path d="M9 11l8-8M12 3h5v5" fill="none" stroke="#000080" stroke-width="2"/></svg>'
};
var BTN_SVG = {
  min: '<svg width="8" height="8" viewBox="0 0 8 8"><rect x="1" y="6" width="6" height="2"/></svg>',
  max: '<svg width="9" height="9" viewBox="0 0 9 9"><path d="M0 0h9v9H0z M1 2v6h7V2z" fill-rule="evenodd"/></svg>',
  close: '<svg width="8" height="7" viewBox="0 0 8 7"><path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5z"/></svg>'
};

// ---------- Items (desktop, folders, Start menu) ----------
function typeOf(item) {
  return item.type || (item.app ? "app" : item.children ? "folder" : item.link ? "link" : "text");
}
function iconName(item) {
  if (item.icon) return item.icon;
  var t = typeOf(item);
  if (t === "app") return APP_ICONS[ALIASES[item.app] || item.app] || "document";
  return { folder: "folder", text: "notepad", dialog: item.dialogIcon || "info", image: "image",
           music: "music", link: "document", run: "run", shutdown: "shutdown" }[t] || "document";
}

var allItems = [];
(function tag(items, parent) {
  items.forEach(function (it) {
    if (it.separator) return;
    it._id = "i" + allItems.length;
    it._parent = parent;
    allItems.push(it);
    if (it.children) tag(it.children, it);
  });
})(C.desktop.concat(C.startMenu), null);

function unlocked(it) {
  return check(it.when) && (!it._parent || unlocked(it._parent));
}
function visibleItems(items) {
  return (items || []).filter(function (it) { return it.separator || check(it.when); });
}
function findByTitle(name) {
  var n = String(name).trim().toLowerCase();
  for (var i = 0; i < allItems.length; i++) {
    var it = allItems[i], t = String(it.title).toLowerCase(), ty = typeOf(it);
    if ((t === n || t.replace(/\.[a-z0-9]+$/, "") === n) && ty !== "run" && ty !== "shutdown" && unlocked(it)) return it;
  }
  return null;
}

function openItem(item) {
  runEffects(item.effects);
  var t = typeOf(item);
  if (t === "link") openLink(item.link);
  else if (t === "app") launch(item.app, item.args);
  else if (t === "folder") openFolder(item);
  else if (t === "text") openNotepad(item);
  else if (t === "dialog") messageBox(item.title, item.text, item.dialogIcon || iconName(item), { id: item._id });
  else if (t === "image") openImage(item);
  else if (t === "music") openMusic(item);
  else if (t === "run") openRun();
  else if (t === "shutdown") shutDown();
  return true;
}

// Open almost anything: an app name, "app:name", a URL or page, or an item title
function open(target, args) {
  if (!target) return false;
  if (typeof target === "object") return openItem(target);
  var t = String(target).trim();
  var m = t.match(/^app:([\w-]+)$/i);
  if (m) return launch(m[1].toLowerCase(), args);
  var low = t.toLowerCase();
  if (APP_FILES[low] || APPS[low] || ALIASES[low]) return launch(low, args);
  var it = findByTitle(t);
  if (it) return openItem(it);
  if (/^(https?:|\/|\.\.?\/|www\.)/i.test(t) || /\.(s?html?|php)([?#]|$)/i.test(t) ||
      /^[^\s\/]+\.[a-z]{2,}(\/|$)/i.test(t)) return openBrowser(t);
  return false;
}

// Links always open in Burger Explorer (or an app, for "app:" links)
function openLink(url, opts) {
  if (!url || url === "#" || /^javascript:/i.test(url)) return false;
  if (/^app:/i.test(url)) return open(url);
  return openBrowser(url, opts);
}

// ---------- Window manager ----------
var wins = {}, zTop = 10, openCount = 0, uid = 0;
var tasksEl = document.getElementById("tasks");
var desktop = document.getElementById("desktop");
var lastPointer = "mouse";
document.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; }, true);

function focusWin(id) {
  for (var k in wins) {
    var w = wins[k], active = k === id && !w.hidden;
    w.el.classList.toggle("inactive", !active);
    w.task.classList.toggle("active", active);
    w.task.classList.toggle("pressed", active);
    w.task.classList.toggle("raised", !active);
  }
  var win = wins[id];
  if (win && !win.hidden) {
    win.el.style.zIndex = ++zTop;
    if (win.onFocus) safe(win.onFocus);
  }
}

function activeId() {
  var best = null, z = -1;
  for (var k in wins) {
    var w = wins[k];
    if (!w.hidden && Number(w.el.style.zIndex) > z) { z = Number(w.el.style.zIndex); best = k; }
  }
  return best;
}

function closeWin(id) {
  var w = wins[id];
  if (!w) return;
  delete wins[id];
  w.closed = true;
  w.cleanups.forEach(function (f) { safe(f); });
  if (w.onClose) safe(w.onClose);
  w.el.remove();
  w.task.remove();
  var next = activeId();
  if (next) focusWin(next);
}

// opts: { id, title, icon, width, height, menubar, status, noMax, noResize,
//         maximized, className, build(body, win) }
function openWindow(o) {
  if (o.id && wins[o.id]) { wins[o.id].show(); return wins[o.id]; }
  var id = o.id || ("w" + (++uid));
  var el = document.createElement("div");
  el.className = "window raised" + (o.className ? " " + o.className : "");
  el.tabIndex = -1;
  var vw = window.innerWidth, vh = window.innerHeight - 30;
  var w = Math.min(o.width || 420, vw - 8);
  var h = o.height ? Math.min(o.height, vh - 8) : null;
  var off = (openCount++ % 8) * 26;
  el.style.width = w + "px";
  if (h) el.style.height = h + "px";
  el.style.left = Math.max(0, Math.min(vw - w, (vw - w) / 2 - 80 + off)) + "px";
  el.style.top = Math.max(0, Math.min(vh - (h || 160), (vh - (h || 160)) / 2 - 60 + off)) + "px";
  el.innerHTML =
    '<div class="titlebar"><span class="tIcon"></span><span class="tText"></span>' +
      (o.noMax ? "" : '<button class="tBtn raised" data-act="min" title="Minimize">' + BTN_SVG.min + '</button>' +
                      '<button class="tBtn raised" data-act="max" title="Maximize">' + BTN_SVG.max + '</button>') +
      '<button class="tBtn raised close" data-act="close" title="Close">' + BTN_SVG.close + '</button></div>' +
    (o.menubar ? '<div class="menubar"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div>' : "") +
    '<div class="wBody"></div>' +
    (o.status != null ? '<div class="statusbar"><div></div></div>' : "") +
    (o.noResize ? "" : '<div class="resizer"></div>');

  var task = document.createElement("button");
  task.className = "taskBtn raised";
  task.innerHTML = '<span class="tkIcon"></span><span class="tkText"></span>';

  var win = {
    id: id, el: el, task: task, body: el.querySelector(".wBody"), hidden: false, closed: false,
    cleanups: [], onClose: null, onFocus: null, onRelaunch: null,
    setTitle: function (t) {
      win.title = t;
      el.querySelector(".tText").textContent = t;
      task.querySelector(".tkText").textContent = t;
      task.title = t;
    },
    setIcon: function (name) {
      win.icon = name;
      el.querySelector(".tIcon").innerHTML = iconHtml(name);
      task.querySelector(".tkIcon").outerHTML = '<span class="tkIcon" style="display:flex">' + iconHtml(name) + '</span>';
    },
    setStatus: function (t) { var s = el.querySelector(".statusbar div"); if (s) s.textContent = t; },
    show: function () { win.hidden = false; el.style.display = ""; focusWin(id); },
    minimize: function () { win.hidden = true; el.style.display = "none"; focusWin(activeId() || ""); },
    close: function () { closeWin(id); },
    toggleMax: function () {
      if (el.classList.contains("maxed")) {
        el.classList.remove("maxed");
        el.style.left = win.prev.left; el.style.top = win.prev.top;
        el.style.width = win.prev.width; el.style.height = win.prev.height;
      } else {
        win.prev = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
        el.classList.add("maxed");
        el.style.left = "0px"; el.style.top = "0px";
        el.style.width = "100%"; el.style.height = "calc(100% - 30px)";
      }
    },
    // Event listeners that are removed again when the window closes
    listen: function (target, type, fn, opt) {
      target.addEventListener(type, fn, opt);
      win.cleanups.push(function () { target.removeEventListener(type, fn, opt); });
    },
    on: function (ev, fn) { win.cleanups.push(on(ev, fn)); }
  };
  el._win = win;
  wins[id] = win;
  win.setTitle(o.title || "");
  win.setIcon(o.icon || "document");
  if (o.status != null) win.setStatus(o.status);

  document.body.insertBefore(el, document.getElementById("taskbar"));
  tasksEl.appendChild(task);
  if (o.build) o.build(win.body, win);
  if (o.maximized && !o.noMax) win.toggleMax();
  focusWin(id);

  el.addEventListener("pointerdown", function () { focusWin(id); });
  var bar = el.querySelector(".titlebar");
  bar.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "close") win.close();
    else if (act === "min") win.minimize();
    else win.toggleMax();
  });
  bar.addEventListener("dblclick", function (e) {
    if (!o.noMax && !e.target.closest("[data-act]")) win.toggleMax();
  });
  task.addEventListener("click", function () {
    if (win.hidden) win.show();
    else if (activeId() === id && !el.classList.contains("inactive")) win.minimize();
    else focusWin(id);
  });
  dragWin(el, bar, false);
  if (!o.noResize) dragWin(el, el.querySelector(".resizer"), true);
  return win;
}

function centerWin(win) {
  var el = win.el;
  el.style.left = Math.max(0, (window.innerWidth - el.offsetWidth) / 2) + "px";
  el.style.top = Math.max(0, (window.innerHeight - 30 - el.offsetHeight) / 2) + "px";
}

// Moving a window by its title bar, or resizing it by the corner
function dragWin(el, handle, resize) {
  handle.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || e.target.closest("[data-act]")) return;
    var maxed = el.classList.contains("maxed");
    if (resize && maxed) return;
    e.preventDefault();
    var sx = e.clientX, sy = e.clientY, r = el.getBoundingClientRect();
    var frames = document.querySelectorAll("iframe");
    for (var i = 0; i < frames.length; i++) frames[i].style.pointerEvents = "none";
    function move(ev) {
      // Dragging a full-screen window's title bar restores it to its normal
      // size under the pointer, then carries on dragging it
      if (maxed) {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 4) return;
        var ratio = (sx - r.left) / r.width, grabY = sy - r.top;
        el._win.toggleMax();
        maxed = false;
        var w = el.offsetWidth;
        r = { left: sx - ratio * w, top: sy - grabY, width: w, height: el.offsetHeight };
      }
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (resize) {
        el.style.width = Math.max(180, r.width + dx) + "px";
        el.style.height = Math.max(90, r.height + dy) + "px";
      } else {
        el.style.left = Math.min(window.innerWidth - 40, Math.max(-r.width + 60, r.left + dx)) + "px";
        el.style.top = Math.min(window.innerHeight - 60, Math.max(0, r.top + dy)) + "px";
      }
    }
    function up() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      for (var i = 0; i < frames.length; i++) frames[i].style.pointerEvents = "";
    }
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  });
}

// Clicking into a page inside Burger Explorer doesn't reach this page,
// so notice the focus moving into the frame instead.
window.addEventListener("blur", function () {
  setTimeout(function () {
    var a = document.activeElement;
    if (!a || a.tagName !== "IFRAME") return;
    var we = a.closest(".window");
    if (we && we._win) focusWin(we._win.id);
    toggleStart(false);
  }, 0);
});

// ---------- Selecting and opening icons ----------
function select(el, scope) {
  var sel = (scope || document).querySelectorAll(".selected");
  for (var i = 0; i < sel.length; i++) sel[i].classList.remove("selected");
  if (el) el.classList.add("selected");
}
// Single click selects, double click opens (single tap on touch screens)
function wireIcons(container, cls, onOpen) {
  var openFn = onOpen || openItem;
  container.addEventListener("click", function (e) {
    var el = e.target.closest("." + cls);
    select(el, container);
    if (el && lastPointer === "touch") openFn(el._item);
  });
  container.addEventListener("dblclick", function (e) {
    var el = e.target.closest("." + cls);
    if (el && lastPointer !== "touch") openFn(el._item);
  });
}

// ---------- Desktop ----------
var deskSig = null;
function renderDesktop() {
  var items = visibleItems(C.desktop);
  var sig = items.map(function (i) { return i._id; }).join(",");
  if (sig === deskSig) return;
  deskSig = sig;
  desktop.innerHTML = "";
  items.forEach(function (it) {
    var el = document.createElement("div");
    el.className = "dIcon";
    el.innerHTML = '<div class="pic">' + iconHtml(iconName(it)) + '</div><div class="label">' + esc(it.title) + '</div>';
    el._item = it;
    desktop.appendChild(el);
  });
  layoutIcons();
}
// Icons sit on a grid. Positions the visitor drags them to are saved in this
// browser; icons that haven't been moved (or are newly unlocked) fill the
// first free cells, top to bottom, left to right.
var GRID = { x: 6, y: 6, w: 80, h: 78 };
function gridSize() {
  return {
    cols: Math.max(1, Math.floor((desktop.clientWidth - GRID.x) / GRID.w)),
    rows: Math.max(1, Math.floor((desktop.clientHeight - 8) / GRID.h))
  };
}
function iconKey(it) { return it.id || it.title; }
function savedPositions() {
  var s = appState("desktop");
  if (!s.pos || typeof s.pos !== "object") s.pos = {};
  return s.pos;
}
function setCell(el, c, r) {
  el._cell = [c, r];
  el.style.left = (GRID.x + c * GRID.w) + "px";
  el.style.top = (GRID.y + r * GRID.h) + "px";
}
function layoutIcons() {
  var icons = Array.prototype.slice.call(desktop.querySelectorAll(".dIcon"));
  var g = gridSize(), pos = savedPositions(), taken = {}, rest = [];
  icons.forEach(function (el) {
    var p = pos[iconKey(el._item)];
    if (p && p[0] < g.cols && p[1] < g.rows && !taken[p[0] + "," + p[1]]) {
      taken[p[0] + "," + p[1]] = 1;
      setCell(el, p[0], p[1]);
    } else rest.push(el);
  });
  var c = 0, r = 0;
  rest.forEach(function (el) {
    while (taken[c + "," + r]) { r++; if (r >= g.rows) { r = 0; c++; } }
    taken[c + "," + r] = 1;
    setCell(el, c, r);
  });
}
// Snap a dropped icon to the nearest free grid cell and remember every
// icon's place, so nothing else shuffles around
function dropIcon(el) {
  var g = gridSize();
  var c = Math.min(g.cols - 1, Math.max(0, Math.round((el.offsetLeft - GRID.x) / GRID.w)));
  var r = Math.min(g.rows - 1, Math.max(0, Math.round((el.offsetTop - GRID.y) / GRID.h)));
  var icons = Array.prototype.slice.call(desktop.querySelectorAll(".dIcon"));
  var taken = {};
  icons.forEach(function (o) { if (o !== el && o._cell) taken[o._cell[0] + "," + o._cell[1]] = 1; });
  if (taken[c + "," + r]) {
    var best = null;
    for (var cc = 0; cc < g.cols; cc++) for (var rr = 0; rr < g.rows; rr++) {
      if (taken[cc + "," + rr]) continue;
      var d = (cc - c) * (cc - c) * GRID.w * GRID.w + (rr - r) * (rr - r) * GRID.h * GRID.h;
      if (!best || d < best[0]) best = [d, cc, rr];
    }
    if (best) { c = best[1]; r = best[2]; } else { c = el._cell[0]; r = el._cell[1]; }
  }
  setCell(el, c, r);
  var pos = savedPositions();
  icons.forEach(function (o) { if (o._cell) pos[iconKey(o._item)] = o._cell.slice(); });
  save();
}
desktop.addEventListener("pointerdown", function (e) {
  if (e.target === desktop) { select(null, desktop); return; }
  var el = e.target.closest(".dIcon");
  if (!el || e.button !== 0) return;
  e.preventDefault();
  var sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop, dragging = false;
  function move(ev) {
    var dx = ev.clientX - sx, dy = ev.clientY - sy;
    if (!dragging) {
      if (Math.abs(dx) + Math.abs(dy) < 5) return;
      dragging = true;
      select(el, desktop);
      el.classList.add("dragging");
    }
    el.style.left = (ox + dx) + "px";
    el.style.top = (oy + dy) + "px";
  }
  function up() {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    if (!dragging) return;
    el.classList.remove("dragging");
    dropIcon(el);
  }
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
});
window.addEventListener("resize", layoutIcons);
wireIcons(desktop, "dIcon");

// ---------- Folder windows (Back / Forward / Address) ----------
var folderCount = 0;
function openFolder(item) {
  for (var k in wins) {
    var f = wins[k].folder;
    if (f && f.history[f.index].item === item) { wins[k].show(); return; }
  }
  var win = openWindow({
    id: "folder" + (folderCount++), title: item.title, icon: iconName(item), width: 460, height: 320,
    menubar: true, status: " ",
    build: function (body) {
      body.innerHTML =
        '<div class="fToolbar">' +
          '<button class="navBtn" data-nav="back" title="Back">' + ARROW.back + '<span>Back</span></button>' +
          '<button class="navBtn" data-nav="fwd" title="Forward">' + ARROW.fwd + '<span>Forward</span></button>' +
          '<div class="fSep"></div>' +
          '<div class="fAddr"><span>Address</span><div class="field sunken"></div></div>' +
        '</div>' +
        '<div class="folderView sunken"></div>';
    }
  });
  win.folder = { history: [{ item: item, addr: addressFor(item, null) }], index: 0 };
  var el = win.el, view = el.querySelector(".folderView");
  view.addEventListener("pointerdown", function (e) { if (e.target === view) select(null, view); });
  wireIcons(view, "fIcon", function (child) {
    if (typeOf(child) === "folder") { runEffects(child.effects); folderGo(win, child); }
    else openItem(child);
  });
  el.querySelector(".fToolbar").addEventListener("click", function (e) {
    var b = e.target.closest("[data-nav]");
    if (b && !b.disabled) folderStep(win, b.getAttribute("data-nav") === "back" ? -1 : 1);
  });
  el.addEventListener("mouseup", function (e) {
    if (e.button === 3) { e.preventDefault(); folderStep(win, -1); }
    if (e.button === 4) { e.preventDefault(); folderStep(win, 1); }
  });
  el.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !/input|textarea/i.test(e.target.tagName)) { e.preventDefault(); folderStep(win, -1); }
  });
  win.on("change", function () { renderFolder(win); });
  renderFolder(win, true);
}

function addressFor(item, parentAddr) {
  if (item.address) return item.address;
  var title = String(item.title).trim();
  var drive = title.match(/^\(?([A-Za-z]):\)?$/);
  if (drive) return drive[1].toUpperCase() + ":\\";
  if (item.icon === "computer") return item.title;
  var base = (parentAddr && /^[A-Za-z]:\\/.test(parentAddr)) ? parentAddr : CFG.baseDrive;
  return base + (/\\$/.test(base) ? "" : "\\") + item.title;
}
function folderGo(win, item) {
  var f = win.folder, here = f.history[f.index];
  f.history = f.history.slice(0, f.index + 1);
  f.history.push({ item: item, addr: addressFor(item, here.addr) });
  f.index++;
  renderFolder(win, true);
}
function folderStep(win, dir) {
  var f = win.folder, next = f.index + dir;
  if (next < 0 || next >= f.history.length) return;
  f.index = next;
  renderFolder(win, true);
}
function renderFolder(win, force) {
  var f = win.folder, entry = f.history[f.index], item = entry.item, el = win.el;
  var kids = visibleItems(item.children);
  var sig = f.index + ":" + kids.map(function (k) { return k._id; }).join(",");
  if (!force && sig === win.folderSig) return;
  win.folderSig = sig;
  var view = el.querySelector(".folderView");
  view.innerHTML = "";
  kids.forEach(function (k) {
    var icon = document.createElement("div");
    icon.className = "fIcon";
    icon.innerHTML = '<div class="pic">' + iconHtml(iconName(k)) + '</div><div class="label">' + esc(k.title) + '</div>';
    icon._item = k;
    view.appendChild(icon);
  });
  if (force) view.scrollTop = 0;
  win.setTitle(item.title);
  win.setIcon(iconName(item));
  el.querySelector(".fAddr .field").innerHTML = iconHtml(iconName(item)) + '<span>' + esc(entry.addr) + '</span>';
  win.setStatus(kids.length + " object(s)");
  el.querySelector('[data-nav="back"]').disabled = f.index === 0;
  el.querySelector('[data-nav="fwd"]').disabled = f.index >= f.history.length - 1;
}

// ---------- Notepad and picture viewer ----------
function openNotepad(item) {
  openWindow({
    id: item._id, title: item.title + " - Notepad", icon: "notepad", width: 460, height: 320, menubar: true,
    build: function (body) {
      body.innerHTML = '<div class="notepadWrap sunken"><textarea class="notepad" spellcheck="false"></textarea></div>';
      body.querySelector("textarea").value = item.text || "";
    }
  });
}
function openImage(item) {
  openWindow({
    id: item._id, title: item.title, icon: "image", width: 520, height: 420,
    build: function (body) {
      body.innerHTML = '<div class="imageView sunken"><img alt=""></div>';
      body.querySelector("img").src = item.src || "";
    }
  });
}

// ---------- Music player ----------
var MP_SVG = {
  play:  '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z"/></svg>',
  pause: '<svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10"/><rect x="7" y="1" width="3" height="10"/></svg>',
  stop:  '<svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8"/></svg>',
  vol:   '<svg width="14" height="12" viewBox="0 0 14 12"><path d="M1 4h3l4-3v10L4 8H1z"/><path d="M10 3.5a3.5 3.5 0 010 5M11.5 1.5a6 6 0 010 9" fill="none" stroke="#000"/></svg>'
};
function mmss(t) {
  if (!isFinite(t) || t < 0) t = 0;
  var m = Math.floor(t / 60), s = Math.floor(t % 60);
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}
function openMusic(item) {
  if (wins[item._id]) { wins[item._id].show(); return; }
  var audio = new Audio();
  audio.preload = "auto";
  audio.loop = !!item.loop;
  audio.src = item.src || "";
  var win = openWindow({
    id: item._id, title: item.title + " - Media Player", icon: "music", width: 300, noMax: true, noResize: true,
    status: "Opening...",
    build: function (body) {
      body.innerHTML =
        '<div class="mp">' +
          '<div class="mpScreen"><div class="mpEq"><i></i><i></i><i></i><i></i><i></i></div>' +
          '<div class="mpInfo"><div class="mpTitle"><span></span></div><div class="mpTime">00:00 / 00:00</div></div></div>' +
          '<input class="mpSeek" type="range" min="0" max="1000" value="0" title="Seek">' +
          '<div class="mpCtrls">' +
            '<button class="btn raised mpBtn" data-mp="play" title="Play">' + MP_SVG.play + '</button>' +
            '<button class="btn raised mpBtn" data-mp="stop" title="Stop">' + MP_SVG.stop + '</button>' +
            '<span class="mpVol">' + MP_SVG.vol + '<input class="mpVolume" type="range" min="0" max="100" value="80" title="Volume"></span>' +
          '</div></div>';
    }
  });
  var el = win.el, playBtn = el.querySelector('[data-mp="play"]'), seek = el.querySelector(".mpSeek");
  var timeEl = el.querySelector(".mpTime"), titleBox = el.querySelector(".mpTitle"), titleSpan = titleBox.querySelector("span");
  var seeking = false;
  titleSpan.textContent = item.title;
  if (titleSpan.scrollWidth > titleBox.clientWidth) titleBox.classList.add("scroll");
  audio.volume = 0.8;
  function refresh() {
    var playing = !audio.paused && !audio.ended;
    el.classList.toggle("mpPlaying", playing);
    playBtn.innerHTML = playing ? MP_SVG.pause : MP_SVG.play;
    playBtn.title = playing ? "Pause" : "Play";
    timeEl.textContent = mmss(audio.currentTime) + " / " + mmss(audio.duration);
    if (!seeking && audio.duration) seek.value = Math.round(audio.currentTime / audio.duration * 1000);
  }
  function play() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { win.setStatus("Cannot play this file"); });
  }
  audio.addEventListener("play", function () { win.setStatus("Playing"); refresh(); });
  audio.addEventListener("pause", function () { if (!audio.ended) win.setStatus("Paused"); refresh(); });
  audio.addEventListener("timeupdate", refresh);
  audio.addEventListener("loadedmetadata", refresh);
  audio.addEventListener("ended", function () { audio.currentTime = 0; win.setStatus("Stopped"); refresh(); });
  audio.addEventListener("error", function () {
    win.setStatus("File not found");
    timeEl.textContent = "--:-- / --:--";
    el.classList.remove("mpPlaying");
  });
  el.querySelector(".mpCtrls").addEventListener("click", function (e) {
    var b = e.target.closest("[data-mp]");
    if (!b) return;
    if (b.getAttribute("data-mp") === "play") { if (audio.paused) play(); else audio.pause(); }
    else { audio.pause(); audio.currentTime = 0; win.setStatus("Stopped"); refresh(); }
  });
  seek.addEventListener("input", function () { seeking = true; });
  seek.addEventListener("change", function () {
    if (audio.duration) audio.currentTime = seek.value / 1000 * audio.duration;
    seeking = false;
    refresh();
  });
  el.querySelector(".mpVolume").addEventListener("input", function () { audio.volume = this.value / 100; });
  win.onClose = function () { audio.pause(); audio.removeAttribute("src"); audio.load(); };
  play();
}

// ---------- Burger Explorer (web browser) ----------
var lastBrowser = null;
function normUrl(u) {
  u = String(u || "").trim();
  if (!u) return "about:blank";
  if (/^www\./i.test(u)) u = "https://" + u;
  else if (!/^[a-z][a-z0-9+.-]*:/i.test(u) && !/^[\/.#?]/.test(u) && /^[^\s\/]+\.[a-z]{2,}(\/|$)/i.test(u)) u = "https://" + u;
  try { return new URL(u, location.href).href; } catch (e) { return u; }
}
function hostOf(u) {
  try { var x = new URL(u); return x.origin === location.origin ? x.pathname : x.host; } catch (e) { return u; }
}

function openBrowser(url, opts) {
  opts = opts || {};
  url = normUrl(url || CFG.homePage);
  if (CFG.browserReuse && !opts.newWindow && lastBrowser && wins[lastBrowser.id]) {
    lastBrowser.navigate(url);
    lastBrowser.show();
    return lastBrowser;
  }
  var win = openWindow({
    title: "Burger Explorer", icon: "globe", width: 960, height: 640, maximized: CFG.browserMaximized,
    status: "Opening page...", className: "bxWin",
    build: function (body) {
      body.innerHTML =
        '<div class="bxBar">' +
          '<button class="navBtn" data-b="back" title="Back">' + ARROW.back + '<span>Back</span></button>' +
          '<button class="navBtn" data-b="fwd" title="Forward">' + ARROW.fwd + '<span>Forward</span></button>' +
          '<button class="navBtn" data-b="reload" title="Refresh">' + ARROW.reload + '<span>Refresh</span></button>' +
          '<button class="navBtn" data-b="home" title="Home">' + ARROW.home + '<span>Home</span></button>' +
          '<div class="fSep"></div><span class="bxLabel">Address</span>' +
          '<input class="bxAddr sunken" spellcheck="false" autocomplete="off">' +
          '<button class="btn raised bxGo" data-b="go">Go</button>' +
          '<button class="navBtn" data-b="out" title="Open in a new browser tab">' + ARROW.out + '</button>' +
        '</div>' +
        '<div class="frameWrap sunken"><iframe class="browserFrame"></iframe></div>';
    }
  });
  var frame = win.el.querySelector("iframe"), addr = win.el.querySelector(".bxAddr");
  var hist = [], idx = -1, ours = false;

  function updateNav() {
    win.el.querySelector('[data-b="back"]').disabled = idx <= 0;
    win.el.querySelector('[data-b="fwd"]').disabled = idx >= hist.length - 1;
  }
  function load(u) {
    ours = true;
    addr.value = u;
    win.setStatus("Opening page " + u + "...");
    frame.src = u;
    updateNav();
  }
  win.navigate = function (u) {
    u = normUrl(u);
    hist = hist.slice(0, idx + 1);
    hist.push(u);
    idx++;
    load(u);
  };
  frame.addEventListener("load", function () {
    var fw = null, href = null, title = null;
    try { fw = frame.contentWindow; href = fw.location.href; title = fw.document.title; } catch (e) { fw = null; }
    if (href === "about:blank" && hist[idx] !== "about:blank") return;
    if (href) {
      if (ours) hist[idx] = href;
      else if (href !== hist[idx]) { hist = hist.slice(0, idx + 1); hist.push(href); idx++; }
      hookFrame(fw, win);
    }
    ours = false;
    var cur = href || hist[idx];
    addr.value = cur;
    win.setTitle((title || hostOf(cur)) + " - Burger Explorer");
    win.setStatus("Done");
    updateNav();
  });
  win.el.querySelector(".bxBar").addEventListener("click", function (e) {
    var b = e.target.closest("[data-b]");
    if (!b || b.disabled) return;
    var act = b.getAttribute("data-b");
    if (act === "back" && idx > 0) { idx--; load(hist[idx]); }
    else if (act === "fwd" && idx < hist.length - 1) { idx++; load(hist[idx]); }
    else if (act === "reload") {
      ours = true;
      try { frame.contentWindow.location.reload(); } catch (err) { frame.src = hist[idx]; }
    }
    else if (act === "home") win.navigate(CFG.homePage);
    else if (act === "go") win.navigate(addr.value);
    else if (act === "out") window.open(hist[idx] || addr.value, "_blank", "noopener");
  });
  addr.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); win.navigate(addr.value); }
  });
  addr.addEventListener("focus", function () { addr.select(); });
  win.onFocus = function () { lastBrowser = win; };
  win.onClose = function () { if (lastBrowser === win) lastBrowser = null; };
  lastBrowser = win;
  win.navigate(url);
  return win;
}

// Pages on this site that load inside Burger Explorer get a few extras:
// their links stay inside BurgerOS, they can reach window.BurgerOS, and
// their quest saves make BurgerOS re-check progress straight away.
function hookFrame(fw, win) {
  try {
    if (fw.__burgerOS) return;
    fw.__burgerOS = true;
    fw.BurgerOS = OS;
    fw.document.addEventListener("pointerdown", function () { focusWin(win.id); toggleStart(false); }, true);
    fw.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || /^(javascript:|#|mailto:)/i.test(href)) return;
      var t = (a.getAttribute("target") || "").toLowerCase();
      if (/^app:/i.test(href)) { e.preventDefault(); open(href); }
      else if (t === "_top" || t === "_parent") { e.preventDefault(); win.navigate(a.href); }
      else if (t && t !== "_self") { e.preventDefault(); openBrowser(a.href, { newWindow: true }); }
    });
    fw.open = function (u) {
      if (u) openBrowser(new URL(u, fw.location.href).href, { newWindow: true });
      return null;
    };
    ["SiteProgress.save", "SiteAccount.event", "SiteInventory.action"].forEach(function (path) {
      var p = path.split("."), obj = fw[p[0]];
      if (!obj || typeof obj[p[1]] !== "function" || obj[p[1]].__burger) return;
      var orig = obj[p[1]];
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        Promise.resolve(r).then(function () { sync(); }, function () {});
        return r;
      };
      wrapped.__burger = true;
      obj[p[1]] = wrapped;
    });
  } catch (e) {}
}

// ---------- Message boxes and progress boxes ----------
// opts: { id, buttons: [{ label, action }], focus: index }
function messageBox(title, text, icon, opts) {
  opts = opts || {};
  icon = icon || "info";
  var buttons = opts.buttons || [{ label: "OK" }];
  var win = openWindow({
    id: opts.id, title: title, icon: icon, width: 360, noMax: true, noResize: true,
    build: function (body, w) {
      body.innerHTML = '<div class="msg"><div class="pic">' + iconHtml(icon) + '</div><p></p></div><div class="msgBtns"></div>';
      body.querySelector("p").textContent = text || "";
      var bb = body.querySelector(".msgBtns");
      buttons.forEach(function (b) {
        var el = document.createElement("button");
        el.className = "btn raised";
        el.textContent = b.label;
        el.addEventListener("click", function () { w.close(); if (b.action) b.action(); });
        bb.appendChild(el);
      });
    }
  });
  win.el.style.width = "auto";
  centerWin(win);
  var btns = win.el.querySelectorAll(".msgBtns button");
  if (btns.length) btns[Math.min(opts.focus || 0, btns.length - 1)].focus();
  return win;
}

function progressBox(text, done, title, icon) {
  var win = openWindow({
    title: title || "Please wait", icon: icon || "mail", width: 340, noMax: true, noResize: true,
    build: function (body) {
      body.innerHTML = '<div class="msg"><div class="pic">' + iconHtml(icon || "mail") + '</div><p></p></div><div class="pbar sunken"><div></div></div>';
      body.querySelector("p").textContent = text;
    }
  });
  centerWin(win);
  var bar = win.el.querySelector(".pbar div"), p = 0;
  var t = setInterval(function () {
    if (win.closed) { clearInterval(t); return; }
    p += 8 + Math.random() * 18;
    bar.style.width = Math.min(100, p) + "%";
    if (p >= 100) {
      clearInterval(t);
      setTimeout(function () { if (!win.closed) { win.close(); if (done) done(); } }, 250);
    }
  }, 120);
  return win;
}

// ---------- Run dialog ----------
function openRun() {
  var win = openWindow({
    id: "run", title: "Run", icon: "run", width: 380, noMax: true, noResize: true,
    build: function (body) {
      body.innerHTML =
        '<div class="runBody"><div class="row">' + iconHtml("run") +
        '<div>Type the name of a program, folder, document, or Internet resource, and it will be opened for you.</div></div>' +
        '<label><span><u>O</u>pen:</span><input class="sunken" type="text" spellcheck="false" autocomplete="off"></label>' +
        '<div class="runBtns"><button class="btn raised" data-r="ok">OK</button>' +
        '<button class="btn raised" data-r="cancel">Cancel</button>' +
        '<button class="btn raised" disabled>Browse...</button></div></div>';
    }
  });
  var input = win.el.querySelector("input");
  function run() {
    var v = input.value.trim();
    if (!v) return;
    win.close();
    if (!open(v)) {
      messageBox(v, "Cannot find the file '" + v + "' (or one of its components). Make sure the path and filename are correct.", "error");
    }
  }
  win.el.querySelector('[data-r="ok"]').addEventListener("click", run);
  win.el.querySelector('[data-r="cancel"]').addEventListener("click", function () { win.close(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); run(); }
    if (e.key === "Escape") win.close();
  });
  input.focus();
}

function shutDown() {
  flush();
  if (CFG.shutdownLink) { top.location.href = CFG.shutdownLink; return; }
  var s = document.getElementById("shutdown");
  s.classList.add("on");
  s.onclick = function () { location.reload(); };
}

// ---------- Apps (loaded only when first opened) ----------
var APPS = {}, running = {}, loading = {};
function registerApp(name, def) { APPS[name] = def; }

function loadApp(name) {
  if (APPS[name]) return Promise.resolve();
  if (!APP_FILES[name]) return Promise.reject(new Error("Unknown program " + name));
  loading[name] = loading[name] || loadScript(BASE + APP_FILES[name]).catch(function (e) {
    delete loading[name];
    throw e;
  });
  return loading[name];
}

function launch(name, args) {
  name = String(name || "").toLowerCase();
  name = ALIASES[name] || name;
  if (name === "explorer") return openBrowser(args || CFG.homePage);
  if (!APPS[name] && !APP_FILES[name]) return false;
  document.body.classList.add("busy");
  loadApp(name).then(function () {
    document.body.classList.remove("busy");
    var def = APPS[name], w = running[name];
    if (!def.multi && w && !w.closed) {
      w.show();
      if (w.onRelaunch) safe(function () { w.onRelaunch(args || {}); });
      return;
    }
    w = def.open(args || {});
    if (!def.multi) running[name] = w;
  }).catch(function (e) {
    document.body.classList.remove("busy");
    console.error(e);
    messageBox(name, "This program could not be opened. Please try again.", "error");
  });
  return true;
}

// ---------- Notification balloon ----------
var balloon = document.getElementById("balloon"), balloonTimer;
function notify(o) {
  balloon.innerHTML = '<div class="bTitle">' + iconHtml(o.icon || "info") + '<b></b><button class="bClose" title="Close">&times;</button></div><div class="bText"></div>';
  balloon.querySelector("b").textContent = o.title || "";
  balloon.querySelector(".bText").textContent = o.text || "";
  balloon.onclick = function (e) {
    balloon.classList.remove("on");
    if (!e.target.closest(".bClose") && o.onClick) o.onClick();
  };
  balloon.classList.add("on");
  clearTimeout(balloonTimer);
  balloonTimer = setTimeout(function () { balloon.classList.remove("on"); }, o.time || 7000);
}

// ---------- Mail model ----------
// Kept here (not in apps/mail.js) so new mail, unread counts and the tray
// icon work even while the Mail window is closed.
var MC = Object.assign({ appName: "Mail", accountName: "Local Folders", visitorName: "User",
  visitorAddress: "", sendMode: "fake", contactEmail: "" }, C.mail || {});
var MF = MC.folders = MC.folders || [];
var mailMsgs = [];
MF.forEach(function (f, fi) {
  (f.messages || []).forEach(function (m) {
    if (m.arriveAfter != null && m.delay == null) m.delay = m.arriveAfter;
    m._id = m.id || (f.name + "|" + m.from + "|" + m.subject);
    m._folder = fi;
    m._static = !m.when && !m.delay;
    mailMsgs.push(m);
  });
});
function roleIndex(role, dflt) {
  for (var i = 0; i < MF.length; i++) if (MF[i].role === role) return i;
  return dflt;
}
var INBOX = roleIndex("inbox", 0), SENT = roleIndex("sent", -1), DELETED = roleIndex("deleted", -1);

function parseDate(s) {
  if (s instanceof Date) return s;
  var m = String(s || "").match(/^(today|yesterday)\s*(.*)$/i);
  if (m) {
    var d = new Date();
    if (m[1].toLowerCase() === "yesterday") d.setDate(d.getDate() - 1);
    var t = m[2].match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (t) {
      var h = Number(t[1]);
      if (t[3]) { h = h % 12; if (t[3].toLowerCase() === "pm") h += 12; }
      d.setHours(h, Number(t[2]), 0, 0);
    }
    return d;
  }
  var p = new Date(s);
  return isNaN(p) ? null : p;
}

var Mail = {
  config: MC, folders: MF, INBOX: INBOX, SENT: SENT, DELETED: DELETED,
  present: function (m) {
    var s = state.mail;
    if (s.purged[m._id]) return false;
    if (m._sent || m._static) return true;
    return !!s.arrived[m._id] && check(m.when);
  },
  folderOf: function (m) {
    return state.mail.deleted[m._id] ? DELETED : (m._sent ? SENT : m._folder);
  },
  messagesIn: function (fi) {
    var out = [];
    mailMsgs.concat(state.mail.sent).forEach(function (m) {
      if (Mail.present(m) && Mail.folderOf(m) === fi) out.push(m);
    });
    return out;
  },
  isRead: function (m) { return !!(m._sent || m.read || state.mail.read[m._id]); },
  unread: function (fi) {
    return Mail.messagesIn(fi).filter(function (m) { return !Mail.isRead(m); }).length;
  },
  dateOf: function (m) {
    if (m._sent) return new Date(m.date);
    var a = state.mail.arrived[m._id];
    return a ? new Date(a) : parseDate(m.date);
  },
  markRead: function (m) {
    if (Mail.isRead(m)) return;
    state.mail.read[m._id] = true;
    save();
    mailChanged();
    runEffects(m.effects);
  },
  // Deleting moves to Deleted Items; deleting from there removes it for good
  remove: function (m) {
    if (Mail.folderOf(m) === DELETED || DELETED < 0) state.mail.purged[m._id] = true;
    else { state.mail.deleted[m._id] = true; state.mail.read[m._id] = true; }
    save();
    mailChanged();
  },
  send: function (msg) {
    var m = { _sent: true, _id: "sent|" + Date.now(), to: msg.to, subject: msg.subject || "",
              body: msg.body || "", date: new Date().toISOString() };
    state.mail.sent.push(m);
    save();
    mailChanged();
    emit("mailsent", m);
    return m;
  },
  // Checks the server, then brings in the next waiting message early
  sendReceive: function () {
    return Promise.race([sync(), new Promise(function (r) { setTimeout(r, 3000); })]).then(function () {
      scheduleMail();
      var next = Object.keys(pending).map(function (k) { return pending[k]; })
        .filter(function (p) { return !p.m.timerOnly; })
        .sort(function (a, b) { return a.due - b.due; })[0];
      if (!next) return 0;
      return deliver([next.m]);
    });
  },
  reset: function () {
    Object.keys(pending).forEach(function (k) { clearTimeout(pending[k].timer); delete pending[k]; });
    state.mail = freshState().mail;
    save();
    scheduleMail();
    mailChanged();
  }
};

// Mail that becomes available waits  delay  seconds, then arrives
var pending = {};
function scheduleMail() {
  mailMsgs.forEach(function (m) {
    var id = m._id;
    if (m._static || state.mail.arrived[id] || state.mail.purged[id]) return;
    if (m.when && !synced) return;   // wait until progress has been checked with the server
    var ok = check(m.when);
    if (ok && !pending[id]) {
      var ms = Math.max(0, (m.delay || 0) * 1000);
      pending[id] = { m: m, due: Date.now() + ms, timer: setTimeout(function () { deliver([m]); }, ms) };
    } else if (!ok && pending[id]) {
      clearTimeout(pending[id].timer);
      delete pending[id];
    }
  });
}
function deliver(msgs) {
  var fresh = msgs.filter(function (m) { return !state.mail.arrived[m._id]; });
  fresh.forEach(function (m) {
    if (pending[m._id]) { clearTimeout(pending[m._id].timer); delete pending[m._id]; }
    state.mail.arrived[m._id] = new Date().toISOString();
  });
  if (!fresh.length) return 0;
  save();
  mailChanged();
  emit("newmail", fresh);
  notify({
    title: MC.appName, icon: "mail",
    text: "You have " + fresh.length + " new message" + (fresh.length > 1 ? "s" : "") + ".",
    onClick: function () { launch("mail", { folder: "inbox" }); }
  });
  return fresh.length;
}

// Tray envelope and the "(1) BurgerOS 98" tab title
var trayIcons = document.getElementById("trayIcons");
var lastUnread = -1;
function mailChanged() {
  var n = Mail.unread(INBOX);
  if (n !== lastUnread) {
    lastUnread = n;
    document.title = (n ? "(" + n + ") " : "") + BASE_TITLE;
    var icon = trayIcons.querySelector(".trayMail");
    if (n && !icon) {
      icon = document.createElement("span");
      icon.className = "trayIcon trayMail";
      icon.innerHTML = iconHtml("mail");
      icon.addEventListener("click", function () { launch("mail", { folder: "inbox" }); });
      trayIcons.appendChild(icon);
    } else if (!n && icon) icon.remove();
    if (icon && n) icon.title = "You have " + n + " unread message" + (n > 1 ? "s" : "");
  }
  emit("mail");
}

// ---------- Start menu ----------
var startMenu = document.getElementById("startMenu");
var startBtn = document.getElementById("startBtn");
document.querySelector("#startBanner span").innerHTML = esc(CFG.startBanner[0]) + "<b>" + esc(CFG.startBanner[1]) + "</b>";
startBtn.innerHTML = iconHtml(CFG.startIcon || "start") + esc(CFG.startText);

function menuHtml(items) {
  var html = "", lastSep = true;
  visibleItems(items).forEach(function (it) {
    if (it.separator) { if (!lastSep) html += '<li class="sep"></li>'; lastSep = true; return; }
    lastSep = false;
    var kids = typeOf(it) === "folder" ? visibleItems(it.children) : [];
    html += '<li data-id="' + it._id + '"><span class="pic">' + iconHtml(iconName(it)) + '</span>' + esc(it.title) +
      (kids.length ? '<span class="arrow">&#9654;</span><div class="submenu raised"><ul class="menu">' +
        menuHtml(it.children) + '</ul></div>' : "") + '</li>';
  });
  return html;
}
function itemById(id) {
  for (var i = 0; i < allItems.length; i++) if (allItems[i]._id === id) return allItems[i];
  return null;
}
function toggleStart(openIt) {
  if (openIt) document.getElementById("startList").innerHTML = menuHtml(C.startMenu);
  startMenu.classList.toggle("open", openIt);
  startBtn.classList.toggle("pressed", openIt);
  startBtn.classList.toggle("raised", !openIt);
}
startBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleStart(!startMenu.classList.contains("open"));
});
startMenu.addEventListener("click", function (e) {
  e.stopPropagation();
  var li = e.target.closest("li[data-id]");
  if (!li) return;
  var it = itemById(li.getAttribute("data-id"));
  if (!it) return;
  if (typeOf(it) === "folder" && lastPointer !== "touch" && li.querySelector(".submenu")) return;
  toggleStart(false);
  openItem(it);
});
document.addEventListener("click", function () { toggleStart(false); });

// ---------- Clock ----------
function tick() {
  var d = new Date(), h = d.getHours(), m = d.getMinutes();
  document.getElementById("clock").textContent = ((h % 12) || 12) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM");
  document.getElementById("tray").title = d.toDateString();
}

// ---------- Public API (window.BurgerOS) ----------
var OS = {
  content: C, config: CFG, esc: esc, iconHtml: iconHtml, icons: ICONS, parseDate: parseDate,
  on: on, off: off, emit: emit,
  // progress and unlocks
  check: check, progress: view, flag: setFlag, hasFlag: view.flag,
  effects: runEffects, refresh: sync,
  // save data
  save: save, appState: appState, state: function () { return state; },
  reset: function () { state = freshState(); state.migrated = 1; flush(); location.reload(); },
  // opening things
  open: open, openLink: openLink, openItem: openItem, launch: launch, browse: openBrowser,
  findItem: findByTitle,
  // windows
  openWindow: openWindow, messageBox: messageBox, progressBox: progressBox, notify: notify,
  centerWin: centerWin, windows: function () { return wins; },
  addStyle: addStyle, registerApp: registerApp,
  mail: Mail
};
window.BurgerOS = OS;

// ---------- Start up ----------
document.body.style.backgroundColor = CFG.desktopColor;
if (CFG.wallpaper) document.body.style.backgroundImage = "url('" + CFG.wallpaper + "')";
on("change", function () {
  renderDesktop();
  scheduleMail();
  mailChanged();
});
renderDesktop();
tick();
setInterval(tick, 5000);
scheduleMail();
mailChanged();
bootProgress();

if (CFG.startupOpen) open(CFG.startupOpen);

// Fetch the app files in the background so they open instantly later
(window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(function () {
  Object.keys(APP_FILES).forEach(function (n) { loadApp(n).catch(function () {}); });
});
})();
