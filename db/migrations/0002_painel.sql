-- Painel do lançamento: fases, marcos, conteúdo (pilares, metas, peças) e demandas.
-- Tudo que tem data guarda o dia relativo ao evento (D-42, D0, D+3): mudou a data do evento, tudo anda junto.

update edicao set data_evento = '2027-02-27'
  where data_evento is null and numero = 4 and projeto_id = (select id from projeto where slug = 'lux');

create table fase (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references edicao(id) on delete cascade,
  nome text not null,
  inicio int not null,
  dias int not null check (dias > 0),
  cor text not null default '#cbc7c1',
  criado_em timestamptz not null default now()
);
create index fase_edicao on fase(edicao_id, inicio);

create table marco (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references edicao(id) on delete cascade,
  tipo text not null check (tipo in ('live','lote','evento')),
  titulo text not null,
  dia int not null,
  hora text,
  criado_em timestamptz not null default now()
);
create index marco_edicao on marco(edicao_id, dia);

create table pilar (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references edicao(id) on delete cascade,
  nome text not null,
  objetivo text not null,
  cor text not null default '#cbc7c1',
  criado_em timestamptz not null default now()
);

create table meta_conteudo (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references edicao(id) on delete cascade,
  tipo text not null check (tipo in ('canal','pilar')),
  valor text not null,
  quantidade int not null check (quantidade > 0),
  periodo text not null check (periodo in ('semana','edicao')),
  criado_em timestamptz not null default now()
);

-- Peça = tudo que sai num canal (reels, stories, API, grupo, e-mail...). Calendário e conteúdo leem daqui.
create table peca (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references edicao(id) on delete cascade,
  dia int not null,
  hora text,
  canal text not null,
  pilar_id uuid references pilar(id) on delete set null,
  titulo text not null,
  responsavel_id uuid references usuario(id) on delete set null,
  status text not null default 'Ideia',
  criado_em timestamptz not null default now()
);
create index peca_edicao on peca(edicao_id, dia);

create table demanda (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references edicao(id) on delete cascade,
  titulo text not null,
  detalhes text,
  responsavel_id uuid references usuario(id) on delete set null,
  prazo int,
  fase_id uuid references fase(id) on delete set null,
  status text not null default 'A fazer' check (status in ('A fazer','Fazendo','Revisão','Concluído')),
  criado_por uuid references usuario(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index demanda_edicao on demanda(edicao_id, status);

-- Fases iniciais da 4ª edição (editáveis no calendário).
insert into fase (edicao_id, nome, inicio, dias, cor)
select e.id, f.nome, f.inicio, f.dias, f.cor
from edicao e join projeto p on p.id = e.projeto_id,
(values ('Planejamento',-70,14,'#5f5c58'), ('Produção',-56,14,'#8a8680'), ('Captação · teste',-42,7,'#b3afa9'),
        ('Captação · escala',-35,28,'#cbc7c1'), ('Captação · reta final',-7,7,'#e7e4df'), ('Evento',0,2,'#fafafa'),
        ('Carrinho Lumen',1,8,'#d1e1e8'), ('Downsell / pós',9,7,'#a9bcc4'), ('Debriefing',16,7,'#7d8b91')) as f(nome,inicio,dias,cor)
where p.slug = 'lux' and e.numero = 4;

-- Primeira demanda: a oferta da 4ª edição.
insert into demanda (edicao_id, titulo, detalhes, responsavel_id, prazo, fase_id, status)
select e.id, 'Definir a oferta da 4ª edição',
  'Diagnóstico: promessa longe do público (R$ 300 mil/ano x ticket de R$ 300 a 600); a dor que compra Lumen é precificação; Lumen vendido a 4 preços; bump não conversa com o Lumen; quem pede análise não recebe abordagem 1 a 1; ingresso a R$ 19 com CAC de R$ 75. Responder: 1) o que é o Lumen (formato, duração, entregáveis); 2) existe algo acima do Lumen e quantas vagas; 3) tese da Ed4 (técnica x negócio/precificação); 4) o Curso Lumen de R$ 697 está pronto; 5) o que pode mudar (preço do ingresso, preço do Lumen, bônus). Entrega: oferta completa (ingresso, bumps, Lumen, condições, downsell) e, a partir dela, a base de comunicação.',
  (select id from usuario where papel = 'admin' order by criado_em limit 1),
  -63, (select f.id from fase f where f.edicao_id = e.id and f.nome = 'Planejamento'), 'Fazendo'
from edicao e join projeto p on p.id = e.projeto_id
where p.slug = 'lux' and e.numero = 4;
