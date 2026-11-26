/* Auto-record the full card journey; only save button appears at the end */
(() => {
  const frame = document.getElementById("journeyFrame");
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("recordStatus");
  const recordBar = document.getElementById("recordBar");
  const gate = document.getElementById("recordGate");
  const gateBtn = document.getElementById("gateBtn");

  if (!frame || !saveBtn || !statusEl || !gate || !gateBtn) return;

  let stream = null;
  let recorder = null;
  let chunks = [];
  let currentMime = "";
  let startedAt = 0;
  let tickTimer = null;
  let savedUrl = null;
  let savedFileName = "";

  function setStatus(message, type = "normal") {
    statusEl.classList.toggle("error", type === "error");
    if (type === "recording") {
      statusEl.innerHTML = '<span class="record-dot" aria-hidden="true"></span>';
      statusEl.appendChild(document.createTextNode(message));
    } else {
      statusEl.textContent = message;
    }
  }

  function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function friendlyError(error) {
    const name = (error && error.name) || "";
    const message = (error && error.message) || "";

    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return "Screen share allow nahi hua. Dobara tap karein aur ‘This tab’ select karein.";
    }
    if (!window.MediaRecorder) {
      return "Is browser me recording supported nahi hai. Chrome ya Edge try karein.";
    }
    if (/secure|https|localhost/i.test(message)) {
      return "Screen recording ke liye HTTPS (Vercel) ya localhost chahiye.";
    }
    return "Recording start nahi ho payi. Dobara tap karein.";
  }

  function markJourneyMode() {
    try {
      const doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
      if (doc && doc.body) doc.body.classList.add("journey-mode");
    } catch (error) {
      /* same-origin; ignore while loading */
    }
  }

  function checkJourneyStep() {
    markJourneyMode();
    let path = "";
    try {
      path = new URL(frame.contentWindow.location.href).pathname;
    } catch (error) {
      return;
    }

    if (/finale\.html$/.test(path) && recorder && recorder.state === "recording") {
      document.body.classList.add("journey-complete");
      recordBar.classList.add("show-save");
      saveBtn.hidden = false;
      saveBtn.disabled = false;
      saveBtn.classList.add("ready");
      setStatus("Recording complete ho gayi 💗 — ab Save recording dabayein.", "recording");
    }
  }

  function pickMimeType() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return "";
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  function makeFileName(type) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const extension = /mp4/i.test(type) ? "mp4" : "webm";
    return `Huma-birthday-journey-${stamp}.${extension}`;
  }

  function releaseStream() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const onFinale = document.body.classList.contains("journey-complete");
    if (onFinale) {
      setStatus(`Recording complete ho gayi 💗 ${formatDuration(elapsed)} — ab Save recording dabayein.`, "recording");
    } else {
      setStatus(`Recording chal rahi hai… ${formatDuration(elapsed)} — aap bas card enjoy karein.`, "recording");
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setStatus(friendlyError(new Error("Screen recording needs HTTPS or localhost")), "error");
      gate.classList.remove("hidden");
      gateBtn.disabled = false;
      return;
    }
    if (!window.MediaRecorder) {
      setStatus(friendlyError(new Error("Video recording is not supported")), "error");
      gate.classList.remove("hidden");
      gateBtn.disabled = false;
      return;
    }

    gateBtn.disabled = true;
    setStatus("Screen share khul raha hai… ‘This tab’ select karein.");

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      gate.classList.add("hidden");
      frame.src = "timer.html?journey=1";

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.addEventListener("ended", requestSave, { once: true });

      currentMime = pickMimeType();
      const options = currentMime ? { mimeType: currentMime } : undefined;
      recorder = new MediaRecorder(stream, options);
      chunks = [];

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener("stop", finalizeRecording);
      recorder.start(250);

      startedAt = Date.now();
      updateTimer();
      tickTimer = window.setInterval(updateTimer, 1000);
    } catch (error) {
      releaseStream();
      gate.classList.remove("hidden");
      gateBtn.disabled = false;
      setStatus(friendlyError(error), "error");
    }
  }

  function requestSave() {
    if (!recorder || recorder.state === "inactive") return;
    saveBtn.disabled = true;
    saveBtn.classList.remove("ready");
    setStatus("Video save ho rahi hai…");
    recorder.stop();
  }

  function downloadSaved() {
    if (!savedUrl || !savedFileName) return;
    const link = document.createElement("a");
    link.href = savedUrl;
    link.download = savedFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function finalizeRecording() {
    window.clearInterval(tickTimer);
    releaseStream();

    if (!chunks.length) {
      setStatus("Video empty thi — dobara try karein.", "error");
      saveBtn.hidden = false;
      saveBtn.disabled = false;
      saveBtn.textContent = "Try again";
      saveBtn.onclick = () => window.location.reload();
      return;
    }

    const type = (recorder && recorder.mimeType) || currentMime || "video/webm";
    const blob = new Blob(chunks, { type });
    savedFileName = makeFileName(type);

    if (savedUrl) URL.revokeObjectURL(savedUrl);
    savedUrl = URL.createObjectURL(blob);

    downloadSaved();
    saveBtn.hidden = false;
    saveBtn.disabled = false;
    saveBtn.textContent = "💾 Download again";
    saveBtn.classList.remove("ready");
    saveBtn.onclick = downloadSaved;
    recordBar.classList.add("show-save");
    setStatus(`Saved! ${savedFileName} download ho gayi. 💾`);
  }

  frame.addEventListener("load", checkJourneyStep);
  gateBtn.addEventListener("click", startRecording);
  saveBtn.addEventListener("click", requestSave);

  window.addEventListener("pagehide", () => {
    window.clearInterval(tickTimer);
    releaseStream();
    if (savedUrl) URL.revokeObjectURL(savedUrl);
  });
})();
