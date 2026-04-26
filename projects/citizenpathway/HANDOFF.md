# Citizen Pathway — Project Handoff

**For the next agent (Claude Code or similar).** This doc is the full running context of the project as of 2026-04-25. Read it end-to-end before making changes. If anything here contradicts what you see in the code, trust the code and update this doc.

## 1. What this project is

A mobile-first web app that helps U.S. green-card holders study for and pass the USCIS citizenship interview. Eight surfaces:

1. **Home** — activity dashboard + entry points to all features
2. **Flashcards** (Study tab) — spaced-repetition civics cards (Government / History / Civics)
3. **Quiz** — timed multiple-choice practice tests
4. **Progress** — per-category mastery, streaks, XP, badges
5. **Voice Practice** — ElevenLabs TTS reads a question, user answers aloud; transcription + feedback (reached from Home card, not the nav)
6. **Mock Interview** — simulated USCIS N-400 interview (reached from Home card)
7. **N400 Form** — helps user prepare their Form N-400 application
8. **Community** — Q&A threads, shared notes

## 2. Stack

| Layer              | Tech                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| Framework          | React 18 + Vite 6 + TailwindCSS 3 + shadcn/ui (Radix primitives)                  |
| Routing            | react-router-dom v6 with 5-tab bottom nav (Home / Study / Quiz / Progress / Community) |
| State / data       | @tanstack/react-query, direct Supabase client                                     |
| Backend            | Supabase Postgres + realtime + a `secure-proxy` Edge Function for secrets injection |
| Voice              | ElevenLabs TTS via browser `fetch` to their HTTP API; mic capture via `getUserMedia` |
| Payments (future)  | `@stripe/stripe-js` installed but no flow built yet                               |
| Mobile wrapper     | Capacitor 7 (Android target; iOS not scaffolded)                                  |
| Design tokens      | HSL CSS custom properties in `src/index.css`; primary hsl(210 70% 50%) = #3b7ad1  |
| Fonts              | Nunito (body) + Inter (UI) via Google Fonts                                       |

**Platform target:** mobile Android app (AAB via Capacitor → Gradle). Web version also runs via `npm run dev`. iOS not set up.

## 3. Project layout

```
citizenpathway/
├── src/
│   ├── pages/              # top-level screens (Home.jsx, Flashcards.jsx, Quiz.jsx, Progress.jsx, Community.jsx, VoicePage.jsx, Interview.jsx, N400Form.jsx, Login.jsx)
│   ├── components/
│   │   ├── layout/AppLayout.jsx   # 5-tab bottom nav + route outlet
│   │   ├── ui/             # shadcn/ui primitives (button, card, dialog, etc.)
│   │   └── <feature>/      # feature-specific components (FlipCard, BadgeDisplay, etc.)
│   ├── lib/
│   │   ├── useTheme.js     # dark-mode toggle
│   │   └── utils.js        # cn() helper
│   ├── api/
│   │   ├── supabaseClient.js   # configured supabase client
│   │   └── invokeProxy.js      # wrapper for secure-proxy edge function
│   ├── App.jsx             # BrowserRouter + route table
│   ├── main.jsx            # React DOM mount
│   └── index.css           # design tokens + Tailwind base layer + safe-area helpers
├── supabase/
│   ├── migrations/         # SQL migrations (base44 → Supabase port)
│   └── functions/secure-proxy/   # Deno edge function, reads API keys from Supabase secrets
├── android/                # Capacitor-generated Gradle project (API 34 target)
│   ├── app/
│   │   ├── build.gradle    # signingConfig reads android/keystore.properties
│   │   └── src/main/AndroidManifest.xml   # INTERNET + RECORD_AUDIO + READ_MEDIA_AUDIO
│   ├── keystore.properties.example   # template — user copies + fills in
│   └── gradlew.bat         # Windows Gradle wrapper
├── capacitor.config.ts     # appId com.citizenpathway.app, webDir dist/
├── package.json            # scripts: dev, build, android:sync, android:open, android:bundle
└── README_ANDROID.md       # step-by-step AAB build guide (read this for keystore + build)
```

## 4. What's done

- [x] Migrated from base44 to Supabase (client + edge function + migrations)
- [x] Supabase publishable anon key wired via `secure-proxy` function
- [x] Login/signup page + auth guard routing
- [x] All 8 screens functional and styled per Claude Design handoff mockup
- [x] Bottom nav trimmed from 6 → 5 tabs (Voice + Interview moved to Home cards)
- [x] Dark mode supported via `next-themes`
- [x] Safe-area (notch/home-indicator) padding applied to header + bottom nav
- [x] Security audit clean: 0 vulnerabilities. Removed unused scaffold deps (jspdf, lodash, react-quill, html2canvas, dompurify, quill)
- [x] Capacitor 7 integrated, `android/` platform scaffolded, signing config ready for user's keystore
- [x] npm scripts: `android:sync`, `android:open`, `android:bundle`

## 5. What's NOT done / known gaps

- [ ] **User hasn't run `npm install` or built the AAB yet** — see `README_ANDROID.md`
- [ ] No iOS target (Capacitor iOS not added; would need macOS to build)
- [ ] Stripe payment flow not wired (dep installed, no checkout UI)
- [ ] No push notifications (would need `@capacitor/push-notifications` + FCM setup)
- [ ] No CI/CD — all builds are manual on user's Windows box
- [ ] No E2E tests; only syntax-check via babel-parser has been used for verification
- [ ] App icon + splash screen use Capacitor defaults (need real brand assets in `android/app/src/main/res/mipmap-*`)
- [ ] `manifest.json` exists in `public/` but PWA isn't validated against Lighthouse
- [ ] `versionCode` / `versionName` in `android/app/build.gradle` are defaults (1 / "1.0") — bump for each Play Store upload

## 6. User's development environment

- **OS:** Windows 11 (`C:\Users\tonie\projects\citizenpathway`)
- **Node:** has npm working; recent Node LTS
- **JDK / Android SDK:** unconfirmed — Android Studio install is the blocker for the first AAB build
- **Supabase project:** provisioned, schema + edge function deployed
- **Google Play Console:** status unknown (requires $25 one-time signup to publish)

## 7. Important caveats for the next agent

**Cowork sandbox ↔ Windows mount quirk.** Earlier in this project, multiple `npm install` runs inside the sandbox-mounted Windows folder (`/sessions/.../mnt/citizenpathway`) left ghost staging directories (`node_modules/.ajv-xxx`, `.vite-xxx`, etc.) that neither `rm -rf` nor subsequent `npm install` could fully clean. Root cause: Windows-mount rename semantics differ from a native Linux fs. **If you're running this from a sandbox mount, do npm installs in a separate scratch dir** (like `/sessions/.../citizenpathway-build/`) and copy only the results back. On the user's native Windows shell, `npm install` works fine.

**Design handoff was reconstructed FROM the repo.** The Claude Design bundle that was delivered earlier (`design_pkg/citizen-pathway/`) was a reproduction of the existing code, not a new design to implement. The only substantive delta was the 6→5 bottom nav, which has been applied. Don't treat that bundle as a source of truth for new work.

**Supabase secrets live in edge-function env, not the repo.** `secure-proxy` edge function reads ElevenLabs API key, Stripe key, etc. from Supabase project secrets. Do not hardcode these client-side; route through `invokeProxy()`.

**Base44 is fully removed.** If you see references to `base44`, `@base44/sdk`, or `base44Client`, they're stale comments — every page has been ported to the Supabase client.

## 8. Common commands

```powershell
# Dev server (web, http://localhost:5173)
npm run dev

# Production web build → dist/
npm run build

# Sync dist/ into the Android project (after every web build)
npm run android:sync

# Open android/ in Android Studio
npm run android:open

# One-shot: build web + sync + Gradle bundleRelease → app-release.aab
npm run android:bundle

# Debug APK for testing on a connected phone (skips signing)
cd android; .\gradlew assembleDebug
```

## 9. How to build the AAB (summary — full version in README_ANDROID.md)

Prereqs the user must do themselves:

1. Install Android Studio (includes SDK + JDK 17)
2. Generate release keystore:
   ```powershell
   cd android
   keytool -genkey -v -keystore citizen-pathway.keystore -alias citizen-pathway -keyalg RSA -keysize 2048 -validity 10000
   ```
3. Copy `android/keystore.properties.example` to `android/keystore.properties`, fill in `storePassword` + `keyPassword`.

Then from project root:

```powershell
npm install
npm run android:bundle
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`.

## 10. Recommended next work

Pick any of these depending on user priority:

1. **Validate the AAB on a physical device** before uploading to Play Store. Cheapest sanity check before the keystore becomes permanent.
2. **Replace default app icon + splash screen** — use `@capacitor/assets` with a 1024x1024 source PNG to generate all density variants automatically.
3. **Add `@capacitor/status-bar` + `@capacitor/splash-screen`** plugins for polished launch feel.
4. **Add Stripe checkout flow** — there's a `@stripe/react-stripe-js` dep but no component using it yet. Would need an `invokeProxy('stripe-checkout', {...})` call from the edge function.
5. **Migrate to Expo / React Native** if a native UI is desired later. Not a small rewrite — every DOM component would need a React Native equivalent. Capacitor is the pragmatic bridge for now.
6. **Add E2E tests** (Playwright for web, Detox for the Android wrapper).
7. **Set up GitHub Actions** to build AABs on tag push. Requires storing the keystore as a secret.
