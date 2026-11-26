/* ============================================================
   Quiet step indicators — emoji stations + numbered button chips.
   No floating labels: the active button gets a small number chip
   and a soft shine, then turns into a ✓ when the action is done.
   ============================================================ */
(function () {
  const page = document.body.dataset.page || "";
  const stepOfPage = { home: 2, wish: 3, gallery: 4, finale: 5 };

  function clearHints() {
    document.querySelectorAll(".btn.indicate").forEach((btn) => {
      btn.classList.remove("indicate");
      delete btn.dataset.step;
    });
  }

  function indicate(btn, step) {
    if (!btn) return;
    clearHints();
    btn.classList.remove("is-done");
    btn.dataset.step = step || "✦";
    btn.classList.add("indicate");
  }

  function markDone(btn) {
    if (!btn) return;
    btn.classList.remove("indicate");
    delete btn.dataset.step;
    btn.classList.add("is-done");
  }

  function nextButton() {
    return (
      document.querySelector(".step-footer .btn-primary") ||
      document.querySelector(".hero-actions .btn-primary") ||
      document.querySelector(".timer-buttons .btn-primary")
    );
  }

  /* Called by page scripts once the current action is finished. */
  window.showNextHint = function () {
    const current = document.querySelector(".btn.indicate");
    const next = nextButton();
    if (current === next) return;
    markDone(current);
    indicate(next, String((stepOfPage[page] || 2) + 1));
  };

  window.clearHint = markDone;

  const firstAction = {
    home: { selector: "#blowBtn", step: "2" },
    wish: { selector: "#openWishBtn", step: "3" },
    gallery: { selector: ".step-footer .btn-primary", step: "5" },
    finale: { selector: "#makeWishBtn", step: "5" },
  }[page];

  if (!firstAction) return;

  // Coming from the cover opens the letter automatically — go straight to Next.
  if (page === "wish" && new URLSearchParams(window.location.search).get("open") === "1") {
    indicate(nextButton(), "4");
    return;
  }

  indicate(document.querySelector(firstAction.selector), firstAction.step);
})();
