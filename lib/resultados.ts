import 'server-only';
import { db } from './db';
import { modelo, perguntas } from './pesquisas';
import type { Modelo, Pergunta } from './pesquisas/tipos';

export type Resp = { id: string; dados: Record<string, any>; nome: string | null; whatsapp: string | null; aceita_depoimento: boolean; aceita_conversa: boolean; criada_em: Date };

export async function carregar(slug: string) {
  const [p] = await db()<{ id: string; slug: string; titulo: string; modelo: string; aberta: boolean }[]>`
    select id, slug, titulo, modelo, aberta from pesquisa where slug = ${slug}`;
  if (!p) return null;
  const m = modelo(p.modelo);
  if (!m) return null;
  const respostas = await db()<Resp[]>`
    select id, dados, nome, whatsapp, aceita_depoimento, aceita_conversa, criada_em from resposta where pesquisa_id = ${p.id} order by criada_em desc`;
  return { pesquisa: p, modelo: m, respostas };
}

/** Rótulo legível de uma resposta, para a tela e o CSV. */
export function legivel(p: Pergunta, v: any): string {
  if (v == null) return '';
  const r = (x: string) => ('opcoes' in p ? p.opcoes.find(o => o.v === x)?.r : undefined) ?? x;
  switch (p.tipo) {
    case 'unica': return r(v);
    case 'multipla': return [...(v.marcadas ?? []).map(r), ...(v.outro ? [`Outro: ${v.outro}`] : [])].join('; ');
    case 'antes_depois': return `${r(v.antes)} → ${r(v.hoje)}`;
    case 'texto': return String(v);
    case 'contato': return [v.depoimento ? 'aceita depoimento' : '', v.conversa ? 'aceita conversa' : ''].filter(Boolean).join('; ');
  }
}

export function contagem(m: Modelo, respostas: Resp[]) {
  return perguntas(m).filter(p => p.tipo === 'unica' || p.tipo === 'multipla' || p.tipo === 'antes_depois').map(p => {
    const opcoes = 'opcoes' in p ? p.opcoes : [];
    if (p.tipo === 'antes_depois') {
      const antes = Object.fromEntries(opcoes.map(o => [o.v, 0])), hoje = { ...antes };
      for (const r of respostas) { const v = r.dados[p.id]; if (v) { antes[v.antes]++; hoje[v.hoje]++; } }
      return { p, opcoes, antes, hoje };
    }
    const c = Object.fromEntries(opcoes.map(o => [o.v, 0]));
    let outros: string[] = [];
    for (const r of respostas) {
      const v = r.dados[p.id];
      if (p.tipo === 'unica' && v) c[v]++;
      if (p.tipo === 'multipla' && v) { for (const x of v.marcadas ?? []) c[x]++; if (v.outro) outros.push(v.outro); }
    }
    return { p, opcoes, c, outros };
  });
}
