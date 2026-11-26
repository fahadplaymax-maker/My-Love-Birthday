/* Final card step — make a wish */
const makeWishBtn = document.getElementById("makeWishBtn");
const finaleMessage = document.getElementById("finaleMessage");

if (makeWishBtn && finaleMessage) {
  makeWishBtn.addEventListener("click", () => {
    burst(180, window.innerWidth / 2, window.innerHeight * 0.45);
    finaleMessage.classList.add("show");
    makeWishBtn.textContent = "Wish sent! 💖";
    makeWishBtn.disabled = true;
    makeWishBtn.style.opacity = "0.85";
    makeWishBtn.style.cursor = "default";

    if (typeof window.clearHint === "function") window.clearHint(makeWishBtn);
  });
}
