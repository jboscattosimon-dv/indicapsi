import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ProntuarioRow {
  id: string;
  paciente_nome: string;
  idade?: string;
  motivo?: string;
  momento_perdida?: string;
  relacao_consigo?: string;
  vive_outros?: string;
  ocupa_mente?: string;
  como_corpo?: string;
  recuperar?: string;
  escrita_livre?: string;
  status?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export async function listarProntuarios() {
  const { data, error } = await supabase
    .from("prontuarios")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data as ProntuarioRow[];
}

export async function buscarProntuario(id: string) {
  const { data, error } = await supabase
    .from("prontuarios")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ProntuarioRow;
}

export async function salvarProntuario(prontuario: ProntuarioRow) {
  const { data, error } = await supabase
    .from("prontuarios")
    .upsert({
      id:               prontuario.id,
      paciente_nome:    prontuario.paciente_nome,
      idade:            prontuario.idade,
      motivo:           prontuario.motivo,
      momento_perdida:  prontuario.momento_perdida,
      relacao_consigo:  prontuario.relacao_consigo,
      vive_outros:      prontuario.vive_outros,
      ocupa_mente:      prontuario.ocupa_mente,
      como_corpo:       prontuario.como_corpo,
      recuperar:        prontuario.recuperar,
      escrita_livre:    prontuario.escrita_livre,
      status:           prontuario.status ?? "completo",
    })
    .select()
    .single();
  if (error) throw error;
  return data as ProntuarioRow;
}

export async function atualizarProntuario(id: string, campos: Partial<ProntuarioRow>) {
  const { data, error } = await supabase
    .from("prontuarios")
    .update(campos)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ProntuarioRow;
}

export async function deletarProntuario(id: string) {
  const { error } = await supabase.from("prontuarios").delete().eq("id", id);
  if (error) throw error;
}
