/* site-inventory.js: how your games read a player's money and items, and ask for them to change.

     <script src="/account/site-account.js"></script>
     <script src="/account/site-progress.js"></script>
     <script src="/account/site-inventory.js"></script>

   Money and items are kept by the server and can only change through the ACTIONS listed in defs.js.
   A page cannot set them: it can only name an action ("find_the_key", "buy_potion") and the server
   decides whether the player may do it, and applies the result. Players need to be logged in; signed-out
   visitors get { ok: false, error: "not_logged_in" }.

   Every call returns a promise that resolves to { ok: true, ... } or { ok: false, error: "code" } and
   never rejects. SiteAccount.message(result) turns an error into a sentence.

     await SiteInventory.get()                    -> { ok, money, items: { itemId: count } }
     await SiteInventory.has("brass_key")         -> { ok, has: true/false, count }     (or has("potion", 3))
     await SiteInventory.action("find_the_key")   -> { ok, money, items, gave, took }   what the player now has
     await SiteInventory.action("riddle", "my answer")   for actions that need a secret answer

   Errors from action(): not_enough (cannot pay), not_ready (an earlier step or item is missing),
   already_done (used up its limit), too_soon (cooldown; the reply has retryInMs), wrong_answer,
   full (would go over the limit), unknown_action, slow_down, not_logged_in. */
(function () {
  "use strict";
  if (window.SiteInventory || !window.SiteAccount) return;
  var A = window.SiteAccount;

  function announce() {
    try { window.dispatchEvent(new CustomEvent("siteprogress", { detail: { quest: "inventory" } })); } catch (e) {}
  }

  window.SiteInventory = {
    get: function () {
      return A.inventory().then(function (r) {
        return r && r.ok ? { ok: true, money: r.money, items: r.items || {} } : r || { ok: false, error: "network" };
      });
    },
    has: function (id, n) {
      n = n === undefined ? 1 : Number(n);
      return window.SiteInventory.get().then(function (r) {
        if (!r.ok) return r;
        var c = r.items[id] || 0;
        return { ok: true, has: Number.isInteger(n) && n > 0 && c >= n, count: c };
      });
    },
    action: function (id, answer) {
      return A.action(id, answer).then(function (r) {
        if (r && r.ok) announce(); // lets the inventory widget refresh straight away
        return r || { ok: false, error: "network" };
      });
    },
  };
})();
