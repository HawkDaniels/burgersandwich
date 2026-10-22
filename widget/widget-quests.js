/* widget-quests.js: a corner button that opens a panel of the player's active quests, how far along each
   one is, and the hint for the step they are on. Add ONE line to the end of any page, just before </body>:

     <script src="/widget-quests.js"></script>

   It loads site-account.js and site-progress.js from the same folder if the page has not already.
   It draws inside its own isolated box, so it does not take on the page's styles and does not change them.

   A quest appears here once the player has saved some progress for it. Its title, summary, steps and hints
   come from QUESTS in defs.js (see the notes there). Each person sees only their own progress.

   Optional settings, written on the script tag (all of them are optional):
     Look of the button
       data-icon="scroll"          a built-in icon, or up to 4 characters such as an emoji (try data-icon="📜")
                                   built-in icons: scroll, book, map, flag, star, alert
       data-image="/img/quests.png"  your own picture instead of an icon (put the file on your site and give its
                                   address; a missing file falls back to the icon)
       data-image-fit="contain"    "contain" shows the whole picture, "cover" fills the button
       data-accent="#4a67d6"       button colour, also used for progress bars; "transparent" shows only the picture
       data-icon-color="#ffffff"   colour of the icon
       data-shape="round"          "round" or "square"
       data-size="52px"            button size, such as 40px or 64px
     Look of the panel
       data-theme="light"          "light", "dark", or "auto" (follows the visitor's device setting)
       data-bg="#ffffff"           panel background colour, overriding the theme
       data-text="#1c1c1c"         panel text colour, overriding the theme
       data-title="Quests"         panel title
     Position
       data-side="right"           "right" or "left"
       data-bottom="80px"          distance from the bottom (the default is 80px on the right, so the button sits
                                   above the inventory button, and 16px on the left)
       data-edge="16px"            distance from the side
   The panel opens beside the button, towards the middle of the page. On a phone it opens across the screen. */
(function () {
  "use strict";
  if (window.__widgetQuests) return;
  window.__widgetQuests = true;

  var me = document.currentScript;
  var base = me && me.src ? me.src.replace(/[^\/]*$/, "") : "/";
  function opt(name, fallback) { var v = me && me.getAttribute("data-" + name); return v ? v.trim() : fallback; }
  // Only plain lengths, colours and addresses are accepted from the tag; anything else falls back to the default.
  var LEN = /^\d{1,4}(px|rem|em|vh|vw|%)$/, HEX = /^#[0-9a-fA-F]{3,8}$/;
  function lengthOpt(name, fallback) { var v = opt(name, fallback); return LEN.test(v) ? v : fallback; }
  function colourOpt(name, fallback, allowTransparent) { var v = opt(name, fallback); return HEX.test(v) || (allowTransparent && v === "transparent") ? v : fallback; }
  function oneOf(name, fallback, list) { var v = opt(name, fallback).toLowerCase(); return list.indexOf(v) >= 0 ? v : fallback; }
  function imageOpt(v) { if (!v) return ""; try { var u = new URL(v, location.href); return u.protocol === "http:" || u.protocol === "https:" ? u.href : ""; } catch (e) { return ""; } }
  var side = oneOf("side", "right", ["right", "left"]);
  var size = /^\d{2,3}px$/.test(opt("size", "52px")) ? opt("size", "52px") : "52px";
  var cfg = {
    side: side,
    size: size,
    edge: lengthOpt("edge", "16px"),
    bottom: lengthOpt("bottom", side === "right" ? "calc(16px + " + size + " + 12px)" : "16px"),
    shape: oneOf("shape", "round", ["round", "square"]),
    accent: colourOpt("accent", "#4a67d6", true),
    iconColor: colourOpt("icon-color", "#ffffff", false),
    icon: opt("icon", "scroll"),
    image: imageOpt(opt("image", "")),
    imageFit: oneOf("image-fit", "contain", ["contain", "cover"]),
    theme: oneOf("theme", "light", ["light", "dark", "auto"]),
    bg: colourOpt("bg", "", false),
    text: colourOpt("text", "", false),
    title: opt("title", "Quests"),
  };
  cfg.hl = cfg.accent === "transparent" ? "#4a67d6" : cfg.accent; // progress bars and focus rings need a visible colour

  function need(file, ready) {
    return new Promise(function (resolve) {
      if (ready()) return resolve();
      var s = document.createElement("script");
      s.src = base + file; s.onload = resolve; s.onerror = resolve;
      document.head.appendChild(s);
    });
  }
  window.__siteDeps = window.__siteDeps || need("site-account.js", function () { return window.SiteAccount; })
    .then(function () { return need("site-progress.js", function () { return window.SiteProgress; }); });

  var CSS = [
    ":host{display:block}",
    "*{box-sizing:border-box}",
    ".w{--bg:#fff;--fg:#1c1c1c;--card:#f4f4f4;--line:#b8b8b8;--mut:#666;--hl:" + cfg.hl + ";--acc:" + cfg.accent + ";--ic:" + cfg.iconColor + ";font-family:inherit;font-size:14px;line-height:1.4;color:var(--fg)}",
    ".w.dark{--bg:#1b1f24;--fg:#e8ecef;--card:#252b32;--line:#4a525b;--mut:#9aa6b0}",
    "@media (prefers-color-scheme:dark){.w.auto{--bg:#1b1f24;--fg:#e8ecef;--card:#252b32;--line:#4a525b;--mut:#9aa6b0}}",
    cfg.bg ? ".w.w{--bg:" + cfg.bg + "}" : "",
    cfg.text ? ".w.w{--fg:" + cfg.text + "}" : "",
    "@supports (color:color-mix(in srgb,red,blue)){.w.w{--card:color-mix(in srgb,var(--fg) 5%,var(--bg));--line:color-mix(in srgb,var(--fg) 28%,var(--bg));--mut:color-mix(in srgb,var(--fg) 62%,var(--bg))}}",
    ".btn{position:fixed;bottom:" + cfg.bottom + ";" + cfg.side + ":" + cfg.edge + ";width:" + cfg.size + ";height:" + cfg.size + ";border-radius:" + (cfg.shape === "round" ? "50%" : "0") + ";border:0;background:var(--acc);color:var(--ic);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:" + (cfg.accent === "transparent" ? "none" : "0 2px 10px rgba(0,0,0,.3)") + ";padding:0;z-index:2147483000}",
    ".img{width:100%;height:100%;object-fit:" + cfg.imageFit + ";border-radius:inherit;display:block}",
    ".ico{font-size:24px;line-height:1}",
    ".panel{position:fixed;bottom:" + cfg.bottom + ";" + cfg.side + ":calc(" + cfg.edge + " + " + cfg.size + " + 10px);width:min(340px,calc(100vw - " + cfg.edge + " - " + cfg.size + " - 26px));max-height:min(520px,calc(100vh - " + cfg.bottom + " - 16px));display:none;flex-direction:column;background:var(--bg);border:1px solid var(--line);z-index:2147483001}",
    "@media (max-width:480px){.panel{left:" + cfg.edge + ";right:" + cfg.edge + ";width:auto;bottom:" + cfg.edge + ";max-height:calc(100vh - " + cfg.edge + " - " + cfg.edge + ")}}",
    ".btn:hover{filter:brightness(1.08)}",
    ".btn:focus-visible,.x:focus-visible,summary:focus-visible,.retry:focus-visible{outline:3px solid var(--hl);outline-offset:2px}",
    ".btn svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    ".badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:" + (cfg.shape === "round" ? "10px" : "0") + ";background:#d6361f;color:#fff;font:600 12px/20px system-ui,sans-serif;text-align:center;padding:0 5px}",
    ".panel.open{display:flex;animation:in .15s ease-out}",
    "@keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion:reduce){.panel.open{animation:none}}",
    ".hd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line)}",
    ".hd h2{margin:0;font-size:15px;font-weight:600;flex:1}",
    ".x{border:0;background:none;color:var(--mut);font-size:20px;line-height:1;cursor:pointer;padding:2px 6px}",
    ".bd{overflow:auto;padding:10px 12px 12px}",
    ".q{background:var(--card);border:1px solid var(--line);padding:10px;margin-bottom:8px}",
    ".q h3{margin:0;font-size:14px;font-weight:600;overflow-wrap:anywhere}",
    ".sum{margin-top:2px;color:var(--mut);font-size:13px;overflow-wrap:anywhere}",
    ".bar{height:6px;background:var(--line);margin:8px 0 4px;overflow:hidden}",
    ".bar i{display:block;height:100%;background:var(--hl)}",
    ".cnt{font-size:12px;color:var(--mut)}",
    ".now{margin-top:6px;overflow-wrap:anywhere}",
    ".hint{margin-top:6px;padding:6px 8px;border-left:3px solid var(--hl);background:var(--bg);font-size:13px;color:var(--mut);overflow-wrap:anywhere}",
    ".empty,.msg,.note{color:var(--mut);font-size:13px}",
    ".note{padding:8px 12px;border-top:1px solid var(--line)}",
    "details{margin-top:10px}summary{cursor:pointer;color:var(--mut);font-size:13px}",
    "details ul{list-style:none;margin:6px 0 0;padding:0}details li{padding:4px 0;color:var(--mut);overflow-wrap:anywhere}",
    ".retry{margin-left:6px}",
  ].join("");

  // Built-in button icons. data-icon takes one of these names, or up to 4 characters (such as an emoji) shown as text.
  var ICONS = {
    bag: '<path d="M6.5 8h11l1 12h-13z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    backpack: '<path d="M8 21h8a2 2 0 0 0 2-2v-7a6 6 0 0 0-12 0v7a2 2 0 0 0 2 2z"/><path d="M9 6.5V5a3 3 0 0 1 6 0v1.5"/><path d="M9 15h6"/>',
    chest: '<path d="M3 9V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v1"/><rect x="3" y="9" width="18" height="11"/><path d="M12 12v3"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',
    key: '<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H21M18 12v3M15 12v2"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/>',
    scroll: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M9 9h6M9 13h6"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>'
  };
  function drawIcon(btn) {
    var name = cfg.icon;
    if (ICONS[name]) { btn.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + "</svg>"); return; }
    if (name && Array.from(name).length <= 4) { var s = document.createElement("span"); s.className = "ico"; s.textContent = name; btn.insertBefore(s, btn.firstChild); return; }
    btn.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS.scroll + "</svg>");
  }
  function fillIcon(btn) {
    if (!cfg.image) { drawIcon(btn); return; }
    var img = document.createElement("img"); img.className = "img"; img.alt = ""; img.src = cfg.image;
    img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); drawIcon(btn); }; // a missing picture falls back to the icon
    btn.insertBefore(img, btn.firstChild);
  }

  var host, root, btn, panel, bodyEl, noteEl, badgeEl;
  var state = { open: false, loaded: false, error: false, defs: null, all: {}, signedIn: false, seq: 0 };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // How many steps are done, from the saved state and the quest's "progress" setting. 0 if unknown.
  function stepsDone(q, saved) {
    if (!q.progress || !saved || typeof saved !== "object") return 0;
    var v = saved[q.progress.field];
    var n = q.progress.count ? (Array.isArray(v) ? v.length : 0) : Number(v);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(Math.floor(n), q.steps.length);
  }

  function build() {
    host = document.createElement("div");
    host.setAttribute("data-site-widget", "quests");
    root = host.attachShadow({ mode: "open" });
    var style = document.createElement("style"); style.textContent = CSS; root.appendChild(style);
    var w = el("div", "w" + (cfg.theme === "light" ? "" : " " + cfg.theme)); root.appendChild(w);

    btn = el("button", "btn"); btn.type = "button"; fillIcon(btn);
    btn.setAttribute("aria-label", "Open " + cfg.title.toLowerCase()); btn.setAttribute("aria-expanded", "false");
    badgeEl = el("span", "badge"); badgeEl.style.display = "none"; badgeEl.setAttribute("aria-hidden", "true"); btn.appendChild(badgeEl);
    btn.onclick = function () { toggle(); };

    panel = el("div", "panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", cfg.title);
    var hd = el("div", "hd"); hd.appendChild(el("h2", null, cfg.title));
    var x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", "Close");
    x.onclick = function () { toggle(false); btn.focus(); };
    hd.appendChild(x);
    bodyEl = el("div", "bd"); noteEl = el("div", "note");
    panel.appendChild(hd); panel.appendChild(bodyEl); panel.appendChild(noteEl);
    w.appendChild(panel); w.appendChild(btn);
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { toggle(false); btn.focus(); } });
    document.body.appendChild(host);
  }

  function toggle(force) {
    state.open = force === undefined ? !state.open : !!force;
    panel.classList.toggle("open", state.open);
    btn.setAttribute("aria-expanded", state.open ? "true" : "false");
    if (state.open) {
      try { window.dispatchEvent(new CustomEvent("site-widget-open", { detail: { name: "quests", side: cfg.side } })); } catch (e) {}
      refresh();
    }
  }
  window.addEventListener("site-widget-open", function (e) {
    var d = e.detail || {}; if (d.name !== "quests" && d.side === cfg.side && state.open) toggle(false);
  });

  function split() {
    var active = [], finished = [];
    ((state.defs && state.defs.quests) || []).forEach(function (q) {
      var saved = state.all[q.id];
      if (saved == null) return; // not started: not shown
      var n = stepsDone(q, saved);
      if (q.steps.length && n >= q.steps.length) finished.push(q); else active.push({ q: q, n: n });
    });
    return { active: active, finished: finished };
  }

  function card(item) {
    var q = item.q, n = item.n, c = el("div", "q");
    c.appendChild(el("h3", null, q.title));
    if (q.summary) c.appendChild(el("div", "sum", q.summary));
    if (q.steps.length) {
      var bar = el("div", "bar"); bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuemin", "0"); bar.setAttribute("aria-valuemax", String(q.steps.length)); bar.setAttribute("aria-valuenow", String(n));
      bar.setAttribute("aria-label", q.title + " progress");
      var fill = el("i"); fill.style.width = Math.round((n / q.steps.length) * 100) + "%"; bar.appendChild(fill);
      c.appendChild(bar);
      c.appendChild(el("div", "cnt", "Step " + Math.min(n + 1, q.steps.length) + " of " + q.steps.length + " (" + n + " done)"));
      var step = q.steps[n];
      if (step && step.text) c.appendChild(el("div", "now", step.text));
      if (step && step.hint) c.appendChild(el("div", "hint", "Hint: " + step.hint));
    } else {
      c.appendChild(el("div", "cnt", "In progress"));
    }
    return c;
  }

  function render() {
    bodyEl.textContent = "";
    var parts = state.loaded ? split() : { active: [], finished: [] };
    if (state.error) {
      var m = el("div", "msg", "Couldn't load your quests. "); var r = el("button", "retry", "Try again"); r.type = "button";
      r.onclick = function () { refresh(); }; m.appendChild(r); bodyEl.appendChild(m);
    } else if (!state.loaded) {
      bodyEl.appendChild(el("div", "msg", "Loading…"));
    } else {
      if (!parts.active.length) bodyEl.appendChild(el("div", "empty", parts.finished.length ? "No active quests right now." : "No active quests yet. Quests you start will appear here."));
      parts.active.forEach(function (it) { bodyEl.appendChild(card(it)); });
      if (parts.finished.length) {
        var d = el("details"); d.appendChild(el("summary", null, "Completed (" + parts.finished.length + ")"));
        var ul = el("ul"); parts.finished.forEach(function (q) { ul.appendChild(el("li", null, q.title)); });
        d.appendChild(ul); bodyEl.appendChild(d);
      }
    }
    var count = parts.active.length;
    badgeEl.textContent = String(count); badgeEl.style.display = state.loaded && count ? "" : "none";
    btn.setAttribute("aria-label", "Open " + cfg.title.toLowerCase() + (state.loaded && count ? " (" + count + " active)" : ""));
    noteEl.textContent = state.loaded && !state.signedIn ? "Not logged in: your quest progress is kept in this browser only." : "";
    noteEl.style.display = noteEl.textContent ? "" : "none";
  }

  function refresh() {
    var mine = ++state.seq;
    window.__siteDeps.then(function () {
      if (!window.SiteProgress || !window.SiteAccount) { state.error = true; render(); return; }
      return Promise.all([window.SiteAccount.defs(), window.SiteProgress.loadAll(), window.SiteAccount.me()]).then(function (res) {
        if (mine !== state.seq) return;
        var defs = res[0], who = res[2];
        if (!defs || !defs.ok) { state.error = true; render(); return; }
        state.defs = defs; state.all = res[1] || {};
        state.signedIn = !!(who && who.ok && who.user); state.loaded = true; state.error = false;
        render();
      });
    }).catch(function () { state.error = true; render(); });
  }

  function start() {
    build(); render();
    window.addEventListener("siteprogress", function () { refresh(); });
    window.addEventListener("storage", function (e) { if (e.key && e.key.indexOf("quest:") === 0) refresh(); });
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") refresh(); });
    // onChange runs once straight away (which fills in the number on the button) and again whenever the login changes
    window.__siteDeps.then(function () { if (window.SiteAccount) window.SiteAccount.onChange(function () { refresh(); }); else refresh(); });
  }

  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
