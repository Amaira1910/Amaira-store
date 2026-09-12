/* ==========================================================================
   Amaira service worker.

   What it does:
   · Pre-caches the app shell so the store opens instantly, and opens at all
     on a bad connection — which is the normal case on mobile data.
   · Serves static assets (JS, CSS, fonts, icons) cache-first. They are
     content-hashed by Next, so a cached copy is never stale.
   · Serves pages network-first with a cached fallback, so stock figures and
     prices are current whenever the network allows and the shop still opens
     when it does not.

   What it deliberately never touches:
   · /admin      — staff pages behind a session; a cached copy on a shared
                   device would leak takings and customer data.
   · /api        — every one is a mutation or a signed payment step.
   · /checkout, /bag, /order — money and personal data, always live.
   · Any request that is not a GET.
   ========================================================================== */

const VERSION = "v1";
const SHELL = `amaira-shell-${VERSION}`;
const STATIC = `amaira-static-${VERSION}`;
const PAGES = `amaira-pages-${VERSION}`;

const SHELL_URLS = ["/", "/shop", "/offline", "/icon.svg", "/manifest.webmanifest"];

/** Paths that must never be read from, or written to, a cache. */
const NEVER_CACHE = [/^\/admin/, /^\/api\//, /^\/checkout/, /^\/bag/, /^\/order\//];

function isNeverCached(pathname) {
  return NEVER_CACHE.some((re) => re.test(pathname));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // addAll rejects wholesale if any single URL fails, which would leave
      // the worker uninstalled. Add them individually instead.
      await Promise.all(
        SHELL_URLS.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => {})),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, STATIC, PAGES]);
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // let cross-origin through untouched
  if (isNeverCached(url.pathname)) return;           // straight to the network, never stored

  // Content-hashed build output: cache-first, it cannot go stale.
  if (url.pathname.startsWith("/_next/static/") || /\.(?:woff2?|png|svg|jpg|jpeg|webp|avif|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // Pages: fresh when possible, cached when not, offline page as a last resort.
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request, PAGES));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    // Only store a clean, complete response. A 206 or an opaque redirect in
    // the cache causes confusing failures later.
    if (response.ok && response.type === "basic") cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const shell = await caches.open(SHELL);
    return (await shell.match("/offline")) ?? new Response("Offline", { status: 503 });
  }
}

/* Lets the page tell a waiting worker to take over immediately. */
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
