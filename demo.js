/* ============================================================
   Demo screen — continuous celebration for the "time complete" view
   ============================================================ */

if (typeof burst === "function") {
  // big opening burst
  setTimeout(() => burst(150, window.innerWidth / 2, window.innerHeight * 0.35), 300);

  // recurring fireworks so the preview always feels alive
  setInterval(() => {
    if (document.hidden) return;
    const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
    const y = Math.random() * window.innerHeight * 0.4 + 80;
    burst(55, x, y);
  }, 2200);
}
