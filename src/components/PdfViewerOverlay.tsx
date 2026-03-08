"use client";

import { useEffect, useCallback } from "react";

export interface PdfViewerOverlayProps {
  /** PDF path relative to public folder, e.g. "/Player-Survival-Guide-v1.2.pdf" */
  src: string;
  title: string;
  onClose: () => void;
}

/**
 * Full-screen overlay for viewing PDFs. Does not affect game state.
 * Use Ctrl+F / Cmd+F to search within the PDF.
 */
export function PdfViewerOverlay({
  src,
  title,
  onClose,
}: PdfViewerOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-neutral-950"
      role="dialog"
      aria-modal="true"
      aria-label={`PDF: ${title}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-amber-900/50 bg-black/80 px-4 py-2">
        <h2 className="text-sm font-medium text-amber-200">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-800/80">
            Ctrl+F to search · Esc to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-amber-800/50 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-950/50 hover:text-amber-100"
          >
            Close
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <iframe
          src={src}
          title={title}
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
