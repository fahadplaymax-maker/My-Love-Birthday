/* Timer step — countdown only, then auto-open the card */
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
  window.setTimeout(() => {
    window.location.href = "cover.html";
  }, 900);
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

if (timerFields.days) {
  updateTimer();
  if (!countdownFinished) timerInterval = window.setInterval(updateTimer, 1000);
}
