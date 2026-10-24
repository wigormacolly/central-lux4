import 'server-only';
import { db } from '@/lib/db';

/* ---------- vocabulário ---------- */
export const STATUS_DEMANDA = ['A fazer', 'Fazendo', 'Revisão', 'Concluído'] as const;
export const STATUS_PECA = ['Ideia', 'Roteiro', 'Gravado', 'Editado', 'Aprovado', 'Publicado'] as const;
export const CANAIS = ['Reels', 'Stories', 'Carrossel', 'Feed', 'YouTube', 'API', 'Grupo', 'E-mail'] as const;
export const OBJETIVOS = ['Atrair', 'Aquecer', 'Vender ingresso', 'Vender Lumen'] as const;
export const TIPOS_MARCO = { live: 'Live', lote: 'Lote', evento: 'Evento' } as const;

/** Tipos que aparecem no calendário, com cor e símbolo. */
export const TIPOS: Record<string, { c: string; i: string }> = {
  Live: { c: '#fafafa', i: '●' }, Lote: { c: '#cbc7c1', i: '◆' }, Evento: { c: '#fafafa', i: '★' },
  API: { c: '#d1e1e8', i: '✉' }, Grupo: { c: '#cbc7c1', i: '◎' }, Reels: { c: '#e7e4df', i: '▶' },
  Stories: { c: '#b3afa9', i: '◐' }, Carrossel: { c: '#a9bcc4', i: '▤' }, Feed: { c: '#9c9893', i: '□' },
  YouTube: { c: '#fafafa', i: '▷' }, 'E-mail': { c: '#8a8680', i: '@' },
};

/* ---------- tipos ---------- */
export type Pessoa = { id: string; nome: string; foto_em: string | null };
export type Fase = { id: string; nome: string; inicio: number; dias: number; cor: string };
export type Marco = { id: string; tipo: keyof typeof TIPOS_MARCO; titulo: string; dia: number; hora: string | null };
export type Pilar = { id: string; nome: string; objetivo: string; cor: string };
export type Meta = { id: string; tipo: 'canal' | 'pilar'; valor: string; quantidade: number; periodo: 'semana' | 'edicao' };
export type Peca = { id: string; dia: number; hora: string | null; canal: string; pilar_id: string | null; titulo: string; responsavel_id: string | null; status: string };
export type Demanda = { id: string; titulo: string; detalhes: string | null; responsavel_id: string | null; prazo: number | null; fase_id: string | null; status: string };
export type Edicao = { id: string; nome: string; numero: number; data_evento: string };

/** Item do calendário: peça, marco ou mensagem da régua de uma live. */
export type Item = { dia: number; hora: string; tipo: string; titulo: string; resp: string | null; status?: string; regua?: boolean; id?: string; origem?: 'peca' | 'marco' };

/* ---------- datas ---------- */
const DIA = 864e5;
const TZ = 'America/Sao_Paulo';
const iso = (d: Date) => d.toISOString().slice(0, 10);
const meio = (s: string) => new Date(s + 'T12:00:00Z');

export function hojeISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
export const data = (ed: Edicao, dia: number) => new Date(meio(ed.data_evento).getTime() + dia * DIA);
export const dataISO = (ed: Edicao, dia: number) => iso(data(ed, dia));
export const diaDe = (ed: Edicao, isoData: string) => Math.round((meio(isoData).getTime() - meio(ed.data_evento).getTime()) / DIA);
export const hoje = (ed: Edicao) => diaDe(ed, hojeISO());
export const fmt = (ed: Edicao, dia: number) => data(ed, dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
export const fmtL = (ed: Edicao, dia: number) => data(ed, dia).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' });
export const D = (dia: number) => `D${dia >= 0 ? '+' : ''}${dia}`;

/* ---------- leitura ---------- */
export async function edicaoAtual(): Promise<Edicao> {
  const [e] = await db()<Edicao[]>`
    select e.id, e.nome, e.numero, coalesce(to_char(e.data_evento, 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM-DD')) data_evento
    from edicao e join projeto p on p.id = e.projeto_id
    where p.slug = 'lux' order by e.numero desc limit 1`;
  if (!e) throw new Error('Nenhuma edição cadastrada');
  return e;
}

export async function pessoas(): Promise<Pessoa[]> {
  return db()<Pessoa[]>`select id, nome, foto_em from usuario where ativo order by criado_em`;
}

export async function carregar(ed: Edicao) {
  const sql = db();
  const [fases, marcos, pilares, metas, pecas, demandas, gente] = await Promise.all([
    sql<Fase[]>`select id, nome, inicio, dias, cor from fase where edicao_id = ${ed.id} order by inicio, criado_em`,
    sql<Marco[]>`select id, tipo, titulo, dia, hora from marco where edicao_id = ${ed.id} order by dia, hora nulls first`,
    sql<Pilar[]>`select id, nome, objetivo, cor from pilar where edicao_id = ${ed.id} order by criado_em`,
    sql<Meta[]>`select id, tipo, valor, quantidade, periodo from meta_conteudo where edicao_id = ${ed.id} order by criado_em`,
    sql<Peca[]>`select id, dia, hora, canal, pilar_id, titulo, responsavel_id, status from peca where edicao_id = ${ed.id} order by dia, hora nulls first, criado_em`,
    sql<Demanda[]>`select id, titulo, detalhes, responsavel_id, prazo, fase_id, status from demanda where edicao_id = ${ed.id} order by prazo nulls last, criado_em`,
    pessoas(),
  ]);
  return { fases, marcos, pilares, metas, pecas, demandas, gente };
}
export type Dados = Awaited<ReturnType<typeof carregar>>;

/* ---------- regras ---------- */
export const faseNo = (fases: Fase[], dia: number) => fases.find(f => dia >= f.inicio && dia < f.inicio + f.dias);

/** Período de captação: soma das fases cujo nome começa com "Captação". */
export function captacao(fases: Fase[]) {
  const c = fases.filter(f => f.nome.toLowerCase().startsWith('captação'));
  if (!c.length) return null;
  const ini = Math.min(...c.map(f => f.inicio)), fim = Math.max(...c.map(f => f.inicio + f.dias));
  const semanas: [number, number][] = [];
  for (let s = ini; s < fim; s += 7) semanas.push([s, Math.min(s + 7, fim)]);
  return { ini, fim, semanas };
}

/** Régua padrão de mensagens de cada live. A régua acompanha a data da live. */
export function regua(m: Marco): Item[] {
  const tema = m.titulo;
  const passos: [number, string, string, string][] = [
    [-7, '19h', 'Grupo', `Convite: live de ${tema}`], [-2, '19h', 'Grupo', `Antecipação da live de ${tema}`],
    [-1, '19h', 'API', `Amanhã: live de ${tema}`], [0, '09h', 'API', `É hoje: ${tema}`],
    [0, '15h', 'Grupo', `Em poucas horas: ${tema}`], [0, '19h', 'API', `Daqui 1 hora: ${tema}`],
    [0, '20h', 'Grupo', 'Começou: link da live'], [0, '20h15', 'API', `Cadê você: ${tema}`],
  ];
  return passos.map(([d, h, tipo, titulo]) => ({ dia: m.dia + d, hora: h, tipo, titulo, resp: null, regua: true }));
}

export function itens(d: Dados): Item[] {
  const it: Item[] = [];
  for (const m of d.marcos) {
    it.push({ dia: m.dia, hora: m.hora ?? (m.tipo === 'live' ? '20h' : ''), tipo: TIPOS_MARCO[m.tipo], titulo: m.tipo === 'live' ? `Live: ${m.titulo}` : m.titulo, resp: null, id: m.id, origem: 'marco' });
    if (m.tipo === 'live') it.push(...regua(m));
  }
  for (const p of d.pecas) it.push({ dia: p.dia, hora: p.hora ?? '', tipo: p.canal, titulo: p.titulo, resp: p.responsavel_id, status: p.status, id: p.id, origem: 'peca' });
  return it.sort((a, b) => a.dia - b.dia || a.hora.localeCompare(b.hora, 'pt-BR', { numeric: true }));
}

export const pessoaDe = (gente: Pessoa[], id: string | null) => gente.find(p => p.id === id) ?? null;
export const nomeDe = (gente: Pessoa[], id: string | null) => gente.find(p => p.id === id)?.nome ?? null;
