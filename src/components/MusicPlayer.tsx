"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Music2, ChevronUp, ChevronDown } from "lucide-react";
import { MUSICAS } from "@/lib/types";

export function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            next();
            return 0;
          }
          return p + 0.3;
        });
      }, 300);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, current]);

  const next = () => {
    setCurrent((c) => (c + 1) % MUSICAS.length);
    setProgress(0);
  };
  const prev = () => {
    setCurrent((c) => (c - 1 + MUSICAS.length) % MUSICAS.length);
    setProgress(0);
  };

  const musica = MUSICAS[current];

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        glass rounded-2xl shadow-[0_8px_32px_rgba(107,76,59,0.12)]
        transition-all duration-500 ease-out
        ${collapsed ? "w-12 h-12" : "w-72"}
      `}
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="w-12 h-12 flex items-center justify-center text-[#C4897A] hover:text-[#A96B5C] transition-colors"
          aria-label="Abrir player"
        >
          <Music2 size={18} strokeWidth={1.5} />
        </button>
      ) : (
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Music2 size={14} strokeWidth={1.5} className="text-[#C4897A]" />
              <span
                className="text-xs tracking-widest uppercase text-[#9B9088] dark:text-[#9B9088]"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 400, letterSpacing: "0.12em" }}
              >
                ambiente
              </span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="text-[#B5ABA3] hover:text-[#9B9088] transition-colors"
              aria-label="Minimizar player"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Song info */}
          <div className="mb-3">
            <p
              className="text-sm text-[#4A3328] dark:text-[#E8DDD1] mb-0.5 truncate"
              style={{ fontFamily: "var(--font-playfair)", fontWeight: 500 }}
            >
              {musica.emoji} {musica.titulo}
            </p>
            <p className="text-xs text-[#9B9088]" style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}>
              {musica.artista} · {musica.duracao}
            </p>
          </div>

          {/* Progress */}
          <div className="progress-track mb-3">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="text-[#B5ABA3] hover:text-[#C4897A] transition-colors"
              aria-label="Música anterior"
            >
              <SkipBack size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="
                w-9 h-9 rounded-full flex items-center justify-center
                bg-[#C4897A] hover:bg-[#A96B5C]
                text-white transition-all duration-200 hover:scale-105
              "
              aria-label={playing ? "Pausar" : "Tocar"}
            >
              {playing
                ? <Pause size={14} strokeWidth={2} />
                : <Play size={14} strokeWidth={2} className="translate-x-0.5" />
              }
            </button>
            <button
              onClick={next}
              className="text-[#B5ABA3] hover:text-[#C4897A] transition-colors"
              aria-label="Próxima música"
            >
              <SkipForward size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Track dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {MUSICAS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setProgress(0); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-4 h-1 bg-[#C4897A]"
                    : "w-1 h-1 bg-[#D9CEBF] dark:bg-[#3D302C]"
                }`}
                aria-label={`Música ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
