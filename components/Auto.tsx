'use client';
import { useFormStatus } from 'react-dom';

/** Select que envia o formulário assim que muda (status de demanda, de peça). */
export function SelectAuto({ name, value, opcoes, label }: { name: string; value: string; opcoes: readonly string[]; label: string }) {
  return (
    <select className="mini" name={name} defaultValue={value} aria-label={label} onChange={e => e.currentTarget.form?.requestSubmit()}>
      {opcoes.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

/** Botão de apagar com confirmação. */
export function Apagar({ rotulo = 'Apagar', pergunta = 'Apagar este item?' }: { rotulo?: string; pergunta?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="x" aria-label={rotulo} title={rotulo} disabled={pending}
      onClick={e => { if (!confirm(pergunta)) e.preventDefault(); }}>×</button>
  );
}

/** Botão de envio que trava enquanto salva. */
export function Enviar({ children, ghost }: { children: React.ReactNode; ghost?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={ghost ? 'btn ghost' : 'btn'} disabled={pending}>{children}</button>;
}
