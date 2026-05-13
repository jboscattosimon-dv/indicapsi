export interface Paciente {
  id: string;
  nome: string;
  email?: string;
  criado_em: string;
  psicologa_id: string;
}

export interface Prontuario {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  data_nascimento: string;
  genero: string;
  estado_civil: string;
  cpf: string;
  endereco: string;
  cidade_estado: string;
  modalidade: string;
  whatsapp: string;
  email: string;
  profissao: string;
  medicacao: string;
  motivo: string;
  criado_em: string;
  atualizado_em: string;
  status: "rascunho" | "completo";
  psicologa_id: string;
}

export interface ProntuarioForm {
  nome: string;
  data_nascimento: string;
  genero: string;
  estado_civil: string;
  cpf: string;
  endereco: string;
  cidade_estado: string;
  modalidade: string;
  whatsapp: string;
  email: string;
  profissao: string;
  medicacao: string;
  motivo: string;
}

export interface Musica {
  id: number;
  titulo: string;
  artista: string;
  duracao: string;
  emoji: string;
}

export const MUSICAS: Musica[] = [
  { id: 1, titulo: "Calma Interior",      artista: "Lua & Piano",        duracao: "4:12", emoji: "🌙" },
  { id: 2, titulo: "Tarde de Outono",     artista: "Elisa Voz",          duracao: "3:47", emoji: "🍂" },
  { id: 3, titulo: "Silêncio Gentil",     artista: "Jardim Sonoro",      duracao: "5:03", emoji: "🌿" },
  { id: 4, titulo: "Entre Margens",       artista: "Sofia & Jazz Trio",  duracao: "4:31", emoji: "☕" },
  { id: 5, titulo: "Bruma de Manhã",      artista: "Ana Melo",           duracao: "3:58", emoji: "🌫️" },
];
