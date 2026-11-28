/* ============================================================
   Journey section — LIVE counter on the gallery page.
   Counts from 3 November 2023 and keeps ticking every second.
   Standalone: no other page or script is touched.
   ============================================================ */
(function () {
  const section = document.querySelector(".journey-card");
  if (!section) return;

  section.classList.add("js-journey");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fields = Array.from(section.querySelectorAll("[data-unit]"));

  // 3 November 2023, 12:00 am (local time)
  const START = new Date(2023, 10, 3, 0, 0, 0).getTime();
  const formatNumber = (value) => Math.round(value).toLocaleString("en-IN");

  // Keep the layout steady while the digits grow.
  fields.forEach((node) => {
    node.style.minWidth = node.textContent.trim().length + "ch";
  });

  function fullMonthsSinceStart(now) {
    let months = (now.getFullYear() - 2023) * 12 + (now.getMonth() - 10);
    if (now.getDate() < 3) months -= 1; // the 3rd hasn't arrived this month yet
    return Math.max(0, months);
  }

  function currentValues() {
    const totalSeconds = Math.max(0, Math.floor((Date.now() - START) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = fullMonthsSinceStart(new Date());

    return {
      years: Math.floor(months / 12),
      months: months,
      weeks: Math.floor(days / 7),
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: totalSeconds,
    };
  }

  function write(values, progress) {
    fields.forEach((node) => {
      const value = values[node.dataset.unit];
      node.textContent = formatNumber(value * (progress === undefined ? 1 : progress));
    });
  }

  let started = false;

  function startTicking() {
    if (started) return;
    started = true;
    section.classList.add("visible");

    const values = currentValues();

    if (reduceMotion) {
      write(values);
      setInterval(() => write(currentValues()), 1000);
      return;
    }

    // One gentle count-up, then the numbers keep growing live.
    const duration = 1700;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const introStart = performance.now();

    function frame(now) {
      const elapsed = now - introStart;
      if (elapsed < duration) {
        write(currentValues(), easeOut(elapsed / duration));
      } else {
        // Only touch the DOM when a displayed value actually changes.
        const live = currentValues();
        fields.forEach((node) => {
          const text = formatNumber(live[node.dataset.unit]);
          if (node.textContent !== text) node.textContent = text;
        });
      }
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startTicking();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
  } else {
    startTicking();
  }
})();
