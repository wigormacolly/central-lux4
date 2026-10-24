import { notFound } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth';
import { carregar, contagem, legivel } from '@/lib/resultados';
import { perguntas } from '@/lib/pesquisas';
import { alternarAberta } from './actions';

export default async function Resultado({ params }: { params: Promise<{ slug: string }> }) {
  const u = await exigirUsuario();
  const { slug } = await params;
  const d = await carregar(slug);
  if (!d) notFound();
  const { pesquisa, modelo, respostas } = d;
  const total = respostas.length;
  const cont = contagem(modelo, respostas);
  const abertas = perguntas(modelo).filter(p => p.tipo === 'texto');
  const contatos = respostas.filter(r => r.aceita_conversa || r.aceita_depoimento);
  const pct = (n: number) => total ? `${Math.round(n / total * 100)}%` : '0%';
  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'end' }}>
        <div><div className="eyebrow">Pesquisa</div><h1 style={{ marginBottom: 0 }}>{pesquisa.titulo}</h1></div>
        <div className="row">
          <a className="btn ghost" href={`/pesquisas/${slug}/csv`}>Baixar CSV</a>
          {u.papel === 'admin' && <form action={alternarAberta.bind(null, slug)}><button className="btn ghost">{pesquisa.aberta ? 'Fechar pesquisa' : 'Reabrir pesquisa'}</button></form>}
        </div>
      </div>
      <div className="grid">
        <div className="card"><span className="lbl">Respostas</span><div className="num" style={{ marginTop: 10 }}>{total}</div></div>
        <div className="card"><span className="lbl">Toparam conversar</span><div className="num" style={{ marginTop: 10 }}>{respostas.filter(r => r.aceita_conversa).length}</div></div>
        <div className="card"><span className="lbl">Aceitam depoimento</span><div className="num" style={{ marginTop: 10 }}>{respostas.filter(r => r.aceita_depoimento).length}</div></div>
      </div>
      {total === 0 && <div className="card muted">Nenhuma resposta ainda. Envie o link <code>/p/{slug}</code> no grupo do Lumen.</div>}
      {total > 0 && <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))' }}>
        {cont.map(x => (
          <section key={x.p.id} className="card stack" style={{ gap: 10 }}>
            <h2 style={{ fontSize: 16 }}>{x.p.titulo}</h2>
            {'antes' in x ? (
              <table className="tbl"><thead><tr><th></th><th>Antes</th><th>Hoje</th></tr></thead><tbody>
                {x.opcoes.map(o => <tr key={o.v}><td>{o.r}</td><td>{x.antes?.[o.v]}</td><td>{x.hoje?.[o.v]}</td></tr>)}
              </tbody></table>
            ) : (<>
              {x.opcoes.map(o => (
                <div key={o.v} className="stack" style={{ gap: 4 }}>
                  <div className="row small" style={{ justifyContent: 'space-between' }}><span>{o.r}</span><span className="muted">{x.c?.[o.v] ?? 0} · {pct(x.c?.[o.v] ?? 0)}</span></div>
                  <div className="bar"><i style={{ width: pct(x.c?.[o.v] ?? 0) }} /></div>
                </div>
              ))}
              {x.outros && x.outros.length > 0 && <div className="small muted">Outros: {x.outros.join(' · ')}</div>}
            </>)}
          </section>
        ))}
      </div>}
      {abertas.map(p => (
        <section key={p.id} className="card stack" style={{ gap: 10 }}>
          <h2 style={{ fontSize: 16 }}>{p.titulo}</h2>
          {respostas.filter(r => r.dados[p.id]).map(r => <p key={r.id} style={{ margin: 0, borderTop: '1px solid var(--line)', paddingTop: 10 }}>{legivel(p, r.dados[p.id])}</p>)}
        </section>
      ))}
      {contatos.length > 0 && <section className="card tbox">
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Quem topou conversar ou dar depoimento</h2>
        <table className="tbl"><thead><tr><th>Nome</th><th>WhatsApp</th><th>Conversa</th><th>Depoimento</th><th>Ticket</th><th>Respondeu em</th></tr></thead><tbody>
          {contatos.map(r => <tr key={r.id}>
            <td>{r.nome || '—'}</td><td>{r.whatsapp || '—'}</td><td>{r.aceita_conversa ? 'sim' : '—'}</td><td>{r.aceita_depoimento ? 'sim' : '—'}</td>
            <td className="muted">{legivel(perguntas(modelo).find(p => p.id === 'ticket')!, r.dados.ticket)}</td>
            <td className="muted">{new Date(r.criada_em).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
          </tr>)}
        </tbody></table>
      </section>}
    </main>
  );
}
