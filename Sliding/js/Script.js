/* 1. SETTINGS */
const OVERRIDE = {};            // e.g. {4:'gif', 5:'gif'} for files that aren't jpg
const src = n => `/Sliding/assets/Sliding%20(${n}).${OVERRIDE[n] || 'jpg'}`;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 2. GATE */
document.getElementById('enterBtn').onclick = () => {
  document.getElementById('gate').hidden = true;
  document.getElementById('yard').hidden = false;
  sizeSparks();
  scrollTo(0, 0);
};

/* 3. MEDIA SLOTS (missing files show a labeled placeholder) */
document.querySelectorAll('[data-slots]').forEach(box => {
  box.dataset.slots.split(',').forEach(n => {
    const fig = document.createElement('figure');
    const img = new Image();
    img.src = src(n.trim());
    img.alt = 'Sliding (' + n.trim() + ')';
    img.onerror = () => { fig.innerHTML = `<div class="missing">Sliding (${n.trim()}) goes here</div>`; };
    fig.appendChild(img); box.appendChild(fig);
  });
});

/* 4. SPARKS (click or tap; off with reduced motion) */
const cv = document.getElementById('sparks'), cx = cv.getContext('2d');
let sparks = [];
function sizeSparks(){ cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', sizeSparks);
sizeSparks();
addEventListener('pointerdown', e => {
  if (reduced) return;
  for (let i = 0; i < 24; i++){
    const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
    sparks.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 30 + Math.random() * 20 });
  }
});
(function loop(){
  cx.clearRect(0, 0, cv.width, cv.height);
  sparks = sparks.filter(p => p.life > 0);
  sparks.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += .25; p.life--;
    cx.fillStyle = p.life > 15 ? '#ffd400' : '#ff6a00';
    cx.fillRect(p.x, p.y, 3, 3);
  });
  requestAnimationFrame(loop);
})();

/* 5. DAYS SINCE LAST SCRAPE (saved in this browser only) */
const daysEl = document.getElementById('days');
let since = Date.now();
try { since = +localStorage.getItem('slidingScrape') || since; } catch (e) {}
function paintDays(){ daysEl.textContent = Math.floor((Date.now() - since) / 86400000); }
paintDays();
document.getElementById('scrapeBtn').onclick = () => {
  since = Date.now();
  try { localStorage.setItem('slidingScrape', since); } catch (e) {}
  paintDays();
};