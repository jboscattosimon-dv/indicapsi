"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Download, Trash2, LogOut, Plus, Calendar, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ProntuarioItem {
  id: string;
  nome: string;
  idade: string;
  criado_em: string;
  status: string;
  motivo: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [prontuarios, setProntuarios] = useState<ProntuarioItem[]>([]);
  const [busca, setBusca] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar auth básica
    const auth = localStorage.getItem("indicapsi-auth");
    if (!auth) { router.push("/login"); return; }

    const historico = JSON.parse(localStorage.getItem("indicapsi-historico") || "[]");
    setProntuarios(historico);
    setTimeout(() => setShow(true), 100);
  }, [router]);

  const filtrados = prontuarios.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const deletar = (id: string) => {
    const novo = prontuarios.filter((p) => p.id !== id);
    setProntuarios(novo);
    localStorage.setItem("indicapsi-historico", JSON.stringify(novo));
  };

  const sair = () => {
    localStorage.removeItem("indicapsi-auth");
    router.push("/login");
  };

  const formatarData = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatarHora = (iso: string) => {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#1A1614]">
      {/* Orb */}
      <div
        className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] opacity-10 dark:opacity-5"
        style={{ background: "radial-gradient(circle, #E8C4BB 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* Sidebar / Nav */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-[#EDE6DC] dark:border-[#2C2320] px-6 py-8 bg-[#FAF9F7] dark:bg-[#1A1614]">
          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-widest text-[#9B9088] mb-1"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300, letterSpacing: "0.18em" }}
            >
              indicapsi
            </p>
            <p
              className="text-sm text-[#4A3328] dark:text-[#E8DDD1]"
              style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
            >
              área da psicóloga
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            <SideItem icon={<FileText size={15} strokeWidth={1.5} />} label="Prontuários" active />
            <SideItem
              icon={<Plus size={15} strokeWidth={1.5} />}
              label="Novo prontuário"
              onClick={() => {
                localStorage.removeItem("indicapsi-draft");
                router.push("/prontuario");
              }}
            />
          </nav>

          <div className="space-y-2">
            <ThemeToggle className="w-full justify-start px-3 rounded-lg" />
            <button
              onClick={sair}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9B9088] hover:text-[#C4897A] hover:bg-[#F0EBE3] dark:hover:bg-[#231C1A] transition-colors"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
            >
              <LogOut size={15} strokeWidth={1.5} />
              sair
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Top bar mobile */}
          <div className="md:hidden flex items-center justify-between px-6 py-5 border-b border-[#EDE6DC] dark:border-[#2C2320]">
            <span
              className="text-sm text-[#9B9088]"
              style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
            >
              indicapsi
            </span>
            <div className="flex gap-2">
              <ThemeToggle />
              <button onClick={sair} className="text-[#9B9088] hover:text-[#C4897A] transition-colors p-2">
                <LogOut size={15} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div
            className="px-6 sm:px-10 py-10 max-w-4xl mx-auto"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            {/* Header */}
            <div className="mb-10">
              <h1
                className="text-3xl sm:text-4xl text-[#4A3328] dark:text-[#E8DDD1] mb-2"
                style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
              >
                Prontuários
              </h1>
              <p
                className="text-sm text-[#9B9088]"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
              >
                {filtrados.length} {filtrados.length === 1 ? "registro" : "registros"}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-4 mb-8">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search
                  size={15}
                  strokeWidth={1.5}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5ABA3]"
                />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="
                    w-full pl-11 pr-4 py-3 rounded-xl
                    bg-white dark:bg-[#231C1A]
                    border border-[#EDE6DC] dark:border-[#2C2320]
                    focus:border-[#C4897A] dark:focus:border-[#C4897A]
                    text-[#4A3328] dark:text-[#E8DDD1] placeholder-[#CEC8C2]
                    text-sm transition-colors
                  "
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
                />
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("indicapsi-draft");
                  router.push("/prontuario");
                }}
                className="
                  flex items-center gap-2 px-5 py-3 rounded-xl text-sm
                  bg-[#4A3328] dark:bg-[#C4897A] text-white
                  hover:bg-[#6B4C3B] dark:hover:bg-[#A96B5C]
                  transition-colors whitespace-nowrap
                "
                style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
              >
                <Plus size={15} strokeWidth={2} />
                novo
              </button>
            </div>

            {/* Lista */}
            {filtrados.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-full border border-[#EDE6DC] dark:border-[#2C2320] flex items-center justify-center mx-auto mb-5">
                  <FileText size={20} strokeWidth={1} className="text-[#CEC8C2]" />
                </div>
                <p
                  className="text-[#B5ABA3] mb-2"
                  style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 400 }}
                >
                  {busca ? "Nenhuma paciente encontrada." : "Nenhum prontuário ainda."}
                </p>
                {!busca && (
                  <button
                    onClick={() => {
                      localStorage.removeItem("indicapsi-draft");
                      router.push("/prontuario");
                    }}
                    className="text-xs text-[#C4897A] hover:text-[#A96B5C] transition-colors mt-2"
                    style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
                  >
                    Criar o primeiro prontuário →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtrados.map((p, i) => (
                  <div
                    key={p.id}
                    className="group card-hover"
                    style={{
                      opacity: show ? 1 : 0,
                      transform: show ? "translateY(0)" : "translateY(12px)",
                      transition: `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`,
                    }}
                  >
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-[#231C1A] border border-[#EDE6DC] dark:border-[#2C2320] hover:border-[#D9CEBF] dark:hover:border-[#3D302C]">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#F0EBE3] dark:bg-[#2C2320] flex items-center justify-center flex-shrink-0">
                        <span
                          className="text-sm text-[#C4897A]"
                          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
                        >
                          {p.nome.charAt(0)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-0.5">
                          <p
                            className="text-[#4A3328] dark:text-[#E8DDD1] truncate"
                            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 500 }}
                          >
                            {p.nome}
                          </p>
                          {p.idade && (
                            <span
                              className="text-xs text-[#B5ABA3] flex-shrink-0"
                              style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
                            >
                              {p.idade} anos
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-[#CEC8C2]" style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}>
                            <Calendar size={11} strokeWidth={1.5} />
                            {formatarData(p.criado_em)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#CEC8C2]" style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}>
                            <Clock size={11} strokeWidth={1.5} />
                            {formatarHora(p.criado_em)}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/prontuario/${p.id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9B9088] hover:text-[#4A3328] dark:hover:text-[#E8DDD1] hover:bg-[#F0EBE3] dark:hover:bg-[#2C2320] transition-colors"
                          aria-label="Ver prontuário"
                        >
                          <FileText size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => deletar(p.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9B9088] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          aria-label="Excluir prontuário"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Link de acesso */}
                      <button
                        onClick={() => router.push(`/prontuario/${p.id}`)}
                        className="text-xs text-[#C4897A] hover:text-[#A96B5C] transition-colors flex-shrink-0 ml-1"
                        style={{ fontFamily: "var(--font-inter)", fontWeight: 400 }}
                      >
                        abrir →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SideItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors
        ${active
          ? "bg-[#F0EBE3] dark:bg-[#2C2320] text-[#4A3328] dark:text-[#E8DDD1]"
          : "text-[#9B9088] hover:text-[#4A3328] dark:hover:text-[#E8DDD1] hover:bg-[#F0EBE3] dark:hover:bg-[#231C1A]"
        }
      `}
      style={{ fontFamily: "var(--font-inter)", fontWeight: active ? 400 : 300 }}
    >
      {icon}
      {label}
    </button>
  );
}
