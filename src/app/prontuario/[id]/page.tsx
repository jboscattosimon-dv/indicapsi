"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, Edit3, Save, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PERGUNTAS } from "@/lib/types";

interface ProntuarioData {
  id: string;
  nome: string;
  paciente_nome?: string;
  idade: string;
  motivo: string;
  momento_perdida: string;
  relacao_consigo: string;
  vive_outros: string;
  ocupa_mente: string;
  como_corpo: string;
  recuperar: string;
  escrita_livre: string;
  criado_em: string;
  status: string;
}

function getNome(d: ProntuarioData) {
  return d.nome || d.paciente_nome || "—";
}

function formatDataLonga(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ProntuarioViewPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;
  const docRef  = useRef<HTMLDivElement>(null);

  const [dados,     setDados]     = useState<ProntuarioData | null>(null);
  const [editando,  setEditando]  = useState(false);
  const [editForm,  setEditForm]  = useState<ProntuarioData | null>(null);
  const [exportando,setExportando]= useState(false);
  const [show,      setShow]      = useState(false);

  useEffect(() => {
    const hist: ProntuarioData[] = JSON.parse(localStorage.getItem("indicapsi-historico") || "[]");
    const pron = hist.find(p => p.id === id);
    if (pron) { setDados(pron); setEditForm(pron); }
    setTimeout(() => setShow(true), 120);
  }, [id]);

  const salvar = () => {
    if (!editForm) return;
    const hist: ProntuarioData[] = JSON.parse(localStorage.getItem("indicapsi-historico") || "[]");
    const i = hist.findIndex(p => p.id === id);
    if (i !== -1) { hist[i] = editForm; localStorage.setItem("indicapsi-historico", JSON.stringify(hist)); }
    setDados(editForm);
    setEditando(false);
  };

  const cancelar = () => { setEditForm(dados); setEditando(false); };

  /* ── PDF com jsPDF nativo (texto, não screenshot) ── */
  const exportarPDF = async () => {
    if (!dados) return;
    setExportando(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const W = 210, ML = 20, MR = 20, MT = 24, colW = W - ML - MR;
      let y = MT;
      const nome = getNome(dados);

      const linha = (cor = "#EDE6DC") => {
        pdf.setDrawColor(cor); pdf.setLineWidth(0.3);
        pdf.line(ML, y, W - MR, y); y += 6;
      };

      const novaPage = () => { pdf.addPage(); y = MT; };

      const checkPage = (need: number) => { if (y + need > 272) novaPage(); };

      /* cabeçalho */
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7); pdf.setTextColor("#B5ABA3");
      pdf.text("INDICAPSI  ·  PRONTUÁRIO TERAPÊUTICO", ML, y);
      pdf.text(formatDataCurta(dados.criado_em), W - MR, y, { align: "right" });
      y += 6;
      linha("#D9CEBF");

      /* nome */
      y += 4;
      pdf.setFontSize(28); pdf.setTextColor("#4A3328");
      pdf.setFont("times", "italic");
      pdf.text(nome, ML, y);
      y += 10;

      /* identificação */
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8); pdf.setTextColor("#9B9088");
      pdf.text("NOME", ML, y);
      pdf.text("IDADE", ML + 80, y);
      pdf.text("DATA DO PREENCHIMENTO", ML + 130, y);
      y += 5;
      pdf.setFontSize(10); pdf.setTextColor("#4A3328");
      pdf.text(nome, ML, y);
      pdf.text(dados.idade ? `${dados.idade} anos` : "—", ML + 80, y);
      pdf.text(formatDataLonga(dados.criado_em), ML + 130, y);
      y += 10;
      linha("#EDE6DC");

      /* perguntas */
      const pergsComEscrita = [
        ...PERGUNTAS.map(p => ({ pergunta: p.pergunta, resposta: dados[p.id as keyof ProntuarioData] as string || "" })),
        { pergunta: "Escrita livre", resposta: dados.escrita_livre || "" },
      ];

      pergsComEscrita.forEach((item, i) => {
        checkPage(24);
        y += 4;

        /* número */
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7); pdf.setTextColor("#C4897A");
        const num = i < PERGUNTAS.length ? String(i + 1).padStart(2, "0") : "✦";
        pdf.text(num, ML, y);

        /* linha decorativa */
        pdf.setDrawColor("#EDE6DC"); pdf.setLineWidth(0.2);
        pdf.line(ML + 7, y - 1, W - MR, y - 1);
        y += 6;

        /* pergunta */
        pdf.setFont("times", "italic");
        pdf.setFontSize(11); pdf.setTextColor("#6B4C3B");
        const pergWrapped = pdf.splitTextToSize(item.pergunta, colW);
        checkPage(pergWrapped.length * 5 + 8);
        pdf.text(pergWrapped, ML, y);
        y += pergWrapped.length * 5.5 + 4;

        /* resposta */
        const resp = item.resposta.trim() || "Não respondida.";
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5); pdf.setTextColor("#4A3328");
        const respWrapped = pdf.splitTextToSize(resp, colW);
        respWrapped.forEach((linha: string) => {
          checkPage(6);
          pdf.text(linha, ML, y);
          y += 5.5;
        });
        y += 4;
      });

      /* rodapé de cada página */
      const total = pdf.getNumberOfPages();
      for (let pg = 1; pg <= total; pg++) {
        pdf.setPage(pg);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7); pdf.setTextColor("#CEC8C2");
        pdf.text("indicapsi — documento confidencial", ML, 288);
        pdf.text(`${pg} / ${total}`, W - MR, 288, { align: "right" });
      }

      pdf.save(`prontuario_${nome.replace(/\s+/g, "_")}_${formatDataCurta(dados.criado_em).replace(/\//g, "-")}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setExportando(false);
    }
  };

  if (!dados) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF9F7" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #C4897A", display: "flex", alignItems: "center", justifyContent: "center", animation: "breathe 2s ease-in-out infinite" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4897A" }} />
      </div>
    </div>
  );

  const nome = getNome(dados);

  return (
    <div style={{ minHeight: "100vh", background: "var(--pv-bg)" }}>
      <style>{`
        :root { --pv-bg:#F5F1EC; --pv-surface:#FDFCFA; --pv-border:#E8DDD1; --pv-fg:#4A3328; --pv-muted:#9B9088; --pv-pale:#B5ABA3; --pv-rose:#C4897A; --pv-doc:#FFFFFF; }
        .dark { --pv-bg:#161210; --pv-surface:#1E1814; --pv-border:#2C2320; --pv-fg:#E8DDD1; --pv-muted:#7A6E6A; --pv-pale:#5A4E4A; --pv-rose:#C4897A; --pv-doc:#1A1614; }
        .pv-toolbar { position:sticky; top:0; z-index:50; background:var(--pv-surface); border-bottom:1.5px solid var(--pv-border); }
        .pv-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:0.78rem; font-family:Inter,system-ui,sans-serif; font-weight:400; transition:all 0.18s; }
        .pv-btn-ghost { background:transparent; color:var(--pv-muted); }
        .pv-btn-ghost:hover { background:var(--pv-bg); color:var(--pv-fg); }
        .pv-btn-outline { background:transparent; border:1.5px solid var(--pv-border) !important; color:var(--pv-muted); }
        .pv-btn-outline:hover { border-color:var(--pv-rose) !important; color:var(--pv-rose); }
        .pv-btn-rose { background:#C4897A; color:#fff; }
        .pv-btn-rose:hover { background:#A96B5C; }
        .pv-btn-dark { background:var(--pv-fg); color:var(--pv-surface); }
        .pv-btn-dark:hover { opacity:0.85; }
        .pv-btn-dark:disabled { opacity:0.5; cursor:not-allowed; }
        .pv-edit-area { width:100%; background:transparent; border:none; border-bottom:1.5px solid var(--pv-rose); color:var(--pv-fg); font-family:Inter,system-ui,sans-serif; font-size:0.95rem; font-weight:300; line-height:1.85; padding:8px 0; resize:none; outline:none; }
        @media print {
          .pv-toolbar { display:none !important; }
          .pv-doc { box-shadow:none !important; border:none !important; }
        }
      `}</style>

      {/* ── TOOLBAR ── */}
      <div className="pv-toolbar no-print">
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button className="pv-btn pv-btn-ghost" onClick={() => router.push("/dashboard")} style={{ paddingLeft: 0 }}>
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span>Painel</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {editando ? (
              <>
                <button className="pv-btn pv-btn-outline" onClick={cancelar}>
                  <X size={13} strokeWidth={1.5} /> cancelar
                </button>
                <button className="pv-btn pv-btn-rose" onClick={salvar}>
                  <Save size={13} strokeWidth={1.5} /> salvar
                </button>
              </>
            ) : (
              <>
                <button className="pv-btn pv-btn-ghost" onClick={() => setEditando(true)}>
                  <Edit3 size={13} strokeWidth={1.5} /> editar
                </button>
                <button className="pv-btn pv-btn-ghost" onClick={() => window.print()}>
                  <Printer size={13} strokeWidth={1.5} /> imprimir
                </button>
                <button className="pv-btn pv-btn-dark" onClick={exportarPDF} disabled={exportando}>
                  <Download size={13} strokeWidth={1.5} />
                  {exportando ? "gerando..." : "exportar PDF"}
                </button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── DOCUMENTO ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 28px 80px" }}>
        <div
          ref={docRef}
          className="pv-doc"
          style={{
            background: "var(--pv-doc)",
            borderRadius: 20,
            border: "1.5px solid var(--pv-border)",
            boxShadow: "0 8px 48px rgba(107,76,59,0.08)",
            overflow: "hidden",
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* ── CAPA DO DOCUMENTO ── */}
          <div style={{ background: "#4A3328", padding: "52px 56px 44px", position: "relative", overflow: "hidden" }}>
            {/* Orbs decorativos no header */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(196,137,122,0.15)", filter: "blur(40px)" }} />
            <div style={{ position: "absolute", bottom: -40, left: 0, width: 180, height: 180, borderRadius: "50%", background: "rgba(232,196,187,0.08)", filter: "blur(30px)" }} />

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
                <div>
                  <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                    prontuário terapêutico
                  </p>
                  <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#FAF9F7", lineHeight: 1.15, marginBottom: 0 }}>
                    {nome}
                  </h1>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4897A", marginLeft: "auto", marginBottom: 8 }} />
                  <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                    {formatDataLonga(dados.criado_em)}
                  </p>
                </div>
              </div>

              {/* Chips de info */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <InfoChip label="Nome" valor={nome} />
                {dados.idade && <InfoChip label="Idade" valor={`${dados.idade} anos`} />}
                <InfoChip label="Status" valor="Completo" destaque />
              </div>
            </div>
          </div>

          {/* ── CORPO DO DOCUMENTO ── */}
          <div style={{ padding: "52px 56px" }}>

            {/* Perguntas */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {PERGUNTAS.map((p, i) => {
                const campo = p.id as keyof ProntuarioData;
                const resposta = (editando && editForm ? editForm[campo] : dados[campo]) as string;
                return (
                  <QuestaoBlock
                    key={p.id}
                    numero={String(i + 1).padStart(2, "0")}
                    pergunta={p.pergunta}
                    resposta={resposta}
                    editando={editando}
                    onChange={v => setEditForm(f => f ? { ...f, [campo]: v } : f)}
                    ultimo={false}
                  />
                );
              })}

              {/* Escrita livre */}
              <QuestaoBlock
                numero="✦"
                pergunta="Escrita livre"
                resposta={(editando && editForm ? editForm.escrita_livre : dados.escrita_livre) || ""}
                editando={editando}
                onChange={v => setEditForm(f => f ? { ...f, escrita_livre: v } : f)}
                ultimo
                rows={10}
              />
            </div>

            {/* Rodapé do documento */}
            <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid var(--pv-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "0.78rem", color: "var(--pv-pale)" }}>
                indicapsi — prontuário terapêutico digital
              </p>
              <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.72rem", color: "var(--pv-pale)", letterSpacing: "0.1em" }}>
                documento confidencial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SUB-COMPONENTES ── */

function InfoChip({ label, valor, destaque = false }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div style={{ padding: "6px 14px", borderRadius: 999, background: destaque ? "rgba(196,137,122,0.25)" : "rgba(255,255,255,0.07)", border: `1px solid ${destaque ? "rgba(196,137,122,0.4)" : "rgba(255,255,255,0.1)"}` }}>
      <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: destaque ? "#C4897A" : "rgba(255,255,255,0.4)", marginRight: 6 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: "0.85rem", color: destaque ? "#E8C4BB" : "rgba(255,255,255,0.75)" }}>
        {valor}
      </span>
    </div>
  );
}

function QuestaoBlock({ numero, pergunta, resposta, editando, onChange, ultimo, rows = 5 }: {
  numero: string; pergunta: string; resposta: string;
  editando: boolean; onChange: (v: string) => void;
  ultimo: boolean; rows?: number;
}) {
  return (
    <div style={{ paddingBottom: 44, marginBottom: 44, borderBottom: ultimo ? "none" : "1px solid var(--pv-border)" }}>
      {/* Número + linha */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.72rem", color: "#C4897A", letterSpacing: "0.1em", minWidth: 20 }}>
          {numero}
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--pv-border)" }} />
      </div>

      {/* Pergunta */}
      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "1.1rem", color: "#C4897A", marginBottom: 16, lineHeight: 1.4 }}>
        {pergunta}
      </h3>

      {/* Resposta ou textarea */}
      {editando ? (
        <textarea
          className="pv-edit-area"
          value={resposta}
          onChange={e => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.96rem", color: "var(--pv-fg)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
          {resposta?.trim() || (
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--pv-pale)" }}>
              não respondida
            </span>
          )}
        </p>
      )}
    </div>
  );
}
