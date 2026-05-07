"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Printer, ArrowLeft, Edit3, Save, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PERGUNTAS } from "@/lib/types";

interface ProntuarioData {
  id: string;
  nome: string;
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

const CAMPO_MAP: Record<string, string> = {
  motivo: "motivo",
  momento_perdida: "momento_perdida",
  relacao_consigo: "relacao_consigo",
  vive_outros: "vive_outros",
  ocupa_mente: "ocupa_mente",
  como_corpo: "como_corpo",
  recuperar: "recuperar",
};

export default function ProntuarioViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [dados, setDados] = useState<ProntuarioData | null>(null);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState<ProntuarioData | null>(null);
  const [exportando, setExportando] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const historico: ProntuarioData[] = JSON.parse(
      localStorage.getItem("indicapsi-historico") || "[]"
    );
    const pron = historico.find((p) => p.id === id);
    if (pron) {
      setDados(pron);
      setEditForm(pron);
    }
    setTimeout(() => setShow(true), 100);
  }, [id]);

  const salvarEdicao = () => {
    if (!editForm) return;
    const historico: ProntuarioData[] = JSON.parse(
      localStorage.getItem("indicapsi-historico") || "[]"
    );
    const idx = historico.findIndex((p) => p.id === id);
    if (idx !== -1) {
      historico[idx] = { ...editForm, status: "completo" };
      localStorage.setItem("indicapsi-historico", JSON.stringify(historico));
    }
    setDados(editForm);
    setEditando(false);
  };

  const exportarPDF = async () => {
    setExportando(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      if (!printRef.current) return;

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: "#FAF9F7",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;

      let y = 10;
      let remainH = imgH;
      let srcY = 0;

      while (remainH > 0) {
        const sliceH = Math.min(pageH - 20, remainH);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceH / imgW) * canvas.width;

        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, srcY * (canvas.width / imgW),
            canvas.width, sliceCanvas.height,
            0, 0,
            canvas.width, sliceCanvas.height
          );
          pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 10, y, imgW, sliceH);
        }

        remainH -= sliceH;
        srcY += sliceH;

        if (remainH > 0) {
          pdf.addPage();
          y = 10;
        }
      }

      pdf.save(`prontuario_${dados?.nome?.replace(/\s+/g, "_") || "paciente"}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setExportando(false);
    }
  };

  const imprimir = () => window.print();

  const formatarData = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] dark:bg-[#1A1614]">
        <div
          className="w-8 h-8 rounded-full border border-[#C4897A] flex items-center justify-center"
          style={{ animation: "breathe 2s ease-in-out infinite" }}
        >
          <div className="w-2 h-2 rounded-full bg-[#C4897A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#1A1614]">
      {/* Toolbar no-print */}
      <div className="no-print sticky top-0 z-50 border-b border-[#EDE6DC] dark:border-[#2C2320] glass">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[#9B9088] hover:text-[#C4897A] transition-colors"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            painel
          </button>

          <div className="flex items-center gap-3">
            {editando ? (
              <>
                <button
                  onClick={() => setEditando(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-[#9B9088] hover:text-[#4A3328] transition-colors border border-[#EDE6DC] dark:border-[#3D302C]"
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
                >
                  <X size={13} strokeWidth={2} />
                  cancelar
                </button>
                <button
                  onClick={salvarEdicao}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs bg-[#C4897A] text-white hover:bg-[#A96B5C] transition-colors"
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
                >
                  <Save size={13} strokeWidth={2} />
                  salvar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-[#9B9088] hover:text-[#4A3328] dark:hover:text-[#E8DDD1] transition-colors"
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
                >
                  <Edit3 size={13} strokeWidth={1.5} />
                  editar
                </button>
                <button
                  onClick={imprimir}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-[#9B9088] hover:text-[#4A3328] dark:hover:text-[#E8DDD1] transition-colors"
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
                >
                  <Printer size={13} strokeWidth={1.5} />
                  imprimir
                </button>
                <button
                  onClick={exportarPDF}
                  disabled={exportando}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs bg-[#4A3328] dark:bg-[#C4897A] text-white hover:bg-[#6B4C3B] dark:hover:bg-[#A96B5C] transition-colors disabled:opacity-60"
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
                >
                  <Download size={13} strokeWidth={1.5} />
                  {exportando ? "gerando..." : "exportar PDF"}
                </button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Documento */}
      <div
        ref={printRef}
        className="max-w-3xl mx-auto px-6 sm:px-12 py-16"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Cabeçalho do documento */}
        <div className="mb-14 pb-10 border-b border-[#EDE6DC] dark:border-[#2C2320]">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p
                className="text-xs uppercase tracking-widest text-[#B5ABA3] mb-2"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.2em" }}
              >
                prontuário terapêutico
              </p>
              <h1
                className="text-4xl sm:text-5xl text-[#4A3328] dark:text-[#E8DDD1] leading-tight"
                style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
              >
                {dados.nome}
              </h1>
            </div>
            <div className="text-right">
              <div className="w-2 h-2 rounded-full bg-[#C4897A] ml-auto mb-2" />
              <p
                className="text-xs text-[#B5ABA3]"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
              >
                {formatarData(dados.criado_em)}
              </p>
            </div>
          </div>

          {/* Identificação */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p
                className="text-xs uppercase tracking-widest text-[#CEC8C2] mb-1"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.14em" }}
              >
                nome
              </p>
              <p
                className="text-[#4A3328] dark:text-[#E8DDD1]"
                style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
              >
                {dados.nome}
              </p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-widest text-[#CEC8C2] mb-1"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.14em" }}
              >
                idade
              </p>
              <p
                className="text-[#4A3328] dark:text-[#E8DDD1]"
                style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
              >
                {dados.idade} anos
              </p>
            </div>
          </div>
        </div>

        {/* Questões terapêuticas */}
        <div className="space-y-14">
          {PERGUNTAS.map((p, i) => {
            const campo = p.id as keyof typeof dados;
            const resposta = editando && editForm
              ? (editForm[campo as keyof ProntuarioData] as string)
              : (dados[campo as keyof ProntuarioData] as string);

            return (
              <div key={p.id}>
                {/* Número + separador */}
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className="text-xs tabular-nums text-[#C4897A]"
                    style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 h-px bg-[#EDE6DC] dark:bg-[#2C2320]" />
                </div>

                <h3
                  className="text-lg text-[#6B4C3B] dark:text-[#C4897A] mb-4 italic"
                  style={{ fontFamily: "var(--font-playfair)", fontWeight: 400 }}
                >
                  {p.pergunta}
                </h3>

                {editando && editForm ? (
                  <textarea
                    value={editForm[campo as keyof ProntuarioData] as string}
                    onChange={(e) =>
                      setEditForm((f) => f ? { ...f, [campo]: e.target.value } : f)
                    }
                    rows={4}
                    className="
                      w-full bg-transparent border-b border-[#C4897A]
                      text-[#4A3328] dark:text-[#E8DDD1]
                      py-2 leading-relaxed transition-colors
                    "
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "0.95rem",
                      lineHeight: "1.85",
                    }}
                  />
                ) : (
                  <p
                    className="text-[#4A3328] dark:text-[#CEC8C2] leading-relaxed whitespace-pre-wrap"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "0.95rem",
                      lineHeight: "1.85",
                    }}
                  >
                    {resposta || (
                      <span className="text-[#CEC8C2] italic" style={{ fontFamily: "var(--font-playfair)" }}>
                        não respondida
                      </span>
                    )}
                  </p>
                )}
              </div>
            );
          })}

          {/* Escrita livre */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span
                className="text-xs text-[#C4897A]"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
              >
                ✦
              </span>
              <div className="flex-1 h-px bg-[#EDE6DC] dark:bg-[#2C2320]" />
            </div>

            <h3
              className="text-lg text-[#6B4C3B] dark:text-[#C4897A] mb-4 italic"
              style={{ fontFamily: "var(--font-playfair)", fontWeight: 400 }}
            >
              Escrita livre
            </h3>

            {editando && editForm ? (
              <textarea
                value={editForm.escrita_livre}
                onChange={(e) =>
                  setEditForm((f) => f ? { ...f, escrita_livre: e.target.value } : f)
                }
                rows={8}
                className="
                  w-full bg-transparent border-b border-[#C4897A]
                  text-[#4A3328] dark:text-[#E8DDD1]
                  py-2 leading-relaxed
                "
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  lineHeight: "1.85",
                }}
              />
            ) : (
              <p
                className="text-[#4A3328] dark:text-[#CEC8C2] leading-relaxed whitespace-pre-wrap"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  lineHeight: "1.85",
                }}
              >
                {dados.escrita_livre || (
                  <span className="text-[#CEC8C2] italic" style={{ fontFamily: "var(--font-playfair)" }}>
                    não preenchida
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Rodapé do documento */}
        <div className="mt-20 pt-8 border-t border-[#EDE6DC] dark:border-[#2C2320]">
          <div className="flex items-center justify-between">
            <p
              className="text-xs text-[#CEC8C2] italic"
              style={{ fontFamily: "var(--font-playfair)", fontWeight: 400 }}
            >
              indicapsi — prontuário terapêutico digital
            </p>
            <p
              className="text-xs text-[#CEC8C2]"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
            >
              documento confidencial
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
