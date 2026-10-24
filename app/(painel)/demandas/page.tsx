import Link from 'next/link';
import { exigirUsuario } from '@/lib/auth';
import { STATUS_DEMANDA, carregar, dataISO, edicaoAtual, fmt, hoje, nomeDe, type Dados, type Demanda, type Edicao } from '@/lib/central';
import { apagarDemanda, criarDemanda, editarDemanda, statusDemanda } from '../acoes';
import { Apagar, Enviar, SelectAuto } from '@/components/Auto';

export default async function Demandas({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const u = await exigirUsuario();
  const { p = 'todos' } = await searchParams;
  const ed = await edicaoAtual();
  const d = await carregar(ed);
  const lista = d.demandas.filter(t => p === 'todos' || (p === 'ninguem' ? !t.responsavel_id : t.responsavel_id === p));
  const filtros = [{ id: 'todos', nome: 'Todos' }, ...d.gente.map(g => ({ id: g.id, nome: g.id === u.id ? `${g.nome} (eu)` : g.nome })), { id: 'ninguem', nome: 'Sem responsável' }];

  return (
    <main className="stack">
      <div><div className="eyebrow">Demandas</div><h1>Gestão de demandas</h1></div>

      <div className="card">
        <div className="head"><h2>Nova demanda</h2>
          <div className="seg">{filtros.map(f => <Link key={f.id} href={f.id === 'todos' ? '/demandas' : `/demandas?p=${f.id}`} aria-pressed={p === f.id}>{f.nome}</Link>)}</div>
        </div>
        <CamposDemanda ed={ed} d={d} acao={criarDemanda} padraoResp={u.id} rotulo="Criar demanda" />
      </div>

      <div className="kanban">
        {STATUS_DEMANDA.map(c => {
          const it = lista.filter(t => t.status === c);
          return (
            <div className="col" key={c}>
              <h4><span>{c}</span><span>{it.length}</span></h4>
              {it.map(t => <Cartao key={t.id} t={t} ed={ed} d={d} />)}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function Cartao({ t, ed, d }: { t: Demanda; ed: Edicao; d: Dados }) {
  const h = hoje(ed);
  const atrasada = t.status !== 'Concluído' && t.prazo !== null && t.prazo < h;
  const fase = d.fases.find(f => f.id === t.fase_id);
  return (
    <div className={`task${atrasada ? ' late' : ''}`}>
      <div className="t">{t.titulo}</div>
      {t.detalhes && <details className="td"><summary>detalhes</summary><p>{t.detalhes}</p></details>}
      <div className="m">
        <span>{nomeDe(d.gente, t.responsavel_id) ?? 'sem responsável'}</span>
        <span>{t.prazo !== null ? fmt(ed, t.prazo) : 'sem prazo'}</span>
        {atrasada && <span className="pill bad">atrasada</span>}
        {fase && <span className="pill">{fase.nome}</span>}
      </div>
      <div className="m">
        <form key={t.status} action={statusDemanda.bind(null, t.id)}><SelectAuto name="status" value={t.status} opcoes={STATUS_DEMANDA} label="Status" /></form>
        <details className="td editar"><summary>editar</summary>
          <CamposDemanda ed={ed} d={d} acao={editarDemanda.bind(null, t.id)} t={t} rotulo="Salvar" />
        </details>
        <form action={apagarDemanda.bind(null, t.id)} style={{ marginLeft: 'auto' }}><Apagar pergunta="Apagar esta demanda?" /></form>
      </div>
    </div>
  );
}

function CamposDemanda({ ed, d, acao, t, padraoResp, rotulo }: { ed: Edicao; d: Dados; acao: (fd: FormData) => Promise<void>; t?: Demanda; padraoResp?: string; rotulo: string }) {
  return (
    <form action={acao} className="form">
      <label className="field"><span>Demanda</span><input className="input" name="titulo" required defaultValue={t?.titulo} placeholder="O que precisa ser feito" /></label>
      <div className="trio">
        <label className="field"><span>Responsável</span>
          <select className="input" name="resp" defaultValue={t ? t.responsavel_id ?? '' : padraoResp}><option value="">Ninguém</option>{d.gente.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
        <label className="field"><span>Prazo</span><input className="input" type="date" name="prazo" defaultValue={t?.prazo != null ? dataISO(ed, t.prazo) : ''} /></label>
        <label className="field"><span>Fase</span>
          <select className="input" name="fase" defaultValue={t?.fase_id ?? ''}><option value="">Sem fase</option>{d.fases.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></label>
      </div>
      <label className="field"><span>Detalhes</span><textarea className="input" name="detalhes" rows={3} defaultValue={t?.detalhes ?? ''} /></label>
      <Enviar>{rotulo}</Enviar>
    </form>
  );
}
