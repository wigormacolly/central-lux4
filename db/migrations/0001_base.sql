-- Base da Central de Lançamento: pessoas, sessões, convites, projetos, edições e pesquisas.

create extension if not exists pgcrypto;

create table usuario (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  papel text not null default 'membro' check (papel in ('admin','membro')),
  senha_hash text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table sessao (
  token_hash text primary key,
  usuario_id uuid not null references usuario(id) on delete cascade,
  criada_em timestamptz not null default now(),
  expira_em timestamptz not null
);
create index sessao_usuario on sessao(usuario_id);

create table convite (
  token_hash text primary key,
  usuario_id uuid not null references usuario(id) on delete cascade,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  usado_em timestamptz
);

create table projeto (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  especialista text,
  criado_em timestamptz not null default now()
);

create table edicao (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projeto(id) on delete cascade,
  numero int not null,
  nome text not null,
  data_evento date,
  criado_em timestamptz not null default now(),
  unique (projeto_id, numero)
);

create table pesquisa (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid references edicao(id) on delete set null,
  slug text not null unique,
  titulo text not null,
  modelo text not null,
  aberta boolean not null default true,
  criado_em timestamptz not null default now()
);

create table resposta (
  id uuid primary key default gen_random_uuid(),
  pesquisa_id uuid not null references pesquisa(id) on delete cascade,
  dados jsonb not null,
  nome text,
  whatsapp text,
  aceita_depoimento boolean not null default false,
  aceita_conversa boolean not null default false,
  criada_em timestamptz not null default now()
);
create index resposta_pesquisa on resposta(pesquisa_id, criada_em desc);

-- Dados iniciais: o Lux, a 4ª edição e a pesquisa com as alunas do Lumen.
insert into projeto (slug, nome, especialista) values ('lux', 'Lux', 'Mari França');
insert into edicao (projeto_id, numero, nome)
  select id, 4, 'Lux 4ª edição' from projeto where slug = 'lux';
insert into pesquisa (edicao_id, slug, titulo, modelo)
  select e.id, 'lumen', 'Pesquisa com as alunas do Lumen', 'lumen-2026'
  from edicao e join projeto p on p.id = e.projeto_id where p.slug = 'lux' and e.numero = 4;
