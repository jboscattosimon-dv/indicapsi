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
  atualizado_em: string;
  status: "rascunho" | "completo";
  psicologa_id: string;
}

export interface ProntuarioForm {
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

export const PERGUNTAS = [
  {
    id: "motivo",
    pergunta: "O que te trouxe até aqui?",
    placeholder: "Pode começar de onde quiser. Não há resposta certa.",
    hint: "Conta com calma.",
  },
  {
    id: "momento_perdida",
    pergunta: "Em que momento da vida você sente que se perdeu?",
    placeholder: "Pode ser uma fase, um evento, ou uma sensação difícil de nomear...",
    hint: "Não precisa ser exato. Só o que lembrar.",
  },
  {
    id: "relacao_consigo",
    pergunta: "Como anda sua relação com você mesma?",
    placeholder: "Com gentileza, com crítica, com distância, com carinho...",
    hint: "Não há resposta certa aqui.",
  },
  {
    id: "vive_outros",
    pergunta: "Você sente que vive mais para os outros do que para si?",
    placeholder: "Pode ser um sim, um às vezes, um eu não sei...",
    hint: "Só o que for verdadeiro para você.",
  },
  {
    id: "ocupa_mente",
    pergunta: "O que mais tem ocupado sua mente ultimamente?",
    placeholder: "Pensamentos que voltam, preocupações que ficam, sonhos que insistem...",
    hint: "Tudo que vier é válido.",
  },
  {
    id: "como_corpo",
    pergunta: "Como está seu corpo ultimamente?",
    placeholder: "Tensão, cansaço, leveza, dor, presença, ausência...",
    hint: "O corpo também fala.",
  },
  {
    id: "recuperar",
    pergunta: "O que você gostaria de recuperar em si mesma?",
    placeholder: "Uma qualidade, uma sensação, uma versão de você que sente falta...",
    hint: "Com carinho.",
  },
];
