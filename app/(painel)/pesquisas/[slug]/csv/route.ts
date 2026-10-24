import { usuarioAtual } from '@/lib/auth';
import { carregar, legivel } from '@/lib/resultados';
import { perguntas } from '@/lib/pesquisas';

export const dynamic = 'force-dynamic';

const cel = (s: string) => {
  let v = s ?? '';
  if (/^[=+\-@]/.test(v)) v = `'${v}`; // evita fórmula ao abrir no Excel/Sheets
  return `"${v.replace(/"/g, '""')}"`;
};

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await usuarioAtual())) return new Response('Faça login.', { status: 401 });
  const { slug } = await params;
  const d = await carregar(slug);
  if (!d) return new Response('Pesquisa não encontrada.', { status: 404 });
  const ps = perguntas(d.modelo);
  const cab = ['respondida_em', ...ps.map(p => p.titulo), 'nome', 'whatsapp'];
  const linhas = d.respostas.map(r => [
    new Date(r.criada_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    ...ps.map(p => legivel(p, r.dados[p.id])), r.nome ?? '', r.whatsapp ?? '',
  ]);
  const csv = '﻿' + [cab, ...linhas].map(l => l.map(cel).join(';')).join('\r\n');
  return new Response(csv, { headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="pesquisa-${slug}.csv"`,
    'Cache-Control': 'no-store',
  } });
}
