"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight } from "lucide-react";

const PALAVRAS_MARQUEE = [
  "escuta", "presença", "cuidado", "gentileza", "silêncio",
  "profundidade", "acolhimento", "calma", "intimidade", "verdade",
  "escuta", "presença", "cuidado", "gentileza", "silêncio",
  "profundidade", "acolhimento", "calma", "intimidade", "verdade",
];

const FRASES = [
  "um espaço só seu.",
  "com gentileza.",
  "sem pressa.",
  "com presença.",
];

export default function Home() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [fraseIdx, setFraseIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Entrada em fases
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Rotação de frases
  useEffect(() => {
    const iv = setInterval(() => setFraseIdx(i => (i + 1) % FRASES.length), 3200);
    return () => clearInterval(iv);
  }, []);

  // Partículas no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    type Particle = { x: number; y: number; r: number; vx: number; vy: number; alpha: number };
    const particles: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.35 + 0.08,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,137,122,${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const vis = (n: number) => phase >= n;

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#FAF9F7] dark:bg-[#1A1614] select-none">

      {/* Canvas de partículas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />

      {/* Orb grande esquerdo */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 40%, #E8C4BB 0%, transparent 65%)",
          filter: "blur(90px)",
          opacity: 0.22,
          animation: "breathe 9s ease-in-out infinite",
        }}
      />
      {/* Orb médio direito */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 w-[550px] h-[550px] rounded-full"
        style={{
          background: "radial-gradient(circle at 60% 60%, #C4897A 0%, transparent 65%)",
          filter: "blur(100px)",
          opacity: 0.15,
          animation: "breathe 11s ease-in-out infinite 3s",
        }}
      />
      {/* Orb central sutil */}
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          background: "radial-gradient(circle, #D9CEBF 0%, transparent 55%)",
          filter: "blur(120px)",
          opacity: 0.12,
          animation: "breathe 14s ease-in-out infinite 1s",
        }}
      />

      {/* ─── NAV ─── */}
      <nav
        className="relative z-20 flex items-center justify-between px-8 sm:px-14 py-7"
        style={{
          opacity: vis(1) ? 1 : 0,
          transform: vis(1) ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C4897A]" />
          <span
            className="text-xs text-[#9B9088] dark:text-[#9B9088] uppercase tracking-[0.22em]"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
          >
            indicapsi
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/login")}
            className="
              text-xs text-[#B5ABA3] hover:text-[#C4897A] dark:text-[#6B5248] dark:hover:text-[#C4897A]
              transition-colors px-4 py-2 rounded-full
              hover:bg-[#F0EBE3] dark:hover:bg-[#231C1A]
            "
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
          >
            área da psicóloga
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Tag superior */}
        <div
          className="flex items-center gap-3 mb-12"
          style={{
            opacity: vis(1) ? 1 : 0,
            transform: vis(1) ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
          }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D9CEBF] dark:to-[#3D302C]" />
          <span
            className="text-[10px] tracking-[0.28em] uppercase text-[#B5ABA3] dark:text-[#6B5248]"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
          >
            prontuário terapêutico
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D9CEBF] dark:to-[#3D302C]" />
        </div>

        {/* Título principal */}
        <h1
          className="max-w-3xl leading-[1.15] mb-8 text-[#4A3328] dark:text-[#E8DDD1]"
          style={{
            fontFamily: "var(--font-playfair)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(2.4rem, 6vw, 5.5rem)",
            opacity: vis(2) ? 1 : 0,
            transform: vis(2) ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 1s ease, transform 1s ease",
          }}
        >
          Antes de começarmos,{" "}
          <br className="hidden sm:block" />
          <em className="not-italic" style={{ color: "#C4897A" }}>quero te conhecer</em>{" "}
          <br className="hidden sm:block" />
          para além do automático.
        </h1>

        {/* Frase rotativa */}
        <div
          className="h-5 mb-14 overflow-hidden"
          style={{
            opacity: vis(2) ? 1 : 0,
            transition: "opacity 0.8s ease 0.3s",
          }}
        >
          <p
            key={fraseIdx}
            className="text-[11px] text-[#9B9088] uppercase"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              letterSpacing: "0.26em",
              animation: "fadeUp 0.5s ease forwards",
            }}
          >
            {FRASES[fraseIdx]}
          </p>
        </div>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4"
          style={{
            opacity: vis(3) ? 1 : 0,
            transform: vis(3) ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <button
            onClick={() => router.push("/prontuario")}
            className="
              group relative flex items-center gap-3
              px-10 py-4 rounded-full
              bg-[#4A3328] dark:bg-[#C4897A]
              text-[#FAF9F7] dark:text-white
              text-sm
              hover:bg-[#6B4C3B] dark:hover:bg-[#A96B5C]
              transition-all duration-300
              hover:shadow-[0_10px_36px_rgba(196,137,122,0.32)]
              hover:-translate-y-1
            "
            style={{ fontFamily: "var(--font-inter)", fontWeight: 400, letterSpacing: "0.1em" }}
          >
            Começar com calma
            <ArrowRight
              size={15}
              strokeWidth={1.5}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </button>

          <button
            onClick={() => router.push("/login")}
            className="
              px-8 py-4 rounded-full text-sm
              text-[#9B9088] hover:text-[#4A3328] dark:hover:text-[#E8DDD1]
              border border-[#D9CEBF] dark:border-[#3D302C]
              hover:border-[#C4897A] dark:hover:border-[#C4897A]
              transition-all duration-300 hover:-translate-y-0.5
            "
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.08em" }}
          >
            sou psicóloga →
          </button>
        </div>

        {/* Nota de privacidade */}
        <p
          className="mt-8 text-[11px] text-[#CEC8C2] dark:text-[#4A3328]"
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 300,
            opacity: vis(3) ? 1 : 0,
            transition: "opacity 0.8s ease 0.4s",
          }}
        >
          suas respostas são confidenciais e tratadas com cuidado
        </p>
      </div>

      {/* ─── MARQUEE ─── */}
      <div
        className="relative z-10 w-full overflow-hidden border-t border-b border-[#EDE6DC] dark:border-[#2C2320] py-4"
        style={{
          opacity: vis(3) ? 1 : 0,
          transition: "opacity 1s ease 0.6s",
        }}
      >
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {PALAVRAS_MARQUEE.map((p, i) => (
            <span
              key={i}
              className="text-[11px] text-[#CEC8C2] dark:text-[#3D302C] uppercase"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.22em" }}
            >
              {i % 2 === 0 ? p : <span className="text-[#D9CEBF] dark:text-[#4A3328]">✦ {p}</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ─── RODAPÉ ─── */}
      <div
        className="relative z-10 flex items-center justify-between px-8 sm:px-14 py-6"
        style={{
          opacity: vis(3) ? 1 : 0,
          transition: "opacity 1s ease 0.8s",
        }}
      >
        <p
          className="text-[11px] text-[#CEC8C2] dark:text-[#2C2320]"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
        >
          feito com escuta e cuidado
        </p>
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-[#D9CEBF] dark:bg-[#3D302C]" />
          <p
            className="text-[11px] text-[#CEC8C2] dark:text-[#2C2320]"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
          >
            © 2025 indicapsi
          </p>
        </div>
      </div>

      <MusicPlayer />

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: var(--op, 0.15); }
          50%       { transform: scale(1.06); opacity: calc(var(--op, 0.15) * 1.5); }
        }
      `}</style>
    </main>
  );
}
