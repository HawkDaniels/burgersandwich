// 1. Visited flag (unlocks the TheLore codec call)
try { localStorage.setItem("agarthaVisited", "1"); } catch (e) {}

// 2. The Tape (synthesized noise + chirps, no audio file needed)
const tapeBtn = document.getElementById("tapeBtn");
let ctx, noiseSrc, chirpTimer, playing = false;

function chirp() {
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
  o.frequency.setValueAtTime(2500, t);
  o.frequency.exponentialRampToValueAtTime(6000, t + 0.25);
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g).connect(ctx.destination);
  o.start(); o.stop(t + 0.3);
}

tapeBtn.addEventListener("click", () => {
  if (!playing) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buf; noiseSrc.loop = true;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800;
    const g = ctx.createGain(); g.gain.value = 0.08;
    noiseSrc.connect(f).connect(g).connect(ctx.destination);
    noiseSrc.start();
    chirpTimer = setInterval(chirp, 700);
    tapeBtn.textContent = "■ Stop the tape";
  } else {
    clearInterval(chirpTimer); noiseSrc.stop(); ctx.close();
    tapeBtn.textContent = "▶ Play the tape (turn volume down)";
  }
  playing = !playing;
});

// 3. The Last Door
const SOCK_CODE = "SockGangLovesYou";
const doorInput = document.getElementById("doorInput");
const doorLink = document.getElementById("doorLink");
doorInput.addEventListener("input", () => {
  if (doorInput.value.trim() === SOCK_CODE) {
    doorLink.hidden = false;
    doorInput.disabled = true;
  }
});