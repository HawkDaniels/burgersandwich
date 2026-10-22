/* site-progress.js: saves game progress in the browser for signed-out players, and hands it to the
   account when (and only when) they CREATE an account. Load it after site-account.js:

     <script src="/site-account.js"></script>
     <script src="/site-progress.js"></script>

   Rules:
   - Signed out: progress is saved in this browser only (localStorage, keys starting "quest:").
   - Creating an account: whatever is saved here is sent to the new account, once.
   - Logging in to an existing account: nothing is sent. The account's own saved progress is used,
     and any progress saved in this browser is ignored.
   - Logging out (or deleting the account): the progress saved in this browser is erased.
   - A login that simply runs out is not a logout, so nothing is erased then.

   Use SiteProgress.save(questId, state) and SiteProgress.load(questId) instead of calling
   SiteAccount.saveQuest directly. Both return promises. */
(function () {
  "use strict";
  if (window.SiteProgress || !window.SiteAccount) return; // already loaded, or site-account.js is missing
  var PREFIX = "quest:";
  var A = window.SiteAccount;

  function keys() {
    var out = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREFIX) === 0) out.push(k); } } catch (e) {}
    return out;
  }
  function readLocal(q) { try { return JSON.parse(localStorage.getItem(PREFIX + q)); } catch (e) { return null; } }
  function writeLocal(q, s) { try { localStorage.setItem(PREFIX + q, JSON.stringify(s)); } catch (e) {} }
  function eraseLocal() { keys().forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); }

  function signedIn() { return A.me().then(function (r) { return !!(r && r.ok && r.user); }); }

  // Hand the saved progress to the brand-new account. A quest stays saved here only if its upload failed.
  function sendLocalProgress() {
    var jobs = keys().map(function (k) {
      var q = k.slice(PREFIX.length), s = readLocal(q);
      if (s == null) { try { localStorage.removeItem(k); } catch (e) {} return Promise.resolve(); }
      return A.saveQuest(q, s).then(function (r) {
        // kept if the upload failed for a passing reason; dropped if it was accepted, or can never be accepted
        if (r && (r.ok || r.error === "unknown_quest")) { try { localStorage.removeItem(k); } catch (e) {} }
      });
    });
    return Promise.all(jobs);
  }

  var register = A.register, logout = A.logout, del = A.deleteAccount;
  A.register = function () {
    return register.apply(A, arguments).then(function (r) {
      return r && r.ok ? sendLocalProgress().then(function () { return r; }) : r;
    });
  };
  A.logout = function () {
    return logout.apply(A, arguments).then(function (r) { if (r && r.ok) eraseLocal(); return r; });
  };
  A.deleteAccount = function () {
    return del.apply(A, arguments).then(function (r) { if (r && r.ok) eraseLocal(); return r; });
  };

  // Tell anything on the page that listens (such as the corner widgets) that a quest changed.
  function announce(quest, r) {
    if (r && r.ok) { try { window.dispatchEvent(new CustomEvent("siteprogress", { detail: { quest: quest } })); } catch (e) {} }
    return r;
  }

  window.SiteProgress = {
    // Signed in: saved on the account. Signed out: saved in this browser.
    save: function (quest, state) {
      return signedIn().then(function (yes) {
        if (yes) return A.saveQuest(quest, state).then(function (r) { return announce(quest, r); });
        writeLocal(quest, state);
        return announce(quest, { ok: true, local: true });
      });
    },
    // Every quest's saved state at once, as { questId: state }. Signed in: from the account.
    // Signed out: from this browser. Never rejects; gives {} if nothing can be read.
    loadAll: function () {
      return signedIn().then(function (yes) {
        if (yes) {
          return A.progress().then(function (r) { return (r && r.ok && r.quests) || {}; });
        }
        var out = {};
        keys().forEach(function (k) { var v = readLocal(k.slice(PREFIX.length)); if (v != null) out[k.slice(PREFIX.length)] = v; });
        return out;
      });
    },
    // Signed in: the account's saved state (or null). Signed out: this browser's saved state (or null).
    load: function (quest) {
      return signedIn().then(function (yes) {
        if (!yes) return readLocal(quest);
        return A.progress().then(function (r) {
          var all = (r && r.ok && (r.quests || r.progress)) || {};
          return all[quest] !== undefined ? all[quest] : null;
        });
      });
    },
  };
})();
