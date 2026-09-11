"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import DeviceArt from "@/components/DeviceArt";
import type { ArtKind } from "@/lib/types";

export interface Slide {
  key: string;
  eyebrow?: string;
  title: string;
  sub: string;
  priceLine?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  art: { kind: ArtKind; hex: string; accent?: string; screen?: string };
  theme: "dark" | "mist" | "paper";
  /** Two colours for the ambient bloom behind a dark slide. */
  glow?: [string, string];
}

const INTERVAL = 7000;

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const region = useRef<HTMLDivElement>(null);

  const go = useCallback((n: number) => setI(((n % slides.length) + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % slides.length), INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, slides.length]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
  };

  return (
    <div
      className="carousel"
      ref={region}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      tabIndex={-1}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="carousel-track">
        {slides.map((s, n) => (
          <section
            key={s.key}
            className={`hero hero-${s.theme} carousel-slide${n === i ? " is-active" : ""}`}
            aria-hidden={n !== i}
            aria-roledescription="slide"
            aria-label={`${n + 1} of ${slides.length}: ${s.title}`}
            {...(n !== i ? { inert: "" as unknown as boolean } : {})}
          >
            {s.theme === "dark" && s.glow && (
              <div
                className="hero-glow"
                style={{ background: `radial-gradient(closest-side, ${s.glow[0]}, ${s.glow[1]} 60%, transparent)` }}
                aria-hidden="true"
              />
            )}
            <div className="hero-content">
              {s.eyebrow && <p className="hero-eyebrow">{s.eyebrow}</p>}
              {/* h2, not h1: these are rotating promo panels, not the page subject.
                  The page supplies its own single h1. */}
              <h2 className="hero-title balance">{s.title}</h2>
              <p className="hero-sub pretty">{s.sub}</p>
              <div className="hero-cta">
                <Link href={s.primary.href} className={`btn${s.theme === "dark" ? " btn-on-dark" : ""}`} tabIndex={n === i ? 0 : -1}>
                  {s.primary.label}
                </Link>
                {s.secondary && (
                  <Link href={s.secondary.href} className="link-cta" tabIndex={n === i ? 0 : -1}>
                    {s.secondary.label} ›
                  </Link>
                )}
              </div>
              {s.priceLine && <p className="hero-price">{s.priceLine}</p>}
            </div>
            <div className="hero-art">
              <DeviceArt kind={s.art.kind} hex={s.art.hex} accent={s.art.accent} screen={s.art.screen} label="" />
            </div>
          </section>
        ))}
      </div>

      {slides.length > 1 && (
        <div className={`carousel-dots${slides[i].theme === "dark" ? " on-dark" : ""}`}>
          {slides.map((s, n) => (
            <button
              key={s.key}
              type="button"
              className="carousel-dot"
              aria-current={n === i}
              aria-label={`Show slide ${n + 1}: ${s.title}`}
              onClick={() => go(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
