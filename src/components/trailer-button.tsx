"use client";

import { useState } from "react";
import { Clapperboard, X } from "lucide-react";

export function TrailerButton({ label, trailerUrl }: { label: string; trailerUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors duration-300 hover:bg-white/20"
      >
        <Clapperboard className="h-4 w-4" aria-hidden />
        {label}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b16] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-bold">{label}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={trailerUrl}
                title={label}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
