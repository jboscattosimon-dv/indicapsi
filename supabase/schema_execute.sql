-- ╔══════════════════════════════════════════════════════════════╗
-- ║  INDICAPSI — Execute no SQL Editor do Supabase              ║
-- ║  https://supabase.com/dashboard/project/kbcfawhcqspumwilpxfv/sql ║
-- ╚══════════════════════════════════════════════════════════════╝

-- 1. Tabela de prontuários (principal)
create table if not exists prontuarios (
  id                text      primary key,
  paciente_nome     text      not null,
  idade             text,
  motivo            text,
  momento_perdida   text,
  relacao_consigo   text,
  vive_outros       text,
  ocupa_mente       text,
  como_corpo        text,
  recuperar         text,
  escrita_livre     text,
  status            text      default 'completo',
  criado_em         timestamptz default now(),
  atualizado_em     timestamptz default now()
);

-- 2. Trigger atualiza atualizado_em
create or replace function fn_update_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prontuarios_ts on prontuarios;
create trigger trg_prontuarios_ts
  before update on prontuarios
  for each row execute function fn_update_timestamp();

-- 3. Tabela de sessões (opcional — para histórico futuro)
create table if not exists sessoes (
  id            uuid         primary key default gen_random_uuid(),
  prontuario_id text         references prontuarios(id) on delete cascade,
  data          date,
  notas         text,
  criado_em     timestamptz  default now()
);

-- Pronto! Execute e confirme que não há erros.
