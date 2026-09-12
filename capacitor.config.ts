/* ==========================================================================
   Capacitor — the native iOS and Android shell.

   READ THIS BEFORE SUBMITTING TO THE APP STORE.

   Apple's Guideline 4.2 rejects "a repackaged website", and 4.2.2 rejects apps
   that are "primarily marketing materials, advertisements, web clippings,
   content aggregators, or a collection of links". A Capacitor shell that only
   loads amairastore.in in a web view IS that, and will be rejected.

   What makes this app pass instead is that it does things a website cannot:
   scanning barcodes with the camera for stock-taking, Face ID for staff
   sign-in, push notifications for new orders, haptics, native share, and a
   catalog that works with no signal. Those are wired in lib/native.ts and
   surfaced in the admin stock-take screen.

   Two ways to configure the web layer:

   1. BUNDLED (`webDir`, no server.url) — assets ship inside the binary, the
      app launches offline, and only data comes over the network. This is the
      configuration Apple is most comfortable with, and the one to submit.
      It needs a static build of the customer surface.

   2. HOSTED (`server.url`) — the shell loads the live site. Useful in
      development because a change appears without rebuilding, and fine for
      internal TestFlight builds. Do NOT submit in this mode.

   See APP_STORE.md for the full submission checklist.
   ========================================================================== */
import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.CAP_MODE === "development";

const config: CapacitorConfig = {
  appId: "in.amairastore.app",
  appName: "Amaira",
  webDir: "public",

  // Native-side behaviour
  ios: {
    contentInset: "always",
    // The store's chrome is dark; match the status bar to it.
    backgroundColor: "#000000",
    // Apple requires a reason for every privacy-sensitive API. The camera one
    // is set in Info.plist — see APP_STORE.md.
    limitsNavigationsToAppBoundDomains: true,
  },

  android: {
    backgroundColor: "#000000",
  },

  server: isDev
    ? {
        // Point at a dev server so changes appear without a rebuild.
        // `cleartext` is only acceptable on a local network.
        url: process.env.CAP_SERVER_URL ?? "http://192.168.1.10:3000",
        cleartext: true,
      }
    : undefined,

  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    // The scanner uses Google's on-device ML Kit. Nothing leaves the phone.
    BarcodeScanning: {
      // Downloaded on first use rather than bundled, keeping the binary small.
      googleBarcodeScannerModuleInstallState: true,
    },
  },
};

export default config;
