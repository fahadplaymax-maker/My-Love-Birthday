/* ============================================================
   Shared script — navigation, countdown, confetti, music
   Loaded on every page.
   ============================================================ */

const currentPage = document.body.dataset.page || "home";

/* -------------------- Mobile navigation -------------------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.textContent = open ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "☰";
    });
  });
}

// Highlight the active page in the navbar
document.querySelectorAll(".nav-link").forEach((link) => {
  if (link.dataset.page === currentPage) link.classList.add("active");
});

/* -------------------- Step progress on greeting card -------------------- */
const stepNumbers = { timer: 0, home: 1, wish: 2, gallery: 3, finale: 4 };
const currentStep = stepNumbers[currentPage];
const dots = document.querySelectorAll(".progress-dots span");

if (dots.length && currentStep !== undefined) {
  dots.forEach((dot, index) => {
    if (index < currentStep) dot.classList.add("done");
    if (index === currentStep) dot.classList.add("active");
  });
}

/* -------------------- Confetti (available on every page) -------------------- */
const canvas = document.getElementById("confetti");
const ctx = canvas ? canvas.getContext("2d") : null;
const confettiColors = ["#FF8FB1", "#E4C7FF", "#8FE3C8", "#FFF3FA", "#FFD86B", "#FFFFFF"];

let particles = [];
let animating = false;

function sizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
sizeCanvas();
window.addEventListener("resize", sizeCanvas);

function burst(count, originX, originY) {
  if (!ctx) return;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 6 + Math.random() * 8,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? "circle" : "rect",
      life: 1,
    });
  }

  if (!animating) {
    animating = true;
    requestAnimationFrame(animate);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.16; // gravity
    p.vx *= 0.99;
    p.rotation += p.spin;
    p.life -= 0.005;

    if (p.y > canvas.height + 40 || p.life <= 0) return false;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, (p.size * 2) / 3);
    }
    ctx.restore();
    return true;
  });

  if (particles.length > 0) {
    requestAnimationFrame(animate);
  } else {
    animating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

window.addEventListener("load", () => {
  setTimeout(() => {
    if (canvas) burst(80, canvas.width / 2, canvas.height * 0.3);
  }, 350);
});

/* -------------------- Music: downloaded birthday song + fallbacks -------------------- */
const YOUTUBE_VIDEO_ID = "3J-Lownj6QM";
const musicBtn = document.getElementById("musicBtn");
const birthdayAudio = document.getElementById("birthdayAudio");
let audioCtx = null;
let isPlaying = false;
let activeNodes = [];
let resetTimer = null;
let ytPlayer = null;
let ytReady = false;

function setMusicButton(playing) {
  isPlaying = playing;
  if (musicBtn) {
    musicBtn.textContent = playing ? "⏸ Pause song" : "🎵 Play our song";
    musicBtn.setAttribute("aria-pressed", String(playing));
    musicBtn.classList.toggle("playing", playing);
  }
}

const melody = [
  ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.5], ["G4", 0.5], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.5], ["F5", 0.5], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2],
];

const noteFrequencies = {
  G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
  D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

function stopMelody() {
  activeNodes.forEach((node) => {
    try { node.stop(); } catch (e) { /* already stopped */ }
  });
  activeNodes = [];
  clearTimeout(resetTimer);
}

function stopSong() {
  stopMelody();
  if (birthdayAudio) {
    birthdayAudio.pause();
    birthdayAudio.currentTime = 0;
  }
  if (ytReady && ytPlayer && typeof ytPlayer.pauseVideo === "function") {
    try { ytPlayer.pauseVideo(); } catch (e) { /* ignore */ }
  }
  setMusicButton(false);
}

function playSong() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !musicBtn) {
    if (musicBtn) musicBtn.textContent = "🎵 Audio not supported";
    return;
  }

  audioCtx = audioCtx || new AudioContextClass();
  if (audioCtx.state === "suspended") audioCtx.resume();

  const beat = 0.42;
  let start = audioCtx.currentTime + 0.06;
  let total = 0;

  melody.forEach(([note, beats]) => {
    const duration = beats * beat;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = noteFrequencies[note];

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.04);
    gain.gain.setValueAtTime(0.16, start + duration * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + duration);

    activeNodes.push(osc);
    start += duration;
    total += duration;
  });

  setMusicButton(true);
  resetTimer = setTimeout(() => {
    stopMelody();
    const state = ytPlayer && ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : -1;
    if (state !== 1) setMusicButton(false); // reset only if YouTube isn't playing
  }, total * 1000 + 200);
}

/* ---- YouTube player (IFrame API) ---- */
function onYouTubeIframeAPIReady() {
  if (!document.getElementById("youtube-player") || typeof YT === "undefined") return;

  ytPlayer = new YT.Player("youtube-player", {
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: (e) => {
        ytReady = true;
        // allow playback triggered from the parent-page button
        e.target.getIframe().setAttribute("allow", "autoplay; encrypted-media");
        // pre-buffer so playVideo() reacts as fast as possible
        e.target.cueVideoById(YOUTUBE_VIDEO_ID);
      },
      onStateChange: (e) => {
        if (e.data === 1) {          // PLAYING → hand over from local melody
          stopMelody();
          setMusicButton(true);
        }
        if (e.data === 2 || e.data === 0) setMusicButton(false); // PAUSED / ENDED
      },
    },
  });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

if (document.getElementById("youtube-player")) {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

if (musicBtn) {
  musicBtn.addEventListener("click", () => {
    if (isPlaying) {
      stopSong();
      return;
    }

    // Huma's downloaded song plays first — no network or buffering needed.
    if (birthdayAudio && typeof birthdayAudio.play === "function") {
      birthdayAudio.play().then(() => {
        setMusicButton(true);
      }).catch(() => {
        // If the local file cannot play, keep the old melody / YouTube fallback.
        playSong();
        if (ytReady && ytPlayer && typeof ytPlayer.playVideo === "function") {
          ytPlayer.playVideo();
        }
      });
      return;
    }

    playSong();
    if (ytReady && ytPlayer && typeof ytPlayer.playVideo === "function") {
      ytPlayer.playVideo();
    }
  });
}

if (birthdayAudio) {
  birthdayAudio.addEventListener("ended", () => setMusicButton(false));
}
