/* Finale — record a short video wish and save it on the device */
(() => {
  const recordBtn = document.getElementById("recordBtn");
  const saveBtn = document.getElementById("saveVideoBtn");
  const statusEl = document.getElementById("videoStatus");
  const liveStage = document.getElementById("liveStage");
  const savedStage = document.getElementById("savedStage");
  const liveVideo = document.getElementById("liveVideo");
  const savedVideo = document.getElementById("savedVideo");

  if (!recordBtn || !saveBtn || !statusEl || !liveVideo || !savedVideo) return;

  const MAX_SECONDS = 60;
  let stream = null;
  let recorder = null;
  let chunks = [];
  let currentMime = "";
  let startedAt = 0;
  let tickTimer = null;
  let stopTimer = null;
  let savedUrl = null;
  let micAvailable = true;

  function setStatus(message, type = "normal") {
    statusEl.classList.toggle("error", type === "error");
    if (type === "recording") {
      statusEl.innerHTML = '<span class="record-dot" aria-hidden="true"></span>';
      statusEl.appendChild(document.createTextNode(message));
    } else {
      statusEl.textContent = message;
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function friendlyError(error) {
    const name = (error && error.name) || "";
    const message = (error && error.message) || "";

    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return "Camera/mic permission deny ho gayi. Address bar se allow karke dobara dabao.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "Camera ya mic nahi mila. Doosra device try karo.";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      return "Camera busy hai — doosra app band karke dobara try karo.";
    }
    if (/secure|https|localhost/i.test(message)) {
      return "Camera recording ke liye HTTPS (Vercel) ya localhost chahiye.";
    }
    if (/not supported/i.test(message)) {
      return "Is browser me video recording supported nahi hai. Chrome ya Edge try karo.";
    }
    return "Recording start nahi ho payi. Dobara try karo.";
  }

  async function getCameraStream() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera recording needs HTTPS or localhost");
    }

    try {
      micAvailable = true;
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
    } catch (firstError) {
      const blocked = ["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(firstError.name);
      if (blocked) throw firstError;

      try {
        micAvailable = false;
        return await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (secondError) {
        throw firstError;
      }
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

  function fileExtension(type) {
    if (/mp4/i.test(type)) return "mp4";
    if (/ogg/i.test(type)) return "ogv";
    return "webm";
  }

  function fileName(type) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `Huma-birthday-wish-${stamp}.${fileExtension(type)}`;
  }

  function downloadSavedVideo() {
    if (!savedUrl) return;
    const link = document.createElement("a");
    link.href = savedUrl;
    link.download = fileName(currentMime);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function releaseStream() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    liveVideo.srcObject = null;
    if (liveStage) liveStage.classList.remove("show");
  }

  function updateTimer() {
    const seconds = Math.min(MAX_SECONDS, Math.floor((Date.now() - startedAt) / 1000));
    const suffix = micAvailable ? "" : " · mic unavailable";
    setStatus(`Recording… ${formatTime(seconds)} / ${formatTime(MAX_SECONDS)}${suffix}`, "recording");
  }

  async function startRecording() {
    recordBtn.disabled = true;
    saveBtn.disabled = true;
    setStatus("Camera chalu ho rahi hai…");

    let nextStream = null;
    try {
      nextStream = await getCameraStream();
      if (!window.MediaRecorder) throw new Error("Video recording is not supported");

      stream = nextStream;
      liveVideo.srcObject = stream;
      if (liveStage) liveStage.classList.add("show");
      await liveVideo.play().catch(() => {});

      currentMime = pickMimeType();
      const options = currentMime ? { mimeType: currentMime } : undefined;
      recorder = new MediaRecorder(stream, options);
      chunks = [];

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener("stop", finishRecording);

      recorder.start(250);
      startedAt = Date.now();
      recordBtn.disabled = false;
      recordBtn.textContent = "⏹ Stop & save";
      recordBtn.classList.add("recording");
      if (savedStage) savedStage.classList.remove("show");
      updateTimer();

      tickTimer = window.setInterval(updateTimer, 250);
      stopTimer = window.setTimeout(stopRecording, MAX_SECONDS * 1000);
    } catch (error) {
      if (nextStream) nextStream.getTracks().forEach((track) => track.stop());
      if (stream === nextStream) releaseStream();
      recordBtn.disabled = false;
      recordBtn.textContent = "🎥 Start recording";
      setStatus(friendlyError(error), "error");
    }
  }

  function stopRecording() {
    if (!recorder || recorder.state === "inactive") return;
    recordBtn.disabled = true;
    setStatus("Video save ho rahi hai…");
    recorder.stop();
  }

  function finishRecording() {
    window.clearInterval(tickTimer);
    window.clearTimeout(stopTimer);
    releaseStream();

    recordBtn.disabled = false;
    recordBtn.textContent = "🎥 Record again";
    recordBtn.classList.remove("recording");

    if (!chunks.length) {
      setStatus("Video empty thi — dobara try karo.", "error");
      return;
    }

    const type = (recorder && recorder.mimeType) || currentMime || "video/webm";
    currentMime = type;
    const blob = new Blob(chunks, { type });

    if (savedUrl) URL.revokeObjectURL(savedUrl);
    savedUrl = URL.createObjectURL(blob);
    savedVideo.src = savedUrl;
    if (savedStage) savedStage.classList.add("show");
    saveBtn.disabled = false;

    downloadSavedVideo();
    setStatus(`Saved! ${fileName(type)} download ho gayi. 💾`);
  }

  recordBtn.addEventListener("click", () => {
    if (recorder && recorder.state === "recording") stopRecording();
    else startRecording();
  });

  saveBtn.addEventListener("click", downloadSavedVideo);

  window.addEventListener("pagehide", () => {
    window.clearInterval(tickTimer);
    window.clearTimeout(stopTimer);
    releaseStream();
    if (savedUrl) URL.revokeObjectURL(savedUrl);
  });
})();
