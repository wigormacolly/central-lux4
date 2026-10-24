import { TIPOS, TIPOS_MARCO, fmt, hoje, type Edicao, type Fase, type Marco } from '@/lib/central';

/** Linha do tempo das fases, com o dia de hoje e o dia do evento marcados. */
export default function Gantt({ ed, fases, marcos = [] }: { ed: Edicao; fases: Fase[]; marcos?: Marco[] }) {
  if (!fases.length) return <p className="muted small">Nenhuma fase cadastrada.</p>;
  const min = Math.min(...fases.map(f => f.inicio)), max = Math.max(...fases.map(f => f.inicio + f.dias));
  const span = Math.max(1, max - min), pct = (o: number) => ((o - min) / span) * 100;
  const h = hoje(ed);
  const semanas: number[] = [];
  for (let w = min; w <= max; w += 7) semanas.push(w);
  return (
    <div className="gantt"><div className="gantt-in">
      <div className="grow"><div /><div style={{ position: 'relative', height: 16 }}>
        {semanas.map(w => <span key={w} className="lbl" style={{ position: 'absolute', left: `${pct(w)}%`, fontSize: 10 }}>{fmt(ed, w)}</span>)}
      </div></div>
      {fases.map(f => (
        <div className="grow" key={f.id}>
          <div className="gname"><span className="sw" style={{ background: f.cor }} /><span>{f.nome}</span></div>
          <div className="gtrack">
            {h >= min && h <= max && <div className="today" style={{ left: `${pct(h)}%` }} title="Hoje" />}
            <div className="d0" style={{ left: `${pct(0)}%` }} />
            <div className="gbar" style={{ left: `${pct(f.inicio)}%`, width: `${(f.dias / span) * 100}%`, background: f.cor }}><span>{fmt(ed, f.inicio)}</span></div>
            {marcos.filter(m => m.dia >= f.inicio && m.dia < f.inicio + f.dias).map(m => (
              <span key={m.id} className="ev" title={`${TIPOS_MARCO[m.tipo]}: ${m.titulo}`} style={{ left: `${pct(m.dia)}%`, background: TIPOS[TIPOS_MARCO[m.tipo]].c }} />
            ))}
          </div>
        </div>
      ))}
    </div></div>
  );
}
