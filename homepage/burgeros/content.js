/* ============================================================
   BurgerOS CONTENT
   Everything visitors see is set in this one file: the desktop, the
   Start menu, emails, terminal commands and Burgerfin.
   ============================================================

   ------------------------------------------------------------
   UNLOCKING THINGS  -  when: { ... }
   ------------------------------------------------------------
   Works on desktop items, folder items, Start menu items, emails,
   terminal commands, Burgerfin libraries and Burgerfin items.
   The thing only appears once EVERY part of its "when" is true:

     flag: "name"               a BurgerOS flag is set (see effects below)
     notFlag: "name"            that flag is NOT set
     achievement: "first_find"  the player has earned this achievement
     quest: "treasure_hunt"     the player has saved any progress on that quest
     quest: "treasure_hunt", steps: 2
                                ...and has finished at least 2 of its steps
                                (needs an entry under os.quests below)
     item: "brass_key"          the player owns at least one (inventory)
     loggedIn: true             the visitor is signed in (false = signed out)
     any: [ {...}, {...} ]      at least one of these is true
     not: { ... }               this is NOT true
     test: function (p) { ... } anything else. p.flag(name), p.achievement(id),
                                p.quest(id) (saved state or null), p.questSteps(id),
                                p.item(id), p.money(), p.user()

   Lists mean "all of them":  flag: ["met_wizard", "has_map"]

   ------------------------------------------------------------
   MAKING THINGS HAPPEN  -  effects: { ... }
   ------------------------------------------------------------
   Runs when an item is opened, an email is first read, a terminal
   command is run, or a Burgerfin card is clicked:

     flag: "name"          set a flag (kept in the visitor's browser)
     unflag: "name"        clear a flag
     event: "read_lore"    report a site event (for event achievements)
     open: "mail"          open an app, page or item, e.g. "terminal",
                           "/pages/chriscorner.html", "Readme.txt"
     run: function (os) {} anything else (os is window.BurgerOS)

   Pages opened inside BurgerOS can do the same through
   BurgerOS.flag("name"), BurgerOS.open("mail") and BurgerOS.refresh().

   ------------------------------------------------------------
   LINKS
   ------------------------------------------------------------
   Every link opens in a Burger Explorer window. A link can also open an
   app:  "app:mail", "app:terminal", "app:burgerfin", "app:messenger".
   ============================================================ */

window.BURGER_CONTENT = {

  /* ----------------------------------------------------------
     SYSTEM SETTINGS
     ---------------------------------------------------------- */
  os: {
    // Text down the side of the Start menu: normal part + bold part
    startBanner: ["burger", "OS 98"],
    // Start button picture ("" = built-in four squares) and text
    startIcon: "/favicon.png",
    startText: "Start",

    desktopColor: "#008080",
    wallpaper: "",                      // e.g. "images/wallpaper.jpg"
    baseDrive: "C:\\",                  // where folder addresses start

    // Something to open when the desktop loads: an item title or app name ("" = nothing)
    startupOpen: "",

    // Shut Down: "" shows the classic shut-down screen, or a URL to leave to
    shutdownLink: "/index.html",

    // Burger Explorer (the built-in web browser)
    homePage: "https://burgersandwich.jp",
    browserMaximized: true,             // open full-screen
    browserReuse: true,                 // new links load in the open browser window

    // Send phones and tablets somewhere else ("" = don't)
    mobileRedirect: "",

    // Quest system helper scripts, loaded in this order. Missing ones are skipped.
    progressScripts: ["/account/site-account.js", "/account/site-progress.js", "/account/site-inventory.js"],

    // How to count finished steps for  when: { quest: "...", steps: N }.
    // Copy the  progress  setting from the quest in defs.js.
    quests: {
      // treasure_hunt: { field: "found", count: true },
      // big_quest:     { field: "step" },
    }
  },

  /* ----------------------------------------------------------
     DESKTOP ITEMS (also used for folders and the Start menu)

       title    - name under the icon
       icon     - computer, folder, globe, chat, document, notepad, recycle, image,
                  music, mail, terminal, media, error, info, warning, help,
                  or a path to your own picture (optional)
       type     - "link"   open  link  in Burger Explorer
                  "app"    open the app named in  app  (mail, terminal, burgerfin, messenger)
                  "folder" show  children
                  "text"   Notepad showing  text
                  "dialog" message box showing  text  (dialogIcon: error/info/warning)
                  "image"  picture viewer showing  src
                  "music"  music player playing  src  (loop: true to repeat)
       address  - for folders: what the Address field shows (optional)
       when     - only show once unlocked (optional)
       effects  - what happens when it's opened (optional)
     ---------------------------------------------------------- */
  desktop: [
    { title: "My Computer", icon: "computer", type: "folder", children: [
      { title: "(C:)", icon: "computer", type: "folder", children: [
        { title: "Documents", icon: "folder", type: "folder", children: [
          { title: "Readme.txt", type: "text",
            text: "Welcome!\r\n\r\nDouble-click the icons to look around.\r\n\r\nEverything on this desktop leads somewhere on the site." },
          { title: "Photos", type: "folder", children: [
            { title: "photo1.jpg", type: "image", src: "images/photo1.jpg" }
          ]}
        ]},
        { title: "Chris's_Corner.txt", type: "link", link: "/pages/chriscorner.html" },
        { title: "Barak's_Domain.txt", type: "link", link: "/pages/barakdomain.html" }
      ]}
    ]},
    { title: "Mail", type: "app", app: "mail" },
    { title: "Terminal", type: "app", app: "terminal" },
    { title: "Burgerfin", type: "app", app: "burgerfin" },
    { title: "Internet", icon: "globe", type: "link", link: "https://burgersandwich.jp" },
    { title: "BS Messenger", type: "app", app: "messenger" },
    { title: "Recycle Bin", icon: "recycle", type: "folder", children: [
      { title: "index.html", icon: "document", type: "link", link: "/homepage/ogburgersandwich.html" }
    ]},
    { title: "song.mp3", type: "music", src: "music/song.mp3" },
    { title: "Do Not Click", icon: "warning", type: "link", link: "/pages/banned.html" }

    // Example of a quest-locked item:
    // , { title: "Wizard Notes.txt", type: "text", text: "...",
    //     when: { flag: "read_wizard_mail" } }
  ],

  /* ----------------------------------------------------------
     START MENU. Same items as above. A folder shows a flyout.
     Special entries: { separator: true }, { type: "run" }, { type: "shutdown" }
     ---------------------------------------------------------- */
  startMenu: [
    { title: "Programs", icon: "folder", type: "folder", children: [
      { title: "Mail", type: "app", app: "mail" },
      { title: "Terminal", type: "app", app: "terminal" },
      { title: "Burgerfin", type: "app", app: "burgerfin" },
      { title: "Internet", icon: "globe", type: "link", link: "https://burgersandwich.jp" },
      { title: "BS Messenger", type: "app", app: "messenger" }
    ]},
    { title: "Help", icon: "help", type: "dialog", dialogIcon: "info",
      text: "Double-click to open files." },
    { separator: true },
    { title: "Run...", icon: "run", type: "run" },
    { separator: true },
    { title: "Shut Down...", icon: "shutdown", type: "shutdown" }
  ],

  /* ----------------------------------------------------------
     MAIL

     Folder:  name, icon (inbox, sent, drafts, deleted, junk, folder),
              role: "inbox", "sent" or "deleted" (optional)

     Message:
       id          - a short unique name (recommended for locked or timed mail,
                     so changing the subject later doesn't re-deliver it)
       from, address, subject
       date        - e.g. "10/12/2026 3:45 PM", "today 9:14 AM", "yesterday 6:02 PM".
                     Mail that arrives later is stamped with its arrival time.
       body        - use \n for new lines. Links: [text](/page.html), a bare
                     https:// address, or [open terminal](app:terminal)
       attachments - [{ name: "file.txt", link: "/page.html" }] (optional)
       important   - true shows a red "!" (optional)
       read        - true starts it as already read (optional)
       when        - the message arrives once this is true (optional)
       delay       - seconds to wait after it becomes available (optional).
                     Send/Recv delivers the next waiting message early.
       timerOnly   - true means Send/Recv can't bring it early (optional)
       effects     - runs the first time the message is read (optional)
     ---------------------------------------------------------- */
  mail: {
    appName: "Mail",
    accountName: "Local Folders",
    visitorName: "User",
    visitorAddress: "user@burgersandwich.jp",
    // "fake" puts sent mail in Sent Items; "mailto" opens the visitor's email program
    sendMode: "fake",
    contactEmail: "",

    folders: [
      { name: "Inbox", icon: "inbox", role: "inbox", messages: [
        {
          from: "John Sandwich", address: "jsandwich@burgersandwich.jp",
          subject: "Welcome to burgersandwich.jp",
          date: "today 12:14 AM",
          important: true,
          body: "John Sandwich Here!\n\nI'm so glad you made it to my website. Please try visiting some pages to earn burgerpoints:\n\n" +
                "- Chris's Corner: [chriscorner.html](/pages/chriscorner.html)\n" +
                "- Barak's Domain: [barakdomain.html](/pages/barakdomain.html)\n\n" +
                "Happy burgin!\nJohn Sandwich",
          attachments: [ { name: "homeward.txt", link: "/index.html" } ]
        },
        {
          from: "Burger Sandwich", address: "orders@burgersandwich.jp",
          subject: "Your order has shipped!",
          date: "yesterday 6:02 PM",
          body: "Good news!\n\nYour order is on its way. Track it here:\nhttps://burgersandwich.jp\n\nThank you for your business."
        },
        {
          from: "Mom", address: "mom@example.com",
          subject: "RE: RE: RE: FW: funny pictures",
          date: "10/12/2026 3:45 PM",
          read: true,
          body: "Did you see these?? Call me.\n\n[Open the album](https://example.com/photos)",
          attachments: [ { name: "IMG_0001.jpg", link: "https://example.com/photos" } ]
        },
        {
          id: "cowboys",
          from: "John Sandwich", address: "jsandwich@burgersandwich.jp",
          subject: "Have you seen these naked cowboys??",
          delay: 30,
          body: "I really can't recommend it enough they're like breeding rams ready to rut: [18nakedcowboys.com](https://18nakedcowboys.com)"
        },
        {
          id: "wizard_warning",
          from: "John Wizard", address: "jwizard@burgersandwitch.jp",
          subject: "Warning to the Travelers of this Realm",
          delay: 200,
          body: "John Wizard here!\n\nThere's reports of evil magiks in this realm. I suggest avoiding any evil trickery and tomfoolery."
        },
        {
          id: "evil_wizard",
          from: "Evil Wizard", address: "dawizza@burgersandwitch.jp",
          subject: "sick bisiness opportunity",
          delay: 260,
          timerOnly: true,
          body: "yo, i got a quest for any members of the burgersandwich order\nfast great pay super easy and all that stuff\nmeet me at the white rock by the sea.\n[go to white rock](/pages/whiterock.html)"
        }

        // Example of quest-locked mail: arrives 5 seconds after the
        // player earns the "first_find" achievement.
        // , { id: "treasure_reply", from: "John Sandwich", subject: "Nice find!",
        //     when: { achievement: "first_find" }, delay: 5,
        //     body: "You found one!", effects: { flag: "read_treasure_reply" } }
      ]},
      { name: "Sent Items", icon: "sent", role: "sent", messages: [] },
      { name: "Deleted Items", icon: "deleted", role: "deleted", messages: [] },
      { name: "Junk E-mail", icon: "junk", messages: [
        { from: "Prince Senegal", address: "psenegal@senegal.gov",
          subject: "URGENT REQUEST", date: "yesterday 4:20 PM",
          body: "Dear friend,\n\nSenegal is in trouble and needs your help!\n\nPlease support our cause by visiting the [Senegal homepage](/pages/negasenegal.html)." }
      ]}
    ]
  },

  /* ----------------------------------------------------------
     TERMINAL

     Built-in commands: help, clear, echo, exit, open <app / page / item>

     Each command below is  name: { ... }  with one of:
       open: "/page.html"     open a page in Burger Explorer
       app: "mail"            open an app
       print: "text" or ["line 1", "line 2"]
       run: function (args, term, os) { term.print("hi"); }
     plus:
       help: "text shown by help"
       hidden: true           works, but isn't listed by help
       when, effects          as described at the top
     ---------------------------------------------------------- */
  terminal: {
    prompt: "guest@burgersandwich:~$",
    welcome: [
"⠀⠀⠀⠀⠀⠀⠀⣀⡤⠔⢒⢏⢉⡙⢛⣶⡻⣟⠛⠶⠶⢦⣤⣀⠀⠀⠀⠀⠀⠀",
"⠀⠀⠀⠀⣠⠔⢫⡅⢀⠚⢠⡍⠀⣪⠂⠸⠿⡄⠘⠆⠈⠰⠀⣭⠳⣦⡀⠀⠀⠀",
"⠀⠀⢠⡞⠁⢁⠀⠀⠉⠀⠒⢀⠀⠋⠀⠛⡀⠈⣠⠈⠀⠲⠂⠀⣠⠈⢳⡀⠀⠀",
"⠀⢰⡏⡄⠀⠀⠀⠀⠘⠀⢠⠉⠀⣉⠀⠈⢁⠀⠈⠀⠒⠀⠀⠒⠀⠀⠀⠹⡄⠀",
"⠀⢸⡀⣴⠄⣢⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠂⠀⠈⠁⠐⠀⠀⠀⠀⢹⠀",
"⠀⢈⡷⠮⢤⣙⡓⠷⠤⢠⣄⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⡜⠀",
"⠼⠷⣾⣀⠀⢀⣍⠑⠒⣢⠤⠤⠤⠤⠤⠤⠤⠖⠲⠶⣒⠒⠀⠉⠉⠀⢀⣈⣻⣦",
"⠀⠀⣩⣿⣤⣗⠺⠭⠭⠧⢤⠀⣠⣏⠱⠦⣀⣴⣝⣒⠉⠑⡤⠒⣉⣙⣬⣿⠀",
"⠀⠐⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣶⣄⠀⠀⢀⡠⢔⣪⡿⣿⠟⠿⠚⠃⠉⢸⡇⠀",
"⠀⠀⢻⣿⣿⣿⣿⣿⣾⣿⣾⣿⣿⣿⢧⣯⠵⠒⠟⡉⡇⢬⠦⢥⣴⣄⣠⣼⠃⠀",
"⠀⠀⡏⡓⠐⠛⠋⠉⠛⢿⡛⠻⠾⣾⠾⠽⣟⣋⣲⠿⠛⠛⠛⠓⠤⢤⠇⠘⡇⠀",
"⠀⠀⣷⢻⣂⢄⢀⠀⡀⠀⠑⠒⠊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⠀⠀⠀⢠⡇⠀",
"⠀⠀⠈⠓⠾⢿⣤⣵⣮⣄⣀⣒⣒⣂⣀⣀⣀⣀⣒⣀⣠⣭⡤⠤⠤⠔⠒⠉⠀⠀",
      "burgersandwich terminal v0.3",
      "Last login: {date}",              // {date} becomes the current date and time
      "",
      "Type 'help' to see available commands.",
      ""
    ],
    commands: {
      log:       { open: "/pages/captainslog.html", help: "Visit The Captain's Log" },
      chris:     { open: "/pages/chriscorner.html", help: "Visit Chris's Corner" },
      barak:     { open: "/pages/barakdomain.html", help: "Visit Barak's Domain" },
      download:  { open: "/pages/downloads.html",   help: "Visit Downloads" },
      "404":     { open: "/pages/example404.html",  help: "404" },
      tag:       { open: "/tags/tags.html",         help: "Visit #code ***Incomplete" },
      mail:      { app: "mail",                     help: "Open Mail" },
      burgerfin: { app: "burgerfin",                help: "Open Burgerfin" },
      chat:      { app: "messenger",                help: "Open BS Messenger" },
      burger:    { print: "sandwich",               help: "burgersandwich" }

      // Example of a secret, quest-locked command:
      // , wizard: { print: ["The white rock remembers."], hidden: true,
      //             when: { flag: "read_evil_wizard" }, effects: { flag: "spoke_to_rock" } }
    }
  },

  /* ----------------------------------------------------------
     BS MESSENGER
       server - address of the chat server (the bs-backend Worker).
                "" means the same site BurgerOS is on (burgersandwich.jp/api/chat).
                It must be "" on the live site: the login cookie only belongs to
                burgersandwich.jp, so a chat on any other address can't see who is
                logged in. When testing locally (Live Server), it connects to the
                local backend (npm run dev in bs-backend, port 8787).
     ---------------------------------------------------------- */
  messenger: {
    title: "BS Messenger",
    server: /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? "http://" + location.hostname + ":8787" : ""
  },

  /* ----------------------------------------------------------
     BURGERFIN

     Library: title, icon (Material icon name), image, style
              ("portrait", "backdrop" or "square"), recent (how many to
              show in "Recently Added in ..."; 0 = none), items, when
     Item:    title, subtitle, image, thumb (wide picture), link, badge,
              tags (extra search words), when, effects
     ---------------------------------------------------------- */
  burgerfin: {
    serverName: "BURGERFIN-SERVER",
    pageBackground: "",
    progressMin: 20,
    progressMax: 80,
    hideEmptyContinue: true,

    libraries: [
      { title: "Main", icon: "movie", image: "images/movies.jpg", style: "portrait", recent: 8, items: [
        { title: "Home",           subtitle: "2026", link: "/altindex.html" },
        { title: "Chris's Corner", subtitle: "2026", link: "/pages/chriscorner.html" },
        { title: "Barak's Domain", subtitle: "2026", link: "/pages/barakdomain.html" }
      ]},
      { title: "Fun", icon: "tv", image: "images/shows.jpg", style: "portrait", recent: 8, items: [
        { title: "Downloads", subtitle: "2026", link: "/pages/downloads.html" }
      ]},
      { title: "Info", icon: "library_music", image: "images/music.jpg", style: "square", recent: 0, items: [
        { title: "Captain's Log", subtitle: "2026", link: "/pages/captainslog.html" },
        { title: "404",           subtitle: "2026", link: "/pages/example404.html" }
      ]}
    ],

    // Extra home rows after "My Media". The continueWatching row fills itself.
    sections: [
      { title: "Continue Watching", style: "backdrop", continueWatching: true, items: [] }
    ],

    // Side menu entries below the libraries.
    // action: "clearContinue" or "close" (closes Burgerfin); or a link
    menu: [
      { head: "User" },
      { title: "Clear Continue Watching", icon: "history", action: "clearContinue" },
      { title: "Sign Out", icon: "exit_to_app", action: "close" }
    ]
  }
};
