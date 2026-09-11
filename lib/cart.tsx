"use client";

/* ==========================================================================
   The bag. Client state, persisted to localStorage, with a toast channel so
   any component can confirm an action without prop-drilling a callback.

   Hydration note: the first render is always an empty bag — matching what the
   server rendered — and the stored bag is merged in after mount. Anything that
   renders a count must respect `ready` or it will flash.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "amaira.bag.v1";
const MAX_QTY = 10;

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const existing = state.find((l) => l.key === action.line.key);
      if (existing) {
        return state.map((l) =>
          l.key === action.line.key
            ? { ...l, qty: Math.min(MAX_QTY, l.qty + action.line.qty) }
            : l,
        );
      }
      return [...state, action.line];
    }
    case "setQty":
      if (action.qty <= 0) return state.filter((l) => l.key !== action.key);
      return state.map((l) =>
        l.key === action.key ? { ...l, qty: Math.min(MAX_QTY, action.qty) } : l,
      );
    case "remove":
      return state.filter((l) => l.key !== action.key);
    case "clear":
      return [];
  }
}

export interface Toast {
  id: number;
  message: string;
  href?: string;
  linkText?: string;
}

interface CartValue {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toasts: Toast[];
  notify: (message: string, opts?: { href?: string; linkText?: string }) => void;
}

const CartContext = createContext<CartValue | null>(null);

function isLine(v: unknown): v is CartLine {
  if (!v || typeof v !== "object") return false;
  const l = v as Record<string, unknown>;
  return (
    typeof l.key === "string" &&
    typeof l.slug === "string" &&
    typeof l.unitPrice === "number" &&
    Number.isFinite(l.unitPrice) &&
    typeof l.qty === "number" &&
    l.qty > 0
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  /* Load once on mount. A corrupt or hand-edited bag is discarded rather than
     crashing the whole app. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch({ type: "hydrate", lines: parsed.filter(isLine) });
        }
      }
    } catch {
      /* storage unavailable (private mode, blocked cookies) — carry on empty */
    }
    setReady(true);
  }, []);

  /* Persist on every change, but never before hydration or we would wipe it. */
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* quota or privacy mode — the bag still works for this session */
    }
  }, [lines, ready]);

  const notify = useCallback((message: string, opts?: { href?: string; linkText?: string }) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, ...opts }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const add = useCallback<CartValue["add"]>(
    (line) => {
      dispatch({ type: "add", line: { ...line, qty: line.qty ?? 1 } });
    },
    [],
  );

  const setQty = useCallback((key: string, qty: number) => dispatch({ type: "setQty", key, qty }), []);
  const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + (l.unitPrice + (l.care ?? 0)) * l.qty, 0),
    [lines],
  );

  const value = useMemo<CartValue>(
    () => ({ lines, ready, count, subtotal, add, setQty, remove, clear, toasts, notify }),
    [lines, ready, count, subtotal, add, setQty, remove, clear, toasts, notify],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Builds the stable key that identifies one configuration in the bag. */
export function lineKey(slug: string, colorId: string, storageId?: string, sizeId?: string): string {
  return [slug, colorId, storageId ?? "-", sizeId ?? "-"].join("::");
}
