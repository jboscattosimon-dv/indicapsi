import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProntuarios(psicologaId: string) {
  const { data, error } = await supabase
    .from("prontuarios")
    .select("*")
    .eq("psicologa_id", psicologaId)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProntuario(id: string) {
  const { data, error } = await supabase
    .from("prontuarios")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function salvarProntuario(prontuario: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("prontuarios")
    .upsert(prontuario)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletarProntuario(id: string) {
  const { error } = await supabase.from("prontuarios").delete().eq("id", id);
  if (error) throw error;
}
