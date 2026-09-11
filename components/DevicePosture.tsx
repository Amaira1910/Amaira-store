"use client";

import { useEffect } from "react";

/**
 * Mirrors the Device Posture API onto the root element as a data attribute, so
 * CSS can respond to "folded" versus "flat" on hardware that reports it.
 *
 * The layout work is done in styles/foldable.css using viewport-segment media
 * queries, which need no JavaScript at all. This only adds the posture, which
 * has no CSS equivalent — a device can have two segments while lying flat, and
 * a few treatments differ between the two.
 */
type PostureLike = {
  type: string;
  addEventListener: (t: string, cb: () => void) => void;
  removeEventListener: (t: string, cb: () => void) => void;
};

export default function DevicePosture() {
  useEffect(() => {
    const posture = (navigator as Navigator & { devicePosture?: PostureLike }).devicePosture;
    if (!posture) return;

    const apply = () => {
      document.documentElement.dataset.posture = posture.type;
    };

    apply();
    posture.addEventListener("change", apply);
    return () => posture.removeEventListener("change", apply);
  }, []);

  return null;
}
