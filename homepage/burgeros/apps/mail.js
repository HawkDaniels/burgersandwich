/* BurgerOS Mail. Messages and settings live in content.js (mail). */
(function () {
"use strict";
var OS = window.BurgerOS, esc = OS.esc, M = OS.mail;

OS.addStyle("mail", [
  ".bm { flex: 1; min-height: 0; display: flex; flex-direction: column; }",
  ".bm .bmMenu { display: flex; padding: 2px; flex: 0 0 auto; }",
  ".bm .bmMenu > span { position: relative; padding: 2px 7px; cursor: default; }",
  ".bm .bmMenu > span:hover, .bm .bmMenu > span.open { box-shadow: inset -1px -1px #808080, inset 1px 1px #fff; }",
  ".bm .bmMenu > span.open { box-shadow: inset 1px 1px #808080, inset -1px -1px #fff; }",
  ".bm .bmDrop { position: absolute; top: 100%; left: 0; z-index: 60; min-width: 190px; padding: 2px; display: none; }",
  ".bm .bmMenu > span.open .bmDrop { display: block; }",
  ".bm .bmDrop div { padding: 3px 20px; white-space: nowrap; }",
  ".bm .bmDrop div:hover { background: #000080; color: #fff; }",
  ".bm .bmDrop hr { border: none; height: 2px; margin: 3px 1px; box-shadow: inset 0 1px #808080, inset 0 -1px #fff; }",
  ".bm .bmTools { display: flex; gap: 1px; padding: 3px 4px; flex: 0 0 auto; border-top: 1px solid #fff; box-shadow: inset 0 1px #808080; overflow-x: auto; }",
  ".bm .tool { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 58px; padding: 3px 6px; background: none; border: none; cursor: pointer; }",
  ".bm .tool svg { width: 24px; height: 24px; }",
  ".bm .tool:hover:not(:disabled) { box-shadow: inset -1px -1px #808080, inset 1px 1px #fff; }",
  ".bm .tool:active:not(:disabled) { box-shadow: inset 1px 1px #808080, inset -1px -1px #fff; }",
  ".bm .tool:disabled { opacity: 0.4; cursor: default; }",
  ".bm .toolSep { width: 2px; margin: 2px 4px; flex: 0 0 auto; box-shadow: inset 1px 0 #808080, inset -1px 0 #fff; }",
  ".bm .bmMain { flex: 1; min-height: 0; display: flex; gap: 3px; padding: 3px 0; }",
  ".bm .bmFolderPane { width: 190px; flex: 0 0 190px; display: flex; flex-direction: column; padding: 2px; }",
  ".bm .paneHead { padding: 3px 6px; background: #c0c0c0; font-weight: bold; flex: 0 0 auto; box-shadow: inset -1px -1px #808080, inset 1px 1px #fff; }",
  ".bm .bmFolders { flex: 1; overflow: auto; padding: 4px 2px; }",
  ".bm .folder { display: flex; align-items: center; gap: 5px; padding: 2px 4px; margin-left: 14px; cursor: default; white-space: nowrap; }",
  ".bm .folder.root { margin-left: 0; }",
  ".bm .folder svg { width: 16px; height: 16px; flex: 0 0 16px; }",
  ".bm .folder .fname { padding: 0 2px; }",
  ".bm .folder.current .fname { background: #000080; color: #fff; }",
  ".bm .folder .count { color: #00f; font-weight: bold; }",
  ".bm .folder.current .count { color: #fff; }",
  ".bm .bmRight { flex: 1; min-width: 0; display: flex; flex-direction: column; }",
  ".bm .bmListWrap { flex: 0 0 42%; display: flex; flex-direction: column; min-height: 80px; padding: 2px; }",
  ".bm .bmList { flex: 1; overflow: auto; outline: none; }",
  ".bm table { width: 100%; border-collapse: collapse; table-layout: fixed; }",
  ".bm th { position: sticky; top: 0; background: #c0c0c0; font-weight: normal; text-align: left; padding: 2px 5px; box-shadow: inset -1px -1px #808080, inset 1px 1px #fff; cursor: pointer; white-space: nowrap; overflow: hidden; z-index: 1; }",
  ".bm th:active { box-shadow: inset 1px 1px #808080; }",
  ".bm th .arrow { font-size: 8px; margin-left: 4px; }",
  ".bm td { padding: 2px 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: default; }",
  ".bm td svg, .bm th svg { width: 14px; height: 14px; vertical-align: -3px; }",
  ".bm th.ic, .bm td.ic { width: 22px; padding: 2px 3px; text-align: center; }",
  ".bm th.from { width: 26%; } .bm th.date { width: 150px; }",
  ".bm tr.unread td { font-weight: bold; }",
  ".bm tr.sel td { background: #000080; color: #fff; }",
  ".bm .bmList:not(:focus) tr.sel td { background: #c0c0c0; color: #000; }",
  ".bm .emptyList { padding: 12px; color: #808080; }",
  ".bm .bmSplit { height: 5px; cursor: ns-resize; flex: 0 0 auto; }",
  ".bm .bmPreview { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 2px; }",
  ".bm .pvHead { flex: 0 0 auto; padding: 6px 8px; background: #e8e6df; border-bottom: 1px solid #808080; line-height: 1.6; user-select: text; -webkit-user-select: text; }",
  ".bm .pvHead b { display: inline-block; width: 58px; font-weight: normal; color: #444; }",
  ".bm .pvHead .subj { font-weight: bold; }",
  ".bm .pvAttach { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }",
  ".bm .attach { display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; background: #fff; border: 1px solid #a0a0a0; cursor: pointer; color: #000; text-decoration: none; }",
  ".bm .attach:hover { border-color: #3a6ea5; background: #eef4fb; }",
  ".bm .attach svg { width: 14px; height: 14px; }",
  ".bm .pvBody { flex: 1; overflow: auto; padding: 10px 12px; font: 13px Arial, Helvetica, sans-serif; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; user-select: text; -webkit-user-select: text; background: #fff; }",
  ".bm .pvBody a { color: #00e; }",
  ".bm .pvEmpty { color: #808080; font: 12px Tahoma, sans-serif; padding: 20px; text-align: center; white-space: normal; }",
  ".bm .bmStatus { display: flex; gap: 2px; flex: 0 0 auto; }",
  ".bm .bmStatus div { padding: 2px 6px; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080; }",
  ".bm .bmStatus div:first-child { flex: 1; }",
  /* compose & find windows */
  ".bm .fields { padding: 6px; display: grid; grid-template-columns: 62px 1fr; gap: 4px 6px; align-items: center; }",
  ".bm .fields input { font: inherit; border: none; padding: 3px 4px; outline: none; width: 100%; user-select: text; -webkit-user-select: text; }",
  ".bm .fields .fixed { padding: 3px 4px; color: #444; }",
  ".bm .composeBody { flex: 1; min-height: 80px; margin: 0 6px 6px; font: 13px Arial, sans-serif; border: none; padding: 6px; resize: none; outline: none; user-select: text; -webkit-user-select: text; }",
  ".bm .dlgBtns { display: flex; justify-content: flex-end; gap: 6px; padding: 4px 6px 6px; }"
].join("\n"));

var ICONS = {
  newmail: '<rect x="2" y="7" width="18" height="13" fill="#fff" stroke="#333"/><path d="M2 7l9 7 9-7" fill="none" stroke="#333"/><path d="M19 1l4 4-9 9-5 1 1-5z" fill="#fc0" stroke="#333"/>',
  reply: '<rect x="6" y="8" width="17" height="12" fill="#fff" stroke="#333"/><path d="M6 8l8.5 6L23 8" fill="none" stroke="#333"/><path d="M1 9l5-5v3h4v4H6v3z" fill="#3a6ea5" stroke="#123"/>',
  replyall: '<rect x="8" y="8" width="15" height="12" fill="#fff" stroke="#333"/><path d="M8 8l7.5 6L23 8" fill="none" stroke="#333"/><path d="M5 9l4-4v2h3v4H9v2z" fill="#3a6ea5" stroke="#123"/><path d="M1 9l4-4v8z" fill="#3a6ea5" stroke="#123"/>',
  forward: '<rect x="1" y="8" width="17" height="12" fill="#fff" stroke="#333"/><path d="M1 8l8.5 6L18 8" fill="none" stroke="#333"/><path d="M23 9l-5-5v3h-4v4h4v3z" fill="#3a6ea5" stroke="#123"/>',
  print: '<rect x="6" y="2" width="12" height="7" fill="#fff" stroke="#333"/><rect x="2" y="9" width="20" height="9" fill="#c0c0c0" stroke="#333"/><rect x="6" y="15" width="12" height="7" fill="#fff" stroke="#333"/><path d="M8 18h8M8 20h6" stroke="#666"/>',
  del: '<path d="M5 5l14 14M19 5L5 19" stroke="#c00" stroke-width="4"/>',
  sendrecv: '<rect x="2" y="7" width="14" height="10" fill="#fff" stroke="#333"/><path d="M2 7l7 5 7-5" fill="none" stroke="#333"/><path d="M14 4h6v4l3-3m-3 3l-3-3M20 20h-6v-4l-3 3m3-3l3 3" fill="none" stroke="#3a6ea5" stroke-width="2"/>',
  addr: '<rect x="4" y="2" width="16" height="20" fill="#3a6ea5" stroke="#123"/><rect x="6" y="4" width="12" height="16" fill="#fff"/><circle cx="12" cy="9" r="3" fill="#c96"/><path d="M7 18c0-4 10-4 10 0z" fill="#36c"/>',
  find: '<circle cx="10" cy="10" r="6" fill="#bdf" stroke="#333" stroke-width="2"/><path d="M14.5 14.5l7 7" stroke="#333" stroke-width="3"/>',
  inbox: '<path d="M1 9l3-6h8l3 6v5H1z" fill="#fff" stroke="#333"/><path d="M1 9h4l1 2h4l1-2h4" fill="none" stroke="#333"/><path d="M8 1v5M6 4l2 2 2-2" fill="none" stroke="#3a6ea5"/>',
  sent: '<path d="M1 9l3-6h8l3 6v5H1z" fill="#fff" stroke="#333"/><path d="M1 9h4l1 2h4l1-2h4" fill="none" stroke="#333"/><path d="M8 7V1M6 3l2-2 2 2" fill="none" stroke="#090"/>',
  drafts: '<path d="M2 1h9l3 3v11H2z" fill="#fff" stroke="#333"/><path d="M4 6h7M4 9h7M4 12h5" stroke="#999"/><path d="M14 5l-5 6-1 2 2-1 5-6z" fill="#fc0" stroke="#333"/>',
  deleted: '<path d="M3 5h10l-1 10H4z" fill="#ddd" stroke="#333"/><rect x="2" y="3" width="12" height="2" fill="#aaa" stroke="#333"/><path d="M6 7v6M8 7v6M10 7v6" stroke="#777"/>',
  junk: '<path d="M3 5h10l-1 10H4z" fill="#ddd" stroke="#333"/><rect x="2" y="3" width="12" height="2" fill="#aaa" stroke="#333"/><circle cx="8" cy="10" r="3" fill="none" stroke="#c00" stroke-width="1.5"/><path d="M6 12l4-4" stroke="#c00" stroke-width="1.5"/>',
  folder: '<path d="M1 4h5l2 2h7v8H1z" fill="#fc0" stroke="#333"/>',
  account: '<rect x="1" y="2" width="14" height="10" fill="#c0c0c0" stroke="#333"/><rect x="3" y="4" width="10" height="6" fill="#3a6ea5"/><rect x="5" y="12" width="6" height="2" fill="#808080"/>',
  closed: '<rect x="1" y="3" width="14" height="10" fill="#ffe680" stroke="#333"/><path d="M1 3l7 6 7-6" fill="none" stroke="#333"/>',
  open: '<path d="M1 7l7-5 7 5v7H1z" fill="#fff" stroke="#333"/><path d="M1 7l7 5 7-5" fill="none" stroke="#333"/>',
  clip: '<path d="M10 4v7a2.5 2.5 0 01-5 0V3.5a1.5 1.5 0 013 0V10" fill="none" stroke="#333" stroke-width="1.2"/>',
  bang: '<rect x="6.5" y="2" width="3" height="8" fill="#d00"/><rect x="6.5" y="12" width="3" height="3" fill="#d00"/>',
  file: '<path d="M3 1h7l3 3v11H3z" fill="#fff" stroke="#333"/><path d="M10 1v3h3" fill="none" stroke="#333"/>'
};
var BIG = { newmail: 1, reply: 1, replyall: 1, forward: 1, print: 1, del: 1, sendrecv: 1, addr: 1, find: 1 };
function svg(name) {
  var vb = BIG[name] ? 24 : 16;
  return '<svg viewBox="0 0 ' + vb + ' ' + vb + '">' + (ICONS[name] || "") + '</svg>';
}

function fmtTime(d) {
  var h = d.getHours(), m = d.getMinutes();
  return ((h % 12) || 12) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM");
}
function fmtDate(d, full) {
  if (!d || isNaN(d)) return "";
  if (!full && d.toDateString() === new Date().toDateString()) return fmtTime(d);
  return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + fmtTime(d);
}

function linkify(text) {
  var out = esc(text);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, u) {
    return '<a href="' + u + '" data-go="' + u + '">' + t + '</a>';
  });
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, function (_, pre, u) {
    return pre + '<a href="' + u + '" data-go="' + u + '">' + u + '</a>';
  });
  return out;
}

var TOOLS = [
  ["new", "newmail", "Create Mail"], ["sep"],
  ["reply", "reply", "Reply"], ["replyall", "replyall", "Reply All"], ["forward", "forward", "Forward"], ["sep"],
  ["print", "print", "Print"], ["delete", "del", "Delete"], ["sep"],
  ["sendrecv", "sendrecv", "Send/Recv"], ["sep"],
  ["addr", "addr", "Addresses"], ["find", "find", "Find"]
];

OS.registerApp("mail", {
  open: function (args) {
    var cfg = M.config, APP = cfg.appName;
    var current = M.INBOX, selectedId = null, sortKey = "date", sortDir = -1, visible = [];

    var win = OS.openWindow({ title: APP, icon: "mail", width: 900, height: 600 });
    var root = document.createElement("div");
    root.className = "bm";
    root.innerHTML =
      '<div class="bmMenu"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>T</u>ools</span>' +
        '<span><u>M</u>essage</span><span class="bmHelp"><u>H</u>elp<div class="bmDrop raised">' +
        '<div data-help="reset">Reset Mailbox...</div><hr><div data-help="about">About ' + esc(APP) + '</div></div></span></div>' +
      '<div class="bmTools">' + TOOLS.map(function (t) {
        if (t[0] === "sep") return '<div class="toolSep"></div>';
        return '<button class="tool" data-tool="' + t[0] + '" title="' + t[2] + '">' + svg(t[1]) + '<span>' + t[2] + '</span></button>';
      }).join("") + '</div>' +
      '<div class="bmMain">' +
        '<div class="bmFolderPane sunken"><div class="paneHead">Folders</div><div class="bmFolders"></div></div>' +
        '<div class="bmRight">' +
          '<div class="bmListWrap sunken"><div class="bmList" tabindex="0"></div></div>' +
          '<div class="bmSplit"></div>' +
          '<div class="bmPreview sunken"><div class="pvHead"></div><div class="pvBody"></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="bmStatus"><div class="bmStatusText"></div><div>Working Online</div></div>';
    win.body.appendChild(root);
    var $ = function (s) { return root.querySelector(s); };
    var listEl = $(".bmList");

    // ---- Title: "(1) Inbox - Mail" ----
    function updateTitle() {
      var n = M.unread(M.INBOX);
      win.setTitle((n ? "(" + n + ") " : "") + M.folders[current].name + " - " + APP);
    }

    // ---- Toolbar ----
    function updateTools() {
      var has = !!selectedMsg();
      ["reply", "replyall", "forward", "print", "delete"].forEach(function (k) {
        root.querySelector('[data-tool="' + k + '"]').disabled = !has;
      });
    }
    $(".bmTools").addEventListener("click", function (e) {
      var b = e.target.closest("[data-tool]");
      if (!b || b.disabled) return;
      var m = selectedMsg();
      switch (b.getAttribute("data-tool")) {
        case "new": compose({}); break;
        case "reply": case "replyall":
          compose({ to: m._sent ? m.to : (m.address || m.from), subject: /^re:/i.test(m.subject) ? m.subject : "RE: " + m.subject, quote: m }); break;
        case "forward": compose({ subject: "FW: " + m.subject, quote: m }); break;
        case "print": OS.messageBox("Print", "No printers are installed. To install a printer, click Start, point to Settings, click Printers, and then double-click Add Printer.", "error"); break;
        case "delete": deleteSelected(); break;
        case "sendrecv": sendReceive(); break;
        case "addr": OS.messageBox("Address Book", "Your address book is empty.", "info"); break;
        case "find": findMessage(); break;
      }
    });

    // ---- Folders ----
    function renderFolders() {
      var html = '<div class="folder root">' + svg("account") + '<span class="fname">' + esc(cfg.accountName) + '</span></div>';
      M.folders.forEach(function (f, i) {
        var unread = M.unread(i);
        html += '<div class="folder' + (i === current ? " current" : "") + '" data-f="' + i + '">' + svg(f.icon || "folder") +
          '<span class="fname">' + esc(f.name) + (unread ? ' <span class="count">(' + unread + ')</span>' : "") + '</span></div>';
      });
      $(".bmFolders").innerHTML = html;
    }
    function goFolder(i) {
      current = i;
      selectedId = null;
      renderAll();
    }
    $(".bmFolders").addEventListener("click", function (e) {
      var f = e.target.closest("[data-f]");
      if (f) goFolder(Number(f.getAttribute("data-f")));
    });

    // ---- Message list ----
    function sorted(items) {
      return items.slice().sort(function (a, b) {
        var x, y;
        if (sortKey === "date") { x = +M.dateOf(a) || 0; y = +M.dateOf(b) || 0; }
        else if (sortKey === "from") { x = String(a._sent ? a.to : a.from || "").toLowerCase(); y = String(b._sent ? b.to : b.from || "").toLowerCase(); }
        else { x = String(a.subject || "").toLowerCase(); y = String(b.subject || "").toLowerCase(); }
        return x < y ? -sortDir : x > y ? sortDir : 0;
      });
    }
    function selectedMsg() {
      for (var i = 0; i < visible.length; i++) if (visible[i]._id === selectedId) return visible[i];
      return null;
    }
    function renderList() {
      visible = sorted(M.messagesIn(current));
      var isSent = current === M.SENT;
      var arrow = function (k) { return sortKey === k ? '<span class="arrow">' + (sortDir > 0 ? "&#9650;" : "&#9660;") + '</span>' : ""; };
      var html = '<table><thead><tr>' +
        '<th class="ic">' + svg("bang") + '</th><th class="ic">' + svg("clip") + '</th><th class="ic">' + svg("closed") + '</th>' +
        '<th class="from" data-sort="from">' + (isSent ? "To" : "From") + arrow("from") + '</th>' +
        '<th data-sort="subject">Subject' + arrow("subject") + '</th>' +
        '<th class="date" data-sort="date">' + (isSent ? "Sent" : "Received") + arrow("date") + '</th></tr></thead><tbody>';
      visible.forEach(function (m) {
        var read = M.isRead(m);
        html += '<tr data-id="' + esc(m._id) + '" class="' + (read ? "" : "unread") + (m._id === selectedId ? " sel" : "") + '">' +
          '<td class="ic">' + (m.important ? svg("bang") : "") + '</td>' +
          '<td class="ic">' + (m.attachments && m.attachments.length ? svg("clip") : "") + '</td>' +
          '<td class="ic">' + svg(read ? "open" : "closed") + '</td>' +
          '<td>' + esc(m._sent ? m.to : m.from) + '</td>' +
          '<td>' + esc(m.subject || "(no subject)") + '</td>' +
          '<td class="date">' + esc(fmtDate(M.dateOf(m))) + '</td></tr>';
      });
      html += '</tbody></table>';
      if (!visible.length) html += '<div class="emptyList">There are no items in this view.</div>';
      var scroll = listEl.scrollTop;
      listEl.innerHTML = html;
      listEl.scrollTop = scroll;
      if (!selectedMsg()) selectedId = null;
      var unread = visible.filter(function (m) { return !M.isRead(m); }).length;
      $(".bmStatusText").textContent = visible.length + " message(s), " + unread + " unread";
      updateTools();
    }
    listEl.addEventListener("click", function (e) {
      var th = e.target.closest("th[data-sort]");
      if (th) {
        var k = th.getAttribute("data-sort");
        if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = k === "date" ? -1 : 1; }
        renderList();
        return;
      }
      var tr = e.target.closest("tr[data-id]");
      if (tr) selectMsg(tr.getAttribute("data-id"));
    });
    function selectMsg(id) {
      selectedId = id;
      var m = selectedMsg();
      renderPreview();
      if (m && !M.isRead(m)) M.markRead(m);   // triggers a "mail" re-render
      else renderList();
      var row = listEl.querySelector("tr.sel");
      if (row) row.scrollIntoView({ block: "nearest" });
    }
    listEl.addEventListener("keydown", function (e) {
      if (!visible.length) return;
      var i = -1;
      for (var j = 0; j < visible.length; j++) if (visible[j]._id === selectedId) i = j;
      if (e.key === "ArrowDown") { e.preventDefault(); selectMsg(visible[Math.min(visible.length - 1, i + 1)]._id); }
      else if (e.key === "ArrowUp") { e.preventDefault(); selectMsg(visible[Math.max(0, i - 1)]._id); }
      else if (e.key === "Delete" && selectedId) deleteSelected();
    });

    // ---- Preview ----
    var shownId = undefined;
    function renderPreview() {
      var m = selectedMsg();
      var head = $(".pvHead"), body = $(".pvBody");
      if ((m ? m._id : null) === shownId && m) return;   // keep scroll position
      shownId = m ? m._id : null;
      if (!m) {
        head.style.display = "none";
        body.innerHTML = '<div class="pvEmpty">' + (visible.length ? "Select a message to read it." : "") + '</div>';
        return;
      }
      head.style.display = "";
      var from = m._sent ? esc(cfg.visitorName) + " &lt;" + esc(cfg.visitorAddress) + "&gt;"
                         : esc(m.from) + (m.address ? " &lt;" + esc(m.address) + "&gt;" : "");
      var to = m._sent ? esc(m.to) : esc(cfg.visitorName) + " &lt;" + esc(cfg.visitorAddress) + "&gt;";
      var att = "";
      if (m.attachments && m.attachments.length) {
        att = '<div class="pvAttach"><b>Attached:</b>' + m.attachments.map(function (a) {
          return '<a class="attach" href="' + esc(a.link || "#") + '" data-go="' + esc(a.link || "") + '">' + svg("file") + esc(a.name) + '</a>';
        }).join("") + '</div>';
      }
      head.innerHTML =
        '<div><b>From:</b>' + from + '</div>' +
        '<div><b>Date:</b>' + esc(fmtDate(M.dateOf(m), true)) + '</div>' +
        '<div><b>To:</b>' + to + '</div>' +
        '<div><b>Subject:</b><span class="subj">' + esc(m.subject || "(no subject)") + '</span></div>' + att;
      body.innerHTML = linkify(m.body || "");
      body.scrollTop = 0;
    }
    $(".bmPreview").addEventListener("click", function (e) {
      var a = e.target.closest("[data-go]");
      if (!a) return;
      e.preventDefault();
      OS.openLink(a.getAttribute("data-go"));
    });

    function renderAll() {
      renderFolders();
      renderList();
      renderPreview();
      updateTitle();
    }

    // ---- Divider between list and preview ----
    $(".bmSplit").addEventListener("pointerdown", function (e) {
      e.preventDefault();
      var wrap = $(".bmListWrap"), pane = $(".bmRight"), top = pane.getBoundingClientRect().top;
      function move(ev) {
        var h = Math.max(80, Math.min(pane.clientHeight - 100, ev.clientY - top));
        wrap.style.flex = "0 0 " + h + "px";
      }
      function up() {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });

    // ---- Delete ----
    function deleteSelected() {
      var m = selectedMsg();
      if (!m) return;
      var idx = visible.indexOf(m);
      var next = visible[idx + 1] || visible[idx - 1];
      selectedId = next && next !== m ? next._id : null;
      M.remove(m);   // triggers a "mail" re-render
      if (selectedId) { var n = selectedMsg(); if (n) M.markRead(n); }
      listEl.focus();
    }

    // ---- Compose (its own window) ----
    function compose(opts) {
      var quote = "";
      if (opts.quote) {
        var q = opts.quote;
        quote = "\n\n----- Original Message -----\nFrom: " + (q._sent ? cfg.visitorName : q.from) +
          "\nSent: " + fmtDate(M.dateOf(q), true) + "\nSubject: " + q.subject + "\n\n" +
          String(q.body || "").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1");
      }
      var cw = OS.openWindow({
        title: opts.subject || "New Message", icon: "mail", width: 560, height: 420,
        build: function (body) {
          body.innerHTML =
            '<div class="bm">' +
              '<div class="fields">' +
                '<span>From:</span><div class="fixed">' + esc(cfg.visitorName) + ' &lt;' + esc(cfg.visitorAddress) + '&gt;</div>' +
                '<span>To:</span><input class="sunken" data-f="to" spellcheck="false">' +
                '<span>Subject:</span><input class="sunken" data-f="subject">' +
              '</div>' +
              '<textarea class="composeBody sunken" data-f="body"></textarea>' +
              '<div class="dlgBtns"><button class="btn raised" data-send>Send</button><button class="btn raised" data-cancel>Cancel</button></div>' +
            '</div>';
        }
      });
      var el = cw.el;
      var to = el.querySelector('[data-f="to"]'), subj = el.querySelector('[data-f="subject"]'), body = el.querySelector('[data-f="body"]');
      to.value = cfg.sendMode === "mailto" && cfg.contactEmail && !opts.to ? cfg.contactEmail : (opts.to || "");
      subj.value = opts.subject || "";
      body.value = quote;
      subj.addEventListener("input", function () { cw.setTitle(subj.value || "New Message"); });
      (to.value ? body : to).focus();
      body.setSelectionRange(0, 0);
      el.querySelector("[data-cancel]").addEventListener("click", function () { cw.close(); });
      el.querySelector("[data-send]").addEventListener("click", function () {
        if (!to.value.trim()) { OS.messageBox(APP, "The message must have at least one name in the To box.", "warning"); return; }
        if (cfg.sendMode === "mailto") {
          location.href = "mailto:" + encodeURIComponent(cfg.contactEmail || to.value.trim()) +
            "?subject=" + encodeURIComponent(subj.value) + "&body=" + encodeURIComponent(body.value);
          cw.close();
          return;
        }
        var msg = { to: to.value.trim(), subject: subj.value, body: body.value };
        cw.close();
        OS.progressBox("Sending message...", function () { M.send(msg); }, APP);
      });
    }

    // ---- Send/Recv ----
    function sendReceive() {
      var result = M.sendReceive();
      OS.progressBox("Checking for new messages...", function () {
        result.then(function (n) {
          if (!n) OS.messageBox(APP, "There are no new messages.", "info");
        });
      }, APP);
    }

    // ---- Find ----
    function findMessage() {
      var fw = OS.openWindow({
        id: "mailFind", title: "Find Message", icon: "mail", width: 340, noMax: true, noResize: true,
        build: function (body) {
          body.innerHTML = '<div class="bm"><div class="fields"><span>Look for:</span><input class="sunken"></div>' +
            '<div class="dlgBtns"><button class="btn raised" data-find>Find Now</button><button class="btn raised" data-cancel>Cancel</button></div></div>';
        }
      });
      OS.centerWin(fw);
      var q = fw.el.querySelector("input");
      q.focus();
      function run() {
        var words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) return;
        fw.close();
        for (var fi = 0; fi < M.folders.length; fi++) {
          var hits = M.messagesIn(fi).filter(function (m) {
            var text = [m.from, m.to, m.subject, m.body].join(" ").toLowerCase();
            return words.every(function (w) { return text.indexOf(w) !== -1; });
          });
          if (hits.length) {
            win.show();
            current = fi;
            renderAll();
            selectMsg(hits[0]._id);
            listEl.focus();
            return;
          }
        }
        OS.messageBox("Find Message", "No messages were found.", "info");
      }
      fw.el.querySelector("[data-find]").addEventListener("click", run);
      fw.el.querySelector("[data-cancel]").addEventListener("click", function () { fw.close(); });
      q.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); run(); } });
    }

    // ---- Help menu ----
    var helpMenu = $(".bmHelp");
    helpMenu.addEventListener("click", function (e) {
      e.stopPropagation();
      var item = e.target.closest("[data-help]");
      if (!item) { helpMenu.classList.toggle("open"); return; }
      helpMenu.classList.remove("open");
      if (item.getAttribute("data-help") === "about") {
        OS.messageBox("About " + APP, APP + " version 6.0. Use Help > Reset Mailbox to put every message back the way it started.", "info");
      } else {
        OS.messageBox("Reset Mailbox",
          "This will restore all deleted messages, mark everything as unread, and remove any messages you have sent.\n\nAre you sure you want to reset the mailbox?",
          "warning", { buttons: [{ label: "Yes", action: function () { selectedId = null; M.reset(); } }, { label: "No" }], focus: 1 });
      }
    });
    win.listen(document, "click", function () { helpMenu.classList.remove("open"); });

    // ---- Stay in sync with the rest of BurgerOS ----
    win.on("mail", renderAll);
    win.onRelaunch = function (a) { if (a && a.folder === "inbox") goFolder(M.INBOX); };

    renderAll();
    listEl.focus();
    return win;
  }
});
})();
