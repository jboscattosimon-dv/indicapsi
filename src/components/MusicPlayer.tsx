"use client";

import { useState } from "react";
import { Music2, X, ChevronDown } from "lucide-react";

const SPOTIFY_EMBED =
  "https://open.spotify.com/embed/album/2ANVost0y2y52ema1E9xAZ?utm_source=generator&theme=0";

export function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir playlist"
          className="
            fixed bottom-6 right-6 z-50
            w-12 h-12 rounded-full
            bg-[#4A3328] dark:bg-[#2C2320]
            text-[#C4897A] hover:text-[#E8C4BB]
            flex items-center justify-center
            shadow-[0_4px_20px_rgba(107,76,59,0.3)]
            hover:shadow-[0_6px_28px_rgba(196,137,122,0.35)]
            hover:scale-105
            transition-all duration-300
          "
        >
          <Music2 size={18} strokeWidth={1.5} />
        </button>
      )}

      {/* Painel do Spotify */}
      <div
        className={`
          fixed bottom-6 right-6 z-50
          w-[340px] rounded-2xl overflow-hidden
          shadow-[0_12px_48px_rgba(107,76,59,0.2)]
          border border-[#3D302C]/40
          transition-all duration-500 ease-out origin-bottom-right
          ${open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }
        `}
        style={{ background: "#121212" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Music2 size={13} strokeWidth={1.5} className="text-[#C4897A]" />
            <span
              className="text-xs text-white/50 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.18em" }}
            >
              ambiente
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/30 hover:text-white/70 transition-colors p-0.5"
            aria-label="Fechar playlist"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Spinner enquanto carrega */}
        {!loaded && (
          <div className="h-[152px] flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border border-[#C4897A]/30 border-t-[#C4897A] animate-spin-slow" />
          </div>
        )}

        {/* Spotify embed */}
        <iframe
          src={SPOTIFY_EMBED}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={loaded ? "block" : "hidden"}
          title="Playlist ambiente — Indicapsi"
        />
      </div>

    </>
  );
}
