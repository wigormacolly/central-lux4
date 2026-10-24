'use server';
import { db } from '@/lib/db';
import { modelo, validador } from '@/lib/pesquisas';

export type Resultado = { ok: true } | { ok: false; erro: string };

export async function responder(slug: string, payload: unknown, isca: string): Promise<Resultado> {
  if (isca) return { ok: true }; // campo invisível preenchido: robô. Finge sucesso e descarta.
  const [p] = await db()<{ id: string; modelo: string; aberta: boolean }[]>`select id, modelo, aberta from pesquisa where slug = ${slug}`;
  if (!p) return { ok: false, erro: 'Pesquisa não encontrada.' };
  if (!p.aberta) return { ok: false, erro: 'Esta pesquisa já foi encerrada. Obrigada pelo interesse.' };
  const m = modelo(p.modelo);
  if (!m) return { ok: false, erro: 'Pesquisa indisponível.' };
  if (JSON.stringify(payload ?? null).length > 20000) return { ok: false, erro: 'Resposta grande demais.' };
  const r = validador(m).safeParse(payload);
  if (!r.success) return { ok: false, erro: r.error.issues[0]?.message ?? 'Confira as respostas.' };
  const c = (r.data as any).contato ?? {};
  await db()`insert into resposta (pesquisa_id, dados, nome, whatsapp, aceita_depoimento, aceita_conversa)
    values (${p.id}, ${db().json(r.data as any)}, ${c.nome || null}, ${c.whatsapp || null}, ${!!c.depoimento}, ${!!c.conversa})`;
  return { ok: true };
}
