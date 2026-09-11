"use client";

import { useEffect } from "react";

/**
 * Registers the service worker.
 *
 * Deliberately not registered on /admin: staff pages should always be live,
 * and a worker scoped to the whole origin would still be installed from
 * there. Registering only from customer pages keeps the scope honest.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.pathname.startsWith("/admin")) return;
    // A worker on localhost during development caches half-built pages and
    // causes more confusion than it is worth.
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
        console.warn("[sw] registration failed", err);
      });
    };

    // Wait for idle so registration never competes with first paint.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
