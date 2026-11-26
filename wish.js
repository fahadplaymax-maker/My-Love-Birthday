/* Wish page — envelope reveal */
const openWishBtn = document.getElementById("openWishBtn");
const envelope = document.getElementById("envelope");
const letter = document.getElementById("letter");

function openLetter() {
  if (!envelope || !letter || letter.classList.contains("show")) return;

  envelope.classList.add("hidden");
  letter.classList.add("show");
  letter.setAttribute("aria-hidden", "false");

  const rect = openWishBtn ? openWishBtn.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth };
  burst(110, rect.left + rect.width / 2, rect.top + rect.height / 2);

  if (openWishBtn) {
    openWishBtn.textContent = "Wish opened 💖";
    openWishBtn.disabled = true;
    openWishBtn.style.opacity = "0.8";
    openWishBtn.style.cursor = "default";
  }

  setTimeout(() => letter.scrollIntoView({ behavior: "smooth", block: "center" }), 250);

  // Move the animated indicator to the next step.
  if (typeof window.showNextHint === "function") window.showNextHint();
}

if (openWishBtn) openWishBtn.addEventListener("click", openLetter);

// If the visitor came from the Home page button (?open=1), open automatically.
if (new URLSearchParams(window.location.search).get("open") === "1") {
  setTimeout(openLetter, 500);
}
