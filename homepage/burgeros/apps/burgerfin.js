/* BurgerOS Burgerfin. Libraries live in content.js (burgerfin). */
(function () {
"use strict";
var OS = window.BurgerOS, esc = OS.esc;

OS.addStyle("burgerfin", [
  ".bf { --bg: #101010; --header: rgba(32,32,32,0.92); --drawer: #1c1c1c; --card: #242424; --text: #e0e0e0; --muted: #a0a0a0; --accent: #00a4dc;",
  "  position: relative; flex: 1; min-height: 0; overflow: hidden; background: var(--bg); color: var(--text);",
  "  font: 14px 'Noto Sans', sans-serif; }",
  ".bf .material-icons { font-family: 'Material Icons'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1;",
  "  letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr;",
  "  -webkit-font-smoothing: antialiased; font-feature-settings: 'liga'; overflow: hidden; }",
  ".bf .backdrop { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.25; pointer-events: none; }",
  ".bf .backdrop::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(16,16,16,0.3), var(--bg) 85%); }",
  ".bf header { position: absolute; top: 0; left: 0; right: 0; height: 46px; z-index: 10; display: flex; align-items: center; padding: 0 6px;",
  "  background: var(--header); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }",
  ".bf .iconBtn { background: none; border: none; color: var(--text); cursor: pointer; width: 40px; height: 40px; border-radius: 50%;",
  "  display: flex; align-items: center; justify-content: center; padding: 0; }",
  ".bf .iconBtn:hover { background: rgba(255,255,255,0.1); }",
  ".bf .iconBtn:disabled { opacity: 0.3; cursor: default; background: none; }",
  ".bf .hidden { display: none !important; }",
  ".bf .logo { display: flex; align-items: center; gap: 10px; margin-left: 6px; font-size: 1.2em; font-weight: 500; cursor: pointer; }",
  ".bf .logoMark { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #aa5cc3, #00a4dc); }",
  ".bf .spacer { flex: 1; }",
  ".bf .avatar { width: 32px; height: 32px; border-radius: 50%; background: #555; display: flex; align-items: center; justify-content: center; }",
  ".bf .drawer { position: absolute; top: 0; bottom: 0; left: -300px; width: 300px; z-index: 30; background: var(--drawer);",
  "  transition: left 0.2s ease; padding-top: 8px; overflow-y: auto; }",
  ".bf .drawer.open { left: 0; }",
  ".bf .scrim { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 25; display: none; }",
  ".bf .scrim.open { display: block; }",
  ".bf .drawerHead { color: var(--muted); font-size: 0.85em; font-weight: 500; margin: 18px 20px 6px; }",
  ".bf .navItem { display: flex; align-items: center; gap: 18px; padding: 11px 20px; cursor: pointer; }",
  ".bf .navItem:hover { background: rgba(255,255,255,0.08); }",
  ".bf .navItem.current, .bf .navItem.current .material-icons { color: var(--accent); }",
  ".bf .navItem .material-icons { color: var(--muted); }",
  ".bf main { position: absolute; inset: 0; overflow-y: auto; padding: 66px 0 40px; }",
  ".bf .section { margin-bottom: 28px; }",
  ".bf .sectionHead { display: flex; align-items: center; padding: 0 3.3%; }",
  ".bf .sectionTitle { font-size: 1.35em; font-weight: 500; margin: 0 0 10px; }",
  ".bf .scrollBtns { margin-left: auto; display: flex; }",
  ".bf .row { display: flex; gap: 14px; overflow-x: auto; padding: 6px 3.3% 10px; scroll-behavior: smooth; scrollbar-width: none; }",
  ".bf .row::-webkit-scrollbar { display: none; }",
  ".bf .libHead { padding: 0 3.3%; margin-bottom: 14px; display: flex; align-items: baseline; gap: 14px; }",
  ".bf .libHead h1 { font-size: 1.6em; font-weight: 500; margin: 0; }",
  ".bf .libHead span { color: var(--muted); font-size: 0.9em; }",
  ".bf .grid { display: flex; flex-wrap: wrap; gap: 18px 14px; padding: 6px 3.3% 10px; }",
  ".bf .empty { padding: 40px 3.3%; color: var(--muted); }",
  ".bf .searchBox { position: relative; margin: 8px 3.3% 24px; max-width: 640px; }",
  ".bf .searchBox .material-icons { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }",
  ".bf .searchBox input { width: 100%; padding: 12px 14px 12px 46px; font: inherit; font-size: 1.05em; color: var(--text); background: #292929;",
  "  border: 2px solid transparent; border-radius: 6px; outline: none; user-select: text; -webkit-user-select: text; }",
  ".bf .searchBox input:focus { border-color: var(--accent); }",
  ".bf .groupTitle { font-size: 1.2em; font-weight: 500; margin: 0 3.3% 6px; }",
  ".bf .group { margin-bottom: 26px; }",
  ".bf .card { flex: 0 0 auto; cursor: pointer; }",
  ".bf .card.backdropCard { width: 300px; }",
  ".bf .card.portrait { width: 160px; }",
  ".bf .card.square { width: 180px; }",
  ".bf .cardImg { position: relative; border-radius: 4px; overflow: hidden; background: var(--card); background-size: cover; background-position: center;",
  "  outline: 3px solid transparent; transition: outline-color 0.15s; }",
  ".bf .backdropCard .cardImg { aspect-ratio: 16 / 9; }",
  ".bf .portrait .cardImg { aspect-ratio: 2 / 3; }",
  ".bf .square .cardImg { aspect-ratio: 1 / 1; }",
  ".bf .card:hover .cardImg { outline-color: var(--accent); }",
  ".bf .placeholderIcon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 56px; color: #5a5a5a; }",
  ".bf .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); opacity: 0; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; }",
  ".bf .card:hover .overlay { opacity: 1; }",
  ".bf .playBtn { width: 52px; height: 52px; border-radius: 50%; background: rgba(0,0,0,0.6); border: 2px solid rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; }",
  ".bf .playBtn .material-icons { font-size: 32px; }",
  ".bf .progress { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: rgba(0,0,0,0.6); }",
  ".bf .progress div { height: 100%; background: var(--accent); }",
  ".bf .badge { position: absolute; top: 6px; right: 6px; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 12px; background: var(--accent); font-size: 0.8em; display: flex; align-items: center; justify-content: center; }",
  ".bf .cardTitle { margin-top: 8px; font-size: 0.92em; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
  ".bf .cardSub { font-size: 0.82em; color: var(--muted); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }"
].join("\n"));

// The fonts are only downloaded the first time Burgerfin opens
function loadFonts() {
  if (document.getElementById("bfFonts")) return;
  var l = document.createElement("link");
  l.id = "bfFonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600&family=Material+Icons&display=block";
  document.head.appendChild(l);
}

OS.registerApp("burgerfin", {
  open: function () {
    loadFonts();
    var cfg = OS.content.burgerfin || {};
    var NAME = cfg.serverName || "Burgerfin";
    var LIBS = cfg.libraries || [];
    var SECTIONS = cfg.sections || [];
    var MENU = cfg.menu || [];
    var PMIN = cfg.progressMin == null ? 20 : cfg.progressMin;
    var PMAX = cfg.progressMax == null ? 80 : cfg.progressMax;
    var HIDE_EMPTY = cfg.hideEmptyContinue !== false;
    var store = OS.appState("burgerfin");
    if (!Array.isArray(store.watched)) store.watched = [];

    var win = OS.openWindow({ title: NAME, icon: "media", width: 1040, height: 660 });
    var root = document.createElement("div");
    root.className = "bf";
    root.innerHTML =
      '<div class="backdrop"></div><div class="scrim"></div><nav class="drawer"></nav>' +
      '<header>' +
        '<button class="iconBtn hidden" data-h="back" title="Back"><span class="material-icons">arrow_back</span></button>' +
        '<button class="iconBtn" data-h="menu" title="Menu"><span class="material-icons">menu</span></button>' +
        '<div class="logo" data-h="home"><div class="logoMark"></div><span></span></div>' +
        '<div class="spacer"></div>' +
        '<button class="iconBtn" title="SyncPlay"><span class="material-icons">groups</span></button>' +
        '<button class="iconBtn" title="Play on another device"><span class="material-icons">cast</span></button>' +
        '<button class="iconBtn" data-h="search" title="Search"><span class="material-icons">search</span></button>' +
        '<button class="iconBtn" title="User"><div class="avatar"><span class="material-icons" style="font-size:20px">person</span></div></button>' +
      '</header>' +
      '<main></main>';
    win.body.appendChild(root);
    var main = root.querySelector("main"), drawer = root.querySelector(".drawer"), scrim = root.querySelector(".scrim");
    root.querySelector(".logo span").textContent = NAME;
    if (cfg.pageBackground) root.querySelector(".backdrop").style.backgroundImage = "url('" + cfg.pageBackground + "')";

    // ---- Unlocked content only ----
    function libs() {
      return LIBS.map(function (lib, i) { return { lib: lib, i: i }; })
        .filter(function (x) { return OS.check(x.lib.when); });
    }
    function items(lib) { return (lib.items || []).filter(function (it) { return OS.check(it.when); }); }
    function itemKey(it) { return it.link + "|" + it.title; }
    function findItem(key) {
      var all = [];
      libs().forEach(function (x) { all = all.concat(items(x.lib)); });
      SECTIONS.forEach(function (s) { if (!s.continueWatching) all = all.concat((s.items || []).filter(function (it) { return OS.check(it.when); })); });
      for (var i = 0; i < all.length; i++) if (itemKey(all[i]) === key) return all[i];
      return null;
    }
    function iconFor(it) {
      for (var l = 0; l < LIBS.length; l++) if ((LIBS[l].items || []).indexOf(it) !== -1) return LIBS[l].icon;
      return "movie";
    }

    // ---- Views: home, library, search (with Back) ----
    var view = { name: "home" }, back = [];
    function go(v) { back.push(view); view = v; render(true); }
    function goBack() { view = back.pop() || { name: "home" }; render(true); }
    function goHome() { back = []; view = { name: "home" }; render(true); }

    // ---- Cards ----
    var rendered = [];
    function cardHtml(it, style, opts) {
      opts = opts || {};
      var k = rendered.length;
      rendered.push({ item: it, library: opts.library });
      var cls = style === "backdrop" || !style ? "backdropCard" : style;
      var pic = (cls === "backdropCard" && it.thumb) ? it.thumb : it.image;
      var bg = pic ? ' style="background-image:url(\'' + esc(pic) + '\')"' : "";
      return '<div class="card ' + esc(cls) + '" data-k="' + k + '" title="' + esc(it.title) + '">' +
        '<div class="cardImg"' + bg + '>' +
          (pic ? "" : '<div class="placeholderIcon material-icons">' + esc(opts.icon || it.icon || "movie") + '</div>') +
          (it.badge ? '<div class="badge">' + esc(it.badge) + '</div>' : "") +
          (opts.progress ? '<div class="progress"><div style="width:' + Math.min(100, opts.progress) + '%"></div></div>' : "") +
          '<div class="overlay"><div class="playBtn"><span class="material-icons">' +
            (opts.library !== undefined ? "folder_open" : "play_arrow") + '</span></div></div>' +
        '</div>' +
        '<div class="cardTitle">' + esc(it.title) + '</div>' +
        (it.subtitle ? '<div class="cardSub">' + esc(it.subtitle) + '</div>' : "") +
      '</div>';
    }
    function rowHtml(id, title, cards) {
      return '<div class="section"><div class="sectionHead"><h2 class="sectionTitle">' + esc(title) +
        '</h2><div class="scrollBtns">' +
        '<button class="iconBtn" data-row="' + id + '" data-dir="-1"><span class="material-icons">chevron_left</span></button>' +
        '<button class="iconBtn" data-row="' + id + '" data-dir="1"><span class="material-icons">chevron_right</span></button>' +
        '</div></div><div class="row" data-rowid="' + id + '">' + cards + '</div></div>';
    }

    function renderHome() {
      var watchedKeys = {};
      store.watched.forEach(function (w) { watchedKeys[w.key] = true; });
      var html = "", libCards = "";
      libs().forEach(function (x) {
        libCards += cardHtml({ title: x.lib.title, image: x.lib.image }, "backdrop", { library: x.i, icon: x.lib.icon });
      });
      if (libCards) html += rowHtml("media", "My Media", libCards);
      SECTIONS.forEach(function (sec, s) {
        var cards = "";
        if (sec.continueWatching) {
          store.watched.forEach(function (w) {
            var it = findItem(w.key);
            if (it) cards += cardHtml(it, sec.style || "backdrop", { progress: w.progress, icon: iconFor(it) });
          });
          if (!cards && HIDE_EMPTY) return;
        } else {
          (sec.items || []).forEach(function (it) {
            if (OS.check(it.when) && !watchedKeys[itemKey(it)]) cards += cardHtml(it, sec.style, { icon: iconFor(it) });
          });
          if (!cards) return;
        }
        html += rowHtml("s" + s, sec.title, cards);
      });
      libs().forEach(function (x) {
        if (!x.lib.recent) return;
        var cards = "";
        items(x.lib).filter(function (it) { return !watchedKeys[itemKey(it)]; })
          .slice(0, x.lib.recent)
          .forEach(function (it) { cards += cardHtml(it, x.lib.style, { icon: x.lib.icon }); });
        if (cards) html += rowHtml("r" + x.i, "Recently Added in " + x.lib.title, cards);
      });
      main.innerHTML = html;
    }

    function renderLibrary(l) {
      var lib = LIBS[l], its = items(lib), cards = "";
      its.forEach(function (it) { cards += cardHtml(it, lib.style, { icon: lib.icon }); });
      main.innerHTML =
        '<div class="libHead"><h1>' + esc(lib.title) + '</h1><span>' + its.length + (its.length === 1 ? " item" : " items") + '</span></div>' +
        (cards ? '<div class="grid">' + cards + '</div>' : '<div class="empty">This library is empty.</div>');
    }

    function matches(words, fields) {
      var text = fields.join(" ").toLowerCase();
      return words.every(function (w) { return text.indexOf(w) !== -1; });
    }
    function renderSearch() {
      main.innerHTML = '<div class="searchBox"><span class="material-icons">search</span>' +
        '<input type="search" placeholder="Search" autocomplete="off"></div><div class="results"></div>';
      var input = main.querySelector("input");
      input.value = view.q || "";
      input.addEventListener("input", function () { view.q = input.value; showResults(); });
      showResults();
      input.focus();
    }
    function showResults() {
      rendered = [];
      var box = main.querySelector(".results"), q = view.q || "";
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) { box.innerHTML = ""; return; }
      var html = "", seen = {}, libCards = "";
      libs().forEach(function (x) {
        if (matches(words, [x.lib.title])) libCards += cardHtml({ title: x.lib.title, image: x.lib.image }, "backdrop", { library: x.i, icon: x.lib.icon });
      });
      if (libCards) html += '<div class="group"><h2 class="groupTitle">Libraries</h2><div class="grid">' + libCards + '</div></div>';
      libs().forEach(function (x) {
        var cards = "";
        items(x.lib).forEach(function (it) {
          if (matches(words, [it.title, it.subtitle || "", (it.tags || []).join(" "), x.lib.title])) {
            seen[itemKey(it)] = true;
            cards += cardHtml(it, x.lib.style, { icon: x.lib.icon });
          }
        });
        if (cards) html += '<div class="group"><h2 class="groupTitle">' + esc(x.lib.title) + '</h2><div class="grid">' + cards + '</div></div>';
      });
      var other = "";
      SECTIONS.forEach(function (sec) {
        if (sec.continueWatching) return;
        (sec.items || []).forEach(function (it) {
          var k = itemKey(it);
          if (!seen[k] && OS.check(it.when) && matches(words, [it.title, it.subtitle || "", (it.tags || []).join(" ")])) {
            seen[k] = true;
            other += cardHtml(it, sec.style, { icon: iconFor(it) });
          }
        });
      });
      if (other) html += '<div class="group"><h2 class="groupTitle">Other</h2><div class="grid">' + other + '</div></div>';
      box.innerHTML = html || '<div class="empty">No results for "' + esc(q.trim()) + '".</div>';
    }

    function render(toTop) {
      if (view.name === "library" && (!LIBS[view.lib] || !OS.check(LIBS[view.lib].when))) view = { name: "home" };
      var keep = toTop ? 0 : main.scrollTop;
      rendered = [];
      if (view.name === "search") renderSearch();
      else if (view.name === "library") renderLibrary(view.lib);
      else renderHome();
      main.scrollTop = keep;
      root.querySelector('[data-h="back"]').classList.toggle("hidden", view.name === "home");
      win.setTitle(view.name === "search" ? "Search - " + NAME : view.name === "library" ? LIBS[view.lib].title + " - " + NAME : NAME);
      buildDrawer();
      updateArrows();
    }

    function updateArrows() {
      var rows = main.querySelectorAll(".row");
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], id = row.getAttribute("data-rowid");
        var left = main.querySelector('[data-row="' + id + '"][data-dir="-1"]');
        var right = main.querySelector('[data-row="' + id + '"][data-dir="1"]');
        if (left) left.disabled = row.scrollLeft <= 1;
        if (right) right.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 1;
      }
    }
    main.addEventListener("scroll", updateArrows, true);
    win.listen(window, "resize", updateArrows);

    // ---- Clicks ----
    root.querySelector("header").addEventListener("click", function (e) {
      var b = e.target.closest("[data-h]");
      if (!b) return;
      var h = b.getAttribute("data-h");
      if (h === "back") goBack();
      else if (h === "home") goHome();
      else if (h === "menu") toggleDrawer(true);
      else if (h === "search") {
        if (view.name !== "search") go({ name: "search", q: "" });
        else main.querySelector("input").focus();
      }
    });
    main.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-dir]");
      if (btn) {
        var row = main.querySelector('[data-rowid="' + btn.getAttribute("data-row") + '"]');
        row.scrollBy({ left: row.clientWidth * 0.8 * Number(btn.getAttribute("data-dir")) });
        return;
      }
      var card = e.target.closest(".card");
      if (!card) return;
      var entry = rendered[card.getAttribute("data-k")];
      if (!entry) return;
      if (entry.library !== undefined) { go({ name: "library", lib: entry.library }); return; }
      var key = itemKey(entry.item);
      var progress = PMIN + Math.floor(Math.random() * (PMAX - PMIN + 1));
      store.watched = store.watched.filter(function (w) {
        if (w.key === key) { progress = w.progress; return false; }
        return true;
      });
      store.watched.unshift({ key: key, progress: progress });
      OS.save();
      if (view.name !== "search") render();
      OS.effects(entry.item.effects);
      OS.openLink(entry.item.link);
    });

    // ---- Side menu ----
    function buildDrawer() {
      var html = "", list = libs();
      if (list.length) html += '<div class="drawerHead">Media</div>';
      list.forEach(function (x) {
        html += '<div class="navItem' + (view.name === "library" && view.lib === x.i ? " current" : "") + '" data-lib="' + x.i + '">' +
          '<span class="material-icons">' + esc(x.lib.icon || "folder") + '</span>' + esc(x.lib.title) + '</div>';
      });
      MENU.forEach(function (m, i) {
        if (m.head) html += '<div class="drawerHead">' + esc(m.head) + '</div>';
        else if (OS.check(m.when)) html += '<div class="navItem" data-menu="' + i + '"><span class="material-icons">' +
          esc(m.icon || "folder") + '</span>' + esc(m.title) + '</div>';
      });
      drawer.innerHTML = html;
    }
    function toggleDrawer(open) {
      drawer.classList.toggle("open", open);
      scrim.classList.toggle("open", open);
    }
    scrim.addEventListener("click", function () { toggleDrawer(false); });
    drawer.addEventListener("click", function (e) {
      var a = e.target.closest(".navItem");
      if (!a) return;
      toggleDrawer(false);
      if (a.hasAttribute("data-lib")) { go({ name: "library", lib: Number(a.getAttribute("data-lib")) }); return; }
      var m = MENU[a.getAttribute("data-menu")];
      if (!m) return;
      OS.effects(m.effects);
      if (m.action === "clearContinue") { store.watched = []; OS.save(); render(); }
      else if (m.action === "close") win.close();
      else if (m.link) OS.openLink(m.link);
    });

    // ---- Stay in sync with unlocks ----
    win.on("change", function () { if (view.name === "search") showResults(); else render(); });
    win.on("reload", function () { store = OS.appState("burgerfin"); if (!Array.isArray(store.watched)) store.watched = []; });

    render(true);
    return win;
  }
});
})();
