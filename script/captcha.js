/*
 * Snack Check — a two-word captcha-style widget ("burger" / "sandwich").
 *
 * Usage:
 *   <div data-captcha data-success-text="Your text here"></div>
 *   <script src="captcha.js"></script>
 *
 * Pressing Enter with the right words turns the widget into a cream box
 * showing your success text (line breaks in the text are kept).
 * Listen for it with:  el.addEventListener("snackcaptcha:solved", ...)
 *
 * In your form handler:
 *   if (!SnackCaptcha.isSolved()) { SnackCaptcha.fail(); return; }
 *
 * Or mount manually:
 *   const cap = SnackCaptcha.mount(el, { successText: "Your text here" });
 *   cap.isSolved(); cap.reset(); cap.fail(); cap.pass(); cap.setSuccessText("...");
 *
 * Note: this runs entirely in the browser, so it's decorative, not real bot protection.
 */
(function () {
  "use strict";

  const WORDS = ["burger", "sandwich"];

  const CSS = `
  .captcha {
    width: 320px; max-width: 100%;
    font-family: Arial, Helvetica, sans-serif;
    background: #7d211b;
    border-radius: 8px;
    padding: 6px;
    box-sizing: border-box;
  }
  .captcha * { box-sizing: border-box; }
  .captcha .sc-image {
    display: block; width: 100%; height: auto;
    background: #fff; border-radius: 4px;
  }
  .captcha .sc-bottom { display: flex; gap: 6px; margin-top: 6px; }
  .captcha .sc-input {
    flex: 1; background: #fbe6a2; border-radius: 4px;
    padding: 8px; font-size: 13px; color: #333;
  }
  .captcha .sc-input label { display: block; margin: 0 0 6px; }
  .captcha .sc-input label.sc-retry { color: #b3261e; font-weight: bold; }
  .captcha .sc-input input {
    width: 100%; margin: 0; padding: 4px 6px; font-size: 14px;
    border: 1px solid #a08a50; border-radius: 2px; background: #fff; color: #111;
  }
  .captcha .sc-buttons { display: flex; flex-direction: column; gap: 3px; }
  .captcha .sc-buttons button {
    width: 28px; height: 24px; margin: 0; padding: 0;
    border: 0; border-radius: 3px;
    background: #b8382e; color: #fff; font-size: 14px; line-height: 1; cursor: pointer;
  }
  .captcha .sc-buttons button:hover { background: #d0473c; }
  .captcha .sc-side {
    width: 74px; color: #f6dcd8; font-size: 11px; line-height: 1.3;
    display: flex; align-items: center;
  }
  .captcha .sc-side b { display: block; font-size: 13px; color: #fff; }
  .captcha .sc-done {
    display: none;
    align-items: center; justify-content: center;
    padding: 12px;
    background: #fbe6a2; border-radius: 4px;
    color: #3a2a10; font-size: 18px; line-height: 1.35;
    text-align: center; white-space: pre-line;
  }
  .captcha.sc-solved .sc-main { display: none; }
  .captcha.sc-solved .sc-done { display: flex; }
  .sc-status { margin-top: 6px; min-height: 1.2em; font-family: Arial, Helvetica, sans-serif; font-size: 13px; }
  .sc-status.sc-ok  { color: #1d7a2e; }
  .sc-status.sc-bad { color: #b3261e; }
  `;

  function injectCSS() {
    if (document.getElementById("captcha-styles")) return;
    const s = document.createElement("style");
    s.id = "captcha-styles";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  let counter = 0;

  // Render one word: rough up the print, then warp it in two passes
  // (columns shifted vertically, then rows shifted horizontally).
  function drawWord(ctx, word, o) {
    // 1. Plain text on an offscreen canvas
    const a = document.createElement("canvas");
    const ac = a.getContext("2d");
    ac.font = o.font;
    const w = Math.ceil(ac.measureText(word).width) + 30;
    const h = o.h;
    a.width = w; a.height = h;
    ac.font = o.font;
    ac.textBaseline = "middle";
    ac.fillStyle = "#111";
    ac.fillText(word, 15, h / 2);

    // Ink bleed around the letters
    const data = ac.getImageData(0, 0, w, h).data;
    for (let i = 0; i < o.blots; i++) {
      const x = Math.floor(rand(0, w)), y = Math.floor(rand(0, h));
      if (data[(y * w + x) * 4 + 3] > 128) {
        ac.beginPath();
        ac.arc(x + rand(-4, 4), y + rand(-4, 4), rand(1, o.blotSize), 0, Math.PI * 2);
        ac.fill();
      }
    }
    // Worn spots knocked out of the letters
    ac.globalCompositeOperation = "destination-out";
    for (let i = 0; i < o.gaps; i++) {
      ac.fillRect(rand(0, w), rand(0, h), rand(1, 6), rand(1, 5));
    }
    ac.globalCompositeOperation = "source-over";

    // 2. Column pass: vertical wave (two overlapping sines for irregularity)
    const pad = Math.ceil(o.ampY * 1.5);
    const b = document.createElement("canvas");
    b.width = w; b.height = h + pad * 2;
    const bc = b.getContext("2d");
    const f1 = rand(0.02, 0.035), p1 = rand(0, 6.28);
    const f2 = f1 * rand(2.3, 3.1), p2 = rand(0, 6.28);
    for (let x = 0; x < w; x++) {
      const dy = o.ampY * Math.sin(x * f1 + p1) + o.ampY * 0.45 * Math.sin(x * f2 + p2);
      bc.drawImage(a, x, 0, 1, h, x, pad + dy, 1, h);
    }

    // 3. Row pass: horizontal shear wave, drawn onto the main canvas
    const f3 = rand(0.04, 0.08), p3 = rand(0, 6.28);
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot);
    for (let y = 0; y < b.height; y++) {
      const dx = o.ampX * Math.sin(y * f3 + p3);
      ctx.drawImage(b, 0, y, w, 1, dx, y - b.height / 2, w, 1);
    }
    ctx.restore();
  }

  function render(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawWord(ctx, WORDS[0], {
      font: "bold 92px 'Courier New', Courier, monospace",
      h: 140, x: rand(8, 26), y: rand(78, 92),
      rot: rand(-0.12, 0.12), ampY: rand(9, 14), ampX: rand(4, 7),
      blots: 2200, blotSize: 4, gaps: 260
    });

    drawWord(ctx, WORDS[1], {
      font: "italic 50px Georgia, 'Times New Roman', serif",
      h: 90, x: rand(300, 325), y: rand(165, 180),
      rot: rand(-0.32, -0.16), ampY: rand(6, 10), ampX: rand(3, 5),
      blots: 600, blotSize: 2.2, gaps: 90
    });
  }

  function normalize(s) {
    return s.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/).join(" ");
  }

  function mount(target, options) {
    if (!target) throw new Error("SnackCaptcha.mount: target element not found");
    injectCSS();
    const id = "sc-answer-" + (++counter);
    let successText = (options && options.successText) ||
      target.getAttribute("data-success-text") ||
      "John Sandwich seems happier now.";

    target.innerHTML = `
      <div class="captcha">
        <div class="sc-main">
        <canvas class="sc-image" width="600" height="220" role="img" aria-label="Two distorted words"></canvas>
        <div class="sc-bottom">
          <div class="sc-input">
            <label for="${id}">Type the two words:</label>
            <input id="${id}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">
          </div>
          <div class="sc-buttons">
            <button type="button" data-act="refresh" title="Get new words">&#x21bb;</button>
            <button type="button" data-act="audio" title="Hear the words">&#x1f50a;</button>
            <button type="button" data-act="help" title="Help">?</button>
          </div>
          <div class="sc-side"><span><b>CAPTCHA</b>no robots on burgersandwich .jp</span></div>
        </div>
        </div>
        <div class="sc-done" role="status"></div>
      </div>
      <div class="sc-status" aria-live="polite"></div>`;

    const canvas = target.querySelector("canvas");
    const input  = target.querySelector("input");
    const status = target.querySelector(".sc-status");
    const frame  = target.querySelector(".captcha");
    const main   = target.querySelector(".sc-main");
    const done   = target.querySelector(".sc-done");
    const label  = target.querySelector(".sc-input label");
    const PROMPT = "Type the two words:";
    let solved = false;

    const setLabel = (text, retry) => {
      label.textContent = text;
      label.classList.toggle("sc-retry", !!retry);
    };

    const setStatus = (msg, cls) => {
      status.textContent = msg || "";
      status.className = "sc-status" + (cls ? " " + cls : "");
    };

    // Swap the inside of the frame for the cream box, keeping the same size
    function solve() {
      done.style.height = main.offsetHeight + "px";
      done.textContent = successText;
      frame.classList.add("sc-solved");
      setStatus("");
      solved = true;
      target.dispatchEvent(new CustomEvent("snackcaptcha:solved", { bubbles: true }));
    }

    const api = {
      el: target,
      isSolved: () => solved || normalize(input.value) === WORDS.join(" "),
      reset() {
        solved = false;
        frame.classList.remove("sc-solved");
        input.value = ""; setStatus(""); setLabel(PROMPT); render(canvas);
      },
      // Wrong answer: clear the entry, draw a fresh image, ask to try again
      fail(msg) {
        input.value = "";
        setStatus("");
        setLabel(msg || "Incorrect. Try again:", true);
        render(canvas);
        input.focus();
      },
      pass(msg) {
        if (msg) successText = msg;
        if (!solved) solve();
      },
      setSuccessText(text) {
        successText = text;
        if (solved) done.textContent = text;
      }
    };

    // Enter: correct → cream box; wrong → new words. Never submits the form.
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (normalize(input.value) === WORDS.join(" ")) solve();
      else api.fail();
    });

    target.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "refresh") { api.reset(); input.focus(); }
      if (act === "audio") {
        if ("speechSynthesis" in window) {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(WORDS.join(". ") + ".");
          u.rate = 0.8;
          speechSynthesis.speak(u);
        } else {
          setStatus("Audio isn't supported in this browser.");
        }
      }
      if (act === "help") setStatus("Type both words in order, separated by a space. Not case-sensitive.");
    });

    render(canvas);
    instances.push(api);
    return api;
  }

  const instances = [];

  window.SnackCaptcha = {
    mount,
    instances,
    // Shortcuts that act on the first widget on the page
    isSolved: () => !!instances[0] && instances[0].isSolved(),
    reset:    () => instances[0] && instances[0].reset(),
    fail:     (m) => instances[0] && instances[0].fail(m),
    pass:     (m) => instances[0] && instances[0].pass(m),
    setSuccessText: (t) => instances[0] && instances[0].setSuccessText(t)
  };

  function autoMount() {
    document.querySelectorAll("[data-captcha]").forEach((el) => {
      if (!el.dataset.scMounted) { el.dataset.scMounted = "1"; mount(el); }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }
})();
