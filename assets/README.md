# Assets folder

Add optional files here to personalize the site.

## Photos
`gallery.html` uses Huma's **5 own photos** from `assets/images/`:

- `Huma-1.png`
- `Huma-2.png`
- `Huma-3.png`
- `Huma-4.png`
- `Huma-5.png`

Each photo has its own one-line caption under it. To swap a photo, overwrite the matching file or change its `<img src="...">` and `<p>` caption in `gallery.html`. No CSS change is needed — cards and the lightbox already style images.

## Music
Huma's birthday song is `assets/audio/Huma-birthday.mp3`. It is loaded as `birthdayAudio` in `cover.html` and `timer.html`, and controlled by `script.js`. If the file is unavailable, the synthesized melody / YouTube song remains as a fallback.
