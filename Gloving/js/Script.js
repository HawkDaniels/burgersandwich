/* 1. SETTINGS */
const OVERRIDE = {};            // e.g. {2:'jpg'} for files that aren't gifs
const src = n => `/Gloving/assets/Gloving%20(${n}).${OVERRIDE[n] || 'gif'}`;
const COLORS = ['#ff2bd6','#2bffea','#fff35a','#3dff77','#ff7a2b','#7a5cff','#ff3b3b','#ffffff'];
let calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 2. GATE */
const calmBtn = document.getElementById('calmBtn');
function paintCalm(){
  document.body.classList.toggle('calm', calm);
  document.getElementById('club').classList.toggle('strobe', !calm);
  calmBtn.textContent = 'CALM MODE: ' + (calm ? 'ON' : 'OFF');
}
calmBtn.onclick = () => { calm = !calm; paintCalm(); };
document.getElementById('enterBtn').onclick = () => {
  document.getElementById('gate').hidden = true;
  document.getElementById('club').hidden = false;
  paintCalm(); sizeCanvas();
};
paintCalm();
document.getElementById('enterBtn').onclick = () => {
  document.getElementById('gate').hidden = true;
  document.getElementById('club').hidden = false;
  paintCalm(); sizeCanvas(); sizeShow();
  scrollTo(0, 0);
  if (!showOn) { showOn = true; requestAnimationFrame(drawShow); }
};

/* 3. MEDIA SLOTS (missing files show a labeled placeholder) */
document.querySelectorAll('[data-slots]').forEach(box => {
  box.dataset.slots.split(',').forEach(n => {
    const fig = document.createElement('figure');
    const img = new Image();
    img.src = src(n.trim());
    img.alt = 'Gloving (' + n.trim() + ')';
    img.onerror = () => { fig.innerHTML = `<div class="missing">Gloving (${n.trim()}) goes here</div>`; };
    fig.appendChild(img); box.appendChild(fig);
  });
});

/* 4. FINGER-LIGHT TRAILS (8 colors) */
const cv = document.getElementById('lights'), cx = cv.getContext('2d');
let ci = 0, last = null;
function sizeCanvas(){ cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', sizeCanvas);
function glow(e){
  const x = e.clientX, y = e.clientY;
  cx.shadowBlur = 18; cx.shadowColor = cx.strokeStyle = COLORS[ci];
  cx.lineWidth = 5; cx.lineCap = 'round';
  if (last){ cx.beginPath(); cx.moveTo(last.x, last.y); cx.lineTo(x, y); cx.stroke(); }
  last = {x, y};
}
addEventListener('pointermove', glow);
addEventListener('pointerup', () => { last = null; ci = (ci + 1) % 8; });
(function fade(){
  cx.globalCompositeOperation = 'destination-out';
  cx.fillStyle = 'rgba(0,0,0,' + (calm ? .12 : .06) + ')';
  cx.fillRect(0, 0, cv.width, cv.height);
  cx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(fade);
})();

/* 5. LOGO EASTER EGG (tap to rotate palette) */
const PALETTES = [['#ff2bd6','#2bffea','#fff35a'],['#3dff77','#7a5cff','#ff7a2b'],['#ff3b3b','#fff35a','#2bffea']];
let pi = 0;
document.getElementById('logo').onclick = () => {
  pi = (pi + 1) % PALETTES.length;
  ['--c1','--c2','--c3'].forEach((v, i) => document.documentElement.style.setProperty(v, PALETTES[pi][i]));
};

/* 6. WAIVER STAMP */
document.getElementById('waiver').onchange = e => { document.getElementById('stamp').hidden = !e.target.checked; };

/* 7. SCRIBBLE WALL (saved in this browser only) */
const wall = document.getElementById('wall');
function addNote(t){
  const d = document.createElement('div');
  d.className = 'note'; d.textContent = t;
  d.style.setProperty('--r', (Math.random() * 10 - 5) + 'deg');
  wall.appendChild(d);
}
let notes = [];
try { notes = JSON.parse(localStorage.getItem('glovingWall') || '[]'); } catch (e) {}
notes.forEach(addNote);
document.getElementById('noteBtn').onclick = () => {
  const i = document.getElementById('noteIn'), t = i.value.trim();
  if (!t) return;
  addNote(t); notes.push(t); i.value = '';
  try { localStorage.setItem('glovingWall', JSON.stringify(notes)); } catch (e) {}
};
/* 8. LIGHT RIG (moving heads, lasers, floor wash) */
const sv = document.getElementById('show'), sx = sv.getContext('2d');
let showOn = false;
function sizeShow(){ sv.width = innerWidth; sv.height = innerHeight; }
addEventListener('resize', sizeShow);

/* 8A. THE HEADS: x position, phase, sweep speed, starting hue */
const HEADS = [...Array(7)].map((_, i) => ({ x: (i + .5) / 7, ph: i * 1.3, sp: .6 + i * .11, hue: i * 50 }));

function drawShow(ms){
  const t = ms / 1000, w = sv.width, h = sv.height;
  const k = calm ? .25 : 1;                                   // calm = slow
  const beat = calm ? 1 : .75 + .25 * Math.max(0, Math.sin(t * Math.PI * 4)); // soft 2 per sec
  const dim = calm ? .5 : 1;

  /* 8B. BACKGROUND + FLOOR WASH */
  sx.globalCompositeOperation = 'source-over';
  sx.fillStyle = 'rgba(7,7,11,.35)'; sx.fillRect(0, 0, w, h);
  const fl = sx.createLinearGradient(0, h, 0, h * .6);
  fl.addColorStop(0, `hsla(${(t * 25 * k) % 360},100%,50%,${.35 * dim * beat})`);
  fl.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = fl; sx.fillRect(0, h * .6, w, h * .4);

  /* 8C. MOVING-HEAD BEAMS */
  sx.globalCompositeOperation = 'lighter';
  HEADS.forEach(hd => {
    const ox = hd.x * w, oy = -10, len = h * 1.4;
    const ang = Math.sin(t * hd.sp * k + hd.ph) * .75;         // swing
    const sp = .07 + .03 * Math.sin(t * k + hd.ph);            // beam width
    const hue = (hd.hue + t * 30 * k) % 360;
    const tx = ox + Math.sin(ang) * len, ty = oy + Math.cos(ang) * len;
    const g = sx.createLinearGradient(ox, oy, tx, ty);
    g.addColorStop(0, `hsla(${hue},100%,60%,${.55 * beat * dim})`);
    g.addColorStop(1, `hsla(${hue},100%,60%,0)`);
    sx.fillStyle = g;
    sx.beginPath(); sx.moveTo(ox, oy);
    sx.lineTo(ox + Math.sin(ang - sp) * len, oy + Math.cos(ang - sp) * len);
    sx.lineTo(ox + Math.sin(ang + sp) * len, oy + Math.cos(ang + sp) * len);
    sx.closePath(); sx.fill();
  });

  /* 8D. LASER FAN (off in calm mode) */
  if (!calm){
    sx.lineWidth = 1.5;
    for (let i = 0; i < 10; i++){
      const a = Math.sin(t * 1.2) * .5 + (i - 5) * .14;
      sx.strokeStyle = `hsla(${(120 + i * 12 + t * 40) % 360},100%,60%,.55)`;
      sx.beginPath(); sx.moveTo(w / 2, h);
      sx.lineTo(w / 2 + Math.sin(a) * h * 1.4, h - Math.cos(a) * h * 1.4);
      sx.stroke();
    }
  }

  sx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(drawShow);
}