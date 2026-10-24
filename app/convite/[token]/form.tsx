'use client';
import { useActionState } from 'react';
import { aceitar, type Estado } from './actions';

export default function Form({ token }: { token: string }) {
  const [st, acao, pend] = useActionState<Estado, FormData>(aceitar.bind(null, token), {});
  return (
    <form action={acao} className="stack">
      <div className="field"><label htmlFor="senha">Senha (mínimo 10 caracteres)</label><input className="input" id="senha" name="senha" type="password" autoComplete="new-password" minLength={10} required /></div>
      <div className="field"><label htmlFor="confirmacao">Repita a senha</label><input className="input" id="confirmacao" name="confirmacao" type="password" autoComplete="new-password" required /></div>
      {st.erro && <p className="err" role="alert">{st.erro}</p>}
      <button className="btn" disabled={pend}>Criar senha e entrar</button>
    </form>
  );
}
