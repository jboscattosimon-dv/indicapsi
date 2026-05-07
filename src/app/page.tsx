"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";

const FRASES_SUAVES = [
  "um espaço só seu.",
  "com gentileza.",
  "sem pressa.",
  "com presença.",
];

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [fraseIdx, setFraseIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setFraseIdx((i) => (i + 1) % FRASES_SUAVES.length);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#FAF9F7] dark:bg-[#1A1614]">
      {/* Orbs decorativos */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, #E8C4BB 0%, transparent 70%)",
          animation: "breathe 8s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-8"
        style={{
          background: "radial-gradient(circle, #D9CEBF 0%, transparent 70%)",
          animation: "breathe 10s ease-in-out infinite 2s",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-8 dark:opacity-5"
        style={{
          background: "radial-gradient(circle, #C4897A 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "breathe 12s ease-in-out infinite 1s",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <span
          className="text-sm text-[#9B9088] tracking-widest uppercase"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.18em" }}
        >
          indicapsi
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="text-xs text-[#9B9088] hover:text-[#C4897A] transition-colors px-4 py-2"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
          >
            área da psicóloga
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 1s ease, transform 1s ease",
          }}
        >
          {/* Linha decorativa */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-12 bg-[#D9CEBF] dark:bg-[#3D302C]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C4897A]" />
            <div className="h-px w-12 bg-[#D9CEBF] dark:bg-[#3D302C]" />
          </div>

          {/* Frase principal */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl leading-tight mb-6 text-[#4A3328] dark:text-[#E8DDD1]"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
          >
            Antes de começarmos,
            <br />
            <span className="text-[#C4897A]">quero te conhecer</span>
            <br />
            para além do automático.
          </h1>

          {/* Subtítulo animado */}
          <div className="h-6 mb-12 overflow-hidden">
            <p
              key={fraseIdx}
              className="text-sm text-[#9B9088] dark:text-[#9B9088] tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 300,
                letterSpacing: "0.2em",
                animation: "fadeUp 0.6s ease forwards",
              }}
            >
              {FRASES_SUAVES[fraseIdx]}
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={() => router.push("/prontuario")}
              className="
                group relative px-10 py-4 rounded-full
                bg-[#4A3328] dark:bg-[#C4897A]
                text-[#FAF9F7] dark:text-white
                text-sm tracking-widest uppercase
                hover:bg-[#6B4C3B] dark:hover:bg-[#A96B5C]
                transition-all duration-300 hover:shadow-[0_8px_30px_rgba(196,137,122,0.3)]
                hover:-translate-y-0.5
              "
              style={{ fontFamily: "var(--font-inter)", fontWeight: 400, letterSpacing: "0.14em" }}
            >
              Começar com calma
            </button>

            <p className="text-xs text-[#B5ABA3] dark:text-[#6B5248]" style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}>
              Suas respostas são confidenciais e tratadas com cuidado.
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div
        className="relative z-10 pb-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 1.5s ease 0.5s",
        }}
      >
        <p className="text-xs text-[#CEC8C2] dark:text-[#3D302C]" style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}>
          feito com escuta e cuidado
        </p>
      </div>

      <MusicPlayer />
    </main>
  );
}
