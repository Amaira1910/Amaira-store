# Shipping Amaira to the App Store

Written for whoever actually submits this. It is specific about what will get
you rejected, because the most common rejection for a shop like this is
avoidable and predictable.

---

## 1. The thing to understand first

**A website cannot be listed on the App Store.** Only an app binary can. And
Apple explicitly rejects binaries that are just a website in a frame:

> **4.2 Minimum Functionality** — "Your app should include features, content,
> and UI that elevate it beyond a repackaged website. If your app is not
> particularly useful, unique, or 'app-like,' it doesn't belong on the App
> Store."

> **4.2.2** — "Other than catalogs, apps shouldn't primarily be marketing
> materials, advertisements, web clippings, content aggregators, or a
> collection of links."

So `capacitor.config.ts` with `server.url` pointing at `amairastore.in` and
nothing else **will be rejected**. That configuration exists in this repo for
development only, and is switched off unless `CAP_MODE=development`.

### What clears 4.2 in this build

These are implemented in `lib/native.ts` and surfaced in the UI. They are the
argument you make to App Review:

| Capability | Where | Why it is not "a website" |
|---|---|---|
| **Barcode scanning** | `/admin/stocktake` | Camera + on-device ML Kit. A stock-take becomes pointing at a box instead of typing. No web equivalent. |
| **Push notifications** | `registerForPush()` | New-order alerts to staff, delivery updates to customers. APNs. |
| **Haptics** | Add-to-bag, scan confirm | Taptic Engine feedback. |
| **Native share sheet** | Product pages | Real iOS share, not a copy-link button. |
| **Offline catalog** | `public/sw.js` | The shop opens and browses with no signal. |
| **Keychain-backed storage** | `setPreference()` | Survives app reinstall; `localStorage` does not. |

**Recommendation:** the strongest 4.2 case is to submit this as a **staff
operations app** — stock-taking, order fulfilment, push alerts — because that
is unambiguously a tool and unambiguously not a web clipping. A
customer-facing shopping app is also fine, but needs the native features above
to be visible and central, not buried.

---

## 2. Payments: you are already doing this right

> **3.1.3(e) Goods and Services Outside of the App** — "If your app enables
> people to purchase physical goods or services that will be consumed outside
> of the app, you must use purchase methods other than in-app purchase to
> collect those payments, such as Apple Pay or traditional credit card entry."

iPhones, Macs and AirPods are physical goods consumed outside the app.
Therefore:

- **You must NOT use In-App Purchase.** Using it would be the violation.
- **Razorpay is the correct and compliant choice.**
- **Apple takes 0% of your hardware sales.** There is no commission on this.

Two things to keep clean:

1. Do not sell anything *digital* that unlocks in-app functionality. AppleCare+
   is a service attached to physical hardware, which is fine.
2. Razorpay Checkout must open in a way that satisfies 3.1.3 — the standard
   Capacitor in-app browser or the native SDK. Do not build a custom card form.

---

## 3. Account deletion

> **5.1.1(v)** — "If your app supports account creation, you must also offer
> account deletion within the app."

Current position: **customers check out as guests.** There is no customer
account, so this does not bite.

The admin portal has staff accounts, but those are internal, created by the
owner, and not "account creation" in the sense the guideline means.

**If you later add customer logins, you must add in-app deletion**, not just a
"email us to delete" link. Apple rejects for this routinely.

---

## 4. Privacy — the nutrition label and Info.plist

### Required Info.plist strings

Every privacy-sensitive API needs a purpose string, in plain language. Vague
ones get rejected.

```xml
<key>NSCameraUsageDescription</key>
<string>Amaira uses the camera to scan product barcodes when taking stock.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Amaira can attach a photo to a service job or a stock discrepancy.</string>

<!-- Only if you add store-locator directions -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Amaira uses your location only to give directions to the Sanjaynagar store.</string>
```

### App Privacy questionnaire (App Store Connect)

Declare honestly, matching `/legal/privacy`:

| Data | Collected | Linked to identity | Used for tracking | Purpose |
|---|---|---|---|---|
| Name | Yes | Yes | No | App functionality |
| Email | Yes | Yes | No | App functionality |
| Phone | Yes | Yes | No | App functionality |
| Physical address | Yes | Yes | No | App functionality |
| Purchase history | Yes | Yes | No | App functionality |
| Payment info | **No** | — | — | Razorpay handles it; it never reaches our server |
| Identifiers / ad data | **No** | — | — | There is no ad SDK in this app |

There is no third-party analytics or advertising SDK in this codebase. If you
add one, this table changes and so does the questionnaire.

### Privacy manifest

Xcode 15+ wants `PrivacyInfo.xcprivacy`. Capacitor plugins may add required-
reason API declarations; run `npx cap sync ios` and check what the plugins
contribute before filing.

---

## 5. Apple trademarks, as an Apple Premium Reseller

This is the part most likely to cause a problem that is *not* a guideline
number, because it is contractual rather than editorial.

- **Your APR agreement with Apple governs how you may use Apple's marks.**
  Read it before you name or brand the app. Ask your Apple account contact to
  review the listing.
- The app is named **Amaira**, not anything containing "Apple". Keep it that
  way. Guideline 4.1 (copycats) and Apple's trademark rules both apply.
- The app icon must be **your** mark, never an Apple logo or a product render.
- Every page of this site already carries the reseller disclaimer
  (`components/SiteFooter.tsx`). The app must too.
- **Product imagery:** this build uses original SVG renders precisely to avoid
  shipping Apple's copyrighted press photography. If you swap in official
  assets from the APR channel, confirm the licence covers an App Store binary.

---

## 6. Before you can build at all

| Requirement | Notes |
|---|---|
| Apple Developer Program | $99/year. An **Organization** account needs a D-U-N-S number; for an Indian business expect 1–2 weeks. |
| A Mac with Xcode | Non-negotiable. iOS binaries cannot be built on Linux. **This was built in a Linux container, so the iOS project has not been compiled or run — that step is yours.** |
| Bundle identifier | `in.amairastore.app`, already set in `capacitor.config.ts`. Register it in App Store Connect. |
| Signing certificates | Distribution certificate + App Store provisioning profile. |
| APNs key | For push. App Store Connect → Keys → Apple Push Notifications service. |

---

## 7. Build steps

```bash
# once
npx cap add ios

# each time the web layer changes
npm run build
npx cap sync ios
npx cap open ios          # opens Xcode
```

Then in Xcode: set the team, bump the build number, Product → Archive,
Distribute App → App Store Connect.

### The bundled-vs-hosted decision

`capacitor.config.ts` ships with `webDir: "public"` and no `server.url`. Before
submitting you need real web assets in `webDir`. Two options:

1. **Static customer surface** (recommended for submission) — build a static
   export of the browsing experience and point `webDir` at it. The app launches
   offline; only data crosses the network. Cleanest 4.2 story.
2. **Staff app** — bundle only the admin surface, which is small, and have it
   call the API. Strongest 4.2 story, smallest binary, and genuinely the most
   useful thing to have on a phone in a shop.

Do not submit with `server.url` set.

---

## 8. Submission checklist

**Assets**
- [ ] Icon at 1024×1024, no alpha, no rounded corners (Apple rounds it)
- [ ] Screenshots: 6.9" and 6.5" iPhone, 13" iPad — real screens, not mockups with marketing text
- [ ] Privacy policy URL → `https<your-domain>/legal/privacy`
- [ ] Support URL → `/support`

**Metadata**
- [ ] Description says what the app does, not what the shop sells
- [ ] Category: Shopping (customer app) or Business (staff app)
- [ ] Age rating: 4+
- [ ] Copyright: your registered business name

**Review notes — write these, they prevent rejections**
- [ ] A working demo account for the admin portal (Apple will not sign up)
- [ ] One sentence naming the native features, so the reviewer finds them
- [ ] That payments use Razorpay because 3.1.3(e) requires it for physical goods
- [ ] That you are an authorised Apple Premium Reseller

**Technical**
- [ ] Tested on a real device, not only the simulator
- [ ] No crash on cold launch with no network
- [ ] Every permission prompt appears only after the user asks for that feature
- [ ] No placeholder or lorem text anywhere
- [ ] Every link works; nothing points at localhost

---

## 9. Rejections to expect, and the answer

| Likely rejection | Why | Fix |
|---|---|---|
| 4.2 Minimum Functionality | Reviewer saw a web view | Point to the scanner, push and offline mode in the review notes. Make them reachable within two taps of launch. |
| 3.1.1 IAP required | Reviewer misread physical goods as digital | Reply citing 3.1.3(e). You are correct; this is a known back-and-forth. |
| 5.1.1 Purpose string | Vague camera string | Say exactly what it scans and why. |
| 2.1 Incomplete information | No demo account | Supply admin credentials in review notes. |
| 4.1 Copycat | Apple marks used as if first-party | Your branding, your icon, disclaimer visible. |

---

## 10. Honest limits of what is in this repo

- The iOS project **has not been generated or compiled.** `npx cap add ios`
  requires macOS. Everything up to that point is configured and ready.
- Push notifications are wired **client-side only**. Sending them needs an APNs
  key and a server-side dispatcher, which is not built.
- `webDir` points at `public`, which is a placeholder. Pick option 1 or 2 in
  §7 before submitting.
- Nothing here has been through App Review, so treat §9 as informed
  expectation, not experience.
