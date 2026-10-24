'use client';
import { useActionState } from 'react';
import { entrar, type Estado } from './actions';

export default function FormLogin() {
  const [st, acao, pend] = useActionState<Estado, FormData>(entrar, {});
  return (
    <form action={acao} className="stack" key={st.n ?? 0}>
      <div className="field"><label htmlFor="email">E-mail</label><input className="input" id="email" name="email" type="email" autoComplete="username" defaultValue={st.email} required /></div>
      <div className="field"><label htmlFor="senha">Senha</label><input className="input" id="senha" name="senha" type="password" autoComplete="current-password" required /></div>
      {st.erro && <p className="err" role="alert">{st.erro}</p>}
      <button className="btn" disabled={pend}>{pend ? 'Entrando' : 'Entrar'}</button>
    </form>
  );
}
