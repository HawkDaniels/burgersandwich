/* 1. REFERENCES AND SETTINGS */
const stepNum = document.getElementById('stepNum');
const night = document.querySelector('.sky-night');
const aurora = document.getElementById('aurora');
const abe = document.getElementById('abe');
const tablets = document.querySelectorAll('.tablet');
const summit = document.getElementById('summit');
const motesBox = document.getElementById('motes');
const needle = document.getElementById('needle');
const hiroshi = document.getElementById('hiroshi');
const MAX_STEPS = 7000;
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
/* 3A. The page loads scrolled to the base, then you climb up */
history.scrollRestoration = 'manual';
let userMoved = false;
['wheel', 'touchstart', 'keydown'].forEach((ev) =>
  window.addEventListener(ev, () => { userMoved = true; }, { passive: true }));
function toBase() { window.scrollTo(0, document.documentElement.scrollHeight); }
window.addEventListener('load', () => { toBase(); updateClimb(); });
if (document.fonts) document.fonts.ready.then(() => { if (!userMoved) { toBase(); updateClimb(); } });

/* 4. CLIMB PROGRESS */
/* 4A. Hiroshi popup roll: ~30% of visits, add #hiroshi to the URL to force it */
const hiroshiChance = location.hash === '#hiroshi' ? 1 : 0.3;
const hiroshiStep = 1500 + Math.floor(Math.random() * 4000);
let hiroshiShown = false;
let ticking = false;
let idleTimer = null;

/* 4B. Progress is 0 at the base and 1 at the summit */
function updateClimb() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(Math.max(1 - window.scrollY / max, 0), 1) : 0;
  const step = Math.round(p * MAX_STEPS);
  stepNum.textContent = step.toLocaleString();
  night.style.opacity = p;
  aurora.style.opacity = Math.min(Math.max((p - 0.55) / 0.35, 0), 1);

  /* 4B-1. Sky face: blurred near the top, sharp after standing still */
  const near = p > 0.9;
  abe.classList.toggle('near', near);
  if (!near) abe.classList.remove('focus');
  clearTimeout(idleTimer);
  if (near) idleTimer = setTimeout(() => abe.classList.add('focus'), 1800);
  if (near && reduceMotion) abe.classList.add('focus');
  if (!near || !reduceMotion) abe.classList.remove('focus');

  if (!hiroshiShown && step >= hiroshiStep && Math.random() < hiroshiChance) showHiroshi();
  ticking = false;
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

/* 7. HIROSHI POPUP */
function showHiroshi() {
  hiroshiShown = true;
  hiroshi.hidden = false;
  requestAnimationFrame(() => hiroshi.classList.add('show'));
  setTimeout(() => {
    hiroshi.classList.remove('show');
    setTimeout(() => { hiroshi.hidden = true; }, 1300);
  }, 5000);
}

/* 8. START */
updateClimb();