# Windows 7 asset drop zone

Drop authentic Win7 sprites at the **exact paths** below. The app falls back to
CSS stand-ins when a file is missing, so partial drops are fine.

✅ = already in place (sourced from the Eshwar0601/Eshwar-win7 reference repo — Microsoft Win7 IP, homage use).
⬜ = still worth grabbing.

Formats: transparent **PNG** except wallpaper/login (**JPG**) and cursors (**.cur**).

## Tier 1 — biggest impact
- [x] `wallpaper/win7-default.jpg`   — optimized to 1920px / ~140KB
- [x] `orb/orb-normal.png`
- [x] `orb/orb-hover.png`
- [x] `orb/orb-pressed.png`          — (currently a copy of hover; replace if you find a real pressed state)
- [x] `icons/computer.png`
- [x] `icons/folder.png`
- [x] `icons/pdf.png`                — use for Dharani_CV
- [x] `icons/internet-explorer.png`
- [x] `icons/shutdown.png`
- [ ] `icons/recycle-empty.png`      ⬜ still needed
- [ ] `icons/recycle-full.png`       ⬜
- [ ] `icons/txt.png`                ⬜
- [ ] `icons/cmd.png`                ⬜ Command Prompt
- [ ] `icons/control-panel.png`      ⬜
- [ ] `icons/certificate.png`        ⬜ NPTEL
- [ ] `icons/notepad.png`            ⬜
- [ ] `icons/app-generic.png`        ⬜ fallback for FlowAX / DriveSync

## Tier 2 — polish
- [x] `tray/volume.png`
- [ ] `tray/network.png`             ⬜
- [ ] `tray/action-center.png`       ⬜
- [ ] `tray/battery.png`             ⬜
- [ ] `tray/chevron-up.png`          ⬜
- [ ] `chrome/min|max|restore|close.png`  ⬜ optional (CSS handles these now)
- [ ] `cursors/normal|link|text|busy.cur` ⬜ (.cur only — NOT .ani)
- [x] `icons/github.png` `icons/linkedin.png` `icons/email.png`  — social (for Contact app)
- [x] `icons/back.svg` `icons/forward.svg`  — explorer nav

## Tier 3 — boot / login phase
- [x] `boot/boot.mp4`                — "Starting Windows" boot animation (video)
- [x] `boot/logo.png`               — Windows 7 logo
- [x] `login/bg.jpg`                — logon background (optimized)
- [x] `sounds/startup.mp3`          — startup chime (plays on first click)
- [ ] `login/user-tile-frame.png`    ⬜ round avatar frame
- [ ] `sounds/logon.wav` `notify.wav` `error.wav` `shutdown.wav`  ⬜ optional

## Fonts (pick one) — still needed
- [ ] `fonts/segoe-ui.woff2` (proprietary — only if you own it)
- [ ] `fonts/selawik.woff2`  (free, metric-compatible — recommended for public site)

## Custom (your own, optional)
- [ ] `icons/flowax.png`  `icons/drivesync.png`   ⬜ bespoke app icons
