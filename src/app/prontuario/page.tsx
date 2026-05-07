"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, ArrowRight, Check } from "lucide-react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PERGUNTAS, type ProntuarioForm } from "@/lib/types";
import { salvarProntuario } from "@/lib/supabase";

type Etapa = "intro" | "identificacao" | "pergunta" | "escrita_livre" | "finalizando" | "concluido";

const MENSAGENS = [
  "Obrigada por confiar.",
  "Você está no lugar certo.",
  "Respire. Continue no seu tempo.",
  "Cada palavra sua importa.",
  "Não existe resposta errada aqui.",
  "Você está fazendo algo muito corajoso.",
  "Estou aqui, ouvindo.",
];

const VAZIO: ProntuarioForm = {
  nome: "", idade: "", motivo: "", momento_perdida: "", relacao_consigo: "",
  vive_outros: "", ocupa_mente: "", como_corpo: "", recuperar: "", escrita_livre: "",
};

export default function ProntuarioPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [form, setForm] = useState<ProntuarioForm>(VAZIO);
  const [animando, setAnimando] = useState(false);
  const [animDir, setAnimDir] = useState<"out" | "in">("in");
  const [prontuarioId, setProntuarioId] = useState<string | null>(null);

  useEffect(() => {
    const draft = localStorage.getItem("indicapsi-draft");
    if (draft) { try { setForm(JSON.parse(draft)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem("indicapsi-draft", JSON.stringify(form));
  }, [form]);

  const pct = () => {
    if (etapa === "intro") return 0;
    if (etapa === "identificacao") return 8;
    if (etapa === "pergunta") return 15 + (perguntaIdx / PERGUNTAS.length) * 65;
    if (etapa === "escrita_livre") return 85;
    return 100;
  };

  const ir = useCallback((fn: () => void) => {
    setAnimDir("out");
    setAnimando(true);
    setTimeout(() => {
      fn();
      setAnimDir("in");
      setAnimando(false);
    }, 280);
  }, []);

  const avancar = () => {
    if (etapa === "intro") ir(() => setEtapa("identificacao"));
    else if (etapa === "identificacao" && form.nome.trim()) ir(() => { setEtapa("pergunta"); setPerguntaIdx(0); });
    else if (etapa === "pergunta") {
      if (perguntaIdx < PERGUNTAS.length - 1) ir(() => setPerguntaIdx(i => i + 1));
      else ir(() => setEtapa("escrita_livre"));
    } else if (etapa === "escrita_livre") {
      ir(() => setEtapa("finalizando"));
      setTimeout(finalizar, 400);
    }
  };

  const voltar = () => {
    if (etapa === "identificacao") ir(() => setEtapa("intro"));
    else if (etapa === "pergunta") {
      if (perguntaIdx > 0) ir(() => setPerguntaIdx(i => i - 1));
      else ir(() => setEtapa("identificacao"));
    } else if (etapa === "escrita_livre") ir(() => { setEtapa("pergunta"); setPerguntaIdx(PERGUNTAS.length - 1); });
  };

  const finalizar = async () => {
    const id = `pron_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dados = {
      id, paciente_nome: form.nome, idade: form.idade, motivo: form.motivo,
      momento_perdida: form.momento_perdida, relacao_consigo: form.relacao_consigo,
      vive_outros: form.vive_outros, ocupa_mente: form.ocupa_mente,
      como_corpo: form.como_corpo, recuperar: form.recuperar,
      escrita_livre: form.escrita_livre, criado_em: new Date().toISOString(), status: "completo",
    };
    const hist = JSON.parse(localStorage.getItem("indicapsi-historico") || "[]");
    hist.unshift({ ...dados, nome: form.nome });
    localStorage.setItem("indicapsi-historico", JSON.stringify(hist));
    localStorage.removeItem("indicapsi-draft");
    try { await salvarProntuario(dados); } catch {}
    setProntuarioId(id);
    setTimeout(() => setEtapa("concluido"), 1800);
  };

  const animStyle: React.CSSProperties = {
    opacity: animando ? 0 : 1,
    transform: animando ? (animDir === "out" ? "translateY(14px)" : "translateY(-14px)") : "translateY(0)",
    transition: "opacity 0.28s ease, transform 0.28s ease",
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", position: "relative" }}>
      <style>{`
        :root { --bg: #FAF9F7; --fg: #4A3328; --muted: #9B9088; --border: #EDE6DC; --rose: #C4897A; --rose-deep: #A96B5C; --cream: #F0EBE3; }
        .dark { --bg: #1A1614; --fg: #E8DDD1; --muted: #9B9088; --border: #2C2320; --cream: #231C1A; }
        .pron-input {
          width: 100%; background: transparent;
          border: none; border-bottom: 1.5px solid #D9CEBF;
          color: var(--fg); padding: 12px 0; font-size: 1.15rem;
          font-family: 'Playfair Display', Georgia, serif; font-style: italic;
          transition: border-color 0.2s;
        }
        .pron-input::placeholder { color: #CEC8C2; }
        .pron-input:focus { outline: none; border-color: #C4897A; }
        .dark .pron-input { border-color: #3D302C; }
        .dark .pron-input:focus { border-color: #C4897A; }
        .pron-textarea {
          width: 100%; background: transparent;
          border: 1.5px solid #EDE6DC; border-radius: 14px;
          color: var(--fg); padding: 18px 20px;
          font-size: 0.96rem; font-family: 'Inter', system-ui, sans-serif;
          font-weight: 300; line-height: 1.9; resize: none;
          transition: border-color 0.2s;
        }
        .pron-textarea::placeholder { color: #CEC8C2; }
        .pron-textarea:focus { outline: none; border-color: #C4897A; }
        .dark .pron-textarea { border-color: #2C2320; }
        .dark .pron-textarea:focus { border-color: #C4897A; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 32px; border-radius: 999px; border: none; cursor: pointer;
          background: #4A3328; color: #FAF9F7;
          font-family: 'Inter', system-ui, sans-serif; font-size: 0.875rem;
          font-weight: 400; letter-spacing: 0.06em;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .dark .btn-primary { background: #C4897A; color: #fff; }
        .btn-primary:hover { background: #6B4C3B; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(196,137,122,0.28); }
        .dark .btn-primary:hover { background: #A96B5C; }
        .btn-rose {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 999px; border: none; cursor: pointer;
          background: #C4897A; color: #fff;
          font-family: 'Inter', system-ui, sans-serif; font-size: 0.875rem;
          font-weight: 400; transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .btn-rose:hover { background: #A96B5C; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(196,137,122,0.3); }
        .btn-rose:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer;
          background: transparent; color: #B5ABA3;
          font-family: 'Inter', system-ui, sans-serif; font-size: 0.875rem;
          font-weight: 300; transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--fg); }
        .label-sm {
          display: block; font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.68rem; font-weight: 300; color: #B5ABA3;
          text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 12px;
        }
      `}</style>

      {/* Orb */}
      <div style={{ position: "fixed", top: 0, right: 0, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #E8C4BB 0%, transparent 70%)", filter: "blur(70px)", opacity: 0.12, pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 10 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9088", fontSize: "0.875rem", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300 }}>
          ← indicapsi
        </button>
        <ThemeToggle />
      </nav>

      {/* Progresso */}
      <div style={{ height: 2, background: "rgba(196,137,122,0.12)", position: "relative" }}>
        <div style={{ height: "100%", width: `${pct()}%`, background: "linear-gradient(90deg, #C4897A, #A96B5C)", borderRadius: 1, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560, ...animStyle }}>
          {etapa === "intro"         && <EtapaIntro onAvancar={avancar} />}
          {etapa === "identificacao" && <EtapaIdentificacao form={form} setForm={setForm} onAvancar={avancar} onVoltar={voltar} />}
          {etapa === "pergunta"      && (
            <EtapaPergunta
              pergunta={PERGUNTAS[perguntaIdx]}
              idx={perguntaIdx}
              total={PERGUNTAS.length}
              value={form[PERGUNTAS[perguntaIdx].id as keyof ProntuarioForm]}
              onChange={v => setForm(f => ({ ...f, [PERGUNTAS[perguntaIdx].id]: v }))}
              onAvancar={avancar}
              mensagem={MENSAGENS[perguntaIdx % MENSAGENS.length]}
            />
          )}
          {etapa === "escrita_livre" && <EtapaEscritaLivre value={form.escrita_livre} onChange={v => setForm(f => ({ ...f, escrita_livre: v }))} onAvancar={avancar} />}
          {etapa === "finalizando"   && <EtapaFinalizando />}
          {etapa === "concluido"     && <EtapaConcluido nome={form.nome} onVer={() => prontuarioId && router.push(`/prontuario/${prontuarioId}`)} />}
        </div>
      </div>

      <MusicPlayer />
    </main>
  );
}

/* ─── ETAPAS ─── */

function Divisor() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C4897A" }} />
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function EtapaIntro({ onAvancar }: { onAvancar: () => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <Divisor />
      <p className="label-sm" style={{ marginBottom: 24 }}>prontuário inicial</p>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--fg)", lineHeight: 1.25, marginBottom: 20 }}>
        Antes de começarmos,<br />quero te conhecer.
      </h2>
      <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.95rem", color: "var(--muted)", lineHeight: 1.8, maxWidth: 380, margin: "0 auto 48px" }}>
        Este não é um formulário. É um espaço de escuta.<br />
        Responda no seu tempo, com suas palavras.<br />
        Não há resposta certa.
      </p>
      <button className="btn-primary" onClick={onAvancar}>
        Estou pronta
        <ArrowRight size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function EtapaIdentificacao({ form, setForm, onAvancar, onVoltar }: {
  form: ProntuarioForm;
  setForm: React.Dispatch<React.SetStateAction<ProntuarioForm>>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  return (
    <div>
      <p className="label-sm" style={{ textAlign: "center", marginBottom: 40 }}>para começar</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        <div>
          <label className="label-sm">como você se chama?</label>
          <input
            className="pron-input"
            type="text"
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            placeholder="Seu nome..."
            autoFocus
            onKeyDown={e => e.key === "Enter" && form.nome && onAvancar()}
          />
        </div>
        <div>
          <label className="label-sm">quantos anos você tem?</label>
          <input
            className="pron-input"
            type="text"
            inputMode="numeric"
            value={form.idade}
            onChange={e => setForm(f => ({ ...f, idade: e.target.value }))}
            placeholder="Sua idade..."
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 52 }}>
        <button className="btn-ghost" onClick={onVoltar}><ChevronLeft size={16} strokeWidth={1.5} />voltar</button>
        <button className="btn-rose" onClick={onAvancar} disabled={!form.nome.trim()}>
          continuar <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function EtapaPergunta({ pergunta, idx, total, value, onChange, onAvancar, mensagem }: {
  pergunta: (typeof PERGUNTAS)[0]; idx: number; total: number; value: string;
  onChange: (v: string) => void; onAvancar: () => void; mensagem: string;
}) {
  return (
    <div>
      {/* Contador + mensagem */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
        <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#B5ABA3", fontVariantNumeric: "tabular-nums" }}>
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: "0.82rem", color: "#C4897A" }}>
          {mensagem}
        </span>
      </div>

      {/* Pergunta */}
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", color: "var(--fg)", lineHeight: 1.3, marginBottom: 8 }}>
        {pergunta.pergunta}
      </h2>
      <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "#B5ABA3", marginBottom: 24 }}>
        {pergunta.hint}
      </p>

      {/* Textarea */}
      <textarea
        className="pron-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={pergunta.placeholder}
        rows={7}
        autoFocus
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
        <button className="btn-rose" onClick={onAvancar}>
          {idx === total - 1 ? "última parte" : "próxima"}
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function EtapaEscritaLivre({ value, onChange, onAvancar }: {
  value: string; onChange: (v: string) => void; onAvancar: () => void;
}) {
  return (
    <div>
      <p className="label-sm" style={{ textAlign: "center", marginBottom: 20 }}>espaço livre</p>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", color: "var(--fg)", lineHeight: 1.3, marginBottom: 8, textAlign: "center" }}>
        Escreva como se ninguém<br />fosse te interromper.
      </h2>
      <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "#B5ABA3", marginBottom: 28, textAlign: "center" }}>
        Pode ser qualquer coisa. Uma lembrança, um desabafo, uma frase solta.
      </p>
      <textarea
        className="pron-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Tudo que vier..."
        rows={10}
        autoFocus
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
        <button className="btn-primary" onClick={onAvancar}>
          finalizar <Check size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function EtapaFinalizando() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid #C4897A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "breathe 2s ease-in-out infinite" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#C4897A", animation: "breathe 2s ease-in-out infinite 0.4s" }} />
      </div>
      <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "var(--muted)" }}>
        Guardando sua história com cuidado...
      </p>
    </div>
  );
}

function EtapaConcluido({ nome, onVer }: { nome: string; onVer: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 150); }, []);
  const primeiro = nome.split(" ")[0];
  return (
    <div style={{ textAlign: "center", opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
      <Divisor />
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.7rem, 4vw, 2.5rem)", color: "var(--fg)", lineHeight: 1.3, marginBottom: 20 }}>
        Obrigada por dividir<br />sua história comigo{primeiro ? `, ${primeiro}` : ""}.
      </h2>
      <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.95rem", color: "var(--muted)", marginBottom: 48, lineHeight: 1.8 }}>
        Nos vemos em breve.{" "}
        <em style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Com calma.</em>
      </p>
      <button className="btn-primary" onClick={onVer}>
        Ver meu prontuário <ArrowRight size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}
