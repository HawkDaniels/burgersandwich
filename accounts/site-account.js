/* site-account.js: include this on any page of the site to talk to the accounts system.
   Add a script tag with src="/site-account.js", then use window.SiteAccount.

   Every call returns a promise that resolves to an object: { ok: true, ... } or { ok: false, error: "code" }.
   It never throws and never rejects. SiteAccount.message(result) turns an error code into a sentence;
   edit the MESSAGES table below to change the wording.

   If the pages are NOT on the same domain as the Worker's /api route, set window.SITE_API = "https://..."
   before loading this file. (Logins use cookies, so the same domain is strongly recommended.) */
(function () {
  "use strict";
  var BASE = (window.SITE_API || "").replace(/\/+$/, "") + "/api";

  var MESSAGES = {
    bad_username: "Usernames are 3 to 16 letters, numbers, - or _ (no spaces).",
    bad_password: "Passwords must be 8 to 128 characters.",
    username_taken: "That username is taken.",
    name_unavailable: "That username can't be used.",
    bad_login: "Username or password is wrong.",
    locked: "Too many wrong passwords. Try again in 15 minutes.",
    slow_down: "Too many attempts. Wait a while and try again.",
    not_logged_in: "You need to log in first.",
    closed: "Registration is closed.",
    bad_captcha: "The human check failed. Try again.",
    network: "Couldn't reach the server.",
    server_error: "Something went wrong on the server.",
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
          function (j) { j.status = r.status; return j; },
          function () { return { ok: false, error: "server_error", status: r.status }; }
        );
      },
      function () { return { ok: false, error: "network" }; }
    );
  }

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
  function notify() {
    api.me().then(function (r) {
      var user = r && r.ok ? r.user : null;
      listeners.slice().forEach(function (cb) { try { cb(user, r); } catch (e) {} });
    });
  }
  if (channel) channel.onmessage = notify;
  window.addEventListener("storage", function (e) { if (e.key === "siteAuthPing") notify(); });

  function afterLogin(r) { if (r && r.ok) changed(); return r; }

  var api = {
    messages: MESSAGES,
    message: function (r) {
      if (!r || r.ok) return "";
      return MESSAGES[r.error] || "Something went wrong.";
    },
    me: function () { return call("GET", "/me"); },
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
    defs: function () { return call("GET", "/defs"); },
    stats: function () { return call("GET", "/achievements/stats"); },
    // Only same-site paths are allowed as a "go back to" address (blocks //evil.com, https://..., javascript:).
    safeNext: function (raw, fallback) {
      var v = String(raw == null ? "" : raw);
      return /^\/(?![\/\\])[^\r\n\\]*$/.test(v) ? v : (fallback || "/");
    },
    // Calls cb(user or null) once now and again whenever the login changes on this or another tab.
    onChange: function (cb) { listeners.push(cb); notify(); },
  };
  window.SiteAccount = api;
})();
