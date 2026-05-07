"use client";

import { useState } from "react";
import { Music2, X } from "lucide-react";

const ALBUM_ID = "2ANVost0y2y52ema1E9xAZ";

export function MusicPlayer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar playlist" : "Abrir playlist"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 50,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: open ? "#C4897A" : "#2C1F1A",
          color: open ? "#fff" : "#C4897A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(107,76,59,0.3)",
          transition: "all 0.2s ease",
        }}
      >
        {open ? <X size={16} /> : <Music2 size={17} strokeWidth={1.5} />}
      </button>

      {/* Painel Spotify */}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "24px",
          zIndex: 49,
          width: "320px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(0,0,0,0.35)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <iframe
          src={`https://open.spotify.com/embed/album/${ALBUM_ID}?utm_source=generator&theme=0`}
          width="320"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Playlist terapêutica"
          style={{ display: "block", border: "none" }}
        />
      </div>
    </>
  );
}
