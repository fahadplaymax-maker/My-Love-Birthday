/* Cover page — candle-blow celebration moment */
const blowBtn = document.getElementById("blowBtn");
const cakeScene = document.getElementById("cakeScene");
const wishMessage = document.getElementById("wishMessage");

function blowCandles() {
  if (!blowBtn || blowBtn.disabled) return;

  blowBtn.disabled = true;
  blowBtn.textContent = "Wish granted ✨";

  if (cakeScene) cakeScene.classList.add("blown");
  if (wishMessage) wishMessage.classList.add("show");

  if (typeof burst === "function") {
    burst(140, window.innerWidth / 2, window.innerHeight * 0.34);
    window.setTimeout(() => burst(80, window.innerWidth / 2, window.innerHeight * 0.42), 220);
  }

  // Move the animated indicator to the next step.
  if (typeof window.showNextHint === "function") window.showNextHint();
}

if (blowBtn) blowBtn.addEventListener("click", blowCandles);
