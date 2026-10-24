'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Modelo, Pergunta } from '@/lib/pesquisas/tipos';
import { responder } from './actions';

type V = Record<string, any>;

function inicial(p: Pergunta): any {
  if (p.tipo === 'multipla') return { marcadas: [], outro: '' };
  if (p.tipo === 'antes_depois') return { antes: '', hoje: '' };
  if (p.tipo === 'contato') return { depoimento: false, conversa: false, nome: '', whatsapp: '' };
  return '';
}

function respondida(p: Pergunta, v: any) {
  if (p.tipo === 'unica') return !p.obrigatoria || !!v;
  if (p.tipo === 'multipla') return !p.obrigatoria || v.marcadas.length > 0 || v.outro.trim().length > 0;
  if (p.tipo === 'antes_depois') return !!v.antes && !!v.hoje;
  if (p.tipo === 'texto') return !p.obrigatoria || v.trim().length >= 2;
  return true;
}

function limpar(p: Pergunta, v: any) {
  if (p.tipo === 'multipla') return { marcadas: v.marcadas, ...(v.outro.trim() ? { outro: v.outro.trim() } : {}) };
  if (p.tipo === 'contato') return { depoimento: v.depoimento, conversa: v.conversa, ...(v.nome.trim() ? { nome: v.nome.trim() } : {}), ...(v.whatsapp.trim() ? { whatsapp: v.whatsapp.trim() } : {}) };
  if (p.tipo === 'unica' && !v) return undefined;
  return v;
}

const opt: React.CSSProperties = { textAlign: 'left', width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--line2)', background: 'rgba(0,0,0,.4)', cursor: 'pointer', fontSize: 15 };
const sel: React.CSSProperties = { ...opt, background: 'var(--paper)', color: '#000', borderColor: 'var(--paper)' };

export default function Questionario({ slug, modelo }: { slug: string; modelo: Modelo }) {
  const lista = useMemo(() => modelo.blocos.flatMap(b => b.perguntas.map(p => ({ p, bloco: b.titulo }))), [modelo]);
  const [i, setI] = useState(-1);
  const [v, setV] = useState<V>(() => Object.fromEntries(lista.map(({ p }) => [p.id, inicial(p)])));
  const [isca, setIsca] = useState('');
  const [erro, setErro] = useState('');
  const [pend, start] = useTransition();
  const router = useRouter();
  const set = (id: string, x: any) => setV(s => ({ ...s, [id]: x }));

  if (i < 0) return (
    <div className="stack">
      <h1>{modelo.abertura.titulo}</h1>
      <p className="muted" style={{ maxWidth: 520, margin: 0 }}>{modelo.abertura.texto}</p>
      <div><button className="btn" onClick={() => setI(0)}>Começar</button></div>
    </div>
  );

  const { p, bloco } = lista[i];
  const val = v[p.id];
  const ultima = i === lista.length - 1;
  const pode = respondida(p, val);

  const enviar = () => start(async () => {
    setErro('');
    const payload = Object.fromEntries(lista.map(({ p }) => [p.id, limpar(p, v[p.id])]).filter(([, x]) => x !== undefined));
    const r = await responder(slug, payload, isca);
    if (r.ok) router.push(`/p/${slug}/obrigado`); else setErro(r.erro);
  });

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="stack" style={{ gap: 8 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}><span className="lbl">{bloco}</span><span className="lbl">{i + 1} de {lista.length}</span></div>
        <div className="bar" aria-hidden="true"><i style={{ width: `${((i + 1) / lista.length) * 100}%` }} /></div>
      </div>
      <h1 style={{ fontSize: 'clamp(24px,3.6vw,32px)', margin: 0 }}>{p.titulo}</h1>
      {p.ajuda && <p className="muted small" style={{ margin: 0 }}>{p.ajuda}</p>}

      {p.tipo === 'unica' && <div className="stack" style={{ gap: 8 }} role="radiogroup">
        {p.opcoes.map(o => <button key={o.v} type="button" role="radio" aria-checked={val === o.v} style={val === o.v ? sel : opt} onClick={() => set(p.id, o.v)}>{o.r}</button>)}
      </div>}

      {p.tipo === 'multipla' && <div className="stack" style={{ gap: 8 }}>
        {p.opcoes.map(o => { const on = val.marcadas.includes(o.v); return (
          <button key={o.v} type="button" role="checkbox" aria-checked={on} style={on ? sel : opt}
            onClick={() => set(p.id, { ...val, marcadas: on ? val.marcadas.filter((x: string) => x !== o.v) : [...val.marcadas, o.v] })}>{o.r}</button>); })}
        {p.outro && <input className="input" placeholder="Outro (opcional)" maxLength={300} value={val.outro} onChange={e => set(p.id, { ...val, outro: e.target.value })} aria-label="Outro" />}
      </div>}

      {p.tipo === 'antes_depois' && <div className="stack">
        {(['antes', 'hoje'] as const).map((k, j) => (
          <div key={k} className="stack" style={{ gap: 8 }}>
            <span className="lbl">{p.rotulos[j]}</span>
            <div className="row" style={{ gap: 8 }}>
              {p.opcoes.map(o => <button key={o.v} type="button" style={{ ...(val[k] === o.v ? sel : opt), width: 'auto', padding: '10px 14px', fontSize: 14 }} aria-pressed={val[k] === o.v} onClick={() => set(p.id, { ...val, [k]: o.v })}>{o.r}</button>)}
            </div>
          </div>
        ))}
      </div>}

      {p.tipo === 'texto' && <textarea className="input" rows={5} maxLength={p.max ?? 1000} value={val} onChange={e => set(p.id, e.target.value)} aria-label={p.titulo} />}

      {p.tipo === 'contato' && <div className="stack" style={{ gap: 10 }}>
        {([['depoimento', 'Podem usar meu resultado como depoimento'], ['conversa', 'Topo uma conversa de 15 minutos com o time']] as const).map(([k, r]) => (
          <button key={k} type="button" role="checkbox" aria-checked={val[k]} style={val[k] ? sel : opt} onClick={() => set(p.id, { ...val, [k]: !val[k] })}>{r}</button>
        ))}
        <div className="field"><label htmlFor="nome">Seu nome (opcional)</label><input className="input" id="nome" maxLength={120} value={val.nome} onChange={e => set(p.id, { ...val, nome: e.target.value })} autoComplete="name" /></div>
        <div className="field"><label htmlFor="whats">WhatsApp (opcional)</label><input className="input" id="whats" inputMode="tel" maxLength={30} value={val.whatsapp} onChange={e => set(p.id, { ...val, whatsapp: e.target.value })} autoComplete="tel" placeholder="(00) 00000-0000" /></div>
      </div>}

      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={isca} onChange={e => setIsca(e.target.value)} name="site" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

      {erro && <p className="err" role="alert">{erro}</p>}
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <button type="button" className="btn ghost" onClick={() => setI(i - 1)} disabled={pend}>Voltar</button>
        {ultima
          ? <button type="button" className="btn" disabled={!pode || pend} onClick={enviar}>{pend ? 'Enviando' : 'Enviar respostas'}</button>
          : <button type="button" className="btn" disabled={!pode} onClick={() => setI(i + 1)}>Continuar</button>}
      </div>
    </div>
  );
}
