/* Timer step — magical countdown, then auto-open the card */
const timerFields = {
  days: document.getElementById("t-days"),
  hours: document.getElementById("t-hours"),
  minutes: document.getElementById("t-minutes"),
  seconds: document.getElementById("t-seconds"),
};

let countdownTarget = new Date(2026, 10, 29, 0, 0, 0, 0);
let countdownFinished = false;
let timerInterval = null;

function flipValue(el, value) {
  if (!el || el.textContent === value) return;
  el.textContent = value;
  el.classList.remove("flip");
  void el.offsetWidth;
  el.classList.add("flip");
}

function finishCountdown() {
  if (countdownFinished) return;
  countdownFinished = true;
  if (timerInterval) window.clearInterval(timerInterval);
  const shell = document.querySelector(".timer-only-shell");
  const tease = document.getElementById("timerTease");
  if (tease) tease.textContent = "It's time! Opening your surprise...";
  if (shell) shell.classList.add("timer-complete");
  window.setTimeout(() => {
    window.location.href = "cover.html";
  }, 1400);
}

function updateTimer() {
  const now = new Date();
  const total = Math.max(0, Math.floor((countdownTarget - now) / 1000));
  const pad = (n) => String(n).padStart(2, "0");

  flipValue(timerFields.days, pad(Math.floor(total / 86400)));
  flipValue(timerFields.hours, pad(Math.floor((total % 86400) / 3600)));
  flipValue(timerFields.minutes, pad(Math.floor((total % 3600) / 60)));
  flipValue(timerFields.seconds, pad(total % 60));

  if (total === 0) finishCountdown();
}

/* Ambient stars */
function spawnStars() {
  const wrap = document.getElementById("timerStars");
  if (!wrap) return;
  const count = window.matchMedia("(max-width: 640px)").matches ? 18 : 32;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "t-star";
    const size = 1.5 + Math.random() * 2.5;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${size}px;height:${size}px;--tw:${3 + Math.random() * 4}s;--td:${Math.random() * 5}s`;
    wrap.appendChild(s);
  }
}

/* Floating hearts & sparkles */
function spawnFloaters() {
  const wrap = document.getElementById("timerFloaters");
  if (!wrap) return;
  const chars = ["♡", "♥", "✦", "✧", "💗", "✨"];
  const count = window.matchMedia("(max-width: 640px)").matches ? 10 : 18;
  for (let i = 0; i < count; i++) {
    const f = document.createElement("span");
    f.className = "t-floater";
    f.textContent = chars[i % chars.length];
    const dur = 10 + Math.random() * 12;
    f.style.cssText = `left:${Math.random() * 100}%;--fd:${dur}s;--fdelay:${Math.random() * dur}s;--fs:${0.7 + Math.random() * 0.8}rem;--fx:${(Math.random() - 0.5) * 60}px`;
    wrap.appendChild(f);
  }
}

spawnStars();
spawnFloaters();

if (timerFields.days) {
  updateTimer();
  if (!countdownFinished) timerInterval = window.setInterval(updateTimer, 1000);
}
