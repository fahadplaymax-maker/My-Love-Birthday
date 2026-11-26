/* Gallery page — lightbox for photos / memory cards */
const lightbox = document.getElementById("lightbox");
const lightboxEmoji = document.getElementById("lightboxEmoji");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxNote = document.getElementById("lightboxNote");
const lightboxClose = document.getElementById("lightboxClose");

function closeLightbox() {
  if (lightbox) lightbox.classList.remove("show");
}

document.querySelectorAll(".gallery-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (!lightbox) return;

    const img = card.querySelector("img");
    const emoji = card.querySelector(".gallery-emoji");
    const note = card.dataset.note || card.querySelector("p")?.textContent || "";

    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "Birthday memory";
      lightboxImg.style.display = "block";
      lightboxEmoji.style.display = "none";
    } else {
      lightboxEmoji.textContent = emoji ? emoji.textContent : "💖";
      lightboxEmoji.style.display = "block";
      lightboxImg.style.display = "none";
      lightboxImg.removeAttribute("src");
    }

    lightboxNote.textContent = note;
    lightbox.classList.add("show");
  });
});

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
