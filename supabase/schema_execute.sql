-- ╔══════════════════════════════════════════════════════════════╗
-- ║  INDICAPSI — Execute no SQL Editor do Supabase              ║
-- ║  https://supabase.com/dashboard/project/kbcfawhcqspumwilpxfv/sql ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Schema v2 — campos atualizados conforme formulário oficial

drop table if exists prontuarios;

create table prontuarios (
  id               text primary key,
  paciente_nome    text not null,
  data_nascimento  text,
  genero           text,
  estado_civil     text,
  cpf              text,
  endereco         text,
  cidade_estado    text,
  modalidade       text,
  whatsapp         text,
  email            text,
  profissao        text,
  medicacao        text,
  motivo           text,
  status           text default 'completo',
  criado_em        timestamptz default now(),
  atualizado_em    timestamptz default now()
);

create or replace function atualizar_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_atualizado_em on prontuarios;

create trigger trg_atualizado_em
before update on prontuarios
for each row execute function atualizar_timestamp();

alter table prontuarios enable row level security;

create policy "allow_all" on prontuarios
  for all using (true) with check (true);
