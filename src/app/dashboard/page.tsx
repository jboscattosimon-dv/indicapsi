"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarProntuarios, deletarProntuario as deletarSupabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Plus, FileText, Trash2, LogOut, ChevronRight, Moon, Sun } from "lucide-react";

interface ProntuarioItem {
  id: string;
  nome: string;
  paciente_nome?: string;
  idade: string;
  criado_em: string;
  status: string;
  motivo: string;
}

function getNome(p: ProntuarioItem) {
  return p.nome || p.paciente_nome || "—";
}

function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const CORES = ["#C4897A", "#A07060", "#8B5E4E", "#9B9088", "#6B4C3B"];

function corAvatar(nome: string) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % CORES.length;
  return CORES[h];
}

export default function DashboardPage() {
  const router = useRouter();
  const [lista, setLista] = useState<ProntuarioItem[]>([]);
  const [busca, setBusca] = useState("");
  const [show, setShow] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("indicapsi-auth");
    if (!auth) { router.push("/login"); return; }

    const local: ProntuarioItem[] = JSON.parse(localStorage.getItem("indicapsi-historico") || "[]");
    setLista(local);

    listarProntuarios()
      .then(remoto => {
        if (!remoto?.length) return;
        const parsed: ProntuarioItem[] = remoto.map(r => ({
          id: r.id, nome: r.paciente_nome ?? "", paciente_nome: r.paciente_nome,
          idade: r.idade ?? "", criado_em: r.criado_em ?? new Date().toISOString(),
          status: r.status ?? "completo", motivo: r.motivo ?? "",
        }));
        const ids = new Set(parsed.map(r => r.id));
        const soLocal = local.filter(l => !ids.has(l.id));
        setLista([...parsed, ...soLocal]);
      })
      .catch(() => {});

    setTimeout(() => setShow(true), 80);
  }, [router]);

  const filtrados = lista.filter(p => getNome(p).toLowerCase().includes(busca.toLowerCase()));

  const deletar = async (id: string) => {
    setDeletandoId(id);
    setTimeout(async () => {
      const novo = lista.filter(p => p.id !== id);
      setLista(novo);
      localStorage.setItem("indicapsi-historico", JSON.stringify(novo));
      try { await deletarSupabase(id); } catch {}
      setDeletandoId(null);
    }, 300);
  };

  const novoForm = () => {
    localStorage.removeItem("indicapsi-draft");
    router.push("/prontuario");
  };

  const sair = () => {
    localStorage.removeItem("indicapsi-auth");
    router.push("/login");
  };

  const hoje = lista.filter(p => {
    const d = new Date(p.criado_em);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--dash-bg)", display: "flex", flexDirection: "column" }}>
      <style>{`
        :root {
          --dash-bg: #F5F1EC;
          --dash-surface: #FDFCFA;
          --dash-border: #E8DDD1;
          --dash-muted: #9B9088;
          --dash-fg: #4A3328;
          --dash-rose: #C4897A;
          --dash-rose-deep: #A96B5C;
          --dash-card: #FFFFFF;
        }
        .dark {
          --dash-bg: #161210;
          --dash-surface: #1E1814;
          --dash-border: #2C2320;
          --dash-muted: #7A6E6A;
          --dash-fg: #E8DDD1;
          --dash-rose: #C4897A;
          --dash-rose-deep: #A96B5C;
          --dash-card: #231C1A;
        }
        .dash-input {
          background: var(--dash-card);
          border: 1.5px solid var(--dash-border);
          border-radius: 12px;
          padding: 11px 16px 11px 42px;
          font-size: 0.875rem;
          font-family: Inter, system-ui, sans-serif;
          font-weight: 300;
          color: var(--dash-fg);
          width: 100%;
          transition: border-color 0.2s;
          outline: none;
        }
        .dash-input::placeholder { color: #CEC8C2; }
        .dash-input:focus { border-color: var(--dash-rose); }
        .dash-card {
          background: var(--dash-card);
          border: 1.5px solid var(--dash-border);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .dash-card:hover {
          border-color: #D9CEBF;
          box-shadow: 0 4px 24px rgba(107,76,59,0.08);
          transform: translateY(-1px);
        }
        .dark .dash-card:hover { border-color: #3D302C; }
        .btn-novo {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--dash-fg); color: var(--dash-surface);
          border: none; border-radius: 12px;
          padding: 11px 22px;
          font-size: 0.875rem; font-family: Inter, system-ui, sans-serif; font-weight: 400;
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-novo:hover { background: #6B4C3B; box-shadow: 0 4px 16px rgba(107,76,59,0.2); }
        .dark .btn-novo { background: var(--dash-rose); color: #fff; }
        .dark .btn-novo:hover { background: var(--dash-rose-deep); }
        .icon-btn {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          display: flex; align-items: center; justify-content: center;
          background: transparent; cursor: pointer;
          color: #CEC8C2; transition: color 0.2s, background 0.2s;
        }
        .icon-btn:hover { color: var(--dash-fg); background: var(--dash-bg); }
        .icon-btn.danger:hover { color: #E57373; background: rgba(229,115,115,0.08); }
        .stat-card {
          background: var(--dash-card);
          border: 1.5px solid var(--dash-border);
          border-radius: 16px;
          padding: 20px 24px;
          flex: 1;
        }
        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px; border: none;
          background: transparent; cursor: pointer; width: 100%;
          font-size: 0.875rem; font-family: Inter, system-ui, sans-serif; font-weight: 300;
          color: var(--dash-muted); transition: all 0.18s;
          text-align: left;
        }
        .nav-link:hover { background: var(--dash-bg); color: var(--dash-fg); }
        .nav-link.active { background: rgba(196,137,122,0.1); color: var(--dash-rose); font-weight: 400; }
      `}</style>

      {/* Orb decorativo */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #E8C4BB 0%, transparent 65%)", filter: "blur(100px)", opacity: 0.18, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #D9CEBF 0%, transparent 65%)", filter: "blur(80px)", opacity: 0.12, pointerEvents: "none" }} />

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 240, minHeight: "100vh", flexShrink: 0,
          background: "var(--dash-surface)", borderRight: "1.5px solid var(--dash-border)",
          display: "flex", flexDirection: "column", padding: "32px 16px",
          position: "sticky", top: 0, height: "100vh",
        }}>
          {/* Logo */}
          <div style={{ padding: "0 8px", marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C4897A" }} />
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--dash-muted)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300 }}>
                indicapsi
              </span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "1rem", color: "var(--dash-fg)" }}>
              área da psicóloga
            </p>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <button className="nav-link active">
              <FileText size={15} strokeWidth={1.5} />
              Prontuários
            </button>
            <button className="nav-link" onClick={novoForm}>
              <Plus size={15} strokeWidth={1.5} />
              Novo prontuário
            </button>
          </nav>

          {/* Footer sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ThemeToggle />
            <button className="nav-link" onClick={sair}>
              <LogOut size={15} strokeWidth={1.5} />
              Sair
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px", maxWidth: "100%" }}>

          {/* Topbar mobile */}
          <div style={{ display: "none" }} className="mobile-top">
            {/* escondido em desktop, visível em mobile via media query */}
          </div>

          <div style={{ maxWidth: 880, margin: "0 auto", opacity: show ? 1 : 0, transform: show ? "none" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>

            {/* ── HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "2rem", color: "var(--dash-fg)", marginBottom: 4, lineHeight: 1.2 }}>
                  Prontuários
                </h1>
                <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "var(--dash-muted)" }}>
                  {lista.length} {lista.length === 1 ? "paciente" : "pacientes"} registradas
                </p>
              </div>
              <button className="btn-novo" onClick={novoForm}>
                <Plus size={15} strokeWidth={2} />
                Novo prontuário
              </button>
            </div>

            {/* ── STATS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
              <StatCard label="Total" valor={lista.length} desc="prontuários" />
              <StatCard label="Hoje" valor={hoje} desc="novos registros" />
              <StatCard label="Último" valor={lista[0] ? getNome(lista[0]).split(" ")[0] : "—"} desc={lista[0] ? formatData(lista[0].criado_em) : "sem registros"} isName />
            </div>

            {/* ── BUSCA ── */}
            <div style={{ position: "relative", marginBottom: 24 }}>
              <Search size={15} strokeWidth={1.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#B5ABA3", pointerEvents: "none" }} />
              <input
                className="dash-input"
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar paciente pelo nome..."
              />
            </div>

            {/* ── LISTA ── */}
            {filtrados.length === 0 ? (
              <EmptyState busca={busca} onNovo={novoForm} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Cabeçalho da lista */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, padding: "0 24px", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--dash-muted)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300 }}>
                    paciente
                  </span>
                  <span style={{ fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--dash-muted)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, width: 120, textAlign: "right" }}>
                    data
                  </span>
                  <span style={{ width: 72 }} />
                </div>

                {filtrados.map((p, i) => {
                  const nome = getNome(p);
                  const cor = corAvatar(nome);
                  const apagando = deletandoId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="dash-card"
                      style={{
                        opacity: apagando ? 0 : show ? 1 : 0,
                        transform: apagando ? "scale(0.97)" : show ? "translateY(0)" : "translateY(12px)",
                        transition: `opacity 0.3s ease, transform 0.3s ease ${i * 0.04}s, box-shadow 0.2s, border-color 0.2s`,
                      }}
                      onClick={() => router.push(`/prontuario/${p.id}`)}
                    >
                      {/* Avatar */}
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${cor}18`, border: `1.5px solid ${cor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: "1rem", color: cor, fontWeight: 500 }}>
                          {iniciais(nome)}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "1rem", color: "var(--dash-fg)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {nome}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {p.idade && (
                            <span style={{ fontSize: "0.75rem", color: "var(--dash-muted)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300 }}>
                              {p.idade} anos
                            </span>
                          )}
                          {p.idade && <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--dash-border)", display: "inline-block" }} />}
                          <span style={{ fontSize: "0.75rem", color: "var(--dash-muted)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300 }}>
                            {formatData(p.criado_em)} · {formatHora(p.criado_em)}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                          className="icon-btn danger"
                          onClick={() => deletar(p.id)}
                          aria-label="Excluir"
                          title="Excluir prontuário"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => router.push(`/prontuario/${p.id}`)}
                          aria-label="Abrir"
                          style={{ color: "#C4897A" }}
                          title="Abrir prontuário"
                        >
                          <ChevronRight size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── COMPONENTES ── */

function StatCard({ label, valor, desc, isName = false }: { label: string; valor: string | number; desc: string; isName?: boolean }) {
  return (
    <div className="stat-card">
      <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--dash-muted)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontFamily: isName ? "'Playfair Display', Georgia, serif" : "Inter, system-ui, sans-serif", fontStyle: isName ? "italic" : "normal", fontWeight: isName ? 400 : 300, fontSize: isName ? "1.25rem" : "1.75rem", color: "var(--dash-fg)", lineHeight: 1, marginBottom: 4 }}>
        {valor}
      </p>
      <p style={{ fontSize: "0.75rem", color: "var(--dash-muted)", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300 }}>
        {desc}
      </p>
    </div>
  );
}

function EmptyState({ busca, onNovo }: { busca: string; onNovo: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1.5px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <FileText size={22} strokeWidth={1} style={{ color: "#CEC8C2" }} />
      </div>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "1.1rem", color: "var(--dash-muted)", marginBottom: 8 }}>
        {busca ? "Nenhuma paciente encontrada." : "Nenhum prontuário ainda."}
      </p>
      {!busca && (
        <button
          onClick={onNovo}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#C4897A", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 300, marginTop: 4 }}
        >
          Criar o primeiro prontuário →
        </button>
      )}
    </div>
  );
}
