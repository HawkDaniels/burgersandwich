// ==========================================================
// MUNANCHO CUSTOM PLAYER (For education)
// Drives the hidden <audio id="audio-player"> from script.js.
// ==========================================================
(function () {
  // 1. Elements
  const audio = document.getElementById("audio-player");
  const playBtn = document.getElementById("pc-play");
  const seek = document.getElementById("pc-seek");
  const volume = document.getElementById("pc-volume");
  const cur = document.getElementById("pc-current");
  const dur = document.getElementById("pc-duration");
  if (!audio || !playBtn) return;

  // 2. Helpers
  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + String(r).padStart(2, "0");
  };
  const fill = (el) => {
    const pct = ((el.value - el.min) / (el.max - el.min || 1)) * 100;
    el.style.setProperty("--pct", pct + "%");
  };
  const showPlaying = (on) => {
    playBtn.textContent = on ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
  };

  // 3. Play / pause (does nothing until a song has been chosen)
  playBtn.addEventListener("click", () => {
    if (!audio.currentSrc && !audio.getAttribute("src")) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });
  audio.addEventListener("play", () => showPlaying(true));
  audio.addEventListener("pause", () => showPlaying(false));
  audio.addEventListener("ended", () => showPlaying(false));

  // 4. Time + seek bar
  const syncDuration = () => {
    if (isFinite(audio.duration)) {
      seek.max = audio.duration;
      dur.textContent = fmt(audio.duration);
    }
    fill(seek);
  };
  audio.addEventListener("loadedmetadata", syncDuration);
  audio.addEventListener("durationchange", syncDuration);
  audio.addEventListener("timeupdate", () => {
    seek.value = audio.currentTime;
    cur.textContent = fmt(audio.currentTime);
    fill(seek);
  });
  seek.addEventListener("input", () => { audio.currentTime = seek.value; });

  // 5. Volume
  volume.addEventListener("input", () => {
    audio.volume = volume.value;
    fill(volume);
  });

  fill(seek);
  fill(volume);
})();