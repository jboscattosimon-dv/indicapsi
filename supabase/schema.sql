-- ──────────────────────────────────────────────────────────────
--  Indicapsi — Schema Supabase
--  Executar no SQL Editor do Supabase Dashboard
-- ──────────────────────────────────────────────────────────────

-- Tabela de psicólogas (usuárias do sistema)
create table if not exists psicologas (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  nome        text,
  criado_em   timestamptz default now()
);

-- Tabela de pacientes
create table if not exists pacientes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  idade         text,
  email         text,
  psicologa_id  uuid references psicologas(id) on delete cascade,
  criado_em     timestamptz default now()
);

-- Tabela de prontuários
create table if not exists prontuarios (
  id                uuid primary key default gen_random_uuid(),
  paciente_id       uuid references pacientes(id) on delete set null,
  psicologa_id      uuid references psicologas(id) on delete cascade,
  paciente_nome     text not null,
  idade             text,
  motivo            text,
  momento_perdida   text,
  relacao_consigo   text,
  vive_outros       text,
  ocupa_mente       text,
  como_corpo        text,
  recuperar         text,
  escrita_livre     text,
  status            text default 'rascunho' check (status in ('rascunho', 'completo')),
  criado_em         timestamptz default now(),
  atualizado_em     timestamptz default now()
);

-- Tabela de sessões
create table if not exists sessoes (
  id            uuid primary key default gen_random_uuid(),
  paciente_id   uuid references pacientes(id) on delete cascade,
  psicologa_id  uuid references psicologas(id) on delete cascade,
  data          date,
  notas         text,
  criado_em     timestamptz default now()
);

-- Trigger para atualizar atualizado_em
create or replace function atualizar_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_prontuarios_update
  before update on prontuarios
  for each row execute function atualizar_timestamp();

-- RLS (Row Level Security)
alter table psicologas  enable row level security;
alter table pacientes   enable row level security;
alter table prontuarios enable row level security;
alter table sessoes     enable row level security;

-- Políticas básicas (psicóloga acessa apenas seus dados)
create policy "psicologa_own_data_pacientes" on pacientes
  for all using (psicologa_id = auth.uid());

create policy "psicologa_own_data_prontuarios" on prontuarios
  for all using (psicologa_id = auth.uid());

create policy "psicologa_own_data_sessoes" on sessoes
  for all using (psicologa_id = auth.uid());
