import Link from 'next/link';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';
import { D, TIPOS, carregar, edicaoAtual, fmt, fmtL, hoje, itens } from '@/lib/central';
import Gantt from '@/components/Gantt';

export default async function Inicio() {
  const u = await exigirUsuario();
  const ed = await edicaoAtual();
  const d = await carregar(ed);
  const h = hoje(ed);
  const abertas = d.demandas.filter(x => x.status !== 'Concluído');
  const atrasadas = abertas.filter(x => x.prazo !== null && x.prazo < h);
  const minhas = abertas.filter(x => x.responsavel_id === u.id).sort((a, b) => (a.prazo ?? 1e9) - (b.prazo ?? 1e9));
  const semana = d.pecas.filter(p => p.dia >= h && p.dia < h + 7);
  const proximos = itens(d).filter(x => !x.regua && x.dia >= h).slice(0, 6);
  const pesquisas = await db()<{ slug: string; titulo: string; n: number; aberta: boolean }[]>`
    select p.slug, p.titulo, p.aberta, (select count(*)::int from resposta r where r.pesquisa_id = p.id) n
    from pesquisa p order by p.criado_em`;

  return (
    <main className="stack">
      <div><div className="eyebrow">Visão geral</div><h1>Olá, {u.nome.split(' ')[0]}</h1></div>

      <div className="kpis">
        <Kpi lbl="Demandas abertas" v={abertas.length} s="do time inteiro" />
        <Kpi lbl="Atrasadas" v={atrasadas.length} s="prazo vencido" cor={atrasadas.length ? 'var(--bad)' : undefined} />
        <Kpi lbl="Peças nos próximos 7 dias" v={semana.length} s="no calendário" />
        <Kpi lbl="Peças publicadas" v={d.pecas.filter(p => p.status === 'Publicado').length} s={`de ${d.pecas.length} planejadas`} />
        {pesquisas.map(p => <Kpi key={p.slug} lbl="Respostas da pesquisa" v={p.n} s={p.aberta ? 'pesquisa aberta' : 'pesquisa fechada'} href={`/pesquisas/${p.slug}`} />)}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="head"><h2>Minhas demandas</h2><span className="lbl">{minhas.length} abertas</span></div>
          {minhas.length ? (
            <div className="lista">{minhas.map(t => (
              <Link key={t.id} href="/demandas" className={`task mini ${t.prazo !== null && t.prazo < h ? 'late' : ''}`}>
                <span className="t">{t.titulo}</span>
                <span className="m"><span>{t.prazo !== null ? fmt(ed, t.prazo) : 'sem prazo'}</span><span className="pill">{t.status}</span></span>
              </Link>
            ))}</div>
          ) : <p className="note">Nada pendente com você.</p>}
        </div>
        <div className="card">
          <div className="head"><h2>Próximos marcos</h2><span className="lbl">do calendário</span></div>
          {proximos.length ? (
            <div className="lista">{proximos.map((x, i) => (
              <div key={i} className="row" style={{ flexWrap: 'nowrap' }}>
                <span className="pill">{fmtL(ed, x.dia)}</span>
                <span style={{ color: TIPOS[x.tipo]?.c }}>{TIPOS[x.tipo]?.i}</span>
                <span style={{ minWidth: 0 }}>{x.titulo}</span>
                <span className="lbl" style={{ marginLeft: 'auto' }}>{D(x.dia)}</span>
              </div>
            ))}</div>
          ) : <p className="note">Nada cadastrado ainda. Lives, lotes e peças entram pelo <Link href="/calendario">calendário</Link>.</p>}
        </div>
      </div>

      <div className="card">
        <div className="head"><h2>Fases da edição</h2><Link className="lbl" href="/calendario#fases">editar fases</Link></div>
        <Gantt ed={ed} fases={d.fases} marcos={d.marcos} />
      </div>
    </main>
  );
}

function Kpi({ lbl, v, s, cor, href }: { lbl: string; v: number; s: string; cor?: string; href?: string }) {
  const corpo = <><div className="lbl">{lbl}</div><div className="num" style={{ color: cor, marginTop: 8 }}>{v}</div><div className="muted small">{s}</div></>;
  return href ? <Link href={href} className="kpi" style={{ textDecoration: 'none' }}>{corpo}</Link> : <div className="kpi">{corpo}</div>;
}
