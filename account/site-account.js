/* site-account.js: include this on any page of the site to talk to the accounts system.
   Add a script tag with src="/account/site-account.js", then use window.SiteAccount.

   Every call returns a promise that resolves to an object: { ok: true, ... } or { ok: false, error: "code" }.
   It never throws and never rejects. SiteAccount.message(result) turns an error code into a sentence;
   edit the MESSAGES table below to change the wording.

   The accounts system is the bs-backend Worker, reached at /api on this same site (burgersandwich.jp/api/*).
   If a page is NOT on that domain, set window.SITE_API = "https://..." before loading this file.
   (Logins use cookies, so the same domain is strongly recommended.)

   Who is logged in is asked once per page and remembered: SiteAccount.current() and onChange() share that
   one answer, and it is asked again only when the login changes (on this tab or another). */
(function () {
  "use strict";
  if (window.SiteAccount) return; // already loaded (several widgets may ask for it)
  var BASE = (window.SITE_API || "").replace(/\/+$/, "") + "/api";

  var MESSAGES = {
    bad_username: "Usernames are 3 to 16 letters, numbers, - or _ (no spaces).",
    bad_password: "Passwords must be 8 to 128 characters.",
    username_taken: "That username is taken.",
    name_unavailable: "That username can't be used.",
    bad_login: "Username or password is wrong.",
    locked: "Too many wrong passwords.", // followed by "Try again in N minutes." (see message below)
    slow_down: "Too many attempts. Wait a while and try again.",
    not_logged_in: "You need to log in first.",
    closed: "Registration is closed.",
    bad_captcha: "The human check failed. Try again.",
    network: "Couldn't reach the server.",
    server_error: "Something went wrong on the server.",
    not_enough: "You don't have enough for that.",
    not_ready: "You can't do that yet.",
    already_done: "You've already done that.",
    too_soon: "Not yet. Try again later.",
    wrong_answer: "That isn't the right answer.",
    full: "You can't carry any more of that.",
    busy: "The server is busy. Try again.",
    unknown_action: "That isn't available.",
  };

  function call(method, path, body) {
    var opts = { method: method, credentials: "same-origin", cache: "no-store", headers: {} };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(BASE + path, opts).then(
      function (r) {
        return r.json().then(
          function (j) {
            j.status = r.status;
            if (j.error === "not_logged_in" && path !== "/me") cached = null; // the login ran out: ask again next time
            return j;
          },
          function () { return { ok: false, error: "server_error", status: r.status }; }
        );
      },
      function () { return { ok: false, error: "network" }; }
    );
  }

  // ---- who is logged in: asked once, shared by everything on the page ----
  var cached = null; // promise of the last /me answer
  function ask() {
    cached = call("GET", "/me");
    cached.then(function (r) { if (!r || r.error === "network" || r.error === "server_error") cached = null; }); // retry next time
    return cached;
  }
  function current() { return cached || ask(); }

  // ---- tell other tabs (and the chat) when the login changes ----
  var listeners = [];
  var channel = null;
  try { channel = new BroadcastChannel("site-auth"); } catch (e) {}
  function changed() {
    // Other tabs and the chat page reconnect on this.
    try { if (channel) channel.postMessage("changed"); } catch (e) {}
    try { localStorage.setItem("siteAuthPing", String(Date.now())); } catch (e) {}
    notify();
  }
  function tell(cb, r) {
    try { cb(r && r.ok ? r.user : null, r); } catch (e) {}
  }
  // The login changed: ask the server once, then tell every listener.
  function notify() {
    ask().then(function (r) {
      listeners.slice().forEach(function (cb) { tell(cb, r); });
    });
  }
  if (channel) channel.onmessage = notify;
  window.addEventListener("storage", function (e) { if (e.key === "siteAuthPing") notify(); });

  function afterLogin(r) { if (r && r.ok) changed(); return r; }

  var api = {
    messages: MESSAGES,
    message: function (r) {
      if (!r || r.ok) return "";
      var text = MESSAGES[r.error] || "Something went wrong.";
      if (r.error === "locked") {
        var min = Math.ceil((Number(r.retryInMs) || 15 * 60000) / 60000);
        text += " Try again in " + (min <= 1 ? "a minute." : min + " minutes.");
      }
      return text;
    },
    // Always asks the server. Most pages want current() instead.
    me: function () { return ask(); },
    // Who is logged in, without asking the server again if this page already asked. Same answer as me().
    current: current,
    register: function (username, password, turnstileToken) {
      var b = { username: username, password: password };
      if (turnstileToken) b.turnstile = turnstileToken;
      return call("POST", "/register", b).then(afterLogin);
    },
    login: function (username, password) { return call("POST", "/login", { username: username, password: password }).then(afterLogin); },
    logout: function () { return call("POST", "/logout", {}).then(afterLogin); },
    changePassword: function (current, next) { return call("POST", "/password", { current: current, next: next }); },
    deleteAccount: function (password) { return call("POST", "/delete-account", { password: password }).then(afterLogin); },
    progress: function () { return call("GET", "/progress"); },
    saveQuest: function (questId, state) { return call("PUT", "/progress/" + encodeURIComponent(questId), { state: state }); },
    event: function (name) { return call("POST", "/event", { event: name }); },
    // The player's money and items: { ok, money, items: { itemId: count } }. Needs a login.
    inventory: function () { return call("GET", "/inventory"); },
    // Ask the server to carry out one of the ACTIONS in defs.js. The server decides whether it is allowed.
    action: function (id, answer) {
      var b = { id: id };
      if (answer !== undefined) b.answer = answer;
      return call("POST", "/action", b);
    },
    defs: function () { return call("GET", "/defs"); },
    stats: function () { return call("GET", "/achievements/stats"); },
    // Only same-site paths are allowed as a "go back to" address (blocks //evil.com, https://..., javascript:).
    safeNext: function (raw, fallback) {
      var v = String(raw == null ? "" : raw);
      return /^\/(?![\/\\])[^\r\n\\]*$/.test(v) ? v : (fallback || "/");
    },
    // Calls cb(user or null) once now and again whenever the login changes on this or another tab.
    onChange: function (cb) { listeners.push(cb); current().then(function (r) { tell(cb, r); }); },
  };
  window.SiteAccount = api;
})();
