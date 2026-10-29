# BurgerOS

## Files

```
burgeros.html            the page visitors open (replaces burgeros.html)
burgeros/
  content.js             EVERYTHING you edit: desktop, Start menu, mail, terminal, Burgerfin, settings
  core.js                window manager, save data, unlocks, quest sync, mail model, browser
  os.css                 shell styles
  apps/mail.js           Mail
  apps/terminal.js       Terminal
  apps/burgerfin.js      Burgerfin
  apps/messenger.js      BS Messenger (connects to the chat server set in content.js)
```

`terminal.html`, `bmail.html` and `burgerfin.html` are no longer needed.

The app files download in the background after the desktop appears, so they
open instantly but never slow down the first load. Burgerfin's Google fonts
only download the first time Burgerfin is opened.

## Save data

Everything is kept under one browser key, `burgeros`, including where the
visitor has dragged desktop icons. Icons are matched by their `id` (or their
title if they have none), so renaming an icon in content.js puts it back in
the first free spot. Mail and Burgerfin
progress from the old separate pages is imported automatically the first time.

## Quest system hooks

- `os.progressScripts` in content.js loads `site-account.js`, `site-progress.js`
  and `site-inventory.js`. Missing files are skipped, so nothing breaks before
  the quest system is live.
- On load, BurgerOS shows what this browser remembers, then asks the server
  (`SiteAccount.me()`, `SiteProgress.load()`, `SiteInventory.get()`) and the
  server's answer replaces it. It checks again when the visitor returns to the tab.
- Locked mail waits for that server check before arriving.
- Any `when: { ... }` in content.js can depend on flags, achievements, quest
  progress, inventory items or sign-in. See the top of content.js.
- Pages opened inside Burger Explorer are watched: when they call
  `SiteProgress.save`, `SiteAccount.event` or `SiteInventory.action`, BurgerOS
  re-checks progress immediately, so new mail and unlocked icons appear without
  a reload. Newly earned achievements show a balloon by the clock.
- Those pages can also use `BurgerOS` directly:
  `BurgerOS.flag("name")`, `BurgerOS.open("mail")`, `BurgerOS.refresh()`.

## Useful console commands while testing

```
BurgerOS.flag("some_flag")          set a flag
BurgerOS.flag("some_flag", false)   clear it
BurgerOS.state()                    see all saved data
BurgerOS.reset()                    wipe all BurgerOS save data and reload
```
