/* 1. REFERENCES AND SETTINGS */
const stepNum = document.getElementById('stepNum');
const night = document.querySelector('.sky-night');
const aurora = document.getElementById('aurora');
const giga = document.getElementById('giga');
const abeWrap = document.getElementById('abeWrap');
const abe = document.getElementById('abe');
const tablets = document.querySelectorAll('.tablet');
const summit = document.getElementById('summit');
const motesBox = document.getElementById('motes');
const needle = document.getElementById('needle');
const hiroshi = document.getElementById('hiroshi');
const MAX_STEPS = 7000;
const ABE_FADE = 0.1; /* share of the climb it takes for the Abe face to fade out */
const HIROSHI_CHANCE = 1; /* 1 = every visit, 0.3 = about a third of visits */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 2. LIGHT MOTES */
if (!reduceMotion) {
  for (let i = 0; i < 28; i++) {
    const m = document.createElement('span');
    const size = 2 + Math.random() * 4;
    m.className = 'mote';
    m.style.left = Math.random() * 100 + '%';
    m.style.width = m.style.height = size + 'px';
    m.style.animationDuration = 14 + Math.random() * 16 + 's';
    m.style.animationDelay = -Math.random() * 20 + 's';
    motesBox.appendChild(m);
  }
}

/* 3. START AT THE BOTTOM */
/* 3A. Nothing triggers until the page has jumped to the base ("ready") */
history.scrollRestoration = 'manual';
let ready = false;
let userMoved = false;
['wheel', 'touchstart', 'keydown'].forEach((ev) =>
  window.addEventListener(ev, () => { userMoved = true; }, { passive: true }));
function toBase() { window.scrollTo(0, document.documentElement.scrollHeight); }

/* 3B. Jump to the base, then reveal the page */
function placeAtBase() {
  toBase();
  ready = true;
  document.body.classList.add('ready');
  updateClimb();
}
/* 3C. Run early, then re-run if fonts or images shift the layout (until you start moving) */
document.addEventListener('DOMContentLoaded', placeAtBase);
window.addEventListener('load', () => { if (!userMoved) placeAtBase(); });
if (document.fonts) document.fonts.ready.then(() => { if (!userMoved) placeAtBase(); });
setTimeout(() => { if (!ready) placeAtBase(); }, 2500); /* safety net */

/* 4. CLIMB PROGRESS */
/* 4A. Hiroshi roll: decided once per visit, add #hiroshi to the URL to force it */
const hiroshiWillAppear = location.hash === '#hiroshi' || Math.random() < HIROSHI_CHANCE;
const hiroshiStep = 1500 + Math.floor(Math.random() * 4000);
let hiroshiShown = false;
let lastStep = null; /* step at the previous update, to detect crossing upward */
let abeStart = null; /* progress at the moment the Abe face appeared */
let idleTimer = null;
let ticking = false;

/* 4B. Progress is 0 at the base and 1 at the summit */
function updateClimb() {
  ticking = false;
  if (!ready) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(Math.max(1 - window.scrollY / max, 0), 1) : 0;
  const step = Math.round(p * MAX_STEPS);
  stepNum.textContent = step.toLocaleString();
  night.style.opacity = p;
  aurora.style.opacity = Math.min(Math.max((p - 0.55) / 0.35, 0), 1);

  /* 4B-1. Giga at the summit: faint near the top, sharp after standing still */
  if (giga) {
    const near = p > 0.9;
    giga.classList.toggle('near', near);
    clearTimeout(idleTimer);
    if (!near) giga.classList.remove('focus');
    else if (reduceMotion) giga.classList.add('focus');
    else {
      giga.classList.remove('focus');
      idleTimer = setTimeout(() => giga.classList.add('focus'), 1800);
    }
  }

  /* 4B-2. Abe face fades as you climb past where it appeared */
  if (abeWrap && abe && abeStart !== null) {
    const fade = 1 - Math.max(p - abeStart, 0) / ABE_FADE;
    abeWrap.style.opacity = Math.max(fade, 0);
    if (fade <= 0) { abe.classList.remove('on'); abeStart = null; }
  }

  /* 4B-3. Hiroshi triggers only when you climb up across his step */
  if (hiroshiWillAppear && !hiroshiShown && lastStep !== null && lastStep < hiroshiStep && step >= hiroshiStep) {
    showHiroshi(p);
  }
  lastStep = step;
}

/* 4C. Throttle to animation frames */
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(updateClimb); }
}, { passive: true });

/* 5. TABLET REVEAL */
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('lit'); reveal.unobserve(entry.target); }
  });
}, { threshold: 0.35 });
tablets.forEach((t) => reveal.observe(t));

/* 6. NEUTRALITY METER */
/* 6A. The text says perfectly neutral. The needle disagrees. */
const meterWatch = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { needle.style.left = '41%'; meterWatch.disconnect(); }
}, { threshold: 0.6 });
meterWatch.observe(summit.querySelector('.meter'));

/* 7. HIROSHI POPUP AND ABE FACE */
function showHiroshi(p) {
  hiroshiShown = true;
  /* 7A. Popup first, so it always shows even if the face is missing */
  hiroshi.hidden = false;
  requestAnimationFrame(() => hiroshi.classList.add('show'));
  setTimeout(() => {
    hiroshi.classList.remove('show');
    setTimeout(() => { hiroshi.hidden = true; }, 1300);
  }, 5000);
  /* 7B. Then the face */
  if (abeWrap && abe) {
    abeStart = p;
    abeWrap.style.opacity = 1;
    abe.classList.add('on');
  }
}