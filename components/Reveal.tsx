"use client";

import { useEffect } from "react";

/**
 * Adds `.is-in` to every `.reveal` as it scrolls into view. One observer for
 * the whole document rather than one per section, and it re-scans after each
 * client navigation.
 */
export default function Reveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px 4% 0px", threshold: 0.02 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)").forEach((el) => {
        // Anything already on screen at scan time reveals immediately.
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.98) el.classList.add("is-in");
        else io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
