'use client';
import { useActionState } from 'react';
import { criarPrimeiro, type Estado } from './actions';

export default function Form() {
  const [st, acao, pend] = useActionState<Estado, FormData>(criarPrimeiro, {});
  return (
    <form action={acao} className="stack" key={st.n ?? 0}>
      <div className="field"><label htmlFor="codigo">Código de primeiro acesso</label><input className="input" id="codigo" name="codigo" type="password" required /></div>
      <div className="field"><label htmlFor="nome">Seu nome</label><input className="input" id="nome" name="nome" defaultValue={st.nome} required /></div>
      <div className="field"><label htmlFor="email">E-mail</label><input className="input" id="email" name="email" type="email" autoComplete="username" defaultValue={st.email} required /></div>
      <div className="field"><label htmlFor="senha">Senha (mínimo 10 caracteres)</label><input className="input" id="senha" name="senha" type="password" autoComplete="new-password" minLength={10} required /></div>
      {st.erro && <p className="err" role="alert">{st.erro}</p>}
      <button className="btn" disabled={pend}>Criar acesso</button>
    </form>
  );
}
