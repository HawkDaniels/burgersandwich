/* widget-inventory.js: a corner button that opens an inventory panel (key items, quest items, money).
   Add ONE line to the end of any page, just before </body>:

     <script src="/widget-inventory.js"></script>

   It loads site-account.js and site-progress.js from the same folder if the page has not already.
   It draws inside its own isolated box, so it does not take on the page's styles and does not change them.

   Optional settings, written on the script tag (all of them are optional):
     Look of the button
       data-icon="bag"             a built-in icon, or up to 4 characters such as an emoji (try data-icon="🎒")
                                   built-in icons: bag, backpack, chest, coin, key, star
       data-image="/img/bag.png"   your own picture instead of an icon (put the file on your site and give its
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
       data-title="Inventory"      panel title
       data-currency="burgerbux"       the word after the money amount
     Position
       data-side="right"           "right" or "left"
       data-bottom="16px"          distance from the bottom
       data-edge="16px"            distance from the side
   The panel opens beside the button, towards the middle of the page. On a phone it opens across the screen. */
(function () {
  "use strict";
  if (window.__widgetInventory) return;
  window.__widgetInventory = true;

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
    bottom: lengthOpt("bottom", "16px"),
    shape: oneOf("shape", "round", ["round", "square"]),
    accent: colourOpt("accent", "#4a67d6", true),
    iconColor: colourOpt("icon-color", "#ffffff", false),
    icon: opt("icon", "bag"),
    image: imageOpt(opt("image", "")),
    imageFit: oneOf("image-fit", "contain", ["contain", "cover"]),
    theme: oneOf("theme", "light", ["light", "dark", "auto"]),
    bg: colourOpt("bg", "", false),
    text: colourOpt("text", "", false),
    currency: opt("currency", "burgerbux"),
    title: opt("title", "Inventory"),
  };
  cfg.hl = cfg.accent === "transparent" ? "#4a67d6" : cfg.accent; // progress bars and focus rings need a visible colour

  // ---- make sure the two helper scripts are there (once, even if several widgets ask) ----
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

  // ---- the box ----
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
    ".btn:focus-visible,.x:focus-visible,summary:focus-visible{outline:3px solid var(--hl);outline-offset:2px}",
    ".btn svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    ".panel.open{display:flex;animation:in .15s ease-out}",
    "@keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion:reduce){.panel.open{animation:none}}",
    ".hd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line)}",
    ".hd h2{margin:0;font-size:15px;font-weight:600;flex:1}",
    ".money{font-weight:600;background:var(--card);border:1px solid var(--line);padding:2px 10px;white-space:nowrap}",
    ".x{border:0;background:none;color:var(--mut);font-size:20px;line-height:1;cursor:pointer;padding:2px 6px}",
    ".bd{overflow:auto;padding:8px 12px 12px}",
    "h3{margin:12px 0 6px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--mut)}",
    "h3:first-child{margin-top:4px}",
    "ul{list-style:none;margin:0;padding:0}",
    "li{background:var(--card);border:1px solid var(--line);padding:8px 10px;margin-bottom:6px}",
    ".row{display:flex;gap:8px;align-items:baseline}.nm{font-weight:600;flex:1;overflow-wrap:anywhere}.ct{color:var(--mut);font-variant-numeric:tabular-nums}",
    ".ds{margin-top:2px;color:var(--mut);font-size:13px;overflow-wrap:anywhere}",
    ".empty,.msg,.note{color:var(--mut);font-size:13px}",
    ".note{padding:8px 12px;border-top:1px solid var(--line)}",
    "button.retry{margin-left:6px}",
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
    btn.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS.bag + "</svg>");
  }
  function fillIcon(btn) {
    if (!cfg.image) { drawIcon(btn); return; }
    var img = document.createElement("img"); img.className = "img"; img.alt = ""; img.src = cfg.image;
    img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); drawIcon(btn); }; // a missing picture falls back to the icon
    btn.insertBefore(img, btn.firstChild);
  }

  var host, root, btn, panel, titleEl, moneyEl, bodyEl, noteEl;
  var state = { open: false, loaded: false, error: false, defs: null, inv: null, signedIn: false, seq: 0 };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function build() {
    host = document.createElement("div");
    host.setAttribute("data-site-widget", "inventory");
    root = host.attachShadow({ mode: "open" });
    var style = document.createElement("style"); style.textContent = CSS; root.appendChild(style);
    var w = el("div", "w" + (cfg.theme === "light" ? "" : " " + cfg.theme)); root.appendChild(w);

    btn = el("button", "btn"); btn.type = "button"; fillIcon(btn);
    btn.setAttribute("aria-label", "Open " + cfg.title.toLowerCase()); btn.setAttribute("aria-expanded", "false");
    btn.onclick = function () { toggle(); };

    panel = el("div", "panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", cfg.title);
    var hd = el("div", "hd"); titleEl = el("h2", null, cfg.title);
    moneyEl = el("span", "money"); var x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", "Close");
    x.onclick = function () { toggle(false); btn.focus(); };
    hd.appendChild(titleEl); hd.appendChild(moneyEl); hd.appendChild(x);
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
      try { window.dispatchEvent(new CustomEvent("site-widget-open", { detail: { name: "inventory", side: cfg.side } })); } catch (e) {}
      refresh();
    }
  }
  // Widgets on the same side take turns, so two panels never sit on top of each other.
  window.addEventListener("site-widget-open", function (e) {
    var d = e.detail || {}; if (d.name !== "inventory" && d.side === cfg.side && state.open) toggle(false);
  });

  function itemList(items, defsById, kind) {
    var ids = Object.keys(items).filter(function (id) { var d = defsById[id]; return d && d.kind === kind; });
    var h = el("h3", null, kind === "key" ? "Key items" : "Quest items");
    var frag = document.createDocumentFragment(); frag.appendChild(h);
    if (!ids.length) { frag.appendChild(el("div", "empty", kind === "key" ? "No key items yet." : "No quest items yet.")); return frag; }
    var ul = el("ul");
    ids.forEach(function (id) {
      var d = defsById[id], li = el("li"), row = el("div", "row");
      row.appendChild(el("span", "nm", d.name));
      if (items[id] > 1) row.appendChild(el("span", "ct", "×" + items[id]));
      li.appendChild(row);
      if (d.description) li.appendChild(el("div", "ds", d.description));
      ul.appendChild(li);
    });
    frag.appendChild(ul);
    return frag;
  }

  function render() {
    bodyEl.textContent = "";
    var inv = state.inv || { money: 0, items: {} };
    var guest = state.loaded && !state.signedIn;
    moneyEl.textContent = guest ? "" : inv.money.toLocaleString() + " " + cfg.currency;
    moneyEl.style.display = guest ? "none" : "";
    if (state.error) {
      var m = el("div", "msg", "Couldn't load your inventory. "); var r = el("button", "retry", "Try again"); r.type = "button";
      r.onclick = function () { refresh(); }; m.appendChild(r); bodyEl.appendChild(m);
    } else if (!state.loaded) {
      bodyEl.appendChild(el("div", "msg", "Loading…"));
    } else if (guest) {
      bodyEl.appendChild(el("div", "msg", "Log in to collect items and money."));
    } else {
      var byId = {}; ((state.defs && state.defs.items) || []).forEach(function (d) { byId[d.id] = d; });
      bodyEl.appendChild(itemList(inv.items, byId, "key"));
      bodyEl.appendChild(itemList(inv.items, byId, "quest"));
    }
    noteEl.textContent = "";
    noteEl.style.display = "none";
  }

  function refresh() {
    var mine = ++state.seq;
    window.__siteDeps.then(function () {
      if (!window.SiteAccount) { state.error = true; render(); return; }
      return Promise.all([window.SiteAccount.defs(), window.SiteAccount.me()]).then(function (res) {
        var defs = res[0], who = res[1];
        if (!defs || !defs.ok) { if (mine === state.seq) { state.error = true; render(); } return; }
        var signedIn = !!(who && who.ok && who.user);
        if (!signedIn) { if (mine === state.seq) { state.defs = defs; state.inv = null; state.signedIn = false; state.loaded = true; state.error = false; render(); } return; }
        return window.SiteAccount.inventory().then(function (inv) {
          if (mine !== state.seq) return; // a newer refresh is already running
          if (!inv || !inv.ok) { state.error = true; render(); return; }
          var items = {};
          Object.keys(inv.items || {}).forEach(function (k) { var n = Math.floor(Number(inv.items[k])); if (n > 0) items[k] = n; });
          state.defs = defs; state.inv = { money: Math.max(0, Math.floor(Number(inv.money)) || 0), items: items };
          state.signedIn = true; state.loaded = true; state.error = false;
          render();
        });
      });
    }).catch(function () { state.error = true; render(); });
  }

  function start() {
    build(); render();
    // keep the panel current: after any save on this page, when the login changes, and when you come back to the tab
    window.addEventListener("siteprogress", function (e) { if (!e.detail || e.detail.quest === "inventory") refresh(); });
        document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && state.open) refresh(); });
    window.__siteDeps.then(function () { if (window.SiteAccount) window.SiteAccount.onChange(function () { if (state.open) refresh(); }); });
  }

  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
