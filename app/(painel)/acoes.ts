'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';
import { CANAIS, OBJETIVOS, STATUS_DEMANDA, STATUS_PECA, TIPOS_MARCO, diaDe, edicaoAtual } from '@/lib/central';

/* Toda ação exige sessão e só mexe em registros da edição atual. */

const txt = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? '').trim().slice(0, max);
const isoOk = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const uuidOk = (s: string) => /^[0-9a-f-]{36}$/i.test(s);
const opc = (s: string) => (uuidOk(s) ? s : null);
const hora = (s: string) => s.slice(0, 8) || null;
const corOk = (s: string) => (/^#[0-9a-f]{6}$/i.test(s) ? s : '#cbc7c1');
const SHADES = ['#fafafa', '#d1e1e8', '#cbc7c1', '#a9bcc4', '#8a8680', '#e7e4df'];

function revalidar() {
  for (const p of ['/', '/calendario', '/demandas', '/conteudo']) revalidatePath(p);
}

async function base() {
  const u = await exigirUsuario();
  const ed = await edicaoAtual();
  return { u, ed, sql: db() };
}

/* ---------- edição ---------- */
export async function mudarDataEvento(fd: FormData) {
  const { ed, sql } = await base();
  const d = txt(fd, 'data', 10);
  if (!isoOk(d)) return;
  await sql`update edicao set data_evento = ${d} where id = ${ed.id}`;
  revalidar();
}

/* ---------- fases ---------- */
export async function salvarFase(id: string, fd: FormData) {
  const { ed, sql } = await base();
  const nome = txt(fd, 'nome', 80), inicio = Math.trunc(Number(fd.get('inicio'))), dias = Math.trunc(Number(fd.get('dias')));
  if (!nome || !Number.isFinite(inicio) || !(dias > 0) || dias > 365 || Math.abs(inicio) > 730) return;
  await sql`update fase set nome = ${nome}, inicio = ${inicio}, dias = ${dias}, cor = ${corOk(txt(fd, 'cor', 7))} where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}
export async function criarFase() {
  const { ed, sql } = await base();
  const [ult] = await sql<{ fim: number }[]>`select coalesce(max(inicio + dias), 0)::int fim from fase where edicao_id = ${ed.id}`;
  await sql`insert into fase (edicao_id, nome, inicio, dias, cor) values (${ed.id}, 'Nova fase', ${ult.fim}, 7, '#8a8680')`;
  revalidar();
}
export async function apagarFase(id: string) {
  const { ed, sql } = await base();
  await sql`delete from fase where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}

/* ---------- marcos (lives, lotes, evento) ---------- */
export async function criarMarco(fd: FormData) {
  const { ed, sql } = await base();
  const tipo = txt(fd, 'tipo', 10), titulo = txt(fd, 'titulo', 160), d = txt(fd, 'data', 10);
  if (!(tipo in TIPOS_MARCO) || !titulo || !isoOk(d)) return;
  await sql`insert into marco (edicao_id, tipo, titulo, dia, hora) values (${ed.id}, ${tipo}, ${titulo}, ${diaDe(ed, d)}, ${hora(txt(fd, 'hora', 8))})`;
  revalidar();
}
export async function apagarMarco(id: string) {
  const { ed, sql } = await base();
  await sql`delete from marco where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}

/* ---------- peças de conteúdo e ações do calendário ---------- */
export async function criarPeca(fd: FormData) {
  const { ed, sql } = await base();
  const canal = txt(fd, 'canal', 20), titulo = txt(fd, 'titulo', 240), d = txt(fd, 'data', 10);
  if (!(CANAIS as readonly string[]).includes(canal) || !titulo || !isoOk(d)) return;
  const pilar = opc(txt(fd, 'pilar', 36));
  await sql`insert into peca (edicao_id, dia, hora, canal, pilar_id, titulo, responsavel_id)
    values (${ed.id}, ${diaDe(ed, d)}, ${hora(txt(fd, 'hora', 8))}, ${canal},
      ${pilar ? sql`(select id from pilar where id = ${pilar} and edicao_id = ${ed.id})` : null},
      ${titulo}, ${opc(txt(fd, 'resp', 36))})`;
  revalidar();
}
export async function statusPeca(id: string, fd: FormData) {
  const { ed, sql } = await base();
  const s = txt(fd, 'status', 20);
  if (!(STATUS_PECA as readonly string[]).includes(s)) return;
  await sql`update peca set status = ${s} where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}
export async function apagarPeca(id: string) {
  const { ed, sql } = await base();
  await sql`delete from peca where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}

/* ---------- linha editorial e metas ---------- */
export async function criarPilar(fd: FormData) {
  const { ed, sql } = await base();
  const nome = txt(fd, 'nome', 80), obj = txt(fd, 'objetivo', 40);
  if (!nome || !(OBJETIVOS as readonly string[]).includes(obj)) return;
  const [n] = await sql<{ n: number }[]>`select count(*)::int n from pilar where edicao_id = ${ed.id}`;
  await sql`insert into pilar (edicao_id, nome, objetivo, cor) values (${ed.id}, ${nome}, ${obj}, ${SHADES[n.n % SHADES.length]})`;
  revalidar();
}
export async function apagarPilar(id: string) {
  const { ed, sql } = await base();
  await sql`delete from pilar where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}
export async function criarMeta(fd: FormData) {
  const { ed, sql } = await base();
  const tipo = txt(fd, 'tipo', 10), periodo = txt(fd, 'periodo', 10), q = Math.trunc(Number(fd.get('quantidade')));
  const valor = txt(fd, tipo === 'canal' ? 'canal' : 'pilar', 80);
  if (!['canal', 'pilar'].includes(tipo) || !['semana', 'edicao'].includes(periodo) || !(q > 0) || q > 999 || !valor) return;
  await sql`insert into meta_conteudo (edicao_id, tipo, valor, quantidade, periodo) values (${ed.id}, ${tipo}, ${valor}, ${q}, ${periodo})`;
  revalidar();
}
export async function apagarMeta(id: string) {
  const { ed, sql } = await base();
  await sql`delete from meta_conteudo where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}

/* ---------- demandas ---------- */
export async function criarDemanda(fd: FormData) {
  const { u, ed, sql } = await base();
  const titulo = txt(fd, 'titulo', 200), d = txt(fd, 'prazo', 10);
  if (!titulo) return;
  const fase = opc(txt(fd, 'fase', 36));
  await sql`insert into demanda (edicao_id, titulo, detalhes, responsavel_id, prazo, fase_id, criado_por)
    values (${ed.id}, ${titulo}, ${txt(fd, 'detalhes', 4000) || null}, ${opc(txt(fd, 'resp', 36))},
      ${isoOk(d) ? diaDe(ed, d) : null},
      ${fase ? sql`(select id from fase where id = ${fase} and edicao_id = ${ed.id})` : null}, ${u.id})`;
  revalidar();
}
export async function statusDemanda(id: string, fd: FormData) {
  const { ed, sql } = await base();
  const s = txt(fd, 'status', 20);
  if (!(STATUS_DEMANDA as readonly string[]).includes(s)) return;
  await sql`update demanda set status = ${s} where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}
export async function editarDemanda(id: string, fd: FormData) {
  const { ed, sql } = await base();
  const titulo = txt(fd, 'titulo', 200), d = txt(fd, 'prazo', 10);
  if (!titulo) return;
  const fase = opc(txt(fd, 'fase', 36));
  await sql`update demanda set titulo = ${titulo}, detalhes = ${txt(fd, 'detalhes', 4000) || null},
    responsavel_id = ${opc(txt(fd, 'resp', 36))}, prazo = ${isoOk(d) ? diaDe(ed, d) : null},
    fase_id = ${fase ? sql`(select id from fase where id = ${fase} and edicao_id = ${ed.id})` : null}
    where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}
export async function apagarDemanda(id: string) {
  const { ed, sql } = await base();
  await sql`delete from demanda where id = ${id} and edicao_id = ${ed.id}`;
  revalidar();
}
