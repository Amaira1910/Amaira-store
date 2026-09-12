/* ==========================================================================
   The native capability layer.

   Every function here works in three environments without the caller caring:
     · inside the iOS/Android app  → the real native API
     · in a desktop browser        → a sensible web fallback, or a no-op
     · during server rendering     → a no-op

   Capacitor plugins are imported dynamically. A static import would pull the
   whole plugin into the browser bundle and, worse, throw during server
   rendering where `window` does not exist.
   ========================================================================== */

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

/* --- haptics ------------------------------------------------------------- */

/** A short confirmation tap. Silent on the web, where there is no equivalent. */
export async function tapFeedback(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch {
    /* plugin missing in this build — not worth surfacing */
  }
}

export async function successFeedback(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* ignore */
  }
}

/* --- share --------------------------------------------------------------- */

/**
 * Native share sheet in the app; the Web Share API in a supporting browser;
 * clipboard as the last resort. Returns what actually happened so the caller
 * can confirm it to the user.
 */
export async function shareLink(input: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "copied" | "unsupported"> {
  if (isNativeApp()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: input.title, text: input.text, url: input.url, dialogTitle: "Share" });
      return "shared";
    } catch {
      /* fall through to the web paths */
    }
  }

  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ title: input.title, text: input.text, url: input.url });
      return "shared";
    } catch (err) {
      // A user cancelling the sheet is not a failure worth reporting.
      if (err instanceof Error && err.name === "AbortError") return "shared";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(input.url);
      return "copied";
    } catch {
      /* ignore */
    }
  }
  return "unsupported";
}

/* --- barcode scanning ---------------------------------------------------- */

export interface ScanResult {
  ok: boolean;
  value?: string;
  error?: string;
}

/**
 * Opens the camera and reads one barcode. This is the capability that makes a
 * native build genuinely different from the website: a stock-take stops being
 * typing and becomes pointing.
 *
 * On the web it reports that it is unavailable, and the UI falls back to a
 * text field.
 */
export async function scanBarcode(): Promise<ScanResult> {
  if (!isNativeApp()) {
    return { ok: false, error: "Scanning needs the Amaira app. Type the code instead." };
  }

  try {
    const { BarcodeScanner } = await import("@capacitor-mlkit/barcode-scanning");

    // Camera permission first — asking mid-scan produces a black screen.
    const permission = await BarcodeScanner.requestPermissions();
    if (permission.camera !== "granted" && permission.camera !== "limited") {
      return { ok: false, error: "Camera access is off. Turn it on in Settings → Amaira." };
    }

    // On Android the ML Kit module is fetched on first use.
    const available = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable().catch(() => ({ available: true }));
    if (!available.available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule().catch(() => {});
    }

    const { barcodes } = await BarcodeScanner.scan();
    const first = barcodes[0];
    if (!first?.rawValue) return { ok: false, error: "Nothing scanned." };
    await successFeedback();
    return { ok: true, value: first.rawValue };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "The scanner could not start." };
  }
}

/* --- push notifications -------------------------------------------------- */

/**
 * Registers for push and returns the device token, which the server needs in
 * order to send anything. Call it from a deliberate action — a "notify me
 * about new orders" toggle — never on first launch. Apple's review team
 * rejects apps that demand permissions before explaining why.
 */
export async function registerForPush(): Promise<{ ok: boolean; token?: string; error?: string }> {
  if (!isNativeApp()) return { ok: false, error: "Push notifications need the Amaira app." };

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === "prompt" || permission.receive === "prompt-with-rationale") {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== "granted") {
      return { ok: false, error: "Notifications are switched off for Amaira." };
    }

    const token = await new Promise<string | null>((resolve) => {
      // registration fires once APNs has issued a token.
      const timeout = setTimeout(() => resolve(null), 10000);
      PushNotifications.addListener("registration", (t) => {
        clearTimeout(timeout);
        resolve(t.value);
      });
      PushNotifications.addListener("registrationError", () => {
        clearTimeout(timeout);
        resolve(null);
      });
      void PushNotifications.register();
    });

    if (!token) return { ok: false, error: "Apple did not issue a device token. Try again." };
    return { ok: true, token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not register for push." };
  }
}

/* --- local storage that survives a reinstall on device -------------------- */

/** Preferences on native (Keychain-backed on iOS), localStorage on the web. */
export async function setPreference(key: string, value: string): Promise<void> {
  if (isNativeApp()) {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key, value });
      return;
    } catch {
      /* fall through */
    }
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

export async function getPreference(key: string): Promise<string | null> {
  if (isNativeApp()) {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      /* fall through */
    }
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
