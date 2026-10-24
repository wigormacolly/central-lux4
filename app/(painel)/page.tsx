import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';

export default async function Inicio() {
  const u = await exigirUsuario();
  const pesquisas = await db()<{ slug: string; titulo: string; n: number; aberta: boolean }[]>`
    select p.slug, p.titulo, p.aberta, (select count(*)::int from resposta r where r.pesquisa_id = p.id) n
    from pesquisa p order by p.criado_em`;
  return (
    <main className="stack">
      <div>
        <div className="eyebrow">Central de lançamento</div>
        <h1>Olá, {u.nome.split(' ')[0]}</h1>
      </div>
      <div className="grid">
        {pesquisas.map(p => (
          <Link key={p.slug} href={`/pesquisas/${p.slug}`} className="card" style={{ textDecoration: 'none' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><span className="lbl">Pesquisa</span><span className="pill">{p.aberta ? 'aberta' : 'fechada'}</span></div>
            <h2 style={{ marginTop: 10 }}>{p.titulo}</h2>
            <div className="num" style={{ marginTop: 14 }}>{p.n}</div>
            <div className="muted small">{p.n === 1 ? 'resposta' : 'respostas'}</div>
          </Link>
        ))}
        <div className="card">
          <span className="lbl">Próximos módulos</span>
          <p className="muted small" style={{ marginTop: 10 }}>Calendário, demandas, conteúdo, funis e oferta entram aqui, um por vez.</p>
        </div>
      </div>
    </main>
  );
}
