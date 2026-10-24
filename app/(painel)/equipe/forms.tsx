'use client';
import { useActionState, useState } from 'react';
import { convidar, novoConvite, type Estado } from './actions';

function Link({ st }: { st: Estado }) {
  const [ok, setOk] = useState(false);
  if (!st.link) return null;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <span className="okmsg">Convite de {st.nome} criado. Envie este link para a pessoa:</span>
      <code style={{ userSelect: 'all', wordBreak: 'break-all', fontSize: 12 }}>{st.link}</code>
      <button type="button" className="btn ghost" onClick={() => navigator.clipboard?.writeText(st.link!).then(() => setOk(true), () => {})}>{ok ? 'Copiado' : 'Copiar link'}</button>
    </div>
  );
}

export function FormConvite() {
  const [st, acao, pend] = useActionState<Estado, FormData>(convidar, {});
  return (
    <form action={acao} className="stack">
      <div className="field"><label htmlFor="nome">Nome</label><input className="input" id="nome" name="nome" required /></div>
      <div className="field"><label htmlFor="email">E-mail</label><input className="input" id="email" name="email" type="email" required /></div>
      <div className="field"><label htmlFor="papel">Papel</label>
        <select className="input" id="papel" name="papel" defaultValue="membro"><option value="membro">Membro</option><option value="admin">Administrador</option></select></div>
      {st.erro && <p className="err">{st.erro}</p>}
      <Link st={st} />
      <button className="btn" disabled={pend}>Criar convite</button>
    </form>
  );
}

export function BotaoNovoConvite({ id }: { id: string }) {
  const [st, acao, pend] = useActionState<Estado, FormData>(novoConvite.bind(null, id), {});
  return (
    <form action={acao} className="stack" style={{ gap: 6 }}>
      <button className="btn ghost" disabled={pend}>Novo convite</button>
      {st.erro && <span className="err">{st.erro}</span>}
      <Link st={st} />
    </form>
  );
}
