"use client";

/** Printing is a browser action, so this is the one client island the
    otherwise-static invoice page needs. */
export default function PrintButton() {
  return (
    <button type="button" className="btn btn-sm" onClick={() => window.print()}>
      Print or save as PDF
    </button>
  );
}
