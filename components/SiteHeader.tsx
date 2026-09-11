"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DeviceArt from "@/components/DeviceArt";
import { IconBag, IconClose, IconMenu, IconSearch } from "@/components/Icons";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/money";
import { searchIndex, type MenuSection, type SearchEntry } from "@/lib/nav";

interface Props {
  menu: MenuSection[];
  index: SearchEntry[];
}

type Panel = { kind: "menu"; key: string } | { kind: "search" } | { kind: "drawer" } | null;

export default function SiteHeader({ menu, index }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const { count, ready } = useCart();
  const navRef = useRef<HTMLElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<number | null>(null);

  const close = useCallback(() => setPanel(null), []);

  /* Any navigation dismisses whatever is open. */
  useEffect(() => { close(); }, [pathname, close]);

  /* Escape closes; the page scroll locks only for the full-height drawer. */
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    if (panel.kind === "drawer") document.body.classList.add("is-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-locked");
    };
  }, [panel, close]);

  /* Clicking outside the whole nav region closes the open panel. */
  useEffect(() => {
    if (!panel || panel.kind === "drawer") return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [panel, close]);

  useEffect(() => {
    if (panel?.kind === "search") searchInput.current?.focus();
  }, [panel]);

  const hits = useMemo(() => searchIndex(index, query), [index, query]);

  /* Pointer intent: open on hover after a beat, and forgive a diagonal exit. */
  const hoverOpen = (key: string) => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
    setPanel({ kind: "menu", key });
  };
  const hoverClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPanel(null), 160);
  };

  const openMenu = panel?.kind === "menu" ? menu.find((m) => m.key === panel.key) : undefined;
  const isOpen = panel !== null;

  return (
    <>
      <nav
        ref={navRef}
        className={`nav${isOpen ? " is-open" : ""}`}
        aria-label="Main"
        onMouseLeave={panel?.kind === "menu" ? hoverClose : undefined}
      >
        <div className="nav-inner">
          <Link href="/" className="nav-brand" aria-label="Amaira — home">
            <span className="wordmark">Amaira</span>
            <span className="apr">Apple Premium Reseller</span>
          </Link>

          <ul className="nav-links">
            {menu.map((section) => (
              <li key={section.key} onMouseEnter={() => hoverOpen(section.key)}>
                <button
                  type="button"
                  className={`nav-link${panel?.kind === "menu" && panel.key === section.key ? " is-active" : ""}`}
                  aria-expanded={panel?.kind === "menu" && panel.key === section.key}
                  aria-haspopup="true"
                  onClick={() =>
                    setPanel((p) =>
                      p?.kind === "menu" && p.key === section.key ? null : { kind: "menu", key: section.key },
                    )
                  }
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-icon-btn"
              aria-label={panel?.kind === "search" ? "Close search" : "Search amaira.store"}
              aria-expanded={panel?.kind === "search"}
              onClick={() => setPanel((p) => (p?.kind === "search" ? null : { kind: "search" }))}
            >
              {panel?.kind === "search" ? <IconClose size={19} /> : <IconSearch size={19} />}
            </button>

            <Link href="/bag" className="nav-icon-btn" aria-label={ready && count > 0 ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag"}>
              <IconBag size={19} />
              {ready && count > 0 && <span className="nav-count">{count}</span>}
            </Link>

            <button
              type="button"
              className="nav-icon-btn nav-burst"
              aria-label={panel?.kind === "drawer" ? "Close menu" : "Open menu"}
              aria-expanded={panel?.kind === "drawer"}
              onClick={() => setPanel((p) => (p?.kind === "drawer" ? null : { kind: "drawer" }))}
            >
              {panel?.kind === "drawer" ? <IconClose size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>

        {openMenu && (
          <div className="mega" onMouseEnter={() => hoverOpen(openMenu.key)}>
            <div className="mega-inner">
              {openMenu.groups.map((group) => (
                <div key={group.title}>
                  <p className="mega-group-title">{group.title}</p>
                  <ul className={`mega-list${group.compact ? " is-compact" : ""}`}>
                    {group.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href}>{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {panel?.kind === "search" && (
          <div className="search-panel">
            <div className="search-inner">
              <form
                className="search-box"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }}
              >
                <IconSearch size={22} />
                <input
                  ref={searchInput}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search iPhone, Mac, AirPods…"
                  aria-label="Search products"
                  autoComplete="off"
                />
              </form>

              <div className="search-results">
                {query.trim().length < 2 ? (
                  <>
                    <p className="search-results-title">Popular right now</p>
                    <ul>
                      {["iPhone 17 Pro", "MacBook Air", "AirPods Pro 3", "Apple Watch Series 11", "iPad Air"].map((t) => (
                        <li key={t}>
                          <button type="button" className="search-hit" onClick={() => setQuery(t)}>
                            <span className="search-hit-art"><IconSearch size={16} /></span>
                            <span className="search-hit-name">{t}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : hits.length > 0 ? (
                  <>
                    <p className="search-results-title">Products</p>
                    <ul>
                      {hits.map((h) => (
                        <li key={h.slug}>
                          <Link href={`/shop/${h.category}/${h.slug}`} className="search-hit">
                            <span className="search-hit-art">
                              <DeviceArt kind={h.art} hex={h.hex} accent={h.accent} screen={h.screen} label="" />
                            </span>
                            <span>
                              <span className="search-hit-name">{h.name}</span>
                              <span className="search-hit-meta"> · from {inr(h.price)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="search-results-title">
                    No results for “{query.trim()}”. Try “iPhone”, “Mac” or “Watch”.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {panel?.kind === "drawer" && (
          <div className="drawer" id="mobile-menu">
            {menu.map((section) => (
              <div className="drawer-group" key={section.key}>
                <Link href={section.href} className="drawer-link">
                  {section.label}
                </Link>
                <ul>
                  {section.groups[0].links.slice(0, 5).map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="drawer-sub">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="drawer-group">
              <p className="drawer-group-title">Amaira</p>
              {[
                { label: "Visit the store", href: "/store" },
                { label: "Service and repair", href: "/services" },
                { label: "Trade in", href: "/trade-in" },
                { label: "EMI and finance", href: "/finance" },
                { label: "Contact us", href: "/contact" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="drawer-sub">{l.label}</Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {panel?.kind === "menu" && <div className="mega-scrim" onClick={close} aria-hidden="true" />}
    </>
  );
}
