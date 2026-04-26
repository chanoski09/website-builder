# Building the Android App Bundle (AAB)

Citizen Pathway's web app is wrapped as a native Android app via [Capacitor](https://capacitorjs.com). This doc covers the remaining manual steps to produce a signed `.aab` file suitable for the Google Play Console.

## Prerequisites (one-time)

1. **Android Studio** — install from https://developer.android.com/studio. The first-run setup wizard installs the Android SDK, platform tools, and a bundled JDK 17. Budget ~4 GB of disk and ~20 min wall time.
2. After install, open Android Studio → More Actions → SDK Manager and confirm:
   - **SDK Platforms:** Android 14 (API 34) is checked.
   - **SDK Tools:** "Android SDK Build-Tools" and "Android SDK Command-line Tools (latest)" are both checked.
3. Make sure `keytool` is on your PATH. It ships with the JDK; Android Studio's bundled JDK lives at `C:\Program Files\Android\Android Studio\jbr\bin`. Add that to PATH if `keytool --help` errors in PowerShell.

## Step 1 — generate the upload keystore (one-time, keep this file forever)

**This keystore file and its passwords must be kept safe.** If you lose them, you can't push updates to the same Play Store listing — you'd have to create a new app. Google does offer Play App Signing enrollment as a recovery option, but don't rely on it.

From the project root in PowerShell:

```powershell
cd android
keytool -genkey -v -keystore citizen-pathway.keystore -alias citizen-pathway -keyalg RSA -keysize 2048 -validity 10000
```

Answer the prompts (name, org, city, country). Pick strong passwords. Back the `citizen-pathway.keystore` file up somewhere offline — a password manager's secure notes, a hardware key, etc. **Do not commit it.** It's already in `.gitignore`.

## Step 2 — tell Gradle where the keystore is

Copy the example file and fill in the passwords you just chose:

```powershell
Copy-Item keystore.properties.example keystore.properties
notepad keystore.properties
```

Set `storePassword`, `keyAlias` (should be `citizen-pathway` if you followed step 1), and `keyPassword`. Save and close.

## Step 3 — build the AAB

From the project root:

```powershell
npm run build
npx cap sync android
cd android
.\gradlew bundleRelease
```

The first Gradle build will download dependencies and take several minutes. Subsequent builds are cached and fast.

On success, the signed bundle lands at:

```
android\app\build\outputs\bundle\release\app-release.aab
```

That's the file you upload to the Google Play Console → Production → Create new release.

## Step 4 — test locally before upload (optional but recommended)

Bundles aren't directly installable on a phone — they get split into APKs by Google Play. To test locally, either:

- Build a release APK instead: `.\gradlew assembleRelease` → `app\build\outputs\apk\release\app-release.apk`, then `adb install` it, or
- Use `bundletool` (from Android SDK) to generate a set of APKs from the AAB and install those.

For most first-time sanity checks, just open the project in Android Studio, plug in a phone with USB debugging enabled, and hit the green Run button. That produces a debug build with no signing required.

## Updating the app (each release)

Bump `versionCode` (integer, must increase every upload) and `versionName` (user-facing, e.g. `1.0.1`) in `android/app/build.gradle`, then repeat step 3.

## Troubleshooting

- **"SDK location not found"** — create `android/local.properties` with `sdk.dir=C\:\\Users\\tonie\\AppData\\Local\\Android\\Sdk` (adjust for your install path). Android Studio usually writes this file automatically the first time you open the project.
- **Gradle daemon fails on first build** — sometimes Gradle can't pick up the JDK. In PowerShell, set `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"` before running `.\gradlew`.
- **App installs but shows white screen** — usually means `npx cap sync android` wasn't rerun after the last `npm run build`. The WebView is loading stale or missing assets.
