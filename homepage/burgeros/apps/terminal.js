/* BurgerOS Terminal. Commands live in content.js (terminal). */
(function () {
"use strict";
var OS = window.BurgerOS;

OS.addStyle("terminal", [
  ".bt { flex: 1; min-height: 0; background: #0c0c0c; color: #33ff66; overflow-y: auto; cursor: text; padding: 10px 14px;",
  "  font: 15px 'DejaVu Sans Mono', Consolas, 'Courier New', monospace; user-select: text; -webkit-user-select: text; }",
  ".bt .out div { white-space: pre-wrap; word-wrap: break-word; line-height: 1.4; }",
  ".bt .prompt { color: #5fafff; }",
  ".bt .error { color: #ff5f5f; }",
  ".bt .dim { color: #7a7a7a; }",
  ".bt .line { display: flex; line-height: 1.4; }",
  ".bt .cmd { flex: 1; background: transparent; border: none; outline: none; color: inherit; font: inherit; padding: 0; margin-left: 0.5em; caret-color: #33ff66; }"
].join("\n"));

var BUILTIN_HELP = {
  help: "Show this list",
  clear: "Clear the screen",
  echo: "Print text back",
  open: "Open an app, page or file",
  exit: "Close the terminal"
};

OS.registerApp("terminal", {
  multi: true,
  open: function () {
    var cfg = OS.content.terminal || {};
    var PROMPT = cfg.prompt || "guest@burgeros:~$";
    var COMMANDS = cfg.commands || {};

    var win = OS.openWindow({ title: "Terminal", icon: "terminal", width: 700, height: 440 });
    var root = document.createElement("div");
    root.className = "bt";
    root.innerHTML = '<div class="out"></div><div class="line"><span class="prompt"></span>' +
      '<input class="cmd" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></div>';
    win.body.appendChild(root);
    var output = root.querySelector(".out"), input = root.querySelector(".cmd");
    root.querySelector(".prompt").textContent = PROMPT;
    var history = [], hIndex = 0;

    function scroll() { root.scrollTop = 1e9; }
    function print(text, cls) {
      list(text).forEach(function (t) {
        var line = document.createElement("div");
        line.textContent = t;
        if (cls) line.className = cls;
        output.appendChild(line);
      });
      scroll();
    }
    function list(v) { return Array.isArray(v) ? v : [v]; }

    // What a  run  function gets as its "term"
    var term = {
      print: print,
      error: function (t) { print(t, "error"); },
      dim: function (t) { print(t, "dim"); },
      clear: function () { output.innerHTML = ""; },
      close: function () { win.close(); },
      window: win
    };

    // A command only exists once it's unlocked
    function command(name) {
      if (!Object.prototype.hasOwnProperty.call(COMMANDS, name)) return null;
      var c = COMMANDS[name];
      return OS.check(c.when) ? c : null;
    }

    function openLater(label, fn) {
      print("Opening " + label + " ...", "dim");
      setTimeout(fn, 400);
    }

    var BUILTINS = {
      help: function () {
        print("Available commands:");
        var all = {};
        Object.keys(BUILTIN_HELP).forEach(function (k) { all[k] = BUILTIN_HELP[k]; });
        Object.keys(COMMANDS).forEach(function (k) {
          var c = command(k);
          if (c && !c.hidden) all[k] = c.help || "";
        });
        var width = 0;
        for (var k in all) width = Math.max(width, k.length);
        for (var name in all) print("  " + name + new Array(width - name.length + 3).join(" ") + all[name]);
      },
      clear: term.clear,
      echo: function (args) { print(args.join(" ")); },
      exit: function () { win.close(); },
      open: function (args) {
        var what = args.join(" ");
        if (!what) { print("usage: open <app | page | file>", "error"); return; }
        openLater(what, function () {
          if (!OS.open(what)) print("open: " + what + ": No such file or directory", "error");
        });
      }
    };

    function run(raw) {
      var line = document.createElement("div");
      var p = document.createElement("span");
      p.className = "prompt";
      p.textContent = PROMPT + " ";
      line.appendChild(p);
      line.appendChild(document.createTextNode(raw));
      output.appendChild(line);

      var parts = raw.trim().split(/\s+/);
      var name = parts[0].toLowerCase(), args = parts.slice(1);
      if (!name) { scroll(); return; }

      var c = command(name);
      if (c) {
        OS.effects(c.effects);
        if (c.print != null) print(c.print);
        if (c.run) {
          try { c.run(args, term, OS); } catch (e) { print(name + ": " + e.message, "error"); }
        }
        if (c.open) openLater(c.open, function () { OS.openLink(c.open); });
        if (c.app) openLater(c.app, function () { OS.launch(c.app, c.args); });
      } else if (BUILTINS[name]) {
        BUILTINS[name](args);
      } else {
        print("bash: " + name + ": command not found", "error");
      }
      scroll();
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var value = input.value;
        if (value.trim()) history.push(value);
        hIndex = history.length;
        input.value = "";
        run(value);
      } else if (e.key === "ArrowUp") {
        if (hIndex > 0) { hIndex--; input.value = history[hIndex]; }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (hIndex < history.length - 1) { hIndex++; input.value = history[hIndex]; }
        else { hIndex = history.length; input.value = ""; }
        e.preventDefault();
      }
    });
    root.addEventListener("click", function () {
      if (!window.getSelection().toString()) input.focus();
    });
    win.onFocus = function () { setTimeout(function () { if (!window.getSelection().toString()) input.focus(); }, 0); };

    var now = new Date().toString();
    (cfg.welcome || []).forEach(function (l) { print(String(l).replace("{date}", now)); });
    input.focus();
    return win;
  }
});
})();
