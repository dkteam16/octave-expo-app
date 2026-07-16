# Octave App — Expo WebView Wrapper

A production-ready Expo wrapper around https://octave.co.in/, with native
offline handling, back-button support, pull-to-refresh, and splash screen.

---

## 1. Run it locally (this is the "see changes live" part)

```bash
npm install
npx expo start
```

This opens a QR code + a browser dev tools tab.

- **Fastest way to preview:** install the **Expo Go** app (App Store /
  Play Store) on your phone and scan the QR code. Any edit you make to
  `App.js` shows up instantly on your phone (hot reload) — no rebuild.
- **Web preview:** press `w` in the terminal, or run `npx expo start --web`.
  Note: WebView-in-browser is emulated differently on web, so use this only
  for layout iteration — always double-check on Expo Go/simulator before
  trusting it.
- **iOS Simulator (Mac only):** press `i` in the terminal (needs Xcode
  installed).
- **Android Emulator:** press `a` in the terminal (needs Android Studio's
  emulator running).

You do **not** need Xcode or Android Studio installed just to develop and
preview with Expo Go — only for local simulators/emulators.

---

## 2. Replace the placeholder assets

`assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`, and
`assets/favicon.png` are auto-generated placeholders (plain "O" logo).
Swap them for real Octave brand assets before building for production:

- `icon.png` — 1024×1024, no transparency, iOS app icon
- `adaptive-icon.png` — 1024×1024, the foreground layer for Android's
  adaptive icon system (keep the logo within the center ~66% safe zone)
- `splash.png` — at least 1284×2778, shown while the app cold-starts
- `favicon.png` — only used for the web preview

---

## 3. Set up EAS (Expo's cloud build service) — one-time

```bash
npm install -g eas-cli
eas login
eas build:configure
```

This links the project to your Expo account and fills in the real
`projectId` in `app.json` (currently a placeholder).

---

## 4. Production builds

```bash
# Android — produces a .aab for Play Store
eas build --platform android --profile production

# iOS — produces a .ipa for App Store (works from Windows/Linux too,
# EAS builds iOS in the cloud, you don't need a Mac)
eas build --platform ios --profile production
```

First iOS build will prompt you to either let EAS auto-manage your
certificates/provisioning profiles (recommended, easiest) or upload your
own if you already have an Apple Developer account set up.

---

## 5. Submit to the stores

```bash
eas submit --platform android
eas submit --platform ios
```

Before this works you need:

- **Google Play:** a Play Console account ($25 one-time), and a service
  account JSON key for API upload (Play Console → Setup → API access) —
  path referenced in `eas.json` as `google-service-account.json`
  (do not commit this file to git).
- **Apple:** an Apple Developer Program account ($99/yr), and your
  App Store Connect App ID + Team ID filled into `eas.json`.

---

## 6. Before you actually submit — the real checklist

**Functional:**
- [ ] Full checkout completes inside the app (add domains to
      `ALLOWED_HOSTS` in `App.js` for your payment gateway if it fails)
- [ ] Airplane Mode mid-session shows the offline screen, not a blank page
- [ ] Android hardware back button works through multi-page navigation
- [ ] Cart persists between app opens (`sharedCookiesEnabled` handles this)

**For Apple approval specifically (Guideline 4.2):**
- [ ] Push notifications wired up and firing (OneSignal or FCM — this is
      your strongest signal to reviewers, since Safari can't do this)
- [ ] A native tab bar or native nav element somewhere, not purely
      the website's own hamburger menu
- [ ] Face ID / Touch ID login if your site has customer accounts
- [ ] Sign in with Apple, if you offer Google/Facebook login anywhere

Submitting the bare wrapper as-is to Apple without at least the push
notification piece has a high chance of a first-round 4.2 rejection.
Android/Play Store has no equivalent restriction — the bare wrapper is
fine there.

---

## Project structure

```
octave-expo-app/
├── App.js              # main app — WebView + offline handling
├── app.json             # Expo config: name, icons, bundle IDs
├── eas.json              # EAS Build/Submit configuration
├── babel.config.js
├── package.json
└── assets/
    ├── icon.png
    ├── adaptive-icon.png
    ├── splash.png
    └── favicon.png
```
