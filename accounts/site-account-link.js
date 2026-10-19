/* site-account-link.js: puts a "Log in / Sign up" link on a page, and swaps it for
   "Signed in as [username]" while the visitor is logged in.

   Usage on any page: put <span id="account-link"></span> where the link should appear, then load
   /site-account.js and after it /site-account-link.js with ordinary script tags (in that order).

   The wording and addresses are the settings just below. */
(function () {
  "use strict";
  var LOGGED_OUT_TEXT = "Log in / Sign up";
  var LOGGED_IN_PREFIX = "Signed in as ";
  var LOGIN_PAGE = "/accounts/login.html";
  var ACCOUNT_PAGE = "/accounts/account.html";

  var holder = document.getElementById("account-link");
  if (!holder || !window.SiteAccount) return;

  function render(user) {
    holder.textContent = "";
    var a = document.createElement("a");
    if (user) {
      a.href = ACCOUNT_PAGE;
      a.appendChild(document.createTextNode(LOGGED_IN_PREFIX));
      var b = document.createElement("b");
      b.textContent = user.username; // textContent: a username can never inject markup
      a.appendChild(b);
    } else {
      var here = location.pathname + location.search;
      a.href = LOGIN_PAGE + (here && here !== "/" ? "?next=" + encodeURIComponent(here) : "");
      a.textContent = LOGGED_OUT_TEXT;
    }
    holder.appendChild(a);
  }

  // Nothing is shown until the server has answered, so a logged-in visitor never sees the login link flash.
  // If the server can't be reached, the login link is shown.
  SiteAccount.onChange(render);
})();
