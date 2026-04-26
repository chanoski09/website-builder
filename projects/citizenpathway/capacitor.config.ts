import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor wraps the Vite web build (dist/) in a native Android shell.
// After `npm run build`, run `npx cap sync` to copy dist/ into android/app/src/main/assets/public.
const config: CapacitorConfig = {
  appId: 'com.citizenpathway.app',
  appName: 'Citizen Pathway',
  webDir: 'dist',
  android: {
    // Use HTTPS scheme inside the WebView so cookies, service workers, and
    // fetch() behave the same as on the live web build. Without this, the
    // WebView loads from http://localhost which breaks Supabase auth cookies.
    allowMixedContent: false,
  },
};

export default config;
