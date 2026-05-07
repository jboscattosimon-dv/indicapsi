"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, ArrowRight, Check } from "lucide-react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PERGUNTAS, type ProntuarioForm } from "@/lib/types";
import { salvarProntuario } from "@/lib/supabase";

const ETAPAS_TOTAL = PERGUNTAS.length + 3; // intro + nome/idade + 7 perguntas + escrita livre + final

type Etapa =
  | "intro"
  | "identificacao"
  | "pergunta"
  | "escrita_livre"
  | "finalizando"
  | "concluido";

const MENSAGENS_ENTRE = [
  "Obrigada por confiar.",
  "Você está no lugar certo.",
  "Respire. Continue no seu tempo.",
  "Cada palavra sua importa.",
  "Não existe resposta errada aqui.",
  "Você está fazendo algo muito corajoso.",
  "Estou aqui, ouvindo.",
];

function getMensagem(idx: number) {
  return MENSAGENS_ENTRE[idx % MENSAGENS_ENTRE.length];
}

const formInicial: ProntuarioForm = {
  nome: "",
  idade: "",
  motivo: "",
  momento_perdida: "",
  relacao_consigo: "",
  vive_outros: "",
  ocupa_mente: "",
  como_corpo: "",
  recuperar: "",
  escrita_livre: "",
};

export default function ProntuarioPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [form, setForm] = useState<ProntuarioForm>(formInicial);
  const [animando, setAnimando] = useState(false);
  const [animDir, setAnimDir] = useState<"in" | "out">("in");
  const [salvandoAuto, setSalvandoAuto] = useState(false);
  const [prontuarioId, setProntuarioId] = useState<string | null>(null);

  // Salvar localmente a cada mudança
  useEffect(() => {
    localStorage.setItem("indicapsi-draft", JSON.stringify(form));
    setSalvandoAuto(true);
    const t = setTimeout(() => setSalvandoAuto(false), 1200);
    return () => clearTimeout(t);
  }, [form]);

  // Carregar rascunho ao montar
  useEffect(() => {
    const draft = localStorage.getItem("indicapsi-draft");
    if (draft) {
      try { setForm(JSON.parse(draft)); } catch {}
    }
  }, []);

  const progresso = () => {
    if (etapa === "intro") return 0;
    if (etapa === "identificacao") return 10;
    if (etapa === "pergunta") return 15 + (perguntaIdx / PERGUNTAS.length) * 65;
    if (etapa === "escrita_livre") return 85;
    if (etapa === "finalizando" || etapa === "concluido") return 100;
    return 0;
  };

  const transicionar = useCallback((fn: () => void) => {
    setAnimDir("out");
    setAnimando(true);
    setTimeout(() => {
      fn();
      setAnimDir("in");
      setTimeout(() => setAnimando(false), 50);
    }, 350);
  }, []);

  const avancar = () => {
    if (etapa === "intro") {
      transicionar(() => setEtapa("identificacao"));
    } else if (etapa === "identificacao") {
      if (!form.nome.trim()) return;
      transicionar(() => { setEtapa("pergunta"); setPerguntaIdx(0); });
    } else if (etapa === "pergunta") {
      if (perguntaIdx < PERGUNTAS.length - 1) {
        transicionar(() => setPerguntaIdx((i) => i + 1));
      } else {
        transicionar(() => setEtapa("escrita_livre"));
      }
    } else if (etapa === "escrita_livre") {
      transicionar(() => setEtapa("finalizando"));
      setTimeout(() => {
        gerarProntuario();
      }, 600);
    }
  };

  const voltar = () => {
    if (etapa === "identificacao") {
      transicionar(() => setEtapa("intro"));
    } else if (etapa === "pergunta") {
      if (perguntaIdx > 0) {
        transicionar(() => setPerguntaIdx((i) => i - 1));
      } else {
        transicionar(() => setEtapa("identificacao"));
      }
    } else if (etapa === "escrita_livre") {
      transicionar(() => { setEtapa("pergunta"); setPerguntaIdx(PERGUNTAS.length - 1); });
    }
  };

  const gerarProntuario = async () => {
    const id = `pron_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const dados = {
      id,
      paciente_nome: form.nome,
      idade:            form.idade,
      motivo:           form.motivo,
      momento_perdida:  form.momento_perdida,
      relacao_consigo:  form.relacao_consigo,
      vive_outros:      form.vive_outros,
      ocupa_mente:      form.ocupa_mente,
      como_corpo:       form.como_corpo,
      recuperar:        form.recuperar,
      escrita_livre:    form.escrita_livre,
      criado_em:        new Date().toISOString(),
      status:           "completo",
    };

    // Salvar localmente (sempre funciona, mesmo sem banco)
    const local = {
      ...dados,
      nome: form.nome,
    };
    const historico = JSON.parse(localStorage.getItem("indicapsi-historico") || "[]");
    historico.unshift(local);
    localStorage.setItem("indicapsi-historico", JSON.stringify(historico));
    localStorage.removeItem("indicapsi-draft");

    // Salvar no Supabase (silencioso em caso de erro)
    try {
      await salvarProntuario(dados);
    } catch (e) {
      console.warn("Supabase offline, salvo apenas localmente:", e);
    }

    setProntuarioId(id);

    setTimeout(() => {
      setEtapa("concluido");
    }, 2000);
  };

  const verProntuario = () => {
    if (prontuarioId) {
      router.push(`/prontuario/${prontuarioId}`);
    }
  };

  const animStyle = {
    opacity: animando ? 0 : 1,
    transform: animando
      ? animDir === "out" ? "translateY(16px)" : "translateY(-16px)"
      : "translateY(0)",
    transition: "opacity 0.35s ease, transform 0.35s ease",
  };

  return (
    <main className="relative min-h-screen flex flex-col bg-[#FAF9F7] dark:bg-[#1A1614]">
      {/* Orb sutil */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[300px] h-[300px] opacity-10 dark:opacity-5"
        style={{
          background: "radial-gradient(circle, #E8C4BB 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-[#EDE6DC] dark:border-[#2C2320]">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-[#9B9088] hover:text-[#C4897A] transition-colors"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.12em" }}
        >
          ← indicapsi
        </button>

        <div className="flex items-center gap-4">
          {/* Salvamento automático */}
          <span
            className="text-xs transition-all duration-500"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              color: salvandoAuto ? "#C4897A" : "#CEC8C2",
            }}
          >
            {salvandoAuto ? "salvando..." : "salvo"}
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Barra de progresso */}
      <div className="progress-track w-full">
        <div className="progress-fill" style={{ width: `${progresso()}%` }} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div
          className="w-full max-w-xl"
          style={animStyle}
        >
          {etapa === "intro" && <EtapaIntro onAvancar={avancar} />}
          {etapa === "identificacao" && (
            <EtapaIdentificacao form={form} setForm={setForm} onAvancar={avancar} onVoltar={voltar} />
          )}
          {etapa === "pergunta" && (
            <EtapaPergunta
              pergunta={PERGUNTAS[perguntaIdx]}
              idx={perguntaIdx}
              total={PERGUNTAS.length}
              value={form[PERGUNTAS[perguntaIdx].id as keyof ProntuarioForm]}
              onChange={(v) => setForm((f) => ({ ...f, [PERGUNTAS[perguntaIdx].id]: v }))}
              onAvancar={avancar}
              onVoltar={voltar}
              mensagem={getMensagem(perguntaIdx)}
            />
          )}
          {etapa === "escrita_livre" && (
            <EtapaEscritaLivre
              value={form.escrita_livre}
              onChange={(v) => setForm((f) => ({ ...f, escrita_livre: v }))}
              onAvancar={avancar}
              onVoltar={voltar}
            />
          )}
          {etapa === "finalizando" && <EtapaFinalizando />}
          {etapa === "concluido" && <EtapaConcluido nome={form.nome} onVer={verProntuario} />}
        </div>
      </div>

      <MusicPlayer />
    </main>
  );
}

/* ────── SUB-COMPONENTES ────── */

function EtapaIntro({ onAvancar }: { onAvancar: () => void }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px w-8 bg-[#D9CEBF] dark:bg-[#3D302C]" />
        <div className="w-1 h-1 rounded-full bg-[#C4897A]" />
        <div className="h-px w-8 bg-[#D9CEBF] dark:bg-[#3D302C]" />
      </div>

      <p
        className="text-xs uppercase tracking-widest text-[#B5ABA3] mb-6"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.2em" }}
      >
        prontuário inicial
      </p>

      <h2
        className="text-3xl sm:text-4xl text-[#4A3328] dark:text-[#E8DDD1] mb-5 leading-snug"
        style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
      >
        Antes de começarmos,
        <br />
        quero te conhecer.
      </h2>

      <p
        className="text-[#9B9088] dark:text-[#9B9088] mb-12 leading-relaxed max-w-sm mx-auto"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "0.95rem" }}
      >
        Este não é um formulário. É um espaço de escuta.
        Responda no seu tempo, com suas palavras.
        Não há resposta certa.
      </p>

      <button
        onClick={onAvancar}
        className="
          inline-flex items-center gap-3 px-8 py-3.5 rounded-full
          bg-[#4A3328] dark:bg-[#C4897A] text-[#FAF9F7] dark:text-white
          text-sm hover:bg-[#6B4C3B] dark:hover:bg-[#A96B5C]
          transition-all duration-300 hover:shadow-[0_8px_24px_rgba(196,137,122,0.25)]
          hover:-translate-y-0.5
        "
        style={{ fontFamily: "var(--font-inter)", fontWeight: 400, letterSpacing: "0.08em" }}
      >
        Estou pronta
        <ArrowRight size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function EtapaIdentificacao({
  form,
  setForm,
  onAvancar,
  onVoltar,
}: {
  form: ProntuarioForm;
  setForm: React.Dispatch<React.SetStateAction<ProntuarioForm>>;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  return (
    <div>
      <p
        className="text-xs uppercase tracking-widest text-[#B5ABA3] mb-8 text-center"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.2em" }}
      >
        para começar
      </p>

      <div className="space-y-8">
        <div className="group">
          <label
            className="block text-xs uppercase tracking-widest text-[#B5ABA3] mb-3"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.16em" }}
          >
            como você se chama?
          </label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Seu nome..."
            autoFocus
            className="
              w-full bg-transparent border-b border-[#D9CEBF] dark:border-[#3D302C]
              focus:border-[#C4897A] dark:focus:border-[#C4897A]
              text-[#4A3328] dark:text-[#E8DDD1] placeholder-[#CEC8C2] dark:placeholder-[#4A3328]
              py-3 text-lg transition-colors duration-200
            "
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
            onKeyDown={(e) => e.key === "Enter" && form.nome && onAvancar()}
          />
        </div>

        <div className="group">
          <label
            className="block text-xs uppercase tracking-widest text-[#B5ABA3] mb-3"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.16em" }}
          >
            quantos anos você tem?
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.idade}
            onChange={(e) => setForm((f) => ({ ...f, idade: e.target.value }))}
            placeholder="Sua idade..."
            className="
              w-full bg-transparent border-b border-[#D9CEBF] dark:border-[#3D302C]
              focus:border-[#C4897A] dark:focus:border-[#C4897A]
              text-[#4A3328] dark:text-[#E8DDD1] placeholder-[#CEC8C2] dark:placeholder-[#4A3328]
              py-3 text-lg transition-colors duration-200
            "
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-12">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-sm text-[#B5ABA3] hover:text-[#9B9088] transition-colors"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          voltar
        </button>
        <button
          onClick={onAvancar}
          disabled={!form.nome.trim()}
          className="
            flex items-center gap-2 px-6 py-3 rounded-full text-sm
            bg-[#C4897A] text-white hover:bg-[#A96B5C]
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-200 hover:shadow-[0_4px_16px_rgba(196,137,122,0.3)]
          "
          style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
        >
          continuar
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function EtapaPergunta({
  pergunta,
  idx,
  total,
  value,
  onChange,
  onAvancar,
  onVoltar,
  mensagem,
}: {
  pergunta: (typeof PERGUNTAS)[0];
  idx: number;
  total: number;
  value: string;
  onChange: (v: string) => void;
  onAvancar: () => void;
  onVoltar: () => void;
  mensagem: string;
}) {
  return (
    <div>
      {/* Contador */}
      <div className="flex items-center gap-3 mb-8">
        <span
          className="text-xs text-[#B5ABA3] tabular-nums"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
        >
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="flex-1 h-px bg-[#EDE6DC] dark:bg-[#2C2320]" />
        <span
          className="text-xs italic text-[#C4897A]"
          style={{ fontFamily: "var(--font-playfair)", fontWeight: 400 }}
        >
          {mensagem}
        </span>
      </div>

      {/* Pergunta */}
      <h2
        className="text-2xl sm:text-3xl text-[#4A3328] dark:text-[#E8DDD1] mb-4 leading-snug"
        style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
      >
        {pergunta.pergunta}
      </h2>

      <p
        className="text-xs text-[#B5ABA3] mb-6"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
      >
        {pergunta.hint}
      </p>

      {/* Área de texto */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={pergunta.placeholder}
        rows={6}
        autoFocus
        className="
          w-full bg-transparent border border-[#EDE6DC] dark:border-[#2C2320]
          focus:border-[#C4897A] dark:focus:border-[#C4897A]
          rounded-xl p-5 text-[#4A3328] dark:text-[#E8DDD1]
          placeholder-[#CEC8C2] dark:placeholder-[#3D302C]
          leading-relaxed transition-colors duration-200
          hover:border-[#D9CEBF] dark:hover:border-[#3D302C]
        "
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 300,
          fontSize: "0.95rem",
          lineHeight: "1.85",
        }}
      />

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-sm text-[#B5ABA3] hover:text-[#9B9088] transition-colors"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          voltar
        </button>
        <button
          onClick={onAvancar}
          className="
            flex items-center gap-2 px-6 py-3 rounded-full text-sm
            bg-[#C4897A] text-white hover:bg-[#A96B5C]
            transition-all duration-200 hover:shadow-[0_4px_16px_rgba(196,137,122,0.3)]
          "
          style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
        >
          {idx === total - 1 ? "última parte" : "próxima"}
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function EtapaEscritaLivre({
  value,
  onChange,
  onAvancar,
  onVoltar,
}: {
  value: string;
  onChange: (v: string) => void;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  return (
    <div>
      <p
        className="text-xs uppercase tracking-widest text-[#B5ABA3] mb-6 text-center"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.2em" }}
      >
        espaço livre
      </p>

      <h2
        className="text-2xl sm:text-3xl text-[#4A3328] dark:text-[#E8DDD1] mb-3 leading-snug text-center"
        style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
      >
        Escreva como se ninguém
        <br />
        fosse te interromper.
      </h2>

      <p
        className="text-center text-xs text-[#B5ABA3] mb-8"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
      >
        Pode ser qualquer coisa. Uma lembrança, um desabafo, uma frase solta.
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tudo que vier..."
        rows={10}
        autoFocus
        className="
          w-full bg-transparent border border-[#EDE6DC] dark:border-[#2C2320]
          focus:border-[#C4897A] dark:focus:border-[#C4897A]
          rounded-xl p-5 text-[#4A3328] dark:text-[#E8DDD1]
          placeholder-[#CEC8C2] dark:placeholder-[#3D302C]
          leading-relaxed transition-colors duration-200
        "
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 300,
          fontSize: "0.95rem",
          lineHeight: "1.85",
        }}
      />

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-sm text-[#B5ABA3] hover:text-[#9B9088] transition-colors"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          voltar
        </button>
        <button
          onClick={onAvancar}
          className="
            flex items-center gap-2 px-6 py-3 rounded-full text-sm
            bg-[#4A3328] dark:bg-[#C4897A] text-[#FAF9F7] dark:text-white
            hover:bg-[#6B4C3B] dark:hover:bg-[#A96B5C]
            transition-all duration-200 hover:shadow-[0_4px_16px_rgba(196,137,122,0.25)]
          "
          style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
        >
          finalizar
          <Check size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function EtapaFinalizando() {
  return (
    <div className="text-center py-12">
      <div
        className="w-12 h-12 rounded-full border border-[#C4897A] mx-auto mb-8 flex items-center justify-center"
        style={{ animation: "breathe 2s ease-in-out infinite" }}
      >
        <div className="w-3 h-3 rounded-full bg-[#C4897A]" style={{ animation: "breathe 2s ease-in-out infinite 0.5s" }} />
      </div>
      <p
        className="text-[#9B9088] text-sm"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.06em" }}
      >
        Guardando sua história com cuidado...
      </p>
    </div>
  );
}

function EtapaConcluido({ nome, onVer }: { nome: string; onVer: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 200); }, []);

  return (
    <div
      className="text-center"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="h-px w-12 bg-[#D9CEBF] dark:bg-[#3D302C]" />
        <div className="w-2 h-2 rounded-full bg-[#C4897A]" />
        <div className="h-px w-12 bg-[#D9CEBF] dark:bg-[#3D302C]" />
      </div>

      <h2
        className="text-3xl sm:text-4xl text-[#4A3328] dark:text-[#E8DDD1] mb-5 leading-snug"
        style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
      >
        Obrigada por dividir
        <br />
        sua história comigo{nome ? `, ${nome.split(" ")[0]}` : ""}.
      </h2>

      <p
        className="text-[#9B9088] mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "0.95rem" }}
      >
        Nos vemos em breve.{" "}
        <span className="italic" style={{ fontFamily: "var(--font-playfair)" }}>
          Com calma.
        </span>
      </p>

      <button
        onClick={onVer}
        className="
          inline-flex items-center gap-3 px-8 py-3.5 rounded-full
          border border-[#C4897A] text-[#C4897A]
          hover:bg-[#C4897A] hover:text-white
          text-sm transition-all duration-300
        "
        style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
      >
        Ver meu prontuário
        <ArrowRight size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}
