import { exigirUsuario } from '@/lib/auth';
import { CANAIS, OBJETIVOS, STATUS_PECA, captacao, carregar, dataISO, edicaoAtual, fmtL, hoje, pessoaDe, type Dados, type Edicao, type Meta } from '@/lib/central';
import { apagarMeta, apagarPeca, apagarPilar, criarMeta, criarPeca, criarPilar, statusPeca } from '../acoes';
import { Apagar, Enviar, SelectAuto } from '@/components/Auto';
import Avatar from '@/components/Avatar';

export default async function Conteudo() {
  await exigirUsuario();
  const ed = await edicaoAtual();
  const d = await carregar(ed);
  const pilarDe = (id: string | null) => d.pilares.find(p => p.id === id);

  return (
    <main className="stack">
      <div><div className="eyebrow">Conteúdo</div><h1>Linha editorial e metas</h1></div>

      <div className="card">
        <div className="head"><h2>Metas de conteúdo</h2><span className="lbl">por semana de captação ou na edição</span></div>
        <div className="stack" style={{ gap: 18 }}>
          {d.metas.length ? d.metas.map(m => <LinhaMeta key={m.id} m={m} ed={ed} d={d} />) : <p className="note" style={{ margin: 0 }}>Nenhuma meta cadastrada.</p>}
        </div>
        <form action={criarMeta} className="linha" style={{ marginTop: 18 }}>
          <select className="input" name="tipo" aria-label="Tipo de meta"><option value="canal">Por canal</option><option value="pilar">Por pilar</option></select>
          <select className="input" name="canal" aria-label="Canal">{CANAIS.map(c => <option key={c}>{c}</option>)}</select>
          <select className="input" name="pilar" aria-label="Pilar">{d.pilares.length ? d.pilares.map(p => <option key={p.id}>{p.nome}</option>) : <option value="">Sem pilares</option>}</select>
          <input className="input" type="number" name="quantidade" min={1} defaultValue={3} aria-label="Quantidade" />
          <select className="input" name="periodo" aria-label="Período"><option value="semana">por semana</option><option value="edicao">na edição</option></select>
          <Enviar>+ Meta</Enviar>
        </form>
        <p className="note">Escolha "por canal" e o canal, ou "por pilar" e o pilar. O outro campo é ignorado.</p>
      </div>

      <div className="card">
        <div className="head"><h2>Linha editorial</h2><span className="lbl">pilares e objetivo no funil</span></div>
        <div className="pilares">
          {d.pilares.length ? d.pilares.map(p => (
            <div key={p.id} className="pilar">
              <b><span className="sw" style={{ background: p.cor }} />{p.nome}</b>
              <span className="muted small">objetivo: {p.objetivo}</span>
              <form action={apagarPilar.bind(null, p.id)} className="canto"><Apagar pergunta={`Apagar o pilar ${p.nome}?`} /></form>
            </div>
          )) : <p className="note" style={{ margin: 0 }}>Nenhum pilar definido ainda.</p>}
        </div>
        <form action={criarPilar} className="linha" style={{ marginTop: 14 }}>
          <input className="input" name="nome" placeholder="Nome do pilar" required aria-label="Pilar" />
          <select className="input" name="objetivo" aria-label="Objetivo">{OBJETIVOS.map(o => <option key={o}>{o}</option>)}</select>
          <Enviar>+ Pilar</Enviar>
        </form>
      </div>

      <div className="card">
        <div className="head"><h2>Calendário de conteúdo</h2><span className="lbl">{d.pecas.length} peças</span></div>
        <form action={criarPeca} className="linha" style={{ marginBottom: 14 }}>
          <input className="input" type="date" name="data" required defaultValue={dataISO(ed, hoje(ed))} aria-label="Data" />
          <input className="input" name="hora" placeholder="19h" aria-label="Horário" />
          <select className="input" name="canal" aria-label="Canal">{CANAIS.map(c => <option key={c}>{c}</option>)}</select>
          <select className="input" name="pilar" aria-label="Pilar"><option value="">Sem pilar</option>{d.pilares.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
          <input className="input largo" name="titulo" placeholder="Tema ou gancho" required aria-label="Conteúdo" />
          <select className="input" name="resp" aria-label="Responsável"><option value="">Ninguém</option>{d.gente.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
          <Enviar>+ Peça</Enviar>
        </form>
        <div className="tbox">
          <table className="tbl">
            <thead><tr><th>Data</th><th>Canal</th><th>Pilar</th><th>Conteúdo</th><th>Quem</th><th>Status</th><th /></tr></thead>
            <tbody>
              {d.pecas.length ? d.pecas.map(c => {
                const pi = pilarDe(c.pilar_id);
                return (
                  <tr key={c.id}>
                    <td className="lbl" style={{ whiteSpace: 'nowrap' }}>{fmtL(ed, c.dia)}{c.hora ? ` · ${c.hora}` : ''}</td>
                    <td>{c.canal}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{pi ? <><span className="sw" style={{ background: pi.cor }} /> {pi.nome}</> : <span className="muted">—</span>}</td>
                    <td style={{ minWidth: 220 }}>{c.titulo}</td>
                    <td><Avatar p={pessoaDe(d.gente, c.responsavel_id)} /></td>
                    <td><form key={c.status} action={statusPeca.bind(null, c.id)}><SelectAuto name="status" value={c.status} opcoes={STATUS_PECA} label="Status" /></form></td>
                    <td><form action={apagarPeca.bind(null, c.id)}><Apagar pergunta="Apagar esta peça?" /></form></td>
                  </tr>
                );
              }) : <tr><td colSpan={7} className="note">Nenhuma peça cadastrada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="note">Status: {STATUS_PECA.join(' → ')}. Tudo que entra aqui aparece no calendário, e vice-versa.</p>
      </div>
    </main>
  );
}

function LinhaMeta({ m, ed, d }: { m: Meta; ed: Edicao; d: Dados }) {
  const nomePilar = (id: string | null) => d.pilares.find(p => p.id === id)?.nome;
  const bate = (c: Dados['pecas'][number]) => (m.tipo === 'canal' ? c.canal === m.valor : nomePilar(c.pilar_id) === m.valor);
  const doTipo = d.pecas.filter(bate);
  const pub = doTipo.filter(c => c.status === 'Publicado').length;
  const apagar = <form action={apagarMeta.bind(null, m.id)}><Apagar pergunta="Apagar esta meta?" /></form>;
  const cap = captacao(d.fases);

  if (m.periodo === 'semana' && cap) {
    const h = hoje(ed);
    const sem = cap.semanas.map(([a, b]) => ({ a, b, n: doTipo.filter(c => c.dia >= a && c.dia < b).length }));
    const ok = sem.filter(s => s.n >= m.quantidade).length;
    return (
      <div>
        <div className="row" style={{ marginBottom: 8 }}>
          <b>{m.valor}</b><span className="lbl">{m.quantidade} por semana · {m.tipo}</span>
          <span className={`pill${ok === sem.length ? ' ok' : ''}`} style={{ marginLeft: 'auto' }}>{ok}/{sem.length} semanas batidas</span>{apagar}
        </div>
        <div className="semcel">{sem.map((s, i) => {
          const pct = Math.min(1, s.n / m.quantidade) * 100;
          return (
            <div key={i} title={`Semana ${i + 1}: ${s.n} de ${m.quantidade}`}>
              <div className={`cel${h >= s.a && h < s.b ? ' atual' : ''}`} style={{ background: `linear-gradient(0deg,rgba(250,250,250,${s.n >= m.quantidade ? 0.55 : 0.22}) ${pct}%,transparent ${pct}%)` }} />
              <div className="lbl" style={{ fontSize: 9.5, textAlign: 'center', marginTop: 4 }}>S{i + 1} · {s.n}/{m.quantidade}</div>
            </div>
          );
        })}</div>
      </div>
    );
  }
  const pct = Math.min(1, doTipo.length / m.quantidade) * 100, pp = Math.min(1, pub / m.quantidade) * 100;
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <b>{m.valor}</b><span className="lbl">{m.quantidade} {m.periodo === 'semana' ? 'por semana (sem fase de captação)' : 'na edição'} · {m.tipo}</span>
        <span className={`pill${doTipo.length >= m.quantidade ? ' ok' : ''}`} style={{ marginLeft: 'auto' }}>{doTipo.length} planejadas · {pub} publicadas</span>{apagar}
      </div>
      <div className="bar" style={{ height: 10, position: 'relative' }}>
        <i style={{ width: `${pct}%`, background: 'rgba(250,250,250,.25)' }} />
        <i style={{ position: 'absolute', left: 0, top: 0, width: `${pp}%` }} />
      </div>
    </div>
  );
}
