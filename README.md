# 🎂 Huma's Birthday Card

A **step-by-step greeting card website** for **Huma** — born **29 November 2004**, turning **22** on 29 November 2026. Each step is its own page, so the card turns one page at a time.

## The card steps
| Step | File | What happens |
|---|---|---|
| 1 | `timer.html` | Animated countdown + poppable balloons; auto-opens the cover when time finishes (no Next button) |
| 2 | `cover.html` | Main celebration: big birthday hero, cake with candles, blow-the-candles surprise, music |
| 3 | `wish.html` | Open the envelope → full personal letter |
| 4 | `gallery.html` | Memory cards (tap to enlarge) |
| 5 | `finale.html` | Make a wish → confetti + closing message → record/save a video wish |

`index.html` is the **entry point** — it redirects straight to Step 1 (`timer.html`), so anyone opening the site link starts from the beginning. Step 1 also has a **🎬 Record full journey** button that opens the tab recorder.

Use the **Back / Next step** buttons at the bottom of each page. The progress bar at the top shows where you are.

**Demo preview:** `birthday-demo.html` shows how the timer screen looks when the countdown finishes on 29 November (frozen `00:00:00:00`, lit cake, confetti). It is a preview only — not part of the step flow.

Only the **Wish (Step 3)** page uses the greeting-card frame; the other steps are plain full sections.

## Files
| File | Purpose |
|---|---|
| `index.html` | Entry point — redirects to Step 1 |
| `timer.html`, `cover.html`, `wish.html`, `gallery.html`, `finale.html` | The five card steps |
| `style.css` | Card design, colors, animations, responsive layout |
| `script.js` | Shared: step progress, confetti, music (local MP3 + fallbacks) |
| `timer.js` | Countdown, soft poppable balloons, cursor hearts |
| `birthday-demo.html` + `demo.js` | Demo preview of the "time complete" birthday screen |
| `wish.js` | Envelope → letter reveal |
| `gallery.js` | Memory card lightbox |
| `finale.js` | Final "Make a wish" surprise |
| `record.html` + `record.js` | Full-journey tab recorder: click through all steps, then save/share the video |
| `video.js` | Optional camera + mic video wish on the final page |
| `assets/audio/Huma-birthday.mp3` | Huma's birthday song played by the music button |

## Run it
Open `index.html` in a browser — it redirects to Step 1. No install or build step needed.

## Deploy
Upload **only** these files (the site is 100% static, no build step):
`index.html`, `timer.html`, `cover.html`, `wish.html`, `gallery.html`, `finale.html`, `record.html`, `birthday-demo.html`, `style.css`, `script.js`, `indicators.js`, `cover.js`, `timer.js`, `wish.js`, `gallery.js`, `finale.js`, `video.js`, `record.js`, `demo.js`, `assets/`.

Works on GitHub Pages, Netlify, Vercel, or any static host. The root URL opens Step 1 automatically. Keep `assets/` even if empty.

## Theme — Pastel Unicorn 🦄
Baby pink `#FF8FB1` · Lavender `#E4C7FF` · Mint `#8FE3C8` · Cream `#FFF3FA` on a soft pastel background

## Music
The "Play our song" button plays **Huma's downloaded birthday song** from `assets/audio/Huma-birthday.mp3` (offline-friendly, no buffering). If that file is unavailable, it falls back to a synthesized birthday melody and the old YouTube song.

## Full journey recording
`record.html` runs the whole card inside an iframe. Tap **Tap to begin**, choose **This tab** (and tick **Share tab audio**) once, then just click through the steps normally. Recording keeps running in the background; nothing else appears during the journey. When the finale page loads, a single **💾 Save recording** button appears. Tap it to stop and download the video. Nothing is uploaded to a server. Needs **HTTPS** (automatic on Vercel/GitHub Pages) or `localhost`.

## Video wish
On the final page, **Record a video wish** uses the browser's camera and microphone, shows a live preview, then saves/downloads the clip on stop (also available via **Download again**). There is a 60-second limit and a **Record again** option. Nothing is uploaded to a server — the file stays on the device. Camera access needs **HTTPS** (automatic on Vercel/GitHub Pages) or `localhost`.

## Add photos
Gallery uses Huma's 5 own photos (`Huma-1.png` … `Huma-5.png`) in `assets/images/`, each with a one-line caption under it. See `assets/README.md` to swap photos.

Made with love 🤍
