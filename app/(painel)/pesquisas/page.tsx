import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';

export default async function Pesquisas() {
  await exigirUsuario();
  const lista = await db()<{ slug: string; titulo: string; aberta: boolean; n: number; ultima: Date | null }[]>`
    select p.slug, p.titulo, p.aberta, count(r.id)::int n, max(r.criada_em) ultima
    from pesquisa p left join resposta r on r.pesquisa_id = p.id group by p.id order by p.criado_em`;
  const base = process.env.APP_URL ?? '';
  return (
    <main className="stack">
      <div><div className="eyebrow">Pesquisas</div><h1>Pesquisas da edição</h1></div>
      <div className="card tbox">
        <table className="tbl">
          <thead><tr><th>Pesquisa</th><th>Respostas</th><th>Última</th><th>Link para as alunas</th><th></th></tr></thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.slug}>
                <td>{p.titulo} <span className="pill">{p.aberta ? 'aberta' : 'fechada'}</span></td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{p.n}</td>
                <td className="muted">{p.ultima ? new Date(p.ultima).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Nenhuma ainda'}</td>
                <td><code style={{ userSelect: 'all' }}>{base}/p/{p.slug}</code></td>
                <td><Link className="btn ghost" href={`/pesquisas/${p.slug}`}>Ver respostas</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
