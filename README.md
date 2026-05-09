# Flag IQ — World Millionaire

A Who-Wants-to-Be-a-Millionaire-style flag-guessing game covering **all 195 UN-recognized countries** (193 members + Vatican City + Palestine). Built as a single self-contained HTML/JS/CSS file, ready to ship as a Progressive Web App or be wrapped into an Android APK with Capacitor.

- 🌍 195 countries, each with at least 3 fun facts
- 💰 Prize ladder from Rp 1,000 → Rp 1,000,000
- 💡 3 lifelines: 50:50, More Clues, Ask Mama/Papa
- 🔒 Safety lines every 20 levels
- 🏆 Top-10 leaderboard saved on the device
- 📱 Portrait-first layout tuned for modern Android (Galaxy S26 Ultra-friendly)

---

## Repository layout

```
.
├── index.html              # The whole game (HTML/CSS/JS)
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker (offline + caches flag images)
├── icon.svg                # Source vector icon
├── icon-maskable.svg       # Maskable variant (for Android adaptive icons)
├── icons/                  # Generated PNG icons (16–1024 px)
├── android-icons/          # Pre-rendered Android launcher icons
├── scripts/
│   └── build-web.js        # Copies web files into www/ for Capacitor
├── capacitor.config.json   # Capacitor configuration
├── package.json            # npm + Capacitor dependencies
├── .gitignore
└── .github/workflows/
    └── android-build.yml   # Optional: auto-builds debug APK on each push
```

---

## 1. Quick preview (no build)

Just open `index.html` in any modern browser. The service worker won't register on `file://`, but the game itself runs fully.

For a more accurate test (so the manifest and service worker work), serve it with any static file server:

```bash
npx serve .
# or:  python3 -m http.server 8000
```

Then visit `http://localhost:3000` (or `:8000`).

---

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/flag-iq.git
git push -u origin main
```

Optionally enable **GitHub Pages** (Settings → Pages → Branch: `main` / root) to host the PWA on a public URL. PWABuilder needs a public URL to generate an APK.

---

## 3. Build the Android APK

You have two options.

### Option A — Easiest: PWABuilder (no Android Studio needed)

1. Push to GitHub and enable GitHub Pages so you have a public URL like  
   `https://<your-username>.github.io/flag-iq/`.
2. Visit **https://www.pwabuilder.com** and paste your URL.
3. Click **Package For Stores → Android**.
4. Choose "Signed APK" (or "Test Package") and download the `.apk`.
5. Sideload onto your phone or upload to Play Store.

PWABuilder reads `manifest.webmanifest` and `sw.js` automatically. The icons in `icons/` are already in the sizes it needs.

### Option B — Full control: Capacitor + Android Studio

Requirements: **Node.js 20+**, **Java JDK 17**, **Android Studio**.

```bash
# 1. Install JS dependencies
npm install

# 2. Add the Android platform (only the first time)
npm run cap:add:android

# 3. Sync your latest web changes into android/
npm run cap:sync

# 4. Copy launcher icons into the right Android folders
mkdir -p android/app/src/main/res
cp -r android-icons/mipmap-* android/app/src/main/res/

# 5. Open in Android Studio (or build from CLI)
npm run cap:open
# or:
cd android && ./gradlew assembleDebug
```

The unsigned debug APK ends up at:  
`android/app/build/outputs/apk/debug/app-debug.apk`

For a release build, generate a keystore with `keytool` and configure it in `android/app/build.gradle`. See [Capacitor Android docs](https://capacitorjs.com/docs/android).

### Option C — Hands-off: GitHub Actions

A workflow at `.github/workflows/android-build.yml` builds a debug APK automatically on every push to `main`. Find the resulting APK under **Actions → latest run → Artifacts → flag-iq-debug-apk**.

---

## 4. Customizing the game

Most things are in `index.html`:

| Want to change…              | Where to look                                                  |
| ---------------------------- | -------------------------------------------------------------- |
| Country list / fun facts     | The `COUNTRIES` array (~line 470)                              |
| Prize ladder shape           | `makeLadder()` and the checkpoint values                       |
| Safety lines                 | The loop in `startGame()` (currently every 20 levels)          |
| App name / icon / colors     | `manifest.webmanifest`, `capacitor.config.json`, `icon.svg`    |
| Lifeline behavior            | `useFifty()`, `useClue()`, `useParent()`                       |

If you regenerate the icons, the source SVGs are `icon.svg` (full design with wordmark) and `icon-maskable.svg` (no wordmark, content centered for Android adaptive cropping). The PNG icons in `icons/` and `android-icons/` are derived from these.

To regenerate from a Linux/macOS machine with ImageMagick installed:

```bash
for size in 16 32 48 180 192 512 1024; do
  convert -background none -density 600 icon.svg -resize ${size}x${size} icons/icon-${size}.png
done
for size in 192 512; do
  convert -background none -density 600 icon-maskable.svg -resize ${size}x${size} icons/icon-maskable-${size}.png
done
```

---

## 5. Notes

- The game fetches flag images from **flagcdn.com**. The service worker caches them on first fetch, so once a player has seen a flag, it works offline. If you want a fully offline-from-day-one APK, download the 195 PNGs into `icons/flags/` and change the `img.src` in `index.html`.
- High scores are stored in the browser's `localStorage`, which Capacitor's WebView preserves across launches.
- The layout is capped at 480 CSS px wide — designed primarily for portrait phones, but renders fine in any window.
