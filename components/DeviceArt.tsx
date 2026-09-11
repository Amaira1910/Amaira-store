/* ==========================================================================
   DeviceArt — original parametric product renders.

   Every product image on this site is drawn here from the product's finish
   colour, rather than loaded as a bitmap. That means: one file to restyle,
   perfect crispness at any size, a few KB instead of a few hundred, and no
   dependency on third-party photography.

   If you later license official Apple product imagery through the APR
   channel, swap the <DeviceArt> call sites for <Image> — the props already
   carry everything a filename would need.
   ========================================================================== */
import type { ArtKind } from "@/lib/types";
import { shade } from "@/lib/color";

/**
 * Gradient ids must be unique per *appearance*, not per instance. Hashing the
 * visual props gives a stable id across server and client renders (so no
 * hydration mismatch) and lets two identical renders safely share one
 * definition — duplicate ids with identical contents resolve identically.
 */
function artId(parts: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < parts.length; i++) {
    h ^= parts.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

export interface DeviceArtProps {
  kind: ArtKind;
  /** Body colour of the finish. */
  hex: string;
  /** Secondary colour — camera plateau, band, ear cushions. Derived if absent. */
  accent?: string;
  /** Screen tint for devices with displays. */
  screen?: string;
  /** Accessible label. Pass "" to mark the render decorative. */
  label?: string;
  className?: string;
}

export default function DeviceArt({ kind, hex, accent, screen, label, className }: DeviceArtProps) {
  const uid = artId(`${kind}|${hex}|${accent ?? ""}|${screen ?? ""}`);
  const a = accent ?? shade(hex, -0.14);
  const s = screen ?? "#111113";
  const hi = shade(hex, 0.3);
  const lo = shade(hex, -0.28);
  const edge = shade(hex, -0.42);

  const decorative = label === "";
  const aria = decorative
    ? { "aria-hidden": true as const, role: "presentation" as const }
    : { role: "img" as const, "aria-label": label ?? "Product render" };

  const common = {
    viewBox: "0 0 320 320",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    ...aria,
  };

  /* Shared defs: a body sheen, a screen vignette and a soft contact shadow. */
  const defs = (
    <defs>
      <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={hi} />
        <stop offset="38%" stopColor={hex} />
        <stop offset="100%" stopColor={lo} />
      </linearGradient>
      <linearGradient id={`rail-${uid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={edge} />
        <stop offset="12%" stopColor={hi} />
        <stop offset="50%" stopColor={hex} />
        <stop offset="88%" stopColor={hi} />
        <stop offset="100%" stopColor={edge} />
      </linearGradient>
      <linearGradient id={`accent-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={shade(a, 0.22)} />
        <stop offset="100%" stopColor={shade(a, -0.16)} />
      </linearGradient>
      <linearGradient id={`screen-${uid}`} x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stopColor={shade(s, 0.16)} />
        <stop offset="45%" stopColor={s} />
        <stop offset="100%" stopColor={shade(s, -0.3)} />
      </linearGradient>
      <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
        <stop offset="42%" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`shadow-${uid}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#000" stopOpacity="0.2" />
        <stop offset="70%" stopColor="#000" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`lens-${uid}`} cx="0.36" cy="0.3" r="0.75">
        <stop offset="0%" stopColor="#4a5766" />
        <stop offset="40%" stopColor="#1b2029" />
        <stop offset="100%" stopColor="#06070a" />
      </radialGradient>
    </defs>
  );

  const body = `url(#body-${uid})`;
  const rail = `url(#rail-${uid})`;
  const accentFill = `url(#accent-${uid})`;
  const screenFill = `url(#screen-${uid})`;
  const glass = `url(#glass-${uid})`;
  const shadowFill = `url(#shadow-${uid})`;
  const lens = `url(#lens-${uid})`;

  /* ---------------------------------------------------------------- phone */
  if (kind === "phone" || kind === "phone-pro") {
    const pro = kind === "phone-pro";
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="296" rx="86" ry="13" fill={shadowFill} />
        {/* body */}
        <rect x="94" y="22" width="132" height="266" rx="30" fill={body} stroke={edge} strokeWidth="1.2" />
        <rect x="94" y="22" width="132" height="266" rx="30" fill={glass} />
        {/* side rails catch the light */}
        <rect x="94" y="22" width="132" height="266" rx="30" fill="none" stroke={rail} strokeWidth="2.4" />
        {/* camera plateau */}
        {pro ? (
          <>
            <rect x="106" y="34" width="82" height="82" rx="25" fill={accentFill} stroke={edge} strokeWidth="0.9" />
            <circle cx="130" cy="58" r="13.5" fill={lens} stroke={edge} strokeWidth="1.6" />
            <circle cx="164" cy="58" r="13.5" fill={lens} stroke={edge} strokeWidth="1.6" />
            <circle cx="130" cy="92" r="13.5" fill={lens} stroke={edge} strokeWidth="1.6" />
            <circle cx="126.5" cy="54" r="4" fill="#7d93ad" opacity="0.5" />
            <circle cx="160.5" cy="54" r="4" fill="#7d93ad" opacity="0.5" />
            <circle cx="126.5" cy="88" r="4" fill="#7d93ad" opacity="0.5" />
            <circle cx="166" cy="92" r="6" fill={shade(a, -0.3)} />
            <circle cx="166" cy="92" r="3.4" fill="#f6efdc" opacity="0.85" />
          </>
        ) : (
          <>
            <rect x="106" y="34" width="50" height="82" rx="24" fill={accentFill} stroke={edge} strokeWidth="0.9" />
            <circle cx="131" cy="58" r="14" fill={lens} stroke={edge} strokeWidth="1.6" />
            <circle cx="131" cy="92" r="14" fill={lens} stroke={edge} strokeWidth="1.6" />
            <circle cx="127" cy="54" r="4.2" fill="#7d93ad" opacity="0.5" />
            <circle cx="127" cy="88" r="4.2" fill="#7d93ad" opacity="0.5" />
            <circle cx="168" cy="46" r="5.5" fill={shade(a, -0.3)} />
            <circle cx="168" cy="46" r="3.1" fill="#f6efdc" opacity="0.85" />
          </>
        )}
        {/* side buttons, flush with the rail rather than proud of it */}
        <rect x="92.6" y="88" width="2.2" height="24" rx="1.1" fill={edge} opacity="0.55" />
        <rect x="92.6" y="120" width="2.2" height="38" rx="1.1" fill={edge} opacity="0.55" />
        <rect x="225.2" y="106" width="2.2" height="44" rx="1.1" fill={edge} opacity="0.55" />
        {/* glass back inset within the metal rail */}
        <rect x="99" y="27" width="122" height="256" rx="26" fill="none" stroke={shade(hex, 0.4)} strokeWidth="0.9" opacity="0.4" />
        <path d="M104 268 q56 16 112 0" fill="none" stroke={shade(hex, 0.5)} strokeWidth="1.2" opacity="0.28" />
      </svg>
    );
  }

  /* --------------------------------------------------------------- laptop */
  if (kind === "laptop") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="262" rx="132" ry="14" fill={shadowFill} />
        {/* lid */}
        <rect x="48" y="64" width="224" height="146" rx="12" fill={body} stroke={edge} strokeWidth="1.2" />
        <rect x="57" y="73" width="206" height="124" rx="5" fill={screenFill} />
        <rect x="57" y="73" width="206" height="124" rx="5" fill={glass} />
        <rect x="147" y="75.5" width="26" height="4" rx="2" fill={shade(s, 0.25)} opacity="0.8" />
        {/* base */}
        <path d="M30 210 H290 L296 232 Q297 238 290 238 H30 Q23 238 24 232 Z" fill={body} stroke={edge} strokeWidth="1.1" />
        <path d="M30 210 H290 L292 218 H28 Z" fill={rail} opacity="0.55" />
        <rect x="132" y="212" width="56" height="4.5" rx="2.2" fill={edge} opacity="0.45" />
      </svg>
    );
  }

  /* --------------------------------------------------------------- tablet */
  if (kind === "tablet") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="296" rx="104" ry="12" fill={shadowFill} />
        <rect x="66" y="26" width="188" height="258" rx="20" fill={body} stroke={edge} strokeWidth="1.2" />
        <rect x="66" y="26" width="188" height="258" rx="20" fill="none" stroke={rail} strokeWidth="2.2" />
        <rect x="78" y="38" width="164" height="234" rx="11" fill={screenFill} />
        <rect x="78" y="38" width="164" height="234" rx="11" fill={glass} />
        <circle cx="160" cy="32.5" r="2.6" fill={shade(s, 0.3)} />
        {/* rear camera hint on the top-left corner rail */}
        <rect x="76" y="20" width="26" height="8" rx="4" fill={accentFill} opacity="0.9" />
      </svg>
    );
  }

  /* ---------------------------------------------------------------- watch */
  if (kind === "watch" || kind === "watch-rugged") {
    const rugged = kind === "watch-rugged";
    const caseW = rugged ? 130 : 118;
    const caseH = rugged ? 150 : 142;
    const x = (320 - caseW) / 2;
    const y = (320 - caseH) / 2 + 4;
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="300" rx="60" ry="10" fill={shadowFill} />
        {/* bands */}
        <path d={`M${x + 22} ${y + 8} L${x + 20} 24 Q${x + 19} 14 ${x + 30} 14 H${x + caseW - 30} Q${x + caseW - 19} 14 ${x + caseW - 20} 24 L${x + caseW - 22} ${y + 8} Z`} fill={accentFill} />
        <path d={`M${x + 22} ${y + caseH - 8} L${x + 20} 296 Q${x + 19} 306 ${x + 30} 306 H${x + caseW - 30} Q${x + caseW - 19} 306 ${x + caseW - 20} 296 L${x + caseW - 22} ${y + caseH - 8} Z`} fill={accentFill} />
        {/* case */}
        <rect x={x} y={y} width={caseW} height={caseH} rx={rugged ? 30 : 34} fill={body} stroke={edge} strokeWidth="1.2" />
        <rect x={x} y={y} width={caseW} height={caseH} rx={rugged ? 30 : 34} fill="none" stroke={rail} strokeWidth="2" />
        {/* crystal */}
        <rect x={x + 10} y={y + 10} width={caseW - 20} height={caseH - 20} rx={rugged ? 22 : 26} fill={screenFill} />
        <rect x={x + 10} y={y + 10} width={caseW - 20} height={caseH - 20} rx={rugged ? 22 : 26} fill={glass} />
        {/* a hint of a watch face */}
        <rect x={x + 26} y={y + 34} width={caseW - 52} height="9" rx="4.5" fill={shade(s, 0.55)} opacity="0.55" />
        <rect x={x + 26} y={y + 50} width={caseW - 76} height="7" rx="3.5" fill={shade(s, 0.4)} opacity="0.4" />
        <circle cx={x + caseW / 2} cy={y + caseH - 44} r="16" fill="none" stroke={shade(s, 0.45)} strokeWidth="4" opacity="0.5" />
        {/* digital crown */}
        <rect x={x + caseW - 1} y={y + 44} width="8" height="22" rx="4" fill={shade(hex, -0.1)} stroke={edge} strokeWidth="0.8" />
        <rect x={x + caseW - 1} y={y + 74} width="6" height="18" rx="3" fill={shade(hex, -0.22)} />
        {rugged && (
          <rect x={x - 6} y={y + 56} width="7" height="24" rx="3.5" fill="#e8791f" stroke={shade("#e8791f", -0.3)} strokeWidth="0.8" />
        )}
      </svg>
    );
  }

  /* ----------------------------------------------------------------- buds */
  if (kind === "buds") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="272" rx="88" ry="12" fill={shadowFill} />
        {/* case */}
        <rect x="82" y="128" width="156" height="128" rx="34" fill={body} stroke={shade(hex, -0.18)} strokeWidth="1.1" />
        <rect x="82" y="128" width="156" height="128" rx="34" fill={glass} />
        <path d="M82 160 H238" stroke={shade(hex, -0.14)} strokeWidth="1.4" opacity="0.8" />
        <rect x="142" y="246" width="36" height="5" rx="2.5" fill={shade(hex, -0.2)} opacity="0.6" />
        <circle cx="160" cy="176" r="3.4" fill={shade(hex, -0.3)} opacity="0.6" />
        {/* two buds resting above */}
        {[118, 202].map((cx, i) => (
          <g key={cx} transform={`translate(${cx} 76) ${i === 1 ? "scale(-1 1)" : ""}`}>
            <ellipse cx="0" cy="0" rx="24" ry="21" fill={body} stroke={shade(hex, -0.2)} strokeWidth="1" />
            <ellipse cx="-3" cy="-4" rx="14" ry="11" fill={glass} />
            <ellipse cx="6" cy="-6" rx="9" ry="7" fill={shade(hex, -0.34)} opacity="0.55" />
            <path d="M-10 14 q-4 26 2 42 q2 6 9 6 q7 0 9 -6 q6 -16 2 -42 Z" fill={body} stroke={shade(hex, -0.2)} strokeWidth="1" />
          </g>
        ))}
      </svg>
    );
  }

  /* ----------------------------------------------------------- headphones */
  if (kind === "headphones") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="288" rx="94" ry="12" fill={shadowFill} />
        {/* canopy */}
        <path d="M72 168 V138 a88 88 0 0 1 176 0 v30" fill="none" stroke={accentFill} strokeWidth="17" strokeLinecap="round" />
        <path d="M72 168 V138 a88 88 0 0 1 176 0 v30" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="6" strokeLinecap="round" />
        {/* arms */}
        <rect x="66" y="150" width="12" height="52" rx="6" fill={shade(hex, -0.1)} />
        <rect x="242" y="150" width="12" height="52" rx="6" fill={shade(hex, -0.1)} />
        {/* ear cups */}
        {[
          { x: 30, flip: 1 },
          { x: 206, flip: -1 },
        ].map((cup) => (
          <g key={cup.x}>
            <rect x={cup.x} y="182" width="84" height="98" rx="40" fill={body} stroke={shade(hex, -0.22)} strokeWidth="1.2" />
            <rect x={cup.x} y="182" width="84" height="98" rx="40" fill={glass} />
            <rect x={cup.x + 10} y="194" width="64" height="74" rx="32" fill={shade(a, -0.06)} opacity="0.9" />
            <rect x={cup.x + 18} y="202" width="48" height="58" rx="24" fill={shade(a, -0.24)} opacity="0.55" />
          </g>
        ))}
        {/* digital crown */}
        <rect x="272" y="196" width="14" height="9" rx="4.5" fill={shade(hex, -0.16)} />
      </svg>
    );
  }

  /* -------------------------------------------------------------- speaker */
  if (kind === "speaker" || kind === "speaker-mini") {
    const mini = kind === "speaker-mini";
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy={mini ? 246 : 276} rx={mini ? 68 : 82} ry="11" fill={shadowFill} />
        {mini ? (
          <>
            <circle cx="160" cy="176" r="68" fill={body} stroke={shade(hex, -0.2)} strokeWidth="1.1" />
            <circle cx="160" cy="176" r="68" fill={glass} />
            <ellipse cx="160" cy="126" rx="44" ry="16" fill={shade(hex, -0.12)} opacity="0.55" />
            <ellipse cx="160" cy="124" rx="34" ry="11" fill={shade(s, 0.1)} opacity="0.5" />
            <ellipse cx="160" cy="240" rx="40" ry="8" fill={shade(hex, -0.26)} opacity="0.5" />
          </>
        ) : (
          <>
            <path d="M96 118 q0 -30 64 -30 q64 0 64 30 v106 q0 32 -64 32 q-64 0 -64 -32 Z" fill={body} stroke={shade(hex, -0.2)} strokeWidth="1.1" />
            <path d="M96 118 q0 -30 64 -30 q64 0 64 30 v106 q0 32 -64 32 q-64 0 -64 -32 Z" fill={glass} />
            <ellipse cx="160" cy="118" rx="64" ry="26" fill={shade(hex, -0.1)} />
            <ellipse cx="160" cy="116" rx="46" ry="17" fill={shade(s, 0.12)} opacity="0.55" />
            <ellipse cx="160" cy="116" rx="26" ry="9" fill={shade(s, 0.4)} opacity="0.35" />
          </>
        )}
        {/* woven mesh texture */}
        {Array.from({ length: mini ? 7 : 9 }).map((_, i) => (
          <line
            key={i}
            x1={mini ? 100 : 100}
            x2={mini ? 220 : 220}
            y1={(mini ? 148 : 148) + i * 11}
            y2={(mini ? 148 : 148) + i * 11}
            stroke={shade(hex, -0.3)}
            strokeOpacity="0.16"
            strokeWidth="1.4"
          />
        ))}
      </svg>
    );
  }

  /* ----------------------------------------------------------------- iMac */
  if (kind === "imac" || kind === "display") {
    const isDisplay = kind === "display";
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="286" rx="96" ry="11" fill={shadowFill} />
        <rect x="30" y="48" width="260" height="168" rx="13" fill={isDisplay ? shade(hex, -0.04) : body} stroke={edge} strokeWidth="1.1" />
        <rect x="41" y="59" width="238" height={isDisplay ? 146 : 132} rx="6" fill={screenFill} />
        <rect x="41" y="59" width="238" height={isDisplay ? 146 : 132} rx="6" fill={glass} />
        <circle cx="160" cy="54" r="2.6" fill={shade(s, 0.3)} />
        {!isDisplay && <rect x="41" y="197" width="238" height="8" rx="3" fill={accentFill} opacity="0.35" />}
        {/* neck and foot */}
        <path d="M139 216 h42 l7 40 h-56 Z" fill={shade(hex, isDisplay ? -0.06 : -0.1)} />
        <rect x="96" y="256" width="128" height="10" rx="5" fill={shade(hex, isDisplay ? -0.12 : -0.18)} />
      </svg>
    );
  }

  /* ------------------------------------------------- mac mini / studio / tv */
  if (kind === "mac-mini" || kind === "mac-studio" || kind === "tv-box") {
    const h = kind === "mac-studio" ? 108 : kind === "tv-box" ? 60 : 72;
    const w = kind === "tv-box" ? 150 : 196;
    const x = (320 - w) / 2;
    const y = 196 - h;
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="214" rx={w / 2 + 12} ry="12" fill={shadowFill} />
        <rect x={x} y={y} width={w} height={h} rx={kind === "tv-box" ? 14 : 18} fill={body} stroke={edge} strokeWidth="1.1" />
        <rect x={x} y={y} width={w} height={h} rx={kind === "tv-box" ? 14 : 18} fill={glass} />
        <rect x={x} y={y + h - 7} width={w} height="7" rx="3.5" fill={shade(hex, -0.22)} opacity="0.7" />
        {kind === "tv-box" ? (
          <circle cx="160" cy={y + h - 16} r="3" fill="#ffffff" opacity="0.5" />
        ) : (
          <>
            <circle cx={x + 24} cy={y + h - 20} r="3" fill={shade(hex, -0.35)} opacity="0.7" />
            <rect x={x + 40} y={y + h - 25} width="20" height="10" rx="5" fill={shade(hex, -0.34)} opacity="0.6" />
            <rect x={x + 68} y={y + h - 25} width="20" height="10" rx="5" fill={shade(hex, -0.34)} opacity="0.6" />
            {kind === "mac-studio" && (
              <rect x={x + 96} y={y + h - 25} width="28" height="10" rx="3" fill={shade(hex, -0.34)} opacity="0.6" />
            )}
          </>
        )}
      </svg>
    );
  }

  /* --------------------------------------------------------------- pencil */
  if (kind === "pencil") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="290" rx="40" ry="9" fill={shadowFill} />
        <g transform="rotate(-24 160 160)">
          <path d="M148 44 h24 a10 10 0 0 1 10 10 v190 h-44 V54 a10 10 0 0 1 10 -10 Z" fill={body} stroke={shade(hex, -0.2)} strokeWidth="1" />
          <path d="M148 44 h10 v200 h-10 Z" fill="#fff" opacity="0.16" />
          <rect x="138" y="150" width="44" height="3" fill={shade(hex, -0.16)} opacity="0.7" />
          <path d="M138 244 h44 l-14 30 a8 8 0 0 1 -16 0 Z" fill={shade(hex, -0.06)} />
          <path d="M152 274 l6 14 l6 -14 Z" fill="#4a4a4f" />
        </g>
      </svg>
    );
  }

  /* ------------------------------------------------------------- keyboard */
  if (kind === "keyboard") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="232" rx="122" ry="11" fill={shadowFill} />
        <rect x="34" y="110" width="252" height="112" rx="11" fill={body} stroke={edge} strokeWidth="1.1" />
        <rect x="34" y="110" width="252" height="112" rx="11" fill={glass} />
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 12 }).map((__, col) => (
            <rect
              key={`${row}-${col}`}
              x={46 + col * 19.5}
              y={122 + row * 22}
              width={16}
              height={18}
              rx={3.4}
              fill={shade(s, 0.08)}
              opacity={0.82}
            />
          )),
        )}
        <rect x="104" y="210" width="112" height="5" rx="2.5" fill={shade(s, 0.12)} opacity="0.55" />
        <rect x="256" y="122" width="18" height="18" rx="4" fill={shade(hex, -0.24)} opacity="0.85" />
      </svg>
    );
  }

  /* ----------------------------------------------------- mouse / trackpad */
  if (kind === "mouse") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="252" rx="58" ry="10" fill={shadowFill} />
        <path d="M160 72 q48 0 48 62 v56 q0 52 -48 52 q-48 0 -48 -52 v-56 q0 -62 48 -62 Z" fill={body} stroke={edge} strokeWidth="1.1" />
        <path d="M160 72 q48 0 48 62 v56 q0 52 -48 52 q-48 0 -48 -52 v-56 q0 -62 48 -62 Z" fill={glass} />
        <path d="M160 72 q-30 0 -41 30 q18 -12 41 -12 q23 0 41 12 q-11 -30 -41 -30 Z" fill="#fff" opacity="0.12" />
        <line x1="160" y1="96" x2="160" y2="150" stroke={shade(hex, -0.2)} strokeWidth="1" opacity="0.4" />
      </svg>
    );
  }

  if (kind === "trackpad") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="226" rx="110" ry="10" fill={shadowFill} />
        <rect x="48" y="96" width="224" height="122" rx="14" fill={body} stroke={edge} strokeWidth="1.1" />
        <rect x="48" y="96" width="224" height="122" rx="14" fill={glass} />
        <rect x="56" y="104" width="208" height="106" rx="9" fill={shade(hex, 0.06)} opacity="0.5" />
      </svg>
    );
  }

  /* --------------------------------------------------------------- airtag */
  if (kind === "airtag") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="248" rx="58" ry="10" fill={shadowFill} />
        <circle cx="160" cy="158" r="80" fill="#f0f0ee" stroke="#d6d6d2" strokeWidth="1.2" />
        <circle cx="160" cy="158" r="80" fill={glass} />
        <circle cx="160" cy="158" r="58" fill={body} stroke={shade(hex, -0.2)} strokeWidth="1" />
        <circle cx="160" cy="158" r="58" fill={glass} />
        <ellipse cx="140" cy="132" rx="26" ry="18" fill="#fff" opacity="0.35" transform="rotate(-28 140 132)" />
      </svg>
    );
  }

  /* -------------------------------------------------------------- adapter */
  if (kind === "adapter") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="248" rx="62" ry="10" fill={shadowFill} />
        <rect x="100" y="96" width="120" height="140" rx="26" fill={body} stroke={shade(hex, -0.18)} strokeWidth="1.1" />
        <rect x="100" y="96" width="120" height="140" rx="26" fill={glass} />
        <rect x="139" y="218" width="42" height="11" rx="5.5" fill={shade(s, 0.16)} opacity="0.75" />
        <rect x="126" y="62" width="11" height="36" rx="3" fill="#b9bbbf" />
        <rect x="183" y="62" width="11" height="36" rx="3" fill="#b9bbbf" />
        <rect x="152" y="48" width="16" height="50" rx="4" fill="#cdcfd3" />
      </svg>
    );
  }

  /* -------------------------------------------------------------- magsafe */
  if (kind === "magsafe") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="238" rx="62" ry="10" fill={shadowFill} />
        <path d="M160 176 q-6 44 -50 58 q-30 10 -52 -6" fill="none" stroke="#dfdfdc" strokeWidth="9" strokeLinecap="round" />
        <path d="M160 176 q-6 44 -50 58 q-30 10 -52 -6" fill="none" stroke="#f2f2f0" strokeWidth="4" strokeLinecap="round" />
        <circle cx="160" cy="126" r="66" fill={body} stroke={shade(hex, -0.16)} strokeWidth="1.2" />
        <circle cx="160" cy="126" r="66" fill={glass} />
        <circle cx="160" cy="126" r="46" fill={shade(hex, -0.05)} opacity="0.75" />
        <circle cx="160" cy="126" r="27" fill={shade(hex, -0.11)} opacity="0.7" />
        <ellipse cx="138" cy="102" rx="22" ry="14" fill="#fff" opacity="0.3" transform="rotate(-30 138 102)" />
      </svg>
    );
  }

  /* ----------------------------------------------------------------- case */
  if (kind === "case") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="296" rx="80" ry="12" fill={shadowFill} />
        <rect x="100" y="26" width="120" height="258" rx="30" fill={body} stroke={shade(hex, -0.22)} strokeWidth="1.2" />
        <rect x="100" y="26" width="120" height="258" rx="30" fill={glass} />
        <rect x="108" y="34" width="104" height="242" rx="25" fill="none" stroke={shade(hex, -0.3)} strokeWidth="1" opacity="0.55" />
        {/* camera cut-out */}
        <rect x="112" y="38" width="76" height="76" rx="24" fill={shade(hex, -0.34)} opacity="0.5" />
        <rect x="118" y="44" width="64" height="64" rx="20" fill="#17181b" opacity="0.9" />
        {/* MagSafe ring */}
        <circle cx="160" cy="188" r="34" fill="none" stroke={shade(hex, -0.3)} strokeWidth="6" opacity="0.28" />
        {/* button cut-outs */}
        <rect x="97" y="96" width="4" height="26" rx="2" fill={shade(hex, -0.35)} opacity="0.6" />
        <rect x="97" y="132" width="4" height="40" rx="2" fill={shade(hex, -0.35)} opacity="0.6" />
        <rect x="219" y="112" width="4" height="46" rx="2" fill={shade(hex, -0.35)} opacity="0.6" />
      </svg>
    );
  }

  /* ----------------------------------------------------------------- band */
  if (kind === "band") {
    return (
      <svg {...common}>
        {defs}
        <ellipse cx="160" cy="290" rx="70" ry="10" fill={shadowFill} />
        <path
          d="M120 40 q-14 0 -14 16 v84 q0 54 54 80 q54 -26 54 -80 v-84 q0 -16 -14 -16 Z"
          fill={body}
          stroke={shade(hex, -0.22)}
          strokeWidth="1.2"
        />
        <path
          d="M120 40 q-14 0 -14 16 v84 q0 54 54 80 q54 -26 54 -80 v-84 q0 -16 -14 -16 Z"
          fill={glass}
        />
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse key={i} cx="160" cy={78 + i * 20} rx="8" ry="5" fill={shade(hex, -0.34)} opacity="0.4" />
        ))}
        <rect x="106" y="34" width="108" height="12" rx="6" fill={shade(hex, -0.14)} />
      </svg>
    );
  }

  /* ---------------------------------------------------------------- cable */
  return (
    <svg {...common}>
      {defs}
      <ellipse cx="160" cy="260" rx="90" ry="10" fill={shadowFill} />
      <path
        d="M72 92 q0 -22 24 -22 q80 0 80 62 q0 62 -80 62 q-24 0 -24 -22"
        fill="none"
        stroke={shade(hex, -0.1)}
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M72 92 q0 -22 24 -22 q80 0 80 62 q0 62 -80 62 q-24 0 -24 -22"
        fill="none"
        stroke={shade(hex, 0.35)}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <rect x="52" y="62" width="30" height="42" rx="9" fill={body} stroke={shade(hex, -0.24)} strokeWidth="1" />
      <rect x="52" y="164" width="30" height="42" rx="9" fill={body} stroke={shade(hex, -0.24)} strokeWidth="1" />
      <rect x="60" y="56" width="14" height="10" rx="4" fill="#b9bbbf" />
      <rect x="60" y="202" width="14" height="10" rx="4" fill="#b9bbbf" />
    </svg>
  );
}
