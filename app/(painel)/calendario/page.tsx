import Link from 'next/link';
import { exigirUsuario } from '@/lib/auth';
import { CANAIS, D, TIPOS, captacao, carregar, data, dataISO, edicaoAtual, faseNo, fmt, fmtL, hoje, itens, pessoaDe } from '@/lib/central';
import Avatar from '@/components/Avatar';
import { apagarFase, apagarMarco, apagarPeca, criarFase, criarMarco, criarPeca, mudarDataEvento, salvarFase } from '../acoes';
import { Apagar, Enviar } from '@/components/Auto';
import Gantt from '@/components/Gantt';

type SP = Promise<{ dia?: string; s?: string; off?: string }>;
const SEMANAS = 7;

export default async function Calendario({ searchParams }: { searchParams: SP }) {
  await exigirUsuario();
  const sp = await searchParams;
  const ed = await edicaoAtual();
  const d = await carregar(ed);
  const h = hoje(ed);
  const cap = captacao(d.fases);

  const off = new Set((sp.off ?? '').split(',').filter(Boolean));
  const todos = itens(d);
  const vis = todos.filter(x => !off.has(x.tipo));
  const contagem: Record<string, number> = {};
  todos.forEach(x => (contagem[x.tipo] = (contagem[x.tipo] ?? 0) + 1));

  // Começa no domingo da semana do início da captação (ou de hoje), e anda de 4 em 4 semanas.
  const ref = Number.isFinite(Number(sp.s)) && sp.s ? Number(sp.s) : (cap?.ini ?? h);
  const inicio = ref - data(ed, ref).getUTCDay();
  const sel = sp.dia !== undefined && Number.isFinite(Number(sp.dia)) ? Number(sp.dia) : null;

  const q = (o: { dia?: number | null; s?: number; off?: Set<string> }) => {
    const p = new URLSearchParams();
    const s = o.s ?? inicio;
    p.set('s', String(s));
    const of = o.off ?? off;
    if (of.size) p.set('off', [...of].join(','));
    const dd = o.dia === undefined ? sel : o.dia;
    if (dd !== null && dd !== undefined) p.set('dia', String(dd));
    return `/calendario?${p}`;
  };
  const alterna = (t: string) => { const n = new Set(off); n.has(t) ? n.delete(t) : n.add(t); return q({ off: n }); };

  const dias = Array.from({ length: SEMANAS * 7 }, (_, i) => inicio + i);
  const doDia = sel !== null ? vis.filter(x => x.dia === sel) : [];
  const hojeISO = dataISO(ed, h);

  return (
    <main className="stack">
      <div><div className="eyebrow">Calendário</div><h1>Calendário do lançamento</h1></div>

      <div className="card">
        <div className="head">
          <h2>{fmt(ed, inicio)} a {fmt(ed, inicio + SEMANAS * 7 - 1)}</h2>
          <div className="row" style={{ gap: 6 }}>
            <Link className="btn ghost sm" href={q({ s: inicio - 28, dia: null })}>Anterior</Link>
            <Link className="btn ghost sm" href={q({ s: h, dia: h })}>Hoje</Link>
            <Link className="btn ghost sm" href={q({ s: inicio + 28, dia: null })}>Próximo</Link>
          </div>
        </div>
        <div className="filtros">
          {Object.keys(TIPOS).map(t => (
            <Link key={t} href={alterna(t)} className="fchip" aria-pressed={!off.has(t)}>
              <span style={{ color: TIPOS[t].c }}>{TIPOS[t].i}</span> {t}{contagem[t] ? <b>{contagem[t]}</b> : null}
            </Link>
          ))}
        </div>
        <div className="tbox"><div className="semanas">
          {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(n => <div key={n} className="lbl" style={{ padding: '0 6px' }}>{n}</div>)}
          {dias.map(k => {
            const dt = data(ed, k), f = faseNo(d.fases, k), di = vis.filter(x => x.dia === k);
            return (
              <Link key={k} href={q({ dia: sel === k ? null : k })} scroll={false}
                className={`dia${k === 0 ? ' dia-ev' : ''}${k === h ? ' hoje' : ''}${sel === k ? ' sel' : ''}`}
                style={f ? { boxShadow: `inset 0 2px 0 ${f.cor}` } : undefined}>
                <span className="n"><span>{dt.getUTCDate()}/{dt.getUTCMonth() + 1}</span><span>{D(k)}</span></span>
                {di.slice(0, 4).map((x, i) => (
                  <span key={i} className="evt" style={{ borderColor: TIPOS[x.tipo]?.c ?? '#888' }} title={`${x.tipo}: ${x.titulo}`}>
                    <span className="ti">{TIPOS[x.tipo]?.i ?? '·'}</span>{x.hora && <span className="hh">{x.hora}</span>}{x.titulo}
                  </span>
                ))}
                {di.length > 4 && <span className="mais">+{di.length - 4}</span>}
              </Link>
            );
          })}
        </div></div>
        <p className="note">Cada live cadastrada gera sozinha a régua de mensagens no grupo e na API (D-7, D-2, D-1, 9h, 15h, 19h, 20h e 20h15). Mudou a data da live, a régua vai junto.</p>
      </div>

      {sel !== null && (
        <div className="card" id="dia">
          <div className="head"><h2>{fmtL(ed, sel)} · {D(sel)}</h2><Link className="lbl" href={q({ dia: null })} scroll={false}>fechar</Link></div>
          {doDia.length ? (
            <div className="dlista">{doDia.map((x, i) => (
              <div key={i} className="drow">
                <span className="hh">{x.hora || '—'}</span>
                <span className="pill" style={{ borderColor: TIPOS[x.tipo]?.c, color: TIPOS[x.tipo]?.c }}>{TIPOS[x.tipo]?.i} {x.tipo}</span>
                <span className="dt">{x.titulo}</span>
                {x.regua && <span className="lbl">régua da live</span>}
                {x.status && <span className="pill">{x.status}</span>}
                {x.resp && <Avatar p={pessoaDe(d.gente, x.resp)} />}
                {x.id && <form action={(x.origem === 'peca' ? apagarPeca : apagarMarco).bind(null, x.id)}><Apagar /></form>}
              </div>
            ))}</div>
          ) : <p className="note">Nada neste dia.</p>}
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <div className="head"><h2>Adicionar ao calendário</h2><span className="lbl">reels, stories, API, grupo...</span></div>
          <form action={criarPeca} className="form">
            <div className="duo">
              <label className="field"><span>Data</span><input className="input" type="date" name="data" required defaultValue={sel !== null ? dataISO(ed, sel) : hojeISO} /></label>
              <label className="field"><span>Horário</span><input className="input" name="hora" placeholder="19h" /></label>
            </div>
            <div className="duo">
              <label className="field"><span>Canal</span><select className="input" name="canal">{CANAIS.map(c => <option key={c}>{c}</option>)}</select></label>
              <label className="field"><span>Responsável</span><select className="input" name="resp"><option value="">Ninguém</option>{d.gente.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
            </div>
            <label className="field"><span>Pilar</span><select className="input" name="pilar"><option value="">Sem pilar</option>{d.pilares.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
            <label className="field"><span>O que vai sair</span><input className="input" name="titulo" required placeholder="Tema ou gancho" /></label>
            <Enviar>Adicionar</Enviar>
          </form>
        </div>
        <div className="card">
          <div className="head"><h2>Lives, lotes e evento</h2><span className="lbl">marcos</span></div>
          <form action={criarMarco} className="form">
            <div className="duo">
              <label className="field"><span>Tipo</span><select className="input" name="tipo"><option value="live">Live</option><option value="lote">Virada de lote</option><option value="evento">Evento</option></select></label>
              <label className="field"><span>Horário</span><input className="input" name="hora" placeholder="20h" /></label>
            </div>
            <label className="field"><span>Data</span><input className="input" type="date" name="data" required defaultValue={sel !== null ? dataISO(ed, sel) : hojeISO} /></label>
            <label className="field"><span>Título</span><input className="input" name="titulo" required placeholder="Tema da live ou nome do lote" /></label>
            <Enviar>Adicionar marco</Enviar>
          </form>
          {d.marcos.length > 0 && (
            <div className="dlista" style={{ marginTop: 16 }}>{d.marcos.map(m => (
              <div key={m.id} className="drow">
                <span className="pill" style={{ borderColor: TIPOS[m.tipo === 'live' ? 'Live' : m.tipo === 'lote' ? 'Lote' : 'Evento'].c }}>{fmt(ed, m.dia)}</span>
                <span className="dt">{m.tipo === 'live' ? 'Live: ' : m.tipo === 'lote' ? 'Lote: ' : ''}{m.titulo}</span>
                <span className="lbl">{D(m.dia)}</span>
                <form action={apagarMarco.bind(null, m.id)}><Apagar pergunta="Apagar este marco? A régua da live sai junto." /></form>
              </div>
            ))}</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="head"><h2>Linha do tempo</h2><span className="lbl">fases e marcos</span></div>
        <Gantt ed={ed} fases={d.fases} marcos={d.marcos} />
      </div>

      <div className="card" id="fases">
        <div className="head"><h2>Fases e data do evento</h2><form action={criarFase}><Enviar ghost>+ fase</Enviar></form></div>
        <form action={mudarDataEvento} className="row" style={{ marginBottom: 16 }}>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><span>Data do evento (D0)</span>
            <input className="input" type="date" name="data" defaultValue={ed.data_evento} required style={{ width: 'auto' }} /></label>
          <Enviar ghost>Salvar data</Enviar>
        </form>
        <p className="note" style={{ marginTop: 0 }}>Cada fase começa num dia relativo ao evento (D-42 = 42 dias antes). Mudou a data do evento, fases, lives, peças e prazos andam juntos.</p>
        <div className="tbox"><div className="fases">
          <div className="fase-ed cab lbl"><span>Fase</span><span>Início (D)</span><span>Dias</span><span>Cor</span><span /><span>Período</span><span /></div>
          {d.fases.map(f => (
            <div key={`${f.id}${f.nome}${f.inicio}${f.dias}${f.cor}`} className="fase-ed">
              <form action={salvarFase.bind(null, f.id)} id={`f-${f.id}`} />
              <input form={`f-${f.id}`} className="input" name="nome" defaultValue={f.nome} aria-label="Nome da fase" required />
              <input form={`f-${f.id}`} className="input" type="number" name="inicio" defaultValue={f.inicio} aria-label="Início" />
              <input form={`f-${f.id}`} className="input" type="number" min={1} name="dias" defaultValue={f.dias} aria-label="Dias" />
              <input form={`f-${f.id}`} type="color" name="cor" defaultValue={f.cor} aria-label="Cor" />
              <button form={`f-${f.id}`} className="btn ghost sm">Salvar</button>
              <span className="lbl" style={{ whiteSpace: 'nowrap' }}>{fmt(ed, f.inicio)} a {fmt(ed, f.inicio + f.dias - 1)}</span>
              <form action={apagarFase.bind(null, f.id)}><Apagar pergunta={`Apagar a fase ${f.nome}?`} /></form>
            </div>
          ))}
        </div></div>
      </div>
    </main>
  );
}
